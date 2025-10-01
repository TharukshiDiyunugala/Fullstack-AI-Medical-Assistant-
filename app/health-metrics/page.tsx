"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface HealthMetric {
  _id: string
  type: string
  value: any
  unit: string
  notes?: string
  measuredAt: string
}

interface Medication {
  _id: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  startDate: string
  endDate?: string
  isActive: boolean
  reminderEnabled: boolean
  instructions?: string
  logs: any[]
}

export default function HealthMetricsPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<"overview" | "blood-pressure" | "blood-sugar" | "weight" | "medications">("overview")
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMetric, setShowAddMetric] = useState(false)
  const [showAddMedication, setShowAddMedication] = useState(false)

  // Form states for adding metrics
  const [metricType, setMetricType] = useState("blood_pressure")
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [glucose, setGlucose] = useState("")
  const [weight, setWeight] = useState("")
  const [notes, setNotes] = useState("")

  // Form states for adding medication
  const [medName, setMedName] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequency, setFrequency] = useState("Once daily")
  const [times, setTimes] = useState(["08:00"])
  const [instructions, setInstructions] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin?callbackUrl=/health-metrics")
    }
  }, [status])

  useEffect(() => {
    if (status === "authenticated") {
      loadData()
    }
  }, [status])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [metricsRes, medsRes] = await Promise.all([
        fetch("/api/health-metrics"),
        fetch("/api/medications?active=true"),
      ])

      if (metricsRes.ok) {
        const data = await metricsRes.json()
        setMetrics(data.metrics || [])
      }

      if (medsRes.ok) {
        const data = await medsRes.json()
        setMedications(data.medications || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addMetric = async () => {
    try {
      let value: any = {}
      let unit = ""

      switch (metricType) {
        case "blood_pressure":
          if (!systolic || !diastolic) return
          value = { systolic: parseInt(systolic), diastolic: parseInt(diastolic) }
          unit = "mmHg"
          break
        case "blood_sugar":
          if (!glucose) return
          value = { glucose: parseInt(glucose) }
          unit = "mg/dL"
          break
        case "weight":
          if (!weight) return
          value = { weight: parseFloat(weight) }
          unit = "kg"
          break
      }

      const response = await fetch("/api/health-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: metricType,
          value,
          unit,
          notes,
          measuredAt: new Date(),
        }),
      })

      if (response.ok) {
        // Reset form
        setSystolic("")
        setDiastolic("")
        setGlucose("")
        setWeight("")
        setNotes("")
        setShowAddMetric(false)
        loadData()
      }
    } catch (error) {
      console.error("Error adding metric:", error)
    }
  }

  const addMedication = async () => {
    if (!medName || !dosage) return

    try {
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: medName,
          dosage,
          frequency,
          times,
          startDate: new Date(),
          instructions,
          reminderEnabled: true,
        }),
      })

      if (response.ok) {
        setMedName("")
        setDosage("")
        setInstructions("")
        setShowAddMedication(false)
        loadData()
      }
    } catch (error) {
      console.error("Error adding medication:", error)
    }
  }

  const logMedication = async (medicationId: string, status: "taken" | "missed" | "skipped") => {
    try {
      const response = await fetch("/api/medications/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicationId,
          status,
          takenAt: new Date(),
        }),
      })
      
      if (response.ok) {
        // Show success feedback
        alert(`Medication marked as ${status}!`)
        loadData()
      }
    } catch (error) {
      console.error("Error logging medication:", error)
      alert("Failed to log medication. Please try again.")
    }
  }

  // Check if medication was taken today
  const wasTakenToday = (medication: Medication) => {
    const today = new Date().toDateString()
    return medication.logs?.some((log: any) => {
      const logDate = new Date(log.takenAt).toDateString()
      return logDate === today && log.status === "taken"
    })
  }

  // Get today's log status
  const getTodayStatus = (medication: Medication) => {
    if (!medication.logs || medication.logs.length === 0) return null
    const today = new Date().toDateString()
    const todayLog = medication.logs.find((log: any) => {
      const logDate = new Date(log.takenAt).toDateString()
      return logDate === today
    })
    return todayLog?.status || null
  }

  // Prepare chart data
  const getBPData = () => {
    return metrics
      .filter((m) => m.type === "blood_pressure")
      .slice(0, 10)
      .reverse()
      .map((m) => ({
        date: new Date(m.measuredAt).toLocaleDateString(),
        systolic: m.value.systolic,
        diastolic: m.value.diastolic,
      }))
  }

  const getBSData = () => {
    return metrics
      .filter((m) => m.type === "blood_sugar")
      .slice(0, 10)
      .reverse()
      .map((m) => ({
        date: new Date(m.measuredAt).toLocaleDateString(),
        glucose: m.value.glucose,
      }))
  }

  const getWeightData = () => {
    return metrics
      .filter((m) => m.type === "weight")
      .slice(0, 10)
      .reverse()
      .map((m) => ({
        date: new Date(m.measuredAt).toLocaleDateString(),
        weight: m.value.weight,
      }))
  }

  const getLatestMetric = (type: string) => {
    return metrics.find((m) => m.type === type)
  }

  if (status === "loading" || isLoading) {
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
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base">
              Back
            </Link>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">📊 Metrics</h1>
          </div>
          <button
            onClick={() => setShowAddMetric(true)}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ➕ Add Metric
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "overview", label: "📈 Overview", icon: "📈" },
            { id: "blood-pressure", label: "❤️ Blood Pressure", icon: "❤️" },
            { id: "blood-sugar", label: "🍬 Blood Sugar", icon: "🍬" },
            { id: "weight", label: "⚖️ Weight", icon: "⚖️" },
            { id: "medications", label: "💊 Medications", icon: "💊" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-2 md:px-4 pb-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Blood Pressure Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">❤️ Blood Pressure</h3>
                  <span className="text-2xl">❤️</span>
                </div>
                {getLatestMetric("blood_pressure") ? (
                  <div>
                    <p className="text-3xl font-bold text-blue-600">
                      {getLatestMetric("blood_pressure")?.value.systolic}/
                      {getLatestMetric("blood_pressure")?.value.diastolic}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">mmHg</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(getLatestMetric("blood_pressure")!.measuredAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No data yet</p>
                )}
              </div>

              {/* Blood Sugar Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">🍬 Blood Sugar</h3>
                  <span className="text-2xl">🍬</span>
                </div>
                {getLatestMetric("blood_sugar") ? (
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {getLatestMetric("blood_sugar")?.value.glucose}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">mg/dL</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(getLatestMetric("blood_sugar")!.measuredAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No data yet</p>
                )}
              </div>

              {/* Weight Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">⚖️ Weight</h3>
                  <span className="text-2xl">⚖️</span>
                </div>
                {getLatestMetric("weight") ? (
                  <div>
                    <p className="text-3xl font-bold text-purple-600">
                      {getLatestMetric("weight")?.value.weight}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">kg</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(getLatestMetric("weight")!.measuredAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No data yet</p>
                )}
              </div>
            </div>

            {/* Active Medications */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">💊 Active Medications</h3>
                <button
                  onClick={() => setShowAddMedication(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  ➕ Add
                </button>
              </div>
              {medications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No active medications</p>
              ) : (
                <div className="space-y-3">
                  {medications.slice(0, 5).map((med) => {
                    const isTaken = wasTakenToday(med)
                    const todayStatus = getTodayStatus(med)
                    
                    return (
                      <div key={med._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-800">{med.name}</p>
                            {isTaken && (
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                ✓ Taken Today
                              </span>
                            )}
                            {todayStatus === "skipped" && (
                              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                                ⊘ Skipped
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{med.dosage} • {med.frequency}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => logMedication(med._id, "taken")}
                            disabled={isTaken}
                            className={`px-3 py-1 text-xs rounded transition-colors ${
                              isTaken
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {isTaken ? "✓ Taken" : "Mark Taken"}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Blood Pressure Tab */}
        {activeTab === "blood-pressure" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">❤️ Blood Pressure Trends</h3>
            {getBPData().length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getBPData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic" strokeWidth={2} />
                  <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolic" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-20">No blood pressure data yet. Add your first reading!</p>
            )}
          </div>
        )}

        {/* Blood Sugar Tab */}
        {activeTab === "blood-sugar" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">🍬 Blood Sugar Trends</h3>
            {getBSData().length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getBSData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="glucose" stroke="#10b981" name="Glucose (mg/dL)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-20">No blood sugar data yet. Add your first reading!</p>
            )}
          </div>
        )}

        {/* Weight Tab */}
        {activeTab === "weight" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">⚖️ Weight Trends</h3>
            {getWeightData().length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getWeightData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="weight" fill="#8b5cf6" name="Weight (kg)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-20">No weight data yet. Add your first measurement!</p>
            )}
          </div>
        )}

        {/* Medications Tab */}
        {activeTab === "medications" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">💊 All Medications</h3>
                <button
                  onClick={() => setShowAddMedication(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  ➕ Add Medication
                </button>
              </div>

              {medications.length === 0 ? (
                <p className="text-gray-500 text-center py-20">No medications added yet</p>
              ) : (
                <div className="space-y-4">
                  {medications.map((med) => {
                    const isTaken = wasTakenToday(med)
                    const todayStatus = getTodayStatus(med)
                    
                    return (
                      <div key={med._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-800 text-lg">{med.name}</h4>
                              {isTaken && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                  ✓ Taken Today
                                </span>
                              )}
                              {todayStatus === "skipped" && (
                                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                                  ⊘ Skipped Today
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600">{med.dosage}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs ${med.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {med.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-gray-500">Frequency</p>
                            <p className="font-medium">{med.frequency}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Times</p>
                            <p className="font-medium">{med.times.join(", ")}</p>
                          </div>
                        </div>

                        {med.instructions && (
                          <p className="text-sm text-gray-600 mb-3">
                            <strong>Instructions:</strong> {med.instructions}
                          </p>
                        )}

                        {/* Show last taken time if taken today */}
                        {isTaken && (
                          <div className="mb-3 p-2 bg-green-50 rounded text-sm">
                            <p className="text-green-700">
                              ✓ Last taken: {new Date(med.logs?.find((log: any) => {
                                const logDate = new Date(log.takenAt).toDateString()
                                return logDate === new Date().toDateString() && log.status === "taken"
                              })?.takenAt || "").toLocaleTimeString()}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => logMedication(med._id, "taken")}
                            disabled={isTaken}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                              isTaken
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {isTaken ? "✓ Already Taken" : "✓ Mark as Taken"}
                          </button>
                          <button
                            onClick={() => logMedication(med._id, "skipped")}
                            disabled={todayStatus === "skipped"}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                              todayStatus === "skipped"
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {todayStatus === "skipped" ? "⊘ Already Skipped" : "⊘ Skip"}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Metric Modal */}
      {showAddMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">➕ Add Health Metric</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metric Type</label>
                <select
                  value={metricType}
                  onChange={(e) => setMetricType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="blood_pressure">Blood Pressure</option>
                  <option value="blood_sugar">Blood Sugar</option>
                  <option value="weight">Weight</option>
                </select>
              </div>

              {metricType === "blood_pressure" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Systolic</label>
                    <input
                      type="number"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      placeholder="120"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diastolic</label>
                    <input
                      type="number"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      placeholder="80"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {metricType === "blood_sugar" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Glucose (mg/dL)</label>
                  <input
                    type="number"
                    value={glucose}
                    onChange={(e) => setGlucose(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              {metricType === "weight" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addMetric}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Metric
              </button>
              <button
                onClick={() => setShowAddMetric(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddMedication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">💊 Add Medication</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medication Name</label>
                <input
                  type="text"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g., Aspirin"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g., 100mg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Every 8 hours">Every 8 hours</option>
                  <option value="As needed">As needed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time(s)</label>
                <input
                  type="time"
                  value={times[0]}
                  onChange={(e) => setTimes([e.target.value])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions (Optional)</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g., Take with food"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addMedication}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Medication
              </button>
              <button
                onClick={() => setShowAddMedication(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
