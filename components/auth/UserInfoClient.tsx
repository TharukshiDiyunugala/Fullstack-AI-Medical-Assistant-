"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import SignOutButton from "./SignOutButton"

export default function UserInfoClient() {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg border border-[#79b473]/10"
    >
      {session.user.image && (
        <motion.img
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          src={session.user.image}
          alt={session.user.name || "User"}
          className="w-16 h-16 rounded-full ring-4 ring-[#79b473]/20"
        />
      )}
      <div className="flex-1">
        <h2 className="text-xl font-bold bg-gradient-to-r from-[#41658a] to-[#414073] bg-clip-text text-transparent">
          {session.user.name}
        </h2>
        <p className="text-gray-600 text-sm">{session.user.email}</p>
      </div>
      <SignOutButton />
    </motion.div>
  )
}
