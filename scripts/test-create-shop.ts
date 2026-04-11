/**
 * Test script: Create a shop and add sample products for the female test account.
 * 
 * Usage: npx tsx scripts/test-create-shop.ts
 */
import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local BEFORE any other imports
config({ path: resolve(__dirname, "../.env.local") })

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:")
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "set" : "MISSING")
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "set" : "MISSING")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

const FEMALE_USER_ID = "c0c1d1d7-14e6-44b0-a7ba-eafd999b50e2"

const SAMPLE_PRODUCTS = [
  {
    name: "Elegant Modest Abaya",
    description: "Beautiful black abaya with delicate embroidery on the sleeves and hem. Made from premium crepe fabric, perfect for special occasions and everyday elegance. Fully lined with comfortable fit.",
    short_description: "Premium crepe abaya with delicate embroidery",
    base_price: 89.99,
    compare_at_price: 129.99,
    images: [
      "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600"
    ],
    tags: ["abaya", "modest", "embroidery", "premium"],
    is_featured: true,
    requires_shipping: true,
    is_digital: false,
    seo_handle: "elegant-modest-abaya",
    category_name: "womens_fashion"
  },
  {
    name: "Pearl & Gold Bridal Hijab",
    description: "Stunning bridal hijab adorned with hand-sewn pearls and gold thread work. Made from luxurious silk chiffon that drapes beautifully. A perfect centerpiece for your wedding day ensemble.",
    short_description: "Luxurious silk chiffan bridal hijab with pearl details",
    base_price: 149.99,
    compare_at_price: 199.99,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d5bc64?w=600"
    ],
    tags: ["bridal", "hijab", "pearl", "wedding", "luxury"],
    is_featured: true,
    requires_shipping: true,
    is_digital: false,
    seo_handle: "pearl-gold-bridal-hijab",
    category_name: "bride_fashion"
  },
  {
    name: "Islamic Calligraphy Wall Art",
    description: "Hand-painted canvas featuring 'Bismillah' in traditional Thuluth script. Framed in solid oak with gold leaf accents. Adds spiritual beauty to any room.",
    short_description: "Hand-painted Bismillah calligraphy on canvas",
    base_price: 199.99,
    images: [
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600"
    ],
    tags: ["islamic", "calligraphy", "wall art", "home decor", "handmade"],
    is_featured: false,
    requires_shipping: true,
    is_digital: false,
    seo_handle: "islamic-calligraphy-wall-art",
    category_name: "islamic_art"
  },
  {
    name: "Rose Gold Wedding Ring Set",
    description: "Matching rose gold wedding bands for bride and groom. Crafted from 14K rose gold with a brushed matte finish. Available in sizes 5-13. Comes in a luxury velvet box.",
    short_description: "Matching 14K rose gold wedding bands",
    base_price: 349.99,
    compare_at_price: 449.99,
    images: [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600"
    ],
    tags: ["wedding", "rings", "rose gold", "bridal", "groom"],
    is_featured: true,
    requires_shipping: true,
    is_digital: false,
    seo_handle: "rose-gold-wedding-ring-set",
    category_name: "jewelry"
  },
  {
    name: "Organic Argan Oil Skincare Set",
    description: "Complete skincare routine with 100% pure organic argan oil from Morocco. Includes facial serum, hair oil, and body moisturizer. Halal certified and cruelty-free.",
    short_description: "Pure organic Moroccan argan oil skincare collection",
    base_price: 59.99,
    images: [
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600"
    ],
    tags: ["skincare", "argan oil", "organic", "halal", "beauty"],
    is_featured: false,
    requires_shipping: true,
    is_digital: false,
    seo_handle: "organic-argan-oil-skincare-set",
    category_name: "beauty_personal_care"
  },
  {
    name: "Premium Dates Gift Box",
    description: "Luxurious assortment of Medjool, Ajwa, and Safawi dates presented in an elegant wooden gift box. Perfect for Ramadan, Eid, or wedding favors. Net weight 1kg.",
    short_description: "Luxury assorted dates in wooden gift box",
    base_price: 44.99,
    images: [
      "https://images.unsplash.com/photo-1596707328574-e8b9d734c079?w=600"
    ],
    tags: ["dates", "gift", "ramadan", "eid", "halal", "food"],
    is_featured: false,
    requires_shipping: true,
    is_digital: false,
    seo_handle: "premium-dates-gift-box",
    category_name: "food_beverages"
  }
]

