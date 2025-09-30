import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import UserInfo from "@/components/auth/UserInfo"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          🏥 Medical Dashboard
        </h1>

        <div className="space-y-6">
          <UserInfo />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  AI Chat
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Chat with our AI assistant for health-related queries
              </p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Start Chat
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🩺</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Symptom Checker
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Check your symptoms and get AI-powered insights
              </p>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Check Symptoms
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Health Metrics
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Track your blood pressure, sugar levels, and more
              </p>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                View Metrics
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              📋 Recent Activity
            </h2>
            <p className="text-gray-600">
              No recent activity yet. Start by chatting with the AI assistant or
              checking your symptoms.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
