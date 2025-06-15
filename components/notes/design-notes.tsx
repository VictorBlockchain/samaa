"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function DesignNotes() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Muslim Dating App - Design & Architecture Notes
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive documentation of design decisions, database schema, and architectural patterns
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🗄️ Database Schema Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-emerald-600 mb-2">Core Tables (15)</h4>
              <ul className="text-sm space-y-1">
                <li>
                  • <Badge variant="outline">users</Badge> - Main user profiles with Solana addresses
                </li>
                <li>
                  • <Badge variant="outline">user_settings</Badge> - Matching preferences & privacy
                </li>
                <li>
                  • <Badge variant="outline">user_verification</Badge> - Document verification system
                </li>
                <li>
                  • <Badge variant="outline">user_sessions</Badge> - Activity tracking
                </li>
                <li>
                  • <Badge variant="outline">user_matches</Badge> - Compatibility scoring
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Matching System (5)</h4>
              <ul className="text-sm space-y-1">
                <li>
                  • <Badge variant="outline">user_actions</Badge> - Likes, passes, blocks
                </li>
                <li>
                  • <Badge variant="outline">conversations</Badge> - Chat management
                </li>
                <li>
                  • <Badge variant="outline">messages</Badge> - Multi-media messaging
                </li>
                <li>
                  • <Badge variant="outline">message_threads</Badge> - Reply functionality
                </li>
                <li>
                  • <Badge variant="outline">compatibility_scores</Badge> - Algorithm results
                </li>
              </ul>
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">E-commerce (8)</h4>
              <ul className="text-sm space-y-1">
                <li>
                  • <Badge variant="outline">shops</Badge> - User-owned stores
                </li>
                <li>
                  • <Badge variant="outline">shop_products</Badge> - Inventory management
                </li>
                <li>
                  • <Badge variant="outline">product_categories</Badge> - Organization
                </li>
                <li>
                  • <Badge variant="outline">orders</Badge> - Purchase tracking
                </li>
                <li>
                  • <Badge variant="outline">order_items</Badge> - Detailed line items
                </li>
                <li>
                  • <Badge variant="outline">reviews</Badge> - Product & user feedback
                </li>
                <li>
                  • <Badge variant="outline">transactions</Badge> - Payment records
                </li>
                <li>
                  • <Badge variant="outline">wallets</Badge> - Multi-currency support
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-600 mb-2">System Features (5)</h4>
              <ul className="text-sm space-y-1">
                <li>
                  • <Badge variant="outline">notifications</Badge> - Push, email, in-app
                </li>
                <li>
                  • <Badge variant="outline">analytics_events</Badge> - User behavior tracking
                </li>
                <li>
                  • <Badge variant="outline">reports</Badge> - Content moderation
                </li>
                <li>
                  • <Badge variant="outline">admin_actions</Badge> - Moderation logs
                </li>
                <li>
                  • <Badge variant="outline">app_settings</Badge> - Global configuration
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🕌 Islamic Design Principles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-emerald-600">Halal Matching</h4>
              <ul className="text-sm space-y-1">
                <li>• Religiosity level filtering</li>
                <li>• Prayer frequency matching</li>
                <li>• Islamic values alignment</li>
                <li>• Mahram/Guardian involvement</li>
                <li>• Marriage intention focus</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Privacy & Modesty</h4>
              <ul className="text-sm space-y-1">
                <li>• Optional photo sharing</li>
                <li>• Guardian notification system</li>
                <li>• Conversation monitoring</li>
                <li>• Report inappropriate content</li>
                <li>• Gradual profile revelation</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600">Community Values</h4>
              <ul className="text-sm space-y-1">
                <li>• Family background importance</li>
                <li>• Educational compatibility</li>
                <li>• Financial transparency</li>
                <li>• Cultural preferences</li>
                <li>• Community involvement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">⚡ Technical Architecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-600">Frontend Stack</h4>
              <ul className="text-sm space-y-1">
                <li>
                  • <Badge>Next.js 14</Badge> - App Router with SSR
                </li>
                <li>
                  • <Badge>TypeScript</Badge> - Type safety
                </li>
                <li>
                  • <Badge>Tailwind CSS</Badge> - Utility-first styling
                </li>
                <li>
                  • <Badge>shadcn/ui</Badge> - Component library
                </li>
                <li>
                  • <Badge>Framer Motion</Badge> - Animations
                </li>
                <li>
                  • <Badge>React Hook Form</Badge> - Form management
                </li>
              </ul>

              <h4 className="font-semibold text-purple-600 mt-4">Web3 Integration</h4>
              <ul className="text-sm space-y-1">
                <li>
                  • <Badge>Solana Web3.js</Badge> - Blockchain interaction
                </li>
                <li>
                  • <Badge>Wallet Adapter</Badge> - Multi-wallet support
                </li>
                <li>
                  • <Badge>SAMAA Token</Badge> - Native currency
                </li>
                <li>
                  • <Badge>Metaplex</Badge> - NFT marketplace
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-emerald-600">Backend & Database</h4>
              <ul className="text-sm space-y-1">
                <li>
                  • <Badge>Supabase</Badge> - PostgreSQL + Auth
                </li>
                <li>
                  • <Badge>PostGIS</Badge> - Geospatial queries
                </li>
                <li>
                  • <Badge>Row Level Security</Badge> - Data protection
                </li>
                <li>
                  • <Badge>Real-time</Badge> - Live messaging
                </li>
                <li>
                  • <Badge>Edge Functions</Badge> - Serverless compute
                </li>
                <li>
                  • <Badge>Storage</Badge> - Media files
                </li>
              </ul>

              <h4 className="font-semibold text-orange-600 mt-4">Performance</h4>
              <ul className="text-sm space-y-1">
                <li>• Strategic database indexing</li>
                <li>• Image optimization & CDN</li>
                <li>• Lazy loading components</li>
                <li>• Caching strategies</li>
                <li>• Bundle optimization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📊 Performance & Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-emerald-600 mb-2">Key Metrics</h4>
              <ul className="text-sm space-y-1">
                <li>• Daily/Monthly Active Users</li>
                <li>• Match Success Rate</li>
                <li>• Conversation Conversion</li>
                <li>• Profile Completion Rate</li>
                <li>• User Retention (7/30 day)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Technical KPIs</h4>
              <ul className="text-sm space-y-1">
                <li>• Page Load Time less than 2s</li>
                <li>• API Response less than 500ms</li>
                <li>• 99.9% Uptime SLA</li>
                <li>• Real-time Message Delivery</li>
                <li>• Mobile Performance Score greater than 90</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">Business Goals</h4>
              <ul className="text-sm space-y-1">
                <li>• 10K+ Registered Users</li>
                <li>• 500+ Successful Matches</li>
                <li>• $50K+ Monthly Revenue</li>
                <li>• 4.5+ App Store Rating</li>
                <li>• 25% Month-over-Month Growth</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
