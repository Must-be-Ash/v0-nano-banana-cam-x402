import { type NextRequest, NextResponse } from "next/server"
import { fal } from "@fal-ai/client"
import { rateLimiter, getClientIP } from "@/lib/rate-limiter"
import { facilitator } from "@coinbase/x402"
import { withX402 } from "@/lib/x402"
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server"
import { ExactEvmScheme } from "@x402/evm/exact/server"
import { createThumbnailPrompt, createCombinedPrompt } from "@/lib/thumbnail-prompt"

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
})

// x402 v2 resource server backed by the CDP facilitator (Node.js runtime)
const resourceServer = new x402ResourceServer(new HTTPFacilitatorClient(facilitator)).register(
  "eip155:8453",
  new ExactEvmScheme(),
)

const RECIPIENT_ADDRESS = process.env.RECIPIENT_WALLET_ADDRESS! as `0x${string}`

const filterConfigs = {
  acid: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with psychedelic acid trip aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Apply flowing tie-dye patterns to clothing with photorealistic fabric textures, rainbow color shifts in hair maintaining natural hair physics, kaleidoscope reflections in eyes with anatomically correct eye structure, preserve exact facial features and natural skin textures while adding subtle color morphing effects that look like real light refraction. For LANDSCAPES: Transform sky into swirling rainbow patterns with realistic cloud formations, add flowing color waves across terrain maintaining geological accuracy, create fractal patterns in trees/mountains with photorealistic bark and rock textures, preserve natural lighting physics and atmospheric perspective. For OBJECTS: Add rainbow color shifts with realistic material properties, create kaleidoscope reflections following real optical laws, maintain exact object proportions and surface textures. For FOOD: Add colorful swirling patterns while preserving realistic food textures, moisture, and natural food physics. For ANIMALS: Add colorful fur/feather patterns with anatomically correct animal features, realistic fur/feather physics. CRITICAL: Maintain photorealistic lighting, shadows, reflections, and material properties. Result must look like a real photograph taken with professional camera equipment, not digital art or illustration.",
  },
  vintage: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with authentic 1970s vintage aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add period-accurate vintage clothing with realistic fabric wear, authentic 1970s hairstyles with natural hair physics, maintain exact facial features and skin textures with realistic film grain overlay, preserve natural body proportions and lighting. For LANDSCAPES: Apply warm golden hour lighting with realistic sun positioning, vintage color grading using authentic film stock characteristics, add realistic film grain texture, maintain accurate atmospheric perspective and natural lighting physics. For OBJECTS: Add authentic aged textures with realistic wear patterns, vintage patina following real oxidation processes, maintain exact object proportions and material properties. For FOOD: Present with period-accurate serving ware, realistic food textures and moisture, authentic vintage photography lighting. For ANIMALS: Maintain anatomically correct animal features with realistic fur/feather textures, natural animal behavior and positioning. CRITICAL: Must look like an actual vintage photograph from the 1970s shot on film, with authentic grain structure, color characteristics, and lighting conditions. No digital art or illustration effects.",
  },
  cyberpunk: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with futuristic cyberpunk aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic LED accents to clothing with authentic light emission and reflection, cybernetic enhancements that look like real prosthetics, holographic elements with realistic light refraction, maintain exact facial features and natural skin textures with realistic lighting interaction. For LANDSCAPES: Transform into photorealistic neon-lit cityscapes with accurate architectural perspective, realistic LED lighting physics, authentic urban atmosphere and lighting conditions. For OBJECTS: Add realistic LED strips with proper light emission, holographic displays following real optical physics, metallic chrome finishes with accurate reflection properties, maintain exact object proportions. For FOOD: Present with realistic futuristic serving methods, authentic neon lighting effects on food surfaces, maintain natural food textures and physics. For ANIMALS: Add subtle cybernetic enhancements that look like real implants, maintain anatomically correct animal features with realistic fur/skin textures. CRITICAL: Must look like a real photograph taken in an actual cyberpunk environment, with authentic lighting physics, material properties, and atmospheric conditions. No cartoon or digital art effects.",
  },
  underwater: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with immersive underwater aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic underwater hair and clothing physics with natural buoyancy, authentic bubble formation and light refraction, maintain exact facial features with realistic underwater lighting effects on skin. For LANDSCAPES: Transform into photorealistic underwater scenes with accurate water physics, realistic coral formations, authentic marine life, proper underwater light filtering and caustic patterns. For OBJECTS: Add realistic coral growth following natural patterns, authentic seaweed attachment, accurate water distortion effects based on real optics, maintain exact object proportions. For FOOD: Present with realistic underwater physics, authentic bubble effects, maintain natural food textures as they would appear underwater. For ANIMALS: Add realistic swimming motion with accurate hydrodynamics, authentic bubble trails, maintain anatomically correct features with realistic underwater adaptations. CRITICAL: Must look like an actual underwater photograph taken with professional diving equipment, with authentic water physics, light refraction, and marine environment conditions. Perfect underwater photography realism.",
  },
  medieval: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with authentic medieval fantasy aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add period-accurate clothing with realistic fabric textures and wear patterns, authentic medieval craftsmanship details, maintain exact facial features with realistic candlelit skin tones and shadows. For LANDSCAPES: Transform into photorealistic medieval settings with architecturally accurate castles, authentic stone construction techniques, realistic medieval landscape features with proper atmospheric perspective. For OBJECTS: Add authentic medieval craftsmanship with realistic metalwork, accurate aging and patina, hand-forged details that follow historical accuracy, maintain exact proportions. For FOOD: Present with historically accurate serving methods, realistic medieval food preparation, authentic wooden and ceramic textures. For ANIMALS: Add period-appropriate accessories with realistic leather and metal work, maintain anatomically correct animal features with authentic medieval context. CRITICAL: Must look like an actual photograph of a real medieval reenactment or historical site, with authentic materials, lighting, and historical accuracy. Perfect historical photography realism.",
  },
  apocalypse: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with post-apocalyptic survival aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistically weathered clothing with authentic wear patterns, genuine survival gear with realistic usage marks, maintain exact facial features with authentic environmental weathering effects on skin. For LANDSCAPES: Transform into photorealistic wasteland scenes with accurate decay physics, realistic structural damage, authentic atmospheric conditions with proper dust and debris physics. For OBJECTS: Add realistic rust and corrosion following actual oxidation processes, authentic makeshift repairs using real materials, maintain exact proportions with believable weathering. For FOOD: Present as realistic survival rations with authentic packaging wear, accurate preservation methods, maintain natural food textures under harsh conditions. For ANIMALS: Add realistic survival adaptations following evolutionary biology, authentic environmental weathering on fur/skin, maintain anatomically correct features. CRITICAL: Must look like an actual documentary photograph of real post-disaster conditions, with authentic weathering, realistic decay processes, and believable survival scenarios. Perfect disaster photography realism.",
  },
  steampunk: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Victorian steampunk aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic brass goggles with realistic metal patina, genuine leather accessories with natural wear, period-accurate Victorian clothing with realistic fabric textures, maintain exact facial features with authentic Victorian-era lighting. For LANDSCAPES: Transform into photorealistic industrial Victorian scenes with architecturally accurate steam machinery, authentic brass and iron construction, realistic steam effects with proper physics. For OBJECTS: Add genuine brass fittings with realistic oxidation, authentic steam mechanisms following real engineering principles, accurate clockwork gears with proper mechanical function, maintain exact proportions. For FOOD: Present with authentic Victorian serving ware, realistic steam effects on hot foods, period-accurate presentation methods. For ANIMALS: Add realistic mechanical accessories with authentic craftsmanship, maintain anatomically correct animal features with believable steampunk integration. CRITICAL: Must look like an actual photograph of real Victorian-era industrial equipment and fashion, with authentic materials, realistic mechanical function, and historical accuracy. Perfect Victorian photography realism.",
  },
  tropical: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with vibrant tropical paradise aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic tropical clothing with realistic fabric textures, genuine flower leis with natural plant details, maintain exact facial features with realistic tropical lighting and natural skin tones. For LANDSCAPES: Transform into photorealistic tropical scenes with botanically accurate palm trees, authentic beach geology, crystal-clear water with realistic refraction and reflection physics. For OBJECTS: Add authentic tropical materials with realistic bamboo grain, natural island craftsmanship details, maintain exact proportions with believable tropical weathering. For FOOD: Present authentic tropical cuisine with realistic exotic fruit textures, natural coconut materials, maintain accurate food physics and moisture. For ANIMALS: Add tropical species with anatomically correct features, realistic plumage and fur textures, authentic tropical environment interactions. CRITICAL: Must look like an actual tropical vacation photograph taken with professional equipment, with authentic natural lighting, realistic tropical conditions, and perfect beach photography quality. No artificial or enhanced effects.",
  },
  winter: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with serene winter wonderland aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic winter clothing with realistic fabric textures and insulation details, natural cold-weather effects on skin like rosy cheeks, maintain exact facial features with realistic winter lighting conditions. For LANDSCAPES: Transform into photorealistic snowy scenes with accurate snow physics, realistic ice formation, authentic frost patterns following natural crystallization, maintain proper winter atmospheric conditions. For OBJECTS: Add realistic snow accumulation following natural physics, authentic frost effects with accurate ice crystal formation, maintain exact proportions with believable winter weathering. For FOOD: Present authentic winter comfort food with realistic steam effects, natural hot food physics, maintain accurate food textures in cold conditions. For ANIMALS: Add realistic winter fur thickness following natural adaptation, authentic snow interaction, maintain anatomically correct features with believable cold-weather behavior. CRITICAL: Must look like an actual winter landscape photograph taken in real snow conditions, with authentic winter lighting, realistic snow physics, and perfect cold-weather photography quality.",
  },
  neon_tokyo: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with vibrant Tokyo street night aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic Japanese street fashion with realistic fabric textures, genuine neon light reflections on clothing following optical physics, maintain exact facial features with realistic urban night lighting. For LANDSCAPES: Transform into photorealistic neon-lit Tokyo streets with architecturally accurate Japanese buildings, authentic kanji signage, realistic urban density and perspective. For OBJECTS: Add authentic Japanese design elements with realistic materials, genuine neon lighting effects with proper light emission, maintain exact proportions with believable urban wear. For FOOD: Present authentic Japanese street food with realistic textures, genuine food stall lighting, maintain accurate food physics and presentation. For ANIMALS: Add realistic urban adaptation features, authentic city lighting effects on fur/feathers, maintain anatomically correct animal characteristics. CRITICAL: Must look like an actual night street photograph taken in Tokyo with professional camera equipment, with authentic neon lighting physics, realistic urban atmosphere, and perfect street photography quality. No artificial enhancement effects.",
  },
  wild_west: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with authentic Wild West frontier aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add period-accurate cowboy attire with realistic leather textures and authentic wear patterns, maintain exact facial features with realistic desert lighting and natural weathering effects. For LANDSCAPES: Transform into photorealistic desert frontier scenes with geologically accurate formations, authentic American Southwest vegetation, realistic atmospheric perspective and desert lighting conditions. For OBJECTS: Add authentic frontier materials with realistic wood grain and metal patina, genuine leather work with natural aging, maintain exact proportions with believable frontier craftsmanship. For FOOD: Present authentic frontier cuisine with realistic campfire cooking effects, period-accurate preparation methods, maintain natural food textures under frontier conditions. For ANIMALS: Add realistic Western context with authentic horse tack and cattle features, maintain anatomically correct animal characteristics with believable frontier environment adaptation. CRITICAL: Must look like an actual historical Wild West photograph or modern Western reenactment, with authentic period materials, realistic desert conditions, and perfect frontier photography quality.",
  },
  art_deco: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with elegant 1920s Art Deco aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic 1920s fashion with realistic fabric textures and period-accurate construction, genuine geometric jewelry with realistic metal and gem properties, maintain exact facial features with authentic Jazz Age lighting and makeup styles. For LANDSCAPES: Transform into photorealistic Art Deco cityscapes with architecturally accurate 1920s buildings, authentic geometric design elements, realistic urban lighting and atmospheric conditions. For OBJECTS: Add genuine geometric patterns with realistic material execution, authentic gold accents with proper metallic properties, maintain exact proportions with believable 1920s craftsmanship. For FOOD: Present with authentic 1920s presentation using period-accurate serving ware, realistic geometric plating, maintain natural food textures with elegant styling. For ANIMALS: Add realistic Art Deco styling context with authentic 1920s luxury environment, maintain anatomically correct animal features. CRITICAL: Must look like an actual 1920s photograph or modern Art Deco recreation, with authentic period materials, realistic luxury finishes, and perfect Jazz Age photography quality.",
  },
  fairy_tale: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with enchanting fairy tale magic aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic magical clothing elements with authentic fabric textures and believable fantasy construction, maintain exact facial features with realistic magical lighting effects that follow optical physics. For LANDSCAPES: Transform into photorealistic enchanted forests with botanically accurate magical plants, realistic fairy lights using authentic light sources, maintain natural forest physics with believable magical enhancements. For OBJECTS: Add realistic magical enhancements with believable sparkle effects using real light physics, maintain exact object proportions with authentic magical craftsmanship. For FOOD: Present magical feast items with realistic food textures enhanced by believable magical presentation, maintain natural food physics with enchanted styling. For ANIMALS: Add realistic fairy tale creature elements following natural biology, maintain anatomically correct features with believable magical adaptations. CRITICAL: Must look like an actual photograph of a real fairy tale movie set or fantasy theme park, with authentic magical effects created through practical means, realistic lighting, and perfect fantasy photography quality. No obvious digital effects.",
  },
  horror: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with atmospheric gothic horror aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic gothic styling with realistic fabric textures and period-accurate construction, maintain exact facial features with realistic dramatic lighting that creates natural shadows and atmospheric effects. For LANDSCAPES: Transform into photorealistic gothic scenes with architecturally accurate old buildings, authentic atmospheric fog using real weather conditions, maintain natural lighting physics with dramatic enhancement. For OBJECTS: Add realistic aged textures following natural weathering processes, authentic antique patina with believable aging, maintain exact proportions with genuine historical wear. For FOOD: Present with authentic gothic presentation using period-accurate serving methods, realistic candlelit ambiance with natural flame lighting. For ANIMALS: Add realistic atmospheric enhancement with natural dramatic lighting, maintain anatomically correct animal features with believable gothic environment adaptation. CRITICAL: Must look like an actual photograph of a real gothic location or horror movie set, with authentic atmospheric conditions, realistic lighting, and perfect dramatic photography quality. Atmospheric but not frightening.",
  },
  desert_mirage: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with mystical Arabian desert aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic flowing desert robes with realistic fabric physics and wind effects, genuine ornate jewelry with realistic metalwork and gem properties, maintain exact facial features with authentic desert lighting conditions. For LANDSCAPES: Transform into photorealistic vast desert scenes with geologically accurate sand dunes, realistic oasis vegetation, authentic mirage effects following optical physics. For OBJECTS: Add genuine Arabian craftsmanship with realistic metalwork and authentic patina, maintain exact proportions with believable desert weathering and sand effects. For FOOD: Present authentic Arabian cuisine with realistic spice textures, period-accurate serving methods, maintain natural food physics in desert conditions. For ANIMALS: Add realistic desert adaptations following evolutionary biology, maintain anatomically correct features with authentic Middle Eastern environment context. CRITICAL: Must look like an actual desert photograph taken in the Arabian Peninsula, with authentic desert lighting, realistic sand physics, and perfect desert photography quality.",
  },
  crystal_cave: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with magical crystal cave aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic crystalline accessories with authentic mineral properties, genuine gem-like reflections following optical physics, maintain exact facial features with realistic prismatic lighting effects created by real crystal refraction. For LANDSCAPES: Transform into photorealistic crystal caverns with geologically accurate gem formations, authentic prismatic light effects using real crystal optics, maintain natural cave physics with believable crystal growth. For OBJECTS: Add realistic crystal growth following natural mineralogy, authentic gem-like surfaces with proper refractive properties, maintain exact proportions with believable crystalline integration. For FOOD: Present with genuine crystal serving ware, realistic prismatic effects on food surfaces, maintain natural food textures with crystalline enhancement. For ANIMALS: Add realistic crystalline effects on fur/scales following natural physics, maintain anatomically correct features with believable crystal cave adaptations. CRITICAL: Must look like an actual photograph taken inside a real crystal cave or geode, with authentic mineral formations, realistic light refraction, and perfect geological photography quality.",
  },
  floating_islands: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with ethereal floating islands aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic flowing clothing with authentic fabric physics in low gravity, maintain exact facial features with believable aerial lighting conditions and natural wind effects. For LANDSCAPES: Transform into photorealistic floating island scenes with geologically accurate suspended terrain, realistic cloud formations with authentic atmospheric physics, maintain natural lighting with believable aerial perspective. For OBJECTS: Add realistic levitation effects following believable physics, authentic cloud integration with natural vapor properties, maintain exact proportions with credible aerial suspension. For FOOD: Present with realistic weightless presentation following actual zero-gravity physics, maintain natural food textures in aerial conditions. For ANIMALS: Add believable wing adaptations following aerodynamic principles, maintain anatomically correct features with realistic flight physics and aerial behavior. CRITICAL: Must look like an actual photograph of a real floating landscape or aerial photography with practical effects, with authentic atmospheric conditions, realistic physics, and perfect aerial photography quality.",
  },
  time_machine: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with temporal fusion aesthetics blending multiple eras. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic mixed-era clothing with authentic fabric textures from different time periods, maintain exact facial features with believable temporal lighting effects that blend different era photography styles. For LANDSCAPES: Transform into photorealistic scenes blending different historical periods with architecturally accurate buildings from various eras, maintain natural lighting physics with believable temporal overlay. For OBJECTS: Add authentic era-blending design with realistic materials from different time periods, maintain exact proportions with believable temporal wear patterns showing multiple historical influences. For FOOD: Present with realistic mixed-era presentation combining authentic historical serving methods, maintain natural food textures with believable temporal fusion styling. For ANIMALS: Add realistic temporal adaptations showing believable evolutionary variations, maintain anatomically correct features with authentic multi-era environmental context. CRITICAL: Must look like an actual photograph where different time periods have been seamlessly blended using practical effects, with authentic historical materials, realistic temporal physics, and perfect multi-era photography quality.",
  },
  spy: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with sophisticated secret agent aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic spy attire with realistic tailored suits, genuine leather accessories, professional spy gadgets with realistic materials, maintain exact facial features with dramatic film noir lighting and natural shadows. For LANDSCAPES: Transform into photorealistic spy environments with architecturally accurate luxury locations, authentic urban nighttime settings, realistic casino interiors with proper lighting and atmosphere. For OBJECTS: Add genuine spy equipment with realistic materials and authentic functionality, maintain exact proportions with believable high-tech integration. For FOOD: Present with sophisticated presentation using authentic luxury serving methods, realistic martini glasses and elegant dining settings. For ANIMALS: Add realistic spy context with authentic luxury environment, maintain anatomically correct animal features. CRITICAL: Must look like an actual photograph from a real spy thriller movie set or luxury location, with authentic materials, realistic dramatic lighting, and perfect cinematic photography quality.",
  },
  gothic: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with elegant gothic romance aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic Victorian gothic clothing with realistic fabric textures and period-accurate construction, genuine ornate jewelry with realistic metalwork, maintain exact facial features with dramatic candlelit lighting and natural shadows. For LANDSCAPES: Transform into photorealistic gothic architecture with historically accurate cathedral details, authentic stone construction, realistic atmospheric fog and dramatic lighting conditions. For OBJECTS: Add genuine gothic craftsmanship with realistic metalwork and authentic aging, maintain exact proportions with believable historical wear patterns. For FOOD: Present with authentic gothic presentation using period-accurate serving methods, realistic candlelit ambiance with natural flame lighting. For ANIMALS: Add realistic gothic environment context with authentic historical setting, maintain anatomically correct animal features. CRITICAL: Must look like an actual photograph of a real gothic cathedral or Victorian mansion, with authentic historical materials, realistic atmospheric conditions, and perfect gothic photography quality.",
  },
  "90s": {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with authentic 1990s nostalgia aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add genuine 90s fashion with realistic fabric textures and period-accurate styling, authentic accessories like chokers and platform shoes, maintain exact facial features with realistic 90s photography lighting and film grain. For LANDSCAPES: Transform into photorealistic 90s environments with architecturally accurate mall aesthetics, authentic neon lighting, realistic arcade settings with period-correct technology. For OBJECTS: Add authentic 90s design elements with realistic materials and genuine retro technology, maintain exact proportions with believable 90s wear patterns. For FOOD: Present with authentic 90s presentation using period-accurate packaging and serving methods, realistic fast food aesthetics. For ANIMALS: Add realistic 90s context with authentic decade environment, maintain anatomically correct animal features. CRITICAL: Must look like an actual photograph taken in the 1990s with period camera equipment, with authentic 90s materials, realistic film photography quality, and perfect decade-specific atmosphere.",
  },
  disco: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with vibrant 1970s disco fever aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic disco fashion with realistic sequined fabrics and metallic textures, genuine platform shoes and bell-bottom pants, maintain exact facial features with realistic disco ball lighting and colorful reflections. For LANDSCAPES: Transform into photorealistic disco club environments with authentic mirror ball effects, realistic dance floor lighting, genuine 70s interior design with period-accurate materials. For OBJECTS: Add authentic disco elements with realistic mirror ball reflections, genuine vinyl records and period-correct audio equipment, maintain exact proportions with believable 70s craftsmanship. For FOOD: Present with authentic 70s presentation using period-accurate serving methods, realistic cocktail presentations with disco lighting effects. For ANIMALS: Add realistic disco context with authentic 70s party environment, maintain anatomically correct animal features. CRITICAL: Must look like an actual photograph taken at a real 1970s disco club, with authentic period materials, realistic disco lighting physics, and perfect 70s party photography quality.",
  },
}

