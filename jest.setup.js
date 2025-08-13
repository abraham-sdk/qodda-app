import jest from "jest"
import "@testing-library/jest-dom"

// Mock Azure services for testing
jest.mock("@azure/storage-blob", () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn(() => ({
      getContainerClient: jest.fn(() => ({
        uploadBlockBlob: jest.fn(),
        getBlobClient: jest.fn(() => ({
          url: "https://mock-blob-url.com/image.jpg",
        })),
      })),
    })),
  },
}))

jest.mock("@azure/cosmos", () => ({
  CosmosClient: jest.fn(() => ({
    database: jest.fn(() => ({
      container: jest.fn(() => ({
        items: {
          create: jest.fn(),
          query: jest.fn(() => ({
            fetchAll: jest.fn(() => ({ resources: [] })),
          })),
        },
      })),
    })),
  })),
}))
