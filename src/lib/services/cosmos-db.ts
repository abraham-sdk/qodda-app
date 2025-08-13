import { CosmosClient, type Database, type Container } from "@azure/cosmos"
import { serverLogger } from "./server-logger"
import type { ClassificationResult, UserProfile } from "@/types"

/**
 * Azure Cosmos DB service for data persistence
 */
class CosmosService {
  private client: CosmosClient | null = null
  private database: Database | null = null
  private classificationsContainer: Container | null = null
  private usersContainer: Container | null = null
  private initialized = false

  /**
   * Initialize Cosmos DB connection
   */
  async initialize() {
    if (this.initialized) return

    try {
      const endpoint = process.env.AZURE_COSMOS_ENDPOINT
      const key = process.env.AZURE_COSMOS_KEY
      const databaseName = process.env.AZURE_COSMOS_DATABASE_NAME || "qodda"

      if (!endpoint || !key) {
        throw new Error("Cosmos DB credentials not configured")
      }

      this.client = new CosmosClient({ endpoint, key })
      this.database = this.client.database(databaseName)

      // Get or create containers
      this.classificationsContainer = this.database.container("classifications")
      this.usersContainer = this.database.container("users")

      this.initialized = true
      serverLogger.info("Cosmos DB initialized successfully")
    } catch (error) {
      serverLogger.error("Failed to initialize Cosmos DB", error as Error)
      throw error
    }
  }

  /**
   * Save classification result
   */
  async saveClassification(classification: Omit<ClassificationResult, "id">): Promise<ClassificationResult> {
    await this.initialize()

    if (!this.classificationsContainer) {
      throw new Error("Classifications container not initialized")
    }

    try {
      const item = {
        id: `${classification.userId}_${Date.now()}`,
        ...classification,
        createdAt: new Date().toISOString(),
      }

      const { resource } = await this.classificationsContainer.items.create(item)
      serverLogger.info("Classification saved", { classificationId: resource?.id })

      return resource as ClassificationResult
    } catch (error) {
      serverLogger.error("Failed to save classification", error as Error)
      throw error
    }
  }

  /**
   * Get user's classification history
   */
  async getUserClassifications(userId: string, limit = 50): Promise<ClassificationResult[]> {
    await this.initialize()

    if (!this.classificationsContainer) {
      throw new Error("Classifications container not initialized")
    }

    try {
      const query = {
        query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC OFFSET 0 LIMIT @limit",
        parameters: [
          { name: "@userId", value: userId },
          { name: "@limit", value: limit },
        ],
      }

      const { resources } = await this.classificationsContainer.items.query(query).fetchAll()
      return resources as ClassificationResult[]
    } catch (error) {
      serverLogger.error("Failed to get user classifications", error as Error)
      throw error
    }
  }

  /**
   * Get classification by ID
   */
  async getClassification(id: string): Promise<ClassificationResult | null> {
    await this.initialize()

    if (!this.classificationsContainer) {
      throw new Error("Classifications container not initialized")
    }

    try {
      const { resource } = await this.classificationsContainer.item(id, id).read()
      return (resource as ClassificationResult) || null
    } catch (error) {
      if ((error as any).code === 404) {
        return null
      }
      serverLogger.error("Failed to get classification", error as Error)
      throw error
    }
  }

  /**
   * Delete classification
   */
  async deleteClassification(id: string, userId: string): Promise<void> {
    await this.initialize()

    if (!this.classificationsContainer) {
      throw new Error("Classifications container not initialized")
    }

    try {
      // Verify ownership
      const classification = await this.getClassification(id)
      if (!classification || classification.userId !== userId) {
        throw new Error("Classification not found or access denied")
      }

      await this.classificationsContainer.item(id, id).delete()
      serverLogger.info("Classification deleted", { classificationId: id })
    } catch (error) {
      serverLogger.error("Failed to delete classification", error as Error)
      throw error
    }
  }

