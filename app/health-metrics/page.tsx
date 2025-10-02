"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { FaHome, FaChartLine, FaHeartbeat, FaWeight, FaPills, FaPlus, FaTimes, FaCheck, FaCalendarAlt, FaClock, FaTint } from "react-icons/fa"
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

  const [metricType, setMetricType] = useState("blood_pressure")
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [glucose, setGlucose] = useState("")
  const [weight, setWeight] = useState("")
  const [notes, setNotes] = useState("")

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
        body: JSON.stringify({ type: metricType, value, unit, notes, measuredAt: new Date() }),
      })

      if (response.ok) {
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
        body: JSON.stringify({ medicationId, status, takenAt: new Date() }),
      })
      
      if (response.ok) {
        loadData()
      }
    } catch (error) {
      console.error("Error logging medication:", error)
    }
  }

  const wasTakenToday = (medication: Medication) => {
    const today = new Date().toDateString()
    return medication.logs?.some((log: any) => {
      const logDate = new Date(log.takenAt).toDateString()
      return logDate === today && log.status === "taken"
    })
  }

  const getTodayStatus = (medication: Medication) => {
    if (!medication.logs || medication.logs.length === 0) return null
    const today = new Date().toDateString()
    const todayLog = medication.logs.find((log: any) => {
      const logDate = new Date(log.takenAt).toDateString()
      return logDate === today
    })
    return todayLog?.status || null
  }

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
      <div className="min-h-screen bg-gradient-to-br from-[#79b473]/5 via-white to-[#41658a]/5 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#79b473] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: FaChartLine },
    { id: "blood-pressure", label: "Blood Pressure", icon: FaHeartbeat },
    { id: "blood-sugar", label: "Blood Sugar", icon: FaTint },
    { id: "weight", label: "Weight", icon: FaWeight },
    { id: "medications", label: "Medications", icon: FaPills },
  ]

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
                <div className="w-10 h-10 bg-gradient-to-br from-[#414073] to-[#4c3957] rounded-xl flex items-center justify-center shadow-lg">
                  <FaChartLine className="text-white text-xl" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#41658a] to-[#414073] bg-clip-text text-transparent">
                  Health Metrics
                </h1>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddMetric(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-[#79b473] to-[#70a37f] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
            >
              <FaPlus />
              <span className="hidden md:inline">Add Metric</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-4 z-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 font-medium ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#41658a] to-[#414073] text-white shadow-lg"
                  : "bg-white/90 backdrop-blur-sm text-gray-700 hover:shadow-md border border-[#79b473]/20"
              }`}
            >
              <tab.icon className={activeTab === tab.id ? "text-white" : "text-[#79b473]"} />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 pb-8 z-10">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Blood Pressure Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-[#79b473]/20 hover:shadow-2xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Blood Pressure</h3>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <FaHeartbeat className="text-white text-xl" />
                    </div>
                  </div>
                  {getLatestMetric("blood_pressure") ? (
                    <div>
                      <p className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                        {getLatestMetric("blood_pressure")?.value.systolic}/
                        {getLatestMetric("blood_pressure")?.value.diastolic}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">mmHg</p>
                      <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                        <FaCalendarAlt />
                        <span>{new Date(getLatestMetric("blood_pressure")!.measuredAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No data yet</p>
                  )}
                </motion.div>

                {/* Blood Sugar Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-[#79b473]/20 hover:shadow-2xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Blood Sugar</h3>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#79b473] to-[#70a37f] rounded-xl flex items-center justify-center">
                      <FaTint className="text-white text-xl" />
                    </div>
                  </div>
                  {getLatestMetric("blood_sugar") ? (
                    <div>
                      <p className="text-4xl font-bold bg-gradient-to-r from-[#79b473] to-[#70a37f] bg-clip-text text-transparent">
                        {getLatestMetric("blood_sugar")?.value.glucose}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">mg/dL</p>
                      <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                        <FaCalendarAlt />
                        <span>{new Date(getLatestMetric("blood_sugar")!.measuredAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No data yet</p>
                  )}
                </motion.div>

                {/* Weight Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-[#79b473]/20 hover:shadow-2xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Weight</h3>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#41658a] to-[#414073] rounded-xl flex items-center justify-center">
                      <FaWeight className="text-white text-xl" />
                    </div>
                  </div>
                  {getLatestMetric("weight") ? (
                    <div>
                      <p className="text-4xl font-bold bg-gradient-to-r from-[#41658a] to-[#414073] bg-clip-text text-transparent">
                        {getLatestMetric("weight")?.value.weight}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">kg</p>
                      <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                        <FaCalendarAlt />
                        <span>{new Date(getLatestMetric("weight")!.measuredAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No data yet</p>
                  )}
                </motion.div>
              </div>

              {/* Active Medications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-[#79b473]/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <FaPills className="text-white text-sm" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Active Medications</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddMedication(true)}
                    className="flex items-center gap-1 text-sm text-[#79b473] hover:text-[#70a37f] font-medium"
                  >
                    <FaPlus /> Add
                  </motion.button>
                </div>
                {medications.length === 0 ? (
                  <div className="text-center py-12">
                    <FaPills className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No active medications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medications.slice(0, 5).map((med, index) => {
                      const isTaken = wasTakenToday(med)
                      const todayStatus = getTodayStatus(med)
                      
                      return (
                        <motion.div
                          key={med._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-[#79b473]/20 hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-800">{med.name}</p>
                              {isTaken && (
                                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                  <FaCheck className="text-xs" /> Taken
                                </span>
                              )}
                              {todayStatus === "skipped" && (
                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                                  Skipped
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{med.dosage} • {med.frequency}</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => logMedication(med._id, "taken")}
                            disabled={isTaken}
                            className={`px-4 py-2 text-xs rounded-lg font-medium transition-all ${
                              isTaken
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-[#79b473] to-[#70a37f] text-white hover:shadow-lg"
                            }`}
                          >
                            {isTaken ? "✓ Taken" : "Mark Taken"}
                          </motion.button>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Blood Pressure Tab */}
          {activeTab === "blood-pressure" && (
            <motion.div
              key="blood-pressure"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-[#79b473]/20"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <FaHeartbeat className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                  Blood Pressure Trends
                </h3>
              </div>
              {getBPData().length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={getBPData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} />
                    <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolic" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-20">
                  <FaHeartbeat className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No blood pressure data yet. Add your first reading!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Blood Sugar Tab */}
          {activeTab === "blood-sugar" && (
            <motion.div
              key="blood-sugar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-[#79b473]/20"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#79b473] to-[#70a37f] rounded-xl flex items-center justify-center">
                  <FaTint className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-[#79b473] to-[#70a37f] bg-clip-text text-transparent">
                  Blood Sugar Trends
                </h3>
              </div>
              {getBSData().length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={getBSData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="glucose" stroke="#79b473" name="Glucose (mg/dL)" strokeWidth={3} dot={{ fill: '#79b473', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-20">
                  <FaTint className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No blood sugar data yet. Add your first reading!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Weight Tab */}
          {activeTab === "weight" && (
            <motion.div
              key="weight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-[#79b473]/20"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#41658a] to-[#414073] rounded-xl flex items-center justify-center">
                  <FaWeight className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-[#41658a] to-[#414073] bg-clip-text text-transparent">
                  Weight Trends
                </h3>
              </div>
              {getWeightData().length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getWeightData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="weight" fill="url(#weightGradient)" name="Weight (kg)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#41658a" />
                        <stop offset="100%" stopColor="#414073" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-20">
                  <FaWeight className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No weight data yet. Add your first measurement!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Medications Tab */}
          {activeTab === "medications" && (
            <motion.div
              key="medications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-[#79b473]/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <FaPills className="text-white text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">All Medications</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddMedication(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#79b473] to-[#70a37f] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    <FaPlus /> Add Medication
                  </motion.button>
                </div>

                {medications.length === 0 ? (
                  <div className="text-center py-20">
                    <FaPills className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No medications added yet</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAddMedication(true)}
                      className="px-6 py-3 bg-gradient-to-r from-[#79b473] to-[#70a37f] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                    >
                      Add Your First Medication
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medications.map((med, index) => {
                      const isTaken = wasTakenToday(med)
                      const todayStatus = getTodayStatus(med)
                      
                      return (
                        <motion.div
                          key={med._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-2 border-[#79b473]/20 rounded-xl p-5 bg-gradient-to-r from-white to-gray-50 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-800 text-lg">{med.name}</h4>
                                {isTaken && (
                                  <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                    <FaCheck /> Taken Today
                                  </span>
                                )}
                                {todayStatus === "skipped" && (
                                  <span className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                                    Skipped Today
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600">{med.dosage}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${med.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {med.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm mb-3 p-3 bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <FaClock className="text-[#79b473]" />
                              <div>
                                <p className="text-gray-500 text-xs">Frequency</p>
                                <p className="font-medium">{med.frequency}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-[#41658a]" />
                              <div>
                                <p className="text-gray-500 text-xs">Times</p>
                                <p className="font-medium">{med.times.join(", ")}</p>
                              </div>
                            </div>
                          </div>

                          {med.instructions && (
                            <p className="text-sm text-gray-600 mb-3 p-2 bg-blue-50 rounded-lg">
                              <strong>Instructions:</strong> {med.instructions}
                            </p>
                          )}

                          {isTaken && (
                            <div className="mb-3 p-3 bg-green-50 rounded-lg text-sm flex items-center gap-2">
                              <FaCheck className="text-green-600" />
                              <p className="text-green-700">
                                Last taken: {new Date(med.logs?.find((log: any) => {
                                  const logDate = new Date(log.takenAt).toDateString()
                                  return logDate === new Date().toDateString() && log.status === "taken"
                                })?.takenAt || "").toLocaleTimeString()}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => logMedication(med._id, "taken")}
                              disabled={isTaken}
                              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                isTaken
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-gradient-to-r from-[#79b473] to-[#70a37f] text-white hover:shadow-lg"
                              }`}
                            >
                              {isTaken ? "✓ Already Taken" : "✓ Mark as Taken"}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => logMedication(med._id, "skipped")}
                              disabled={todayStatus === "skipped"}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                todayStatus === "skipped"
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {todayStatus === "skipped" ? "Already Skipped" : "Skip"}
                            </motion.button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Metric Modal */}
      <AnimatePresence>
        {showAddMetric && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddMetric(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-[#79b473] to-[#70a37f] bg-clip-text text-transparent">
                  Add Health Metric
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddMetric(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Metric Type</label>
                  <select
                    value={metricType}
                    onChange={(e) => setMetricType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#79b473]/20 focus:border-[#79b473] outline-none transition-all"
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#79b473]/20 focus:border-[#79b473] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Diastolic</label>
                      <input
                        type="number"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                        placeholder="80"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#79b473]/20 focus:border-[#79b473] outline-none transition-all"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#79b473]/20 focus:border-[#79b473] outline-none transition-all"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#79b473]/20 focus:border-[#79b473] outline-none transition-all"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#79b473]/20 focus:border-[#79b473] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addMetric}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#79b473] to-[#70a37f] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Add Metric
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddMetric(false)}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Medication Modal */}
      <AnimatePresence>
        {showAddMedication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddMedication(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Add Medication
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddMedication(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medication Name</label>
                  <input
                    type="text"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="e.g., Aspirin"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#79b473]/20 focus:border-[#79b473] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g., 100mg"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#79b473]/20 focus:border-[#79b473] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#79b473]/20 focus:border-[#79b473] outline-none transition-all"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#79b473]/20 focus:border-[#79b473] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructions (Optional)</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g., Take with food"
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#79b473]/20 focus:border-[#79b473] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addMedication}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#79b473] to-[#70a37f] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Add Medication
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddMedication(false)}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
