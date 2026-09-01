import * as React from "react"
import { getPlatformGatewayConfig } from "@/actions/gateway-actions"
import { GatewaySettingsManager } from "@/components/admin/gateway-settings-manager"
import { headers } from "next/headers"

export const dynamic = "force-dynamic"

export default async function AdminGatewayPage() {
  const config = await getPlatformGatewayConfig()
  
  const headersList = await headers()
  const host = headersList.get("host") || "localhost:3000"
  const protocol = headersList.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https")
  const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || `${protocol}://${host}`
  const webhookUrl = `${baseUrl}/api/webhooks/mercadopago`

  return (
    <GatewaySettingsManager
      initialConfig={config}
      webhookUrl={webhookUrl}
    />
  )
}