  /**
   * Save or update user profile
   */
  async saveUserProfile(profile: UserProfile): Promise<UserProfile> {
    await this.initialize()

    if (!this.usersContainer) {
      throw new Error("Users container not initialized")
    }

    try {
      const item = {
        id: profile.id,
        ...profile,
        updatedAt: new Date().toISOString(),
      }

      const { resource } = await this.usersContainer.items.upsert(item)
      serverLogger.info("User profile saved", { userId: resource?.id })

      return resource as UserProfile
    } catch (error) {
      serverLogger.error("Failed to save user profile", error as Error)
      throw error
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    await this.initialize()

    if (!this.usersContainer) {
      throw new Error("Users container not initialized")
    }

    try {
      const { resource } = await this.usersContainer.item(userId, userId).read()
      return (resource as UserProfile) || null
    } catch (error) {
      if ((error as any).code === 404) {
        return null
      }
      serverLogger.error("Failed to get user profile", error as Error)
      throw error
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    totalClassifications: number
    recentClassifications: number
    topConditions: Array<{ condition: string; count: number }>
  }> {
    await this.initialize()

    if (!this.classificationsContainer) {
      throw new Error("Classifications container not initialized")
    }

    try {
      // Total classifications
      const totalQuery = {
        query: "SELECT VALUE COUNT(1) FROM c WHERE c.userId = @userId",
        parameters: [{ name: "@userId", value: userId }],
      }
      const { resources: totalResult } = await this.classificationsContainer.items.query(totalQuery).fetchAll()
      const totalClassifications = totalResult[0] || 0

      // Recent classifications (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const recentQuery = {
        query: "SELECT VALUE COUNT(1) FROM c WHERE c.userId = @userId AND c.createdAt >= @date",
        parameters: [
          { name: "@userId", value: userId },
          { name: "@date", value: thirtyDaysAgo },
        ],
      }
      const { resources: recentResult } = await this.classificationsContainer.items.query(recentQuery).fetchAll()
      const recentClassifications = recentResult[0] || 0

      // Top conditions
      const conditionsQuery = {
        query: `
          SELECT c.predictions[0].tagName as condition, COUNT(1) as count
          FROM c 
          WHERE c.userId = @userId AND ARRAY_LENGTH(c.predictions) > 0
          GROUP BY c.predictions[0].tagName
          ORDER BY COUNT(1) DESC
          OFFSET 0 LIMIT 5
        `,
        parameters: [{ name: "@userId", value: userId }],
      }
      const { resources: conditionsResult } = await this.classificationsContainer.items
        .query(conditionsQuery)
        .fetchAll()

      return {
        totalClassifications,
        recentClassifications,
        topConditions: conditionsResult || [],
      }
    } catch (error) {
      serverLogger.error("Failed to get user stats", error as Error)
      throw error
    }
  }

  /**
   * Search classifications
   */
  async searchClassifications(userId: string, searchTerm: string, limit = 20): Promise<ClassificationResult[]> {
    await this.initialize()

    if (!this.classificationsContainer) {
      throw new Error("Classifications container not initialized")
    }

    try {
      const query = {
        query: `
          SELECT * FROM c 
          WHERE c.userId = @userId 
          AND (
            CONTAINS(LOWER(c.predictions[0].tagName), LOWER(@searchTerm))
            OR CONTAINS(LOWER(c.fileName), LOWER(@searchTerm))
          )
          ORDER BY c.createdAt DESC
          OFFSET 0 LIMIT @limit
        `,
        parameters: [
          { name: "@userId", value: userId },
          { name: "@searchTerm", value: searchTerm },
          { name: "@limit", value: limit },
        ],
      }

      const { resources } = await this.classificationsContainer.items.query(query).fetchAll()
      return resources as ClassificationResult[]
    } catch (error) {
      serverLogger.error("Failed to search classifications", error as Error)
      throw error
    }
  }
}

export const cosmosService = new CosmosService()
