"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface Symptom {
  name: string
  severity: "mild" | "moderate" | "severe"
  duration: string
}

interface Analysis {
  probableConditions: string[]
  urgencyLevel: "low" | "medium" | "high" | "emergency"
  recommendations: string[]
  selfCareAdvice: string[]
  whenToSeeDoctor: string
  detailedAnalysis?: string
}

export default function SymptomCheckerPage() {
  const { data: session, status } = useSession()
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [currentSymptom, setCurrentSymptom] = useState("")
  const [currentSeverity, setCurrentSeverity] = useState<"mild" | "moderate" | "severe">("mild")
  const [currentDuration, setCurrentDuration] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin?callbackUrl=/symptom-checker")
    }
  }, [status])

  // Load history
  useEffect(() => {
    if (status === "authenticated") {
      loadHistory()
    }
  }, [status])

  const loadHistory = async () => {
    try {
      const response = await fetch("/api/symptom-check")
      if (response.ok) {
        const data = await response.json()
        setHistory(data.checks || [])
      }
    } catch (error) {
      console.error("Error loading history:", error)
    }
  }

  const addSymptom = () => {
    if (!currentSymptom.trim() || !currentDuration.trim()) return

    setSymptoms([
      ...symptoms,
      {
        name: currentSymptom.trim(),
        severity: currentSeverity,
        duration: currentDuration.trim(),
      },
    ])

    setCurrentSymptom("")
    setCurrentDuration("")
    setCurrentSeverity("mild")
  }

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index))
  }

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) return

    setIsAnalyzing(true)
    setAnalysis(null)

    try {
      const response = await fetch("/api/symptom-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms,
          age: age ? parseInt(age) : undefined,
          gender: gender || undefined,
          additionalInfo: additionalInfo || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze symptoms")
      }

      setAnalysis(data.analysis)
      loadHistory()
    } catch (error: any) {
      console.error("Analysis error:", error)
      alert(error.message || "Failed to analyze symptoms. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetForm = () => {
    setSymptoms([])
    setCurrentSymptom("")
    setCurrentDuration("")
    setCurrentSeverity("mild")
    setAge("")
    setGender("")
    setAdditionalInfo("")
    setAnalysis(null)
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800 border-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "emergency":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case "low":
        return "✅"
      case "medium":
        return "⚠️"
      case "high":
        return "🚨"
      case "emergency":
        return "🆘"
      default:
        return "ℹ️"
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base"
            >
              Back
            </Link>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">
              🩺 Symptom Checker
            </h1>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            📋 History ({history.length})
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-2 md:p-4 flex flex-col md:flex-row gap-4">
        {/* History Sidebar */}
        {showHistory && (
          <div className="w-full md:w-80 bg-white rounded-2xl shadow-lg p-4 overflow-y-auto max-h-64 md:max-h-[calc(100vh-120px)]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Previous Checks</h2>
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No history yet</p>
            ) : (
              <div className="space-y-3">
                {history.map((check) => (
                  <div
                    key={check._id}
                    className="p-3 rounded-lg border bg-gray-50 border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(check.analysis.urgencyLevel)}`}>
                        {getUrgencyIcon(check.analysis.urgencyLevel)} {check.analysis.urgencyLevel.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(check.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <strong>Symptoms:</strong>
                      <ul className="ml-4 mt-1 text-xs">
                        {check.symptoms.slice(0, 3).map((s: any, i: number) => (
                          <li key={i}>• {s.name}</li>
                        ))}
                        {check.symptoms.length > 3 && (
                          <li className="text-gray-500">+ {check.symptoms.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Input Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📝 Enter Your Symptoms
              </h2>

              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Important:</strong> This tool provides general information only and is not a substitute for professional medical advice. Always consult a healthcare provider for diagnosis and treatment.
                </p>
              </div>

              {/* Symptom Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptom
                  </label>
                  <input
                    type="text"
                    value={currentSymptom}
                    onChange={(e) => setCurrentSymptom(e.target.value)}
                    placeholder="e.g., Headache, Fever, Cough"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    onKeyPress={(e) => e.key === "Enter" && addSymptom()}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity
                    </label>
                    <select
                      value={currentSeverity}
                      onChange={(e) => setCurrentSeverity(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={currentDuration}
                      onChange={(e) => setCurrentDuration(e.target.value)}
                      placeholder="e.g., 2 days"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      onKeyPress={(e) => e.key === "Enter" && addSymptom()}
                    />
                  </div>
                </div>

                <button
                  onClick={addSymptom}
                  disabled={!currentSymptom.trim() || !currentDuration.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ➕ Add Symptom
                </button>
              </div>

              {/* Added Symptoms */}
              {symptoms.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Added Symptoms ({symptoms.length})
                  </h3>
                  <div className="space-y-2">
                    {symptoms.map((symptom, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{symptom.name}</p>
                          <p className="text-xs text-gray-600">
                            {symptom.severity} • {symptom.duration}
                          </p>
                        </div>
                        <button
                          onClick={() => removeSymptom(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Information */}
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Optional Information (helps improve accuracy)
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g., 30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Additional Information
                  </label>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Any other relevant information (medications, allergies, etc.)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={analyzeSymptoms}
                  disabled={symptoms.length === 0 || isAnalyzing}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isAnalyzing ? "🔄 Analyzing..." : "🔍 Analyze Symptoms"}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  🔄 Reset
                </button>
              </div>
            </div>

            {/* Analysis Results */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📊 Analysis Results
              </h2>

              {!analysis && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-6xl mb-4">🩺</div>
                  <p className="text-gray-600">
                    Add your symptoms and click "Analyze" to get AI-powered insights
                  </p>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="text-6xl mb-4 animate-pulse">🔄</div>
                  <p className="text-gray-600">Analyzing your symptoms...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                </div>
              )}

              {analysis && (
                <div className="space-y-6">
                  {/* Urgency Level */}
                  <div className={`p-4 rounded-lg border-2 ${getUrgencyColor(analysis.urgencyLevel)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getUrgencyIcon(analysis.urgencyLevel)}</span>
                      <h3 className="font-bold text-lg">
                        Urgency: {analysis.urgencyLevel.toUpperCase()}
                      </h3>
                    </div>
                    <p className="text-sm">{analysis.whenToSeeDoctor}</p>
                  </div>

                  {/* Probable Conditions */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      🏥 Probable Conditions
                    </h3>
                    <ul className="space-y-2">
                      {analysis.probableConditions.map((condition, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      💡 Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Self-Care Advice */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      🏠 Self-Care Tips
                    </h3>
                    <ul className="space-y-2">
                      {analysis.selfCareAdvice.map((advice, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-purple-600 mt-1">→</span>
                          <span>{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Detailed Analysis */}
                  {analysis.detailedAnalysis && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 mb-2">📝 Detailed Analysis</h3>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {analysis.detailedAnalysis}
                      </p>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-800">
                      <strong>⚠️ Medical Disclaimer:</strong> This analysis is for informational purposes only and should not be considered medical advice. Always consult with a qualified healthcare professional for proper diagnosis and treatment.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
