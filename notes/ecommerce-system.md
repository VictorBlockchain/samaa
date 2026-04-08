# E-Commerce System Overview

This document summarizes the shop and e-commerce system implemented in the application, focusing on Muslim fashion (men and women) and wedding-related gifts.

## Objectives
- Enable verified users to create and manage shops
- Support rich product catalogs with variants (size, color, custom options)
- Provide carts, checkout, orders, payments, shipping, reviews, wishlists
- Enforce safety and moderation (bans, probation) consistently across flow

## Data Model Summary
- Shops: `shops`
- Categories: `product_categories`
- Products: `products`, `product_variants`, `product_variant_options`
- Inventory: `inventory`
- Carts: `shopping_carts`, `cart_items`
- Orders: `orders`, `order_items`
- Payments: `payments`
- Reviews & Social: `product_reviews`, `shop_reviews`, `wishlists`

## Enum Types
- `shop_status`: `draft`, `active`, `suspended`
- `product_category`: Islamic-fashion taxonomy for men/women, wedding items, gifts
- `product_condition`: `new`, `used_like_new`, `used_good`, `used_fair`
- `order_status`: `created`, `confirmed`, `packed`, `shipped`, `delivered`, `cancelled`, `returned`
- `payment_status`: `pending`, `authorized`, `captured`, `refunded`, `failed`
- `shipping_method`: `standard`, `express`, `pickup`
- `size_system`: `alpha`, `numeric`, `eu`, `uk`, `us`

## Core Functions (Schema)
- Shop management
  - `create_shop`, `update_shop_settings`
  - `get_shop_dashboard`, `get_shop_inventory_report`, `get_shop_orders`
- Product management
  - `add_product`, `update_product`, `delete_product`
  - `add_product_variant`, `update_product_variant`, `bulk_update_inventory`, `update_inventory`
  - `get_shop_products`, `get_product_details`
- Shopping
  - `browse_products`, `search_products_advanced`, `get_trending_products`
  - `add_to_cart`, `update_cart_item`, `remove_from_cart`, `clear_user_cart`, `get_user_cart`
  - `add_to_wishlist`, `remove_from_wishlist`, `get_user_wishlist`, `get_recommended_products`
- Orders & payments
  - `create_order_from_cart`, `update_order_status`, `get_user_orders`, `get_order_tracking`
  - `process_payment`, `apply_discount_to_order`, `get_user_purchase_history`
- Reviews & categories
  - `add_product_review`, `create_product_category`, `get_category_hierarchy`
- Analytics
  - `get_shop_analytics`, `get_product_performance`

## Muslim Fashion Coverage
- Men: thobes, kufis, prayer caps, formal/casual wear
- Women: abayas, hijabs, jilbabs, modest dresses, prayer garments
- Wedding: bridal wear, groom attire, accessories
- Gifts: Islamic books, jewelry, home decor, prayer items

## Safety & Moderation
- Ban checks: `is_user_banned(user_id)` enforced in cart, orders, payments
- Probation: rate limiting applied to messaging; ecommerce can adapt similarly
- Reviews: stored with metadata for moderation and quality filtering
- Shop status: `suspended` prevents listing, checkout, and new products

## Operational Notes
- Indexes: added for products, variants, inventory, orders for performance
- Stock reservations: during `create_order_from_cart`, inventory is decremented appropriately
- Soft delete: products support soft deletion while retaining order history
- Analytics: aggregate queries for shop and product performance

## API Layer (Next)
- REST/GraphQL endpoints wrapping the above functions
- Auth: only verified users can `create_shop`, owners manage their resources
- Rate limits: cart updates, order creation, payment attempts
- Pagination & filters: category, price, size, color, condition, shop

## Frontend (Next)
- Shop creation wizard and settings
- Product catalog browsing and detail pages with variant selection
- Cart and checkout flow with address, shipping, payment
- Order tracking and history view
- Shop owner dashboard: products, inventory, orders, analytics
- Reviews and wishlist UI

## Payments & Shipping (Next)
- Payment gateways: Stripe/PayPal integration mapping to `payments`
- Shipping carriers: method selection, tracking updates to `orders`
- Taxes & VAT: per-region calculation stored on orders

## Future Enhancements
- Discount codes, promotions, bundles
- Returns & exchanges workflow
- Gift registry for weddings
- Seller verification tiers and trust signals
- Image optimization, CDN, and media moderation

---

Refer to `schema/schema.sql` for table and function definitions. The checklist at `notes/muslim-marriage-app-checklist.md` tracks backend completion and lists pending UI and integration tasks.