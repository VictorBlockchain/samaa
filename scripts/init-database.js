// Database initialization script
// Run this to set up the Supabase database with initial data

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Use service role key for admin operations, fallback to anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey
const supabase = createClient(supabaseUrl, supabaseKey)

if (supabaseServiceKey) {
  console.log('🔑 Using service role key for admin operations')
} else {
  console.log('⚠️  Using anon key - some operations may be restricted')
}

async function initializeDatabase() {
  console.log('🚀 Initializing Supabase database...')

  try {
    console.log('🔗 Testing connection to Supabase...')

    // Simple connection test
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })

    if (error && error.code === '42P01') {
      // Table doesn't exist - schema needs to be created
      console.log('⚠️  Database tables not found. Schema needs to be created first.')
      console.log('')
      console.log('📋 SETUP INSTRUCTIONS:')
      console.log('1. Go to your Supabase SQL Editor:')
      console.log('   🔗 https://supabase.com/dashboard/project/rdyvdihzphbdpgdktjgg/sql')
      console.log('')
      console.log('2. Copy and paste the entire contents of scripts/supabase-schema.sql')
      console.log('3. Click "Run" to execute the schema')
      console.log('4. Run this script again: node scripts/init-database.js')
      console.log('')
      return
    } else if (error) {
      console.error('❌ Database connection failed:', error.message)
      console.log('📝 Please check your Supabase credentials in .env.local')
      return
    }

    console.log('✅ Database connection successful')
    console.log(`📊 Current users count: ${data?.length || 0}`)

    // Check if product categories exist
    const { data: categories, error: catError } = await supabase
      .from('product_categories')
      .select('*')

    if (catError) {
      console.log('⚠️  Product categories table not found. Please run the schema first.')
      console.log('Error details:', catError.message)
    } else if (categories.length === 0) {
      console.log('📦 Initializing product categories...')
      
      const defaultCategories = [
        { name: "Women's Clothes", description: "Modest clothing for women", sort_order: 1 },
        { name: "Men's Clothes", description: "Traditional and modern clothing for men", sort_order: 2 },
        { name: "Arts & Crafts", description: "Islamic art, calligraphy, and handmade items", sort_order: 3 },
        { name: "Accessories", description: "Prayer beads, jewelry, and accessories", sort_order: 4 },
        { name: "Shoes", description: "Modest and comfortable footwear", sort_order: 5 },
        { name: "Hand Bags", description: "Bags and purses for daily use", sort_order: 6 },
        { name: "Books", description: "Islamic books and educational materials", sort_order: 7 },
        { name: "Home Decor", description: "Islamic home decoration items", sort_order: 8 },
        { name: "NFTs", description: "Digital collectibles and Islamic art NFTs", sort_order: 9 }
      ]

      const { error: insertError } = await supabase
        .from('product_categories')
        .insert(defaultCategories)

      if (insertError) {
        console.error('❌ Failed to insert categories:', insertError.message)
      } else {
        console.log('✅ Product categories initialized successfully')
      }
    } else {
      console.log(`✅ Product categories already exist (${categories.length} categories)`)
    }

    // Add the test profile to Supabase if it doesn't exist
    const testWalletAddress = 'BPaN7WF2c5dxBr7NQWrqb1aY3TwQAjfMVmvDZZZ8L12z'
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('solana_address', testWalletAddress)
      .single()

    if (!existingProfile) {
      console.log('👤 Creating test profile...')
      
      // Create minimal test profile with only required fields
      const testProfile = {
        solana_address: testWalletAddress,
        first_name: 'Ahmed',
        last_name: 'Hassan',
        age: 29,
        gender: 'male',
        date_of_birth: '1995-01-15',
        location: 'New York, NY, USA'
      }

      // Use raw SQL to bypass the trigger issue
      console.log('🔧 Using raw SQL to create test profile...')

      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO users (
            solana_address, first_name, last_name, age, gender, date_of_birth, location
          ) VALUES (
            '${testWalletAddress}', 'Ahmed', 'Hassan', 29, 'male'::gender_type, '1995-01-15', 'New York, NY, USA'
          );
        `
      })

      if (sqlError) {
        console.log('⚠️  Raw SQL approach failed, trying direct insert...')

        // Fallback to direct insert
        const { error: directError } = await supabase
          .from('users')
          .insert(testProfile)

        if (directError) {
          console.error('❌ Failed to create test profile:', directError.message)
          console.log('💡 The database schema may need the trigger function fixed.')
          console.log('💡 You can manually create a user through the Supabase dashboard for now.')
        } else {
          console.log('✅ Test profile created successfully with direct insert')
        }
      } else {
        console.log('✅ Test profile created successfully with raw SQL')
      }
    } else {
      console.log('✅ Test profile already exists')
    }

    console.log('\n🎉 Database initialization complete!')
    console.log('📱 You can now test the app with cross-browser profile viewing')
    console.log(`🔗 Test profile: ${testWalletAddress}`)

  } catch (error) {
    console.error('❌ Initialization failed:', error)
  }
}

// Run the initialization
initializeDatabase()
