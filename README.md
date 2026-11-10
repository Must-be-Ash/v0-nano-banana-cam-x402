# Nano Banana Cam x402

AI-powered camera app with **cryptocurrency micropayments** using the x402 protocol. Capture photos and transform them with 21 unique AI filters for just $0.05 USDC per transformation.

[![Hosted on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://x402-thumbnails.vercel.app/)
[![x402 Protocol](https://img.shields.io/badge/Powered%20by-x402-blue?style=for-the-badge)](https://www.x402.org/)

---

## 🎯 Overview

This app demonstrates **HTTP 402 Payment Required** in action - a modern micropayment standard that brings cryptocurrency payments to web APIs. Users pay $0.05 in USDC on Base network for each AI image transformation, with payments happening automatically and transparently.

### What is x402?

[**x402**](https://www.x402.org/) is an open HTTP protocol that enables **instant cryptocurrency micropayments** for API access. Instead of subscriptions or manual payments, users pay tiny amounts (cents) per request using USDC stablecoins.

**How it works:**
1. Client makes API request without payment → receives HTTP 402 "Payment Required"
2. Client automatically creates cryptographic payment authorization and retries
3. Server verifies payment signature and balance
4. Server settles payment on-chain (USDC transferred to your wallet)
5. Server delivers the resource (processed image)

**Benefits:**
- ✅ **No subscriptions** - pay only for what you use
- ✅ **Instant settlement** - USDC arrives in your wallet immediately
- ✅ **Gasless for users** - facilitator pays blockchain fees
- ✅ **Trustless** - cryptographic signatures, no intermediaries
- ✅ **HTTP-native** - works with any HTTP client/server

Learn more: [x402.org](https://www.x402.org/)

---

## 💳 How x402 Works in This App

When a user captures a photo and applies a filter:

1. **Wallet Connection**: User connects crypto wallet (via RainbowKit)
2. **Capture & Filter**: User takes photo and selects AI filter
3. **Payment Authorization**: Client automatically signs EIP-3009 payment authorization ($0.05 USDC)
4. **Verification**: Server verifies signature and checks USDC balance
5. **Settlement**: Server executes on-chain USDC transfer (payment collected)
6. **AI Processing**: Image sent to fal.ai Nano Banana API for transformation
7. **Delivery**: Processed image returned with watermark

**Payment happens in step 5 BEFORE expensive AI processing** - ensuring you only pay for successful deliveries.

**Transaction Details:**
- **Network**: Base (Ethereum L2)
- **Token**: USDC (Circle's USD stablecoin)
- **Amount**: $0.05 per transformation
- **Facilitator**: Coinbase Developer Platform (CDP)
- **Your Revenue**: 100% (you keep all payments)

---

## 🙏 Credits

This app is a **fork** of the original [Nano Banana Cam](https://x.com/estebansuarez) created by **Esteban Suarez** ([@EstebanSuarez](https://x.com/estebansuarez)).

**Original App**: Camera application with AI-powered image filters using fal.ai's Nano Banana model

**This Fork**: Added x402 cryptocurrency micropayments to monetize AI transformations

All credit for the core camera app, UI/UX design, and filter concepts goes to Esteban Suarez. This fork demonstrates how to add HTTP 402 payments to existing web applications.

---

## ✨ Features

### AI Transformations (21 Filters)
- **Art Deco** - 1920s glamour
- **Cyberpunk** - Futuristic neon cities
- **Wild West** - Cowboy frontier
- ...and more

### x402 Micropayments
- $0.05 USDC per AI transformation
- Automatic payment handling (no manual approvals per payment)
- Instant settlement to your wallet
- Base network (low fees)
- Gasless for end users

### Technical Features
- Responsive camera interface
- Front/back camera support
- Real-time payment verification
- CDP facilitator integration
- RainbowKit wallet connection
- Automatic watermarking
- Rate limiting (Redis via Upstash)

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: [fal.ai](https://fal.ai) Nano Banana model
- **Payments**: [x402 protocol](https://www.x402.org/)
- **Blockchain**: Base (Ethereum L2)
- **Wallet**: [RainbowKit](https://www.rainbowkit.com/) + wagmi + viem
- **Facilitator**: [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
- **Styling**: Tailwind CSS v4
- **Rate Limiting**: Upstash Redis
- **Deployment**: Vercel

---

## 🚀 Setup Guide

### Prerequisites

- Node.js 18+ and npm
- Crypto wallet with USDC on Base network (to receive payments)
- Coinbase Developer Platform account
- WalletConnect account
- fal.ai API key
- Upstash Redis database

### 1. Fork & Clone

```bash
git clone https://github.com/Must-be-Ash/thumbnail-maker
cd thumbnail-maker
npm install
```

### 2. Get Required API Keys

#### Coinbase Developer Platform (Payment Processing)
1. Go to [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Save your `API Key ID` and `API Key Secret`

#### WalletConnect (Wallet Connection)
1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create account and new project
3. Copy your **Project ID**

#### fal.ai (AI Image Processing)
1. Go to [fal.ai](https://fal.ai)
2. Sign up and get your API key
3. Copy your **FAL_KEY**

#### Upstash Redis (Rate Limiting)
1. Go to [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy **REST URL** and **REST Token**

### 3. Configure Environment Variables

Create `.env.local`:

```bash
# Coinbase Developer Platform (for payment processing)
CDP_API_KEY_ID=your-cdp-api-key-id
CDP_API_KEY_SECRET=your-cdp-api-key-secret

# Your wallet address (where payments are sent)
RECIPIENT_WALLET_ADDRESS=0xYourWalletAddress

# Network configuration (Base mainnet)
NEXT_PUBLIC_NETWORK=eip155:8453
NEXT_PUBLIC_USDC_CONTRACT=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# WalletConnect (for RainbowKit wallet connection)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# fal.ai (for AI image processing)
FAL_KEY=your-fal-api-key

# Upstash Redis (for rate limiting)
KV_REST_API_URL=your-upstash-redis-url
KV_REST_API_TOKEN=your-upstash-redis-token
```

### 4. Update Payment Amount (Optional)

Edit `app/api/process-image/route.ts`:

```typescript
export const POST = withX402(handler, {
  accepts: { scheme: "exact", price: "$0.05", ... }, // Change to your desired price in USD
  ...
}, resourceServer)
```

### 5. Test Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Testing Tips:**
- Use testnet first (change `NEXT_PUBLIC_NETWORK=eip155:84532`)
- Get test USDC from [CDP Faucet](https://portal.cdp.coinbase.com/products/faucet)
- Monitor payments in browser console logs

### 6. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
vercel env add CDP_API_KEY_ID
vercel env add CDP_API_KEY_SECRET
# ... add all other env vars

# Deploy to production
vercel --prod
```

**Important**: Set all environment variables in Vercel dashboard under **Settings → Environment Variables**

---

## 💰 Payment Flow (Technical)

### Client-Side Flow

```typescript
// 1. User connects wallet (RainbowKit)
const { address, isConnected } = useAccount()
const { data: walletClient } = useWalletClient()

// 2. User captures photo and selects filter
// → triggers payment flow

// 3. Build an x402 v2 client and wrap native fetch
const { wrapFetchWithPayment, x402Client } = await import("@x402/fetch")
const { ExactEvmScheme, toClientEvmSigner } = await import("@x402/evm")

const signer = toClientEvmSigner(
  { address: walletClient.account.address, signTypedData: (msg) => walletClient.signTypedData(msg) },
  publicClient,
)
const client = new x402Client()
  .register("eip155:8453", new ExactEvmScheme(signer))
  .registerPolicy((_v, reqs) => reqs.filter((r) => BigInt(r.amount) <= BigInt(0.1 * 10 ** 6))) // Max: $0.10 USDC

const fetchWithPayment = wrapFetchWithPayment(fetch, client)

// 4. Automatic payment handling
const response = await fetchWithPayment("/api/process-image", {
  method: "POST",
  body: JSON.stringify({ imageUrl, filter })
})

// Payment happens automatically:
// - First request → receives 402 with payment requirements
// - Client signs EIP-3009 authorization (one signature)
// - Retries with PAYMENT-SIGNATURE header
// - Server verifies, settles, processes image
```

### Server-Side Flow

```typescript
// app/api/process-image/route.ts
import { facilitator } from "@coinbase/x402"
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server"
import { ExactEvmScheme } from "@x402/evm/exact/server"
import { withX402 } from "@/lib/x402" // verifies + settles before the handler runs

const resourceServer = new x402ResourceServer(new HTTPFacilitatorClient(facilitator))
  .register("eip155:8453", new ExactEvmScheme())

async function handler(request: NextRequest) {
  // Only runs after payment is verified AND settled
  const result = await fal.subscribe("fal-ai/nano-banana/edit", {
    input: { prompt, image_urls: [imageUrl] }
  })
  return NextResponse.json({ processedImageUrl: result.data.images[0].url })
}

export const POST = withX402(handler, {
  accepts: { scheme: "exact", price: "$0.05", network: "eip155:8453", payTo: RECIPIENT_ADDRESS },
  description: "AI image transformation with Nano Banana - $0.05",
}, resourceServer)

// No PAYMENT-SIGNATURE header → 402 with PAYMENT-REQUIRED header
// Successful response → includes PAYMENT-RESPONSE receipt header
```

**Key Security Points:**
- ✅ Payment verification happens BEFORE image processing
- ✅ Payment settlement happens BEFORE expensive API calls
- ✅ If settlement fails, user doesn't get the image
- ✅ Cryptographic signatures prevent fraud
- ✅ Nonces prevent replay attacks

---

## 📊 Monitoring Payments

### Check Your Balance

Visit [BaseScan](https://basescan.org/) and enter your `RECIPIENT_WALLET_ADDRESS` to see:
- Total USDC received
- Transaction history
- Individual payment details

### View Transaction Details

Each payment includes transaction hash in response:

```typescript
const receipt = decodeXPaymentResponse(
  response.headers.get('x-payment-response')
)

console.log('Transaction:', receipt.transaction)
console.log('Network:', receipt.network)
console.log('Payer:', receipt.payer)
```

View on block explorer:
```
https://basescan.org/tx/{receipt.transaction}
```

---

## 🔧 Development

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### Environment-Specific Testing

**Testnet (Base Sepolia, `eip155:84532`):**
```bash
NEXT_PUBLIC_NETWORK=eip155:84532
```

**Mainnet (Base, `eip155:8453`):**
```bash
NEXT_PUBLIC_NETWORK=eip155:8453
```

### Debugging Payment Issues

Check browser console for detailed logs:
```
[x402] Payment verified successfully
[x402] Settling payment...
[x402] ✅ Payment settled successfully!
[x402] Transaction: 0x...
```

If you see errors, check:
1. Environment variables are set correctly
2. Wallet has sufficient USDC balance
3. CDP API keys are valid
4. Network matches (testnet vs mainnet)

---

## 📚 Learn More

### x402 Protocol
- **Website**: [x402.org](https://www.x402.org/)
- **Documentation**: Learn about HTTP 402 payments
- **GitHub**: [github.com/coinbase/x402](https://github.com/coinbase/x402)

### Coinbase Developer Platform
- **Portal**: [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com/)
- **Facilitator**: Payment verification and settlement service


### Related Technologies
- **RainbowKit**: [rainbowkit.com](https://www.rainbowkit.com/)
- **wagmi**: [wagmi.sh](https://wagmi.sh)
- **viem**: [viem.sh](https://viem.sh)
- **fal.ai**: [fal.ai](https://fal.ai)
- **Base**: [base.org](https://base.org)

---

## 🤝 Contributing

Contributions are welcome! This fork demonstrates x402 integration patterns that can be applied to other applications.

**Ideas for Contributions:**
- Additional AI filters
- Alternative payment networks (Solana, etc.)
- Subscription models using x402
- Analytics dashboard
- Batch processing discounts

---

## 🌟 Showcase

This app demonstrates how to:
- ✅ Add cryptocurrency payments to existing apps
- ✅ Implement HTTP 402 Payment Required
- ✅ Use CDP facilitator for payment processing
- ✅ Integrate RainbowKit for wallet connection
- ✅ Handle EIP-3009 payment authorizations
- ✅ Build pay-per-use AI APIs
- ✅ Deploy x402 apps to Vercel

**Perfect starting point for building paid APIs with x402!**

---

**A frok of nano banana cam v0 template by by [@EstebanSuarez](https://x.com/estebansuarez) | Learn more about x402 at [x402.org](https://www.x402.org/)**
