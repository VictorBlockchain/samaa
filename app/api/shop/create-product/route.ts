import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const body = await req.json()
    const {
      shop_id,
      name,
      description,
      base_price,
      compare_at_price,
      category_id,
      images,
      tags,
      condition,
      requires_shipping,
      is_digital,
      sku,
      brand,
    } = body

    // Validate required fields
    if (!shop_id || !name || !base_price) {
      return NextResponse.json(
        { error: "shop_id, name, and base_price are required" },
        { status: 400 }
      )
    }

    // Verify user owns the shop
    const { data: { user } } = await supabaseAdmin.auth.getUser(
      req.headers.get("Authorization")?.replace("Bearer ", "") || ""
    )

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: shop, error: shopError } = await supabaseAdmin
      .from("shops")
      .select("id, owner_id")
      .eq("id", shop_id)
      .single()

    if (shopError || !shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    if (shop.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create product (bypasses RLS with service role)
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert({
        shop_id,
        name,
        description: description || null,
        base_price,
        compare_at_price: compare_at_price || null,
        category_id: category_id || null,
        images: images || null,
        tags: tags || null,
        condition: condition || null,
        requires_shipping: requires_shipping ?? true,
        is_digital: is_digital ?? false,
        is_active: true,
        is_featured: false,
        sku: sku || null,
        brand: brand || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, product })
  } catch (err: any) {
    console.error("Error in create-product API:", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
