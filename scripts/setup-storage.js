// Storage bucket setup script for Supabase
// Run this to create the necessary storage buckets

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const buckets = [
  {
    name: 'profile-photos',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    description: 'User profile photos and additional images'
  },
  {
    name: 'profile-videos',
    public: true,
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/mov', 'video/avi'],
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    description: 'User profile video introductions'
  },
  {
    name: 'profile-audio',
    public: true,
    allowedMimeTypes: ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'],
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    description: 'User voice introductions and audio messages'
  },
  {
    name: 'shop-images',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    description: 'Shop and product images'
  },
  {
    name: 'shop-videos',
    public: true,
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/mov', 'video/avi'],
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    description: 'Shop and product videos'
  }
]

async function setupStorageBuckets() {
  console.log('🗄️  Setting up Supabase storage buckets...')

  for (const bucketConfig of buckets) {
    try {
      // Check if bucket already exists
      const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.error(`❌ Error listing buckets: ${listError.message}`)
        continue
      }

      const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketConfig.name)

      if (bucketExists) {
        console.log(`✅ Bucket '${bucketConfig.name}' already exists`)
        continue
      }

      // Create bucket
      const { data, error } = await supabase.storage.createBucket(bucketConfig.name, {
        public: bucketConfig.public,
        allowedMimeTypes: bucketConfig.allowedMimeTypes,
        fileSizeLimit: bucketConfig.fileSizeLimit
      })

      if (error) {
        console.error(`❌ Failed to create bucket '${bucketConfig.name}': ${error.message}`)
      } else {
        console.log(`✅ Created bucket '${bucketConfig.name}' - ${bucketConfig.description}`)
      }

    } catch (error) {
      console.error(`❌ Error creating bucket '${bucketConfig.name}':`, error)
    }
  }

  // Set up RLS policies for storage
  console.log('\n🔒 Setting up Row Level Security policies for storage...')
  
  try {
    // Note: Storage RLS policies need to be set up through the Supabase dashboard
    // or using the SQL editor. The JavaScript client doesn't support creating storage policies.
    console.log('📝 Storage RLS policies need to be set up manually in Supabase dashboard:')
    console.log('   1. Go to Storage > Policies in your Supabase dashboard')
    console.log('   2. Create policies for each bucket to allow:')
    console.log('      - Users to upload files to their own folders')
    console.log('      - Public read access for profile media')
    console.log('      - Users to delete their own files')
    console.log('')
    console.log('📋 Suggested folder structure:')
    console.log('   profile-photos/{user_id}/photos/{timestamp}.{ext}')
    console.log('   profile-videos/{user_id}/videos/{timestamp}.{ext}')
    console.log('   profile-audio/{user_id}/audio/{timestamp}.{ext}')
    console.log('   shop-images/{shop_id}/images/{timestamp}.{ext}')
    console.log('   shop-videos/{shop_id}/videos/{timestamp}.{ext}')

  } catch (error) {
    console.error('❌ Error setting up RLS policies:', error)
  }

  console.log('\n🎉 Storage setup complete!')
  console.log('📱 You can now upload profile photos, videos, and audio files')
  console.log('🛍️  Shop media uploads are also ready')
  console.log(`📏 File size limit: ${buckets[0].fileSizeLimit / (1024 * 1024)}MB per file`)
}

// Run the setup
setupStorageBuckets().catch(console.error)
