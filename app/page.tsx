import { auth } from "@/lib/auth"
import Link from "next/link"
import SignInButton from "@/components/auth/SignInButton"

export default async function Home() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">🏥 Medical Assistant</h1>
          <div>
            {session?.user ? (
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Dashboard
              </Link>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your AI-Powered Health Companion
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get instant health insights, track your metrics, and chat with our intelligent medical assistant
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">AI Chat Assistant</h3>
            <p className="text-gray-600">
              Chat with our Gemini AI-powered assistant for personalized health guidance and answers to your medical questions
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🩺</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Symptom Checker</h3>
            <p className="text-gray-600">
              Input your symptoms and get AI-driven analysis with probable conditions and recommended next steps
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Health Tracking</h3>
            <p className="text-gray-600">
              Monitor blood pressure, blood sugar, weight, and medication history with interactive charts and reminders
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-xl mb-8 opacity-90">
            Sign in now to access your personalized health dashboard
          </p>
          {!session?.user && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>© 2025 Medical Assistant. Built with Next.js and Gemini AI.</p>
        </div>
      </footer>
    </div>
  )
}