async function handler(request: NextRequest) {
  try {
    // Payment is verified and settled by withX402 (lib/x402.ts) before this runs
    const clientIP = getClientIP(request)
    const rateLimitResult = await rateLimiter.isAllowed(clientIP)

    if (!rateLimitResult.allowed) {
      const resetTime = new Date(rateLimitResult.resetTime || 0).toISOString()
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          resetTime,
          remaining: 0,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetTime,
            "Retry-After": Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    const { imageUrl, filter, customPrompt } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Determine which prompt to use based on combination of inputs
    let finalPrompt: string

    if (customPrompt && filter && filter !== "none") {
      // Both custom prompt AND filter: combine them
      const config = filterConfigs[filter as keyof typeof filterConfigs]
      if (!config) {
        return NextResponse.json({ error: "Invalid filter" }, { status: 400 })
      }
      finalPrompt = createCombinedPrompt(customPrompt, config.prompt)
      console.log("[thumbnail-maker] Processing with combined prompt + filter:", filter)
      console.log("[thumbnail-maker] Custom content:", customPrompt.substring(0, 80) + "...")
    } else if (customPrompt) {
      // Custom prompt only (no filter or filter is "none")
      finalPrompt = createThumbnailPrompt(customPrompt)
      console.log("[thumbnail-maker] Processing with custom prompt only:", customPrompt.substring(0, 100) + "...")
    } else if (filter && filter !== "none") {
      // Filter only (backward compatible - no custom prompt)
      const config = filterConfigs[filter as keyof typeof filterConfigs]
      if (!config) {
        return NextResponse.json({ error: "Invalid filter" }, { status: 400 })
      }
      finalPrompt = config.prompt
      console.log("[thumbnail-maker] Processing with filter only:", filter)
    } else {
      return NextResponse.json({ error: "Either customPrompt or filter is required" }, { status: 400 })
    }

    console.log("[thumbnail-maker] Using transformation prompt")

    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt: finalPrompt,
        image_urls: [imageUrl],
        num_images: 1,
      },
    })

    console.log("[thumbnail-maker] Nano Banana transformation result:", result)

    const processedImageUrl = result.data?.images?.[0]?.url

    if (!processedImageUrl) {
      throw new Error("No processed image returned from Nano Banana")
    }

    console.log("[thumbnail-maker] Returning processed image without watermark")

    // withX402 attaches the PAYMENT-RESPONSE receipt header after settlement
    const headers: Record<string, string> = {
      "X-RateLimit-Limit": "100",
      "X-RateLimit-Remaining": rateLimitResult.remaining?.toString() || "0",
      "X-RateLimit-Reset": new Date(rateLimitResult.resetTime || 0).toISOString(),
    }

    return NextResponse.json(
      {
        processedImageUrl: processedImageUrl,
      },
      { headers }
    )
  } catch (error) {
    console.error("[thumbnail-maker] Error with Nano Banana processing:", error)
    return NextResponse.json(
      {
        error: "Failed to process image with Nano Banana",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export const POST = withX402(
  handler,
  {
    accepts: {
      scheme: "exact",
      price: "$0.05",
      network: "eip155:8453",
      payTo: RECIPIENT_ADDRESS,
      maxTimeoutSeconds: 60,
    },
    description: "AI image transformation with Nano Banana - $0.05",
    mimeType: "application/json",
  },
  resourceServer,
)
