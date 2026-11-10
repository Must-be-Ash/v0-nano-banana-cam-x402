import { type NextRequest, NextResponse } from "next/server"
import {
  x402HTTPResourceServer,
  type x402ResourceServer,
  type HTTPAdapter,
  type HTTPRequestContext,
  type HTTPResponseInstructions,
  type RouteConfig,
} from "@x402/core/server"

// Minimal x402 v2 route wrapper built on @x402/core (@x402/next requires Next 16).
// Verifies and settles payment BEFORE the handler runs so USDC is collected before
// the expensive fal.ai call, then attaches the PAYMENT-RESPONSE receipt header.

class NextAdapter implements HTTPAdapter {
  constructor(private req: NextRequest) {}
  getHeader(name: string) {
    return this.req.headers.get(name) || undefined
  }
  getMethod() {
    return this.req.method
  }
  getPath() {
    return this.req.nextUrl.pathname
  }
  getUrl() {
    return this.req.url
  }
  getAcceptHeader() {
    return this.req.headers.get("Accept") || ""
  }
  getUserAgent() {
    return this.req.headers.get("User-Agent") || ""
  }
}

function toNextResponse(response: HTTPResponseInstructions) {
  const headers = new Headers(response.headers)
  if (response.isHtml) {
    headers.set("Content-Type", "text/html")
    return new NextResponse(response.body as string, { status: response.status, headers })
  }
  headers.set("Content-Type", "application/json")
  return new NextResponse(JSON.stringify(response.body ?? {}), { status: response.status, headers })
}

export function withX402(
  handler: (request: NextRequest) => Promise<NextResponse>,
  routeConfig: RouteConfig,
  server: x402ResourceServer,
) {
  const httpServer = new x402HTTPResourceServer(server, { "*": routeConfig })
  let initPromise: Promise<void> | null = null

  return async (request: NextRequest): Promise<NextResponse> => {
    initPromise ??= httpServer.initialize().catch((error) => {
      initPromise = null
      throw error
    })
    await initPromise

    const adapter = new NextAdapter(request)
    const context: HTTPRequestContext = {
      adapter,
      path: request.nextUrl.pathname,
      method: request.method,
      paymentHeader: adapter.getHeader("payment-signature") || adapter.getHeader("x-payment"),
    }

    const result = await httpServer.processHTTPRequest(context)

    if (result.type === "no-payment-required") return handler(request)
    if (result.type === "payment-error") return toNextResponse(result.response)

    const settlement = await httpServer.processSettlement(
      result.paymentPayload,
      result.paymentRequirements,
      result.declaredExtensions,
      { request: context },
    )

    if (!settlement.success) return toNextResponse(settlement.response)

    const response = await handler(request)
    for (const [key, value] of Object.entries(settlement.headers)) {
      response.headers.set(key, value)
    }
    return response
  }
}
