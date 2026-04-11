import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const body = await req.json()
    const { product_id, variants } = body

    if (!product_id || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: "product_id and variants array are required" },
        { status: 400 }
      )
    }

    // Verify user owns the product
    const { data: { user } } = await supabaseAdmin.auth.getUser(
      req.headers.get("Authorization")?.replace("Bearer ", "") || ""
    )

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("shop_id")
      .eq("id", product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const { data: shop } = await supabaseAdmin
      .from("shops")
      .select("owner_id")
      .eq("id", product.shop_id)
      .single()

    if (!shop || shop.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create variants
    const variantsToInsert = variants.map((v: any) => ({
      product_id,
      title: v.title || "Standard",
      sku: v.sku || null,
      price: v.price || null,
      is_active: true,
    }))

    const { data, error } = await supabaseAdmin
      .from("product_variants")
      .insert(variantsToInsert)
      .select()

    if (error) {
      console.error("Error creating variants:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, variants: data })
  } catch (err: any) {
    console.error("Error in create-variants API:", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
