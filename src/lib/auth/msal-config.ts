/**
 * MSAL (Microsoft Authentication Library) configuration for Azure AD B2C
 */

import type { Configuration, PopupRequest, RedirectRequest } from "@azure/msal-browser"

// MSAL configuration object
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID!,
    authority: `https://${process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.NEXT_PUBLIC_AZURE_AD_B2C_POLICY_NAME}`,
    knownAuthorities: [`${process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME}.b2clogin.com`],
    redirectUri: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    postLogoutRedirectUri: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case 0: // LogLevel.Error
            console.error(message)
            return
          case 1: // LogLevel.Warning
            console.warn(message)
            return
          case 2: // LogLevel.Info
            console.info(message)
            return
          case 3: // LogLevel.Verbose
            console.debug(message)
            return
        }
      },
    },
  },
}

// Scopes for API access
export const loginRequest: RedirectRequest = {
  scopes: ["openid", "profile", "email"],
}

export const tokenRequest: PopupRequest = {
  scopes: ["openid", "profile", "email"],
  
  // forceRefresh: false,
}

// Graph API scopes (if needed for additional user info)
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
}
