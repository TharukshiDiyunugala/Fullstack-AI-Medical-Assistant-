import { auth } from "@/lib/auth"
import SignOutButton from "./SignOutButton"

export default async function UserInfo() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  return (
    <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
      {session.user.image && (
        <img
          src={session.user.image}
          alt={session.user.name || "User"}
          className="w-16 h-16 rounded-full"
        />
      )}
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-800">
          {session.user.name}
        </h2>
        <p className="text-gray-600">{session.user.email}</p>
      </div>
      <SignOutButton />
    </div>
  )
}
