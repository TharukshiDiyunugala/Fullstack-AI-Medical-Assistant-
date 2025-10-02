"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { FaStethoscope, FaHome, FaHistory, FaPlus, FaTrash, FaExclamationTriangle, FaCheckCircle, FaHospital, FaLightbulb, FaHeartbeat } from "react-icons/fa"

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

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin?callbackUrl=/symptom-checker")
    }
  }, [status])

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
    setSymptoms([...symptoms, { name: currentSymptom.trim(), severity: currentSeverity, duration: currentDuration.trim() }])
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
      if (!response.ok) throw new Error(data.error || "Failed to analyze symptoms")
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
      case "low": return "bg-green-100 text-green-800 border-green-300"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "high": return "bg-orange-100 text-orange-800 border-orange-300"
      case "emergency": return "bg-red-100 text-red-800 border-red-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case "low": return "✅"
      case "medium": return "⚠️"
      case "high": return "🚨"
      case "emergency": return "🆘"
      default: return "ℹ️"
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-[#79b473]/5 via-white to-[#41658a]/5">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-[#79b473]/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-[#41658a]/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-[#79b473]/10"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-4 py-2 bg-white text-[#41658a] rounded-xl hover:shadow-lg transition-all duration-300 font-medium border-2 border-[#41658a]/20"
              >
                <FaHome className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#41658a] to-[#414073] rounded-xl flex items-center justify-center shadow-lg">
                  <FaStethoscope className="text-white text-xl" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#41658a] to-[#414073] bg-clip-text text-transparent">
                  Symptom Checker
                </h1>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-[#41658a] to-[#414073] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
            >
              <FaHistory />
              <span className="hidden md:inline">History ({history.length})</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="relative max-w-7xl mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-4 z-10">
        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full md:w-80 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 overflow-y-auto max-h-64 md:max-h-[calc(100vh-120px)] border border-[#79b473]/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaHistory className="text-[#41658a]" />
                <h2 className="text-lg font-bold bg-gradient-to-r from-[#41658a] to-[#414073] bg-clip-text text-transparent">Previous Checks</h2>
              </div>
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No history yet</p>
              ) : (
                <div className="space-y-3">
                  {history.map((check) => (
                    <motion.div
                      key={check._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl border bg-gradient-to-br from-gray-50 to-white border-[#79b473]/20 hover:shadow-md transition-shadow"
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
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-[#79b473]/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#79b473] to-[#70a37f] rounded-lg flex items-center justify-center">
                  <FaHeartbeat className="text-white text-sm" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#41658a] to-[#414073] bg-clip-text text-transparent">
                  Enter Your Symptoms
                </h2>
              </div>

              {/* Disclaimer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300/50 rounded-xl p-3 mb-4"
              >
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-800">
                    <strong>Important:</strong> This tool provides general information only and is not a substitute for professional medical advice.
                  </p>
                </div>
              </motion.div>

              {/* Symptom Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Symptom</label>
                  <input
                    type="text"
                    value={currentSymptom}
                    onChange={(e) => setCurrentSymptom(e.target.value)}
                    placeholder="e.g., Headache, Fever, Cough"
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-[#79b473]/30 rounded-xl focus:ring-4 focus:ring-[#79b473]/20 focus:border-[#79b473] outline-none transition-all duration-300 shadow-inner"
                    onKeyPress={(e) => e.key === "Enter" && addSymptom()}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                    <select
                      value={currentSeverity}
                      onChange={(e) => setCurrentSeverity(e.target.value as any)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-[#79b473]/30 rounded-xl focus:ring-4 focus:ring-[#79b473]/20 focus:border-[#79b473] outline-none transition-all duration-300 shadow-inner"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={currentDuration}
                      onChange={(e) => setCurrentDuration(e.target.value)}
                      placeholder="e.g., 2 days"
                      className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-[#79b473]/30 rounded-xl focus:ring-4 focus:ring-[#79b473]/20 focus:border-[#79b473] outline-none transition-all duration-300 shadow-inner"
                      onKeyPress={(e) => e.key === "Enter" && addSymptom()}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addSymptom}
                  disabled={!currentSymptom.trim() || !currentDuration.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#79b473] to-[#70a37f] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <FaPlus /> Add Symptom
                </motion.button>
              </div>

              {/* Added Symptoms */}
              <AnimatePresence>
                {symptoms.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6"
                  >
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Added Symptoms ({symptoms.length})
                    </h3>
                    <div className="space-y-2">
                      {symptoms.map((symptom, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-[#79b473]/10 to-[#70a37f]/10 rounded-xl border border-[#79b473]/20"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{symptom.name}</p>
                            <p className="text-xs text-gray-600">
                              {symptom.severity} • {symptom.duration}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeSymptom(index)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <FaTrash />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#79b473] focus:border-[#79b473] outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#79b473] focus:border-[#79b473] outline-none text-sm"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Additional Information</label>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Any other relevant information (medications, allergies, etc.)"
                    rows={3}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#79b473] focus:border-[#79b473] outline-none text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={analyzeSymptoms}
                  disabled={symptoms.length === 0 || isAnalyzing}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#41658a] to-[#414073] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <FaCheckCircle />
                  {isAnalyzing ? "Analyzing..." : "Analyze Symptoms"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Reset
                </motion.button>
              </div>
            </motion.div>

            {/* Analysis Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-[#79b473]/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#41658a] to-[#414073] rounded-lg flex items-center justify-center">
                  <FaHospital className="text-white text-sm" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#41658a] to-[#414073] bg-clip-text text-transparent">
                  Analysis Results
                </h2>
              </div>

              {!analysis && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-64 text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    <FaStethoscope className="text-[#79b473]" />
                  </motion.div>
                  <p className="text-gray-600">
                    Add your symptoms and click "Analyze" to get AI-powered insights
                  </p>
                </motion.div>
              )}

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-64">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-[#79b473] border-t-transparent rounded-full mb-4"
                  />
                  <p className="text-gray-600 font-medium">Analyzing your symptoms...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                </div>
              )}

              {analysis && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Urgency Level */}
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className={`p-4 rounded-xl border-2 ${getUrgencyColor(analysis.urgencyLevel)}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getUrgencyIcon(analysis.urgencyLevel)}</span>
                      <h3 className="font-bold text-lg">
                        Urgency: {analysis.urgencyLevel.toUpperCase()}
                      </h3>
                    </div>
                    <p className="text-sm">{analysis.whenToSeeDoctor}</p>
                  </motion.div>

                  {/* Probable Conditions */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <FaHospital className="text-[#41658a]" /> Probable Conditions
                    </h3>
                    <ul className="space-y-2">
                      {analysis.probableConditions.map((condition, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 text-gray-700 p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-[#41658a] mt-1">•</span>
                          <span>{condition}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <FaLightbulb className="text-[#79b473]" /> Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 text-gray-700 p-2 bg-green-50 rounded-lg"
                        >
                          <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                          <span>{rec}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Self-Care Advice */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <FaHeartbeat className="text-purple-600" /> Self-Care Tips
                    </h3>
                    <ul className="space-y-2">
                      {analysis.selfCareAdvice.map((advice, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 text-gray-700 p-2 bg-purple-50 rounded-lg"
                        >
                          <span className="text-purple-600 mt-1">→</span>
                          <span>{advice}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Detailed Analysis */}
                  {analysis.detailedAnalysis && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                      <h3 className="font-bold text-gray-800 mb-2">📝 Detailed Analysis</h3>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {analysis.detailedAnalysis}
                      </p>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-3"
                  >
                    <div className="flex items-start gap-2">
                      <FaExclamationTriangle className="text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-800">
                        <strong>Medical Disclaimer:</strong> This analysis is for informational purposes only and should not be considered medical advice. Always consult with a qualified healthcare professional for proper diagnosis and treatment.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
