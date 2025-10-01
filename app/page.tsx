"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { FaRobot, FaStethoscope, FaChartLine, FaArrowRight, FaHeart, FaPills, FaUserMd } from "react-icons/fa"
import { useSession } from "next-auth/react"
import SignInButton from "@/components/auth/SignInButton"

export default function Home() {
  const { data: session } = useSession()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#79b473]/5 via-white to-[#41658a]/5 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-[#79b473]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#41658a]/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50 ? "glass shadow-lg" : "bg-white/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#79b473] to-[#70a37f] rounded-xl flex items-center justify-center shadow-lg">
              <FaHeart className="text-white text-xl" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#41658a] to-[#414073] bg-clip-text text-transparent">
              MediAssist AI
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {session?.user ? (
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-6 py-3 bg-white text-[#41658a] rounded-xl hover:shadow-lg transition-all duration-300 font-medium border-2 border-[#41658a]/20"
              >
                <span>Dashboard</span>
                
              </Link>
            ) : (
              <SignInButton />
            )}
          </motion.div>
        </div>
      </motion.nav>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#79b473]/20 to-[#70a37f]/20 rounded-full text-[#41658a] font-semibold text-sm mb-4">
              ✨ Powered by Gemini AI
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-[#41658a] via-[#414073] to-[#4c3957] bg-clip-text text-transparent">
              Your AI-Powered
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#79b473] to-[#70a37f] bg-clip-text text-transparent">
              Health Companion
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 px-4"
          >
            Get instant health insights, track your metrics, and chat with our intelligent medical assistant powered by advanced AI technology
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {!session?.user && (
              <>
                <SignInButton />
                <Link
                  href="#features"
                  className="px-8 py-3 border-2 border-[#41658a] text-[#41658a] rounded-xl hover:bg-[#41658a] hover:text-white transition-all duration-300 font-medium"
                >
                  Learn More
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Features Section */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
          {[
            {
              icon: FaRobot,
              title: "AI Chat Assistant",
              description: "Chat with our Gemini AI-powered assistant for personalized health guidance",
              gradient: "from-[#79b473] to-[#70a37f]",
              delay: 0.2
            },
            {
              icon: FaStethoscope,
              title: "Symptom Checker",
              description: "Get AI-driven analysis with probable conditions and recommended next steps",
              gradient: "from-[#41658a] to-[#414073]",
              delay: 0.4
            },
            {
              icon: FaChartLine,
              title: "Health Tracking",
              description: "Monitor vitals, medications, and view interactive charts with insights",
              gradient: "from-[#414073] to-[#4c3957]",
              delay: 0.6
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: feature.delay }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="text-white text-2xl" />
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 group-hover:text-[#41658a] transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-[#41658a] via-[#414073] to-[#4c3957] rounded-3xl p-12 md:p-16 text-center text-white overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#79b473]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#70a37f]/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
                <FaUserMd className="text-4xl" />
              </div>
            </motion.div>
            
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Health Journey?
            </h3>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of users who trust MediAssist AI for their health management needs
            </p>
            
            {!session?.user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignInButton />
                <Link
                  href="#features"
                  className="px-8 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
                >
                  Explore Features
                </Link>
              </div>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#79b473] to-[#70a37f] text-white rounded-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg"
              >
                Go to Dashboard
                <FaArrowRight />
              </Link>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#79b473] to-[#70a37f] rounded-xl flex items-center justify-center">
                  <FaHeart className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-[#41658a] to-[#414073] bg-clip-text text-transparent">
                  MediAssist AI
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                Your trusted AI-powered health companion for better healthcare management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="hover:text-[#41658a] transition-colors cursor-pointer">AI Chat Assistant</li>
                <li className="hover:text-[#41658a] transition-colors cursor-pointer">Symptom Checker</li>
                <li className="hover:text-[#41658a] transition-colors cursor-pointer">Health Tracking</li>
                <li className="hover:text-[#41658a] transition-colors cursor-pointer">Medication Reminders</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Technology</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Powered by Google Gemini AI</li>
                <li>• Built with Next.js 15</li>
                <li>• Secure MongoDB Storage</li>
                <li>• Real-time Analytics</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-300 pt-8 text-center">
            <p className="text-gray-600 text-sm">
              © 2025 MediAssist AI. Built with ❤️ using Next.js and Gemini AI.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              ⚠️ This is an AI assistant for informational purposes only. Always consult healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
