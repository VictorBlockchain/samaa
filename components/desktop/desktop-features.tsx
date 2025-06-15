"use client"

import { Shield, Heart, MessageCircle, UserCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function DesktopFeatures() {
  const features = [
    {
      icon: Shield,
      title: "Islamic Values",
      description: "Platform built with Islamic principles at its core, ensuring halal interactions",
      color: "from-teal-500 to-teal-600",
    },
    {
      icon: UserCheck,
      title: "Verified Profiles",
      description: "All profiles are manually verified for authenticity and serious intentions",
      color: "from-rose-500 to-rose-600",
    },
    {
      icon: MessageCircle,
      title: "Guided Communication",
      description: "Structured conversations with family involvement and Islamic guidance",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Heart,
      title: "Meaningful Matches",
      description: "Advanced compatibility algorithm based on values, goals, and Islamic principles",
      color: "from-amber-500 to-amber-600",
    },
  ]

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Why Choose
            <span className="block bg-gradient-to-r from-teal-600 to-rose-600 bg-clip-text text-transparent">
              Noor?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the perfect blend of Islamic tradition and modern technology in your search for a life partner
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-2"
            >
              <CardContent className="p-8 text-center">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-4 group-hover:text-teal-600 transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
