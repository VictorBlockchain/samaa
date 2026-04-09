/**
 * Test script to verify Mailgun email configuration
 * Run with: npx tsx scripts/test-email.ts
 */

// Load environment variables from .env.local
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local from the project root
const envPath = path.resolve(process.cwd(), '.env.local')
dotenv.config({ path: envPath })

console.log('Environment loaded from:', envPath)
console.log('MAILGUN_API_KEY exists:', !!process.env.MAILGUN_API_KEY)
console.log('MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN)
console.log('')

import { sendEmailVerification, testMailgunConnection } from '../lib/mailgun'

async function testEmail() {
  console.log('=== Mailgun Email Test ===\n')

  // Test 1: Connection
  console.log('Test 1: Testing Mailgun connection...')
  const connectionTest = await testMailgunConnection()
  console.log('Connection result:', connectionTest)
  console.log('')

  if (!connectionTest.success) {
    console.error('❌ Connection test failed! Fix the errors above first.')
    return
  }

  // Test 2: Send verification email
  console.log('Test 2: Sending test verification email...')
  const testEmail = 'jl10130x@gmail.com' // Change this to your email
  const testName = 'Test User'
  const testLink = `http://localhost:3000/auth/verify-email?token=test-token&email=${encodeURIComponent(testEmail)}`

  const emailResult = await sendEmailVerification(testEmail, testName, testLink)
  console.log('Email result:', emailResult)
  console.log('')

  if (emailResult.success) {
    console.log('✅ Email sent successfully!')
    console.log(`   Message ID: ${emailResult.id}`)
    console.log(`   Check your inbox at: ${testEmail}`)
  } else {
    console.error('❌ Email sending failed!')
    console.error(`   Error: ${emailResult.error}`)
  }
}

testEmail().catch(console.error)
