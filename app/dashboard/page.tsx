"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { motion } from "framer-motion"
import { FaRobot, FaStethoscope, FaChartLine, FaHome, FaArrowRight, FaHeart, FaPills, FaCalendarAlt } from "react-icons/fa"
import UserInfoClient from "@/components/auth/UserInfoClient"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin?callbackUrl=/dashboard")
    }
  }, [status])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#79b473]/5 via-white to-[#41658a]/5 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#79b473] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#79b473]/5 via-white to-[#41658a]/5 p-4 md:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-[#79b473]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#41658a] to-[#414073] bg-clip-text text-transparent mb-2">
              Welcome Back! 👋
            </h1>
            <p className="text-gray-600">Here's your health overview</p>
          </div>
          <Link
            href="/"
            className="group flex items-center gap-2 px-6 py-3 bg-white text-[#41658a] rounded-xl hover:shadow-lg transition-all duration-300 font-medium border-2 border-[#41658a]/20"
          >
            <FaHome className="group-hover:-translate-x-1 transition-transform" />
            Home
          </Link>
        </motion.div>

        <div className="space-y-6">
          <UserInfoClient />

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FaRobot,
                title: "AI Chat Assistant",
                description: "Chat with our AI assistant for instant health guidance",
                gradient: "from-[#79b473] to-[#70a37f]",
                link: "/chat",
                buttonText: "Start Chat",
                delay: 0.1
              },
              {
                icon: FaStethoscope,
                title: "Symptom Checker",
                description: "Get AI-powered analysis of your symptoms",
                gradient: "from-[#41658a] to-[#414073]",
                link: "/symptom-checker",
                buttonText: "Check Symptoms",
                delay: 0.2
              },
              {
                icon: FaChartLine,
                title: "Health Metrics",
                description: "Track vitals, medications, and view insights",
                gradient: "from-[#414073] to-[#4c3957]",
                link: "/health-metrics",
                buttonText: "View Metrics",
                delay: 0.3
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative p-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="text-white text-2xl" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#41658a] transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <Link
                    href={feature.link}
                    className={`group/btn relative flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium overflow-hidden`}
                  >
                    <span className="relative z-10">{feature.buttonText}</span>
                    <FaArrowRight className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left" />
                  </Link>
                </div>
                
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#79b473] to-[#70a37f] rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Recent Activity
              </h2>
            </div>
            
            <div className="bg-gradient-to-br from-[#79b473]/5 to-[#41658a]/5 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FaHeart className="text-[#79b473] text-2xl" />
              </div>
              <p className="text-gray-600 mb-4">
                No recent activity yet. Start your health journey today!
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/chat"
                  className="px-6 py-2 bg-gradient-to-r from-[#79b473] to-[#70a37f] text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium"
                >
                  Start Chat
                </Link>
                <Link
                  href="/symptom-checker"
                  className="px-6 py-2 bg-white text-[#41658a] border-2 border-[#41658a]/20 rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium"
                >
                  Check Symptoms
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
