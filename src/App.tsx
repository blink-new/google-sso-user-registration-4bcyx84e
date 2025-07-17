import { useState, useEffect } from 'react'
import { LoginPage } from '@/components/LoginPage'
import { ProfileCompletion } from '@/components/ProfileCompletion'
import { Dashboard } from '@/components/Dashboard'
import { Toaster } from '@/components/ui/toaster'
import { User } from '@/types/user'
import { blink } from '@/blink/client'
import { initializeDatabase } from '@/utils/database'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showProfileCompletion, setShowProfileCompletion] = useState(false)

  useEffect(() => {
    // Initialize database tables
    initializeDatabase()
    
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      setIsLoading(state.isLoading)
      
      if (state.user) {
        try {
          // Check if user exists in our database
          const existingUsers = await blink.db.users.list({
            where: { email: state.user.email },
            limit: 1
          })
          
          let userData: User
          
          if (existingUsers.length === 0) {
            // Create new user
            userData = await blink.db.users.create({
              id: `user_${Date.now()}`,
              email: state.user.email,
              name: state.user.displayName || state.user.email,
              avatarUrl: state.user.photoURL,
              googleId: state.user.uid,
              profileCompleted: false
            })
          } else {
            userData = existingUsers[0]
          }
          
          setUser(userData)
          // Check if profile is completed (handle boolean conversion from SQLite)
          const isProfileCompleted = typeof userData.profileCompleted === 'string' 
            ? Number(userData.profileCompleted) > 0 
            : userData.profileCompleted
          setShowProfileCompletion(!isProfileCompleted)
        } catch (error) {
          console.error('Error handling user authentication:', error)
          // If database operations fail, still allow user to proceed
          setUser({
            id: `user_${Date.now()}`,
            email: state.user.email,
            name: state.user.displayName || state.user.email,
            avatarUrl: state.user.photoURL,
            googleId: state.user.uid,
            profileCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          setShowProfileCompletion(true)
        }
      } else {
        setUser(null)
        setShowProfileCompletion(false)
      }
    })

    return unsubscribe
  }, [])

  const handleProfileComplete = () => {
    setShowProfileCompletion(false)
    // Refresh user data
    if (user) {
      setUser(prev => prev ? { ...prev, profileCompleted: true } : null)
    }
  }

  const handleEditProfile = () => {
    setShowProfileCompletion(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  if (showProfileCompletion) {
    return (
      <ProfileCompletion
        user={user}
        onProfileComplete={handleProfileComplete}
      />
    )
  }

  return (
    <>
      <Dashboard user={user} onEditProfile={handleEditProfile} />
      <Toaster />
    </>
  )
}

export default App