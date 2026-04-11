-- ============================================================================
-- STEP-BY-STEP DIAGNOSTIC
-- Run each query ONE AT A TIME to find exactly where the 500 error comes from
-- ============================================================================

-- TEST 1: Can we even SELECT from order_items?
SELECT 'TEST 1: Basic select from order_items' as test;
SELECT COUNT(*) as total_rows FROM order_items;

-- TEST 2: Can we filter by order_id?
SELECT 'TEST 2: Filter by specific order_id' as test;
SELECT * FROM order_items WHERE order_id = 'd0f476a7-391f-44c9-8aaf-205e19f6e308';

-- TEST 3: Check table structure
SELECT 'TEST 3: Table columns' as test;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- TEST 4: Check constraints
SELECT 'TEST 4: Table constraints' as test;
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'order_items'::regclass;

-- TEST 5: Check if RLS is enabled
SELECT 'TEST 5: RLS status' as test;
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'order_items';

-- TEST 6: Check policies
SELECT 'TEST 6: RLS policies' as test;
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'order_items';

-- TEST 7: Try the EXACT query the app uses
SELECT 'TEST 7: Exact app query' as test;
SELECT * FROM order_items WHERE order_id = 'd0f476a7-391f-44c9-8aaf-205e19f6e308';

-- TEST 8: Check if products table is accessible
SELECT 'TEST 8: Products table access' as test;
SELECT id, name, base_price FROM products LIMIT 5;

-- TEST 9: Check foreign key integrity
SELECT 'TEST 9: Foreign key check - products' as test;
SELECT oi.id, oi.product_id, p.name
FROM order_items oi
LEFT JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = 'd0f476a7-391f-44c9-8aaf-205e19f6e308';

-- TEST 10: Check for NULL constraint violations
SELECT 'TEST 10: NULL check' as test;
SELECT 
  COUNT(*) as total,
  COUNT(product_id) as with_product_id,
  COUNT(variant_id) as with_variant_id,
  COUNT(CASE WHEN product_id IS NULL AND variant_id IS NULL THEN 1 END) as missing_both
FROM order_items;
