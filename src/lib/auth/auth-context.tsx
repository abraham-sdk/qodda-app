/**
 * Authentication context using MSAL for Azure AD B2C
 */

"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { PublicClientApplication, InteractionStatus, InteractionRequiredAuthError } from "@azure/msal-browser"
import { MsalProvider, useMsal, useIsAuthenticated, useAccount } from "@azure/msal-react"
import { msalConfig, loginRequest, tokenRequest } from "./msal-config"
import type { User } from "@/src/lib/types"

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig)

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  getAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </MsalProvider>
  )
}

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { instance, accounts, inProgress } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const account = useAccount(accounts[0] || {})

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && account) {
      // Convert MSAL account to our User type
      const userData: User = {
        id: account.homeAccountId,
        email: account.username,
        name: account.name || account.username,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setUser(userData)
    } else {
      setUser(null)
    }

    setIsLoading(inProgress === InteractionStatus.Startup)
  }, [isAuthenticated, account, inProgress])

  const signIn = async () => {
    try {
      setIsLoading(true)
      await instance.loginRedirect(loginRequest)
    } catch (error) {
      console.error("Sign in error:", error)
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      })
    } catch (error) {
      console.error("Sign out error:", error)
      setIsLoading(false)
    }
  }

  const getAccessToken = async (): Promise<string | null> => {
    if (!account) return null

    try {
      const response = await instance.acquireTokenSilent({
        ...tokenRequest,
        account: account,
      })
      return response.accessToken
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Fallback to interactive method
        try {
          const response = await instance.acquireTokenPopup(tokenRequest)
          return response.accessToken
        } catch (interactiveError) {
          console.error("Interactive token acquisition failed:", interactiveError)
          return null
        }
      }
      console.error("Token acquisition failed:", error)
      return null
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    getAccessToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