async function main() {
  console.log("=== Shop Creation Test Script ===\n")

  // Step 1: Check if user exists
  console.log("1️⃣  Checking user account...")
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", FEMALE_USER_ID)
    .single()

  if (userError || !user) {
    console.error("❌ User not found:", userError?.message)
    process.exit(1)
  }
  console.log(`✅ User found: ${user.first_name || "Unknown"} (${user.email || "no email"})\n`)

  // Step 2: Check if shop already exists
  console.log("2️⃣  Checking for existing shop...")
  const { data: existingShop } = await supabaseAdmin
    .from("shops")
    .select("*")
    .eq("owner_id", FEMALE_USER_ID)
    .single()

  let shopId: string

  if (existingShop) {
    console.log(`⚠️  Shop already exists: "${existingShop.name}" (id: ${existingShop.id})`)
    console.log("   Using existing shop for product creation.\n")
    shopId = existingShop.id
  } else {
    // Step 3: Create shop
    console.log("3️⃣  Creating shop...")
    const shopData = {
      owner_id: FEMALE_USER_ID,
      name: "Noor Collection",
      description: "Curated modest fashion, bridal essentials, and Islamic lifestyle products. Quality and elegance for the modern Muslim woman.",
      status: "active",
      verified: true,
      rating: 4.8,
      total_reviews: 0,
      total_sales: 0,
      total_products: 0,
      response_rate: 100,
      on_time_delivery_rate: 100,
      vacation_mode: false,
      auto_accept_orders: true,
      minimum_order_amount: 0,
      return_policy_days: 14,
      processing_time: "1-3 business days",
      address: {
        city: "London",
        country: "United Kingdom"
      },
      contact_info: {
        email: "hello@noorcollection.com"
      }
    }

    const { data: shop, error: shopError } = await supabaseAdmin
      .from("shops")
      .insert(shopData)
      .select()
      .single()

    if (shopError) {
      console.error("❌ Failed to create shop:", shopError.message)
      process.exit(1)
    }

    shopId = shop.id
    console.log(`✅ Shop created: "${shop.name}" (id: ${shopId})\n`)
  }

  // Step 4: Add products
  console.log(`4️⃣  Adding ${SAMPLE_PRODUCTS.length} sample products...\n`)

  for (const product of SAMPLE_PRODUCTS) {
    const { category_name, ...productData } = product

    const { data: createdProduct, error: productError } = await supabaseAdmin
      .from("products")
      .insert({
        shop_id: shopId,
        ...productData,
        is_active: true,
        is_featured: product.is_featured || false,
        requires_shipping: product.requires_shipping !== false,
        is_digital: product.is_digital || false,
        rating: 0,
        total_reviews: 0,
        total_sold: 0,
        view_count: 0,
        condition: "new",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (productError) {
      console.error(`❌ Failed to create "${product.name}":`, productError.message)
    } else {
      console.log(`✅ Created: "${createdProduct.name}" — $${createdProduct.base_price}`)
    }
  }

  // Step 5: Update total_products count
  console.log("\n5️⃣  Updating shop product count...")
  const { count } = await supabaseAdmin
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shopId)
    .eq("is_active", true)

  await supabaseAdmin
    .from("shops")
    .update({ total_products: count || 0 })
    .eq("id", shopId)

  console.log(`✅ Shop now has ${count} products\n`)

  // Step 6: Summary
  console.log("=== Summary ===")
  console.log(`🏪 Shop: "Noor Collection"`)
  console.log(`👤 Owner: ${user.first_name || "Unknown"} (${FEMALE_USER_ID})`)
  console.log(`📦 Products: ${count}`)
  console.log(`🆔 Shop ID: ${shopId}`)
  console.log("\n✅ All done!")
}

main().catch(console.error)
