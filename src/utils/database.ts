import { blink } from '@/blink/client'

// Local storage keys for fallback
const USERS_STORAGE_KEY = 'google_sso_users'
const PROFILES_STORAGE_KEY = 'google_sso_profiles'

// Database initialization with fallback to localStorage
export const initializeDatabase = async () => {
  try {
    // Try to create tables in Blink database
    await blink.db.users.list({ limit: 1 })
    console.log('Database connected successfully')
    return true
  } catch (error) {
    console.warn('Database not available, using localStorage fallback:', error)
    return false
  }
}

// Fallback user management using localStorage
export const userStorage = {
  async findByEmail(email: string) {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
    return users.find((user: any) => user.email === email) || null
  },

  async create(userData: any) {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
    const newUser = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    users.push(newUser)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    return newUser
  },

  async update(userId: string, updates: any) {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
    const userIndex = users.findIndex((user: any) => user.id === userId)
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
      return users[userIndex]
    }
    return null
  }
}

// Fallback profile management using localStorage
export const profileStorage = {
  async findByUserId(userId: string) {
    const profiles = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '[]')
    return profiles.find((profile: any) => profile.userId === userId) || null
  },

  async create(profileData: any) {
    const profiles = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '[]')
    const newProfile = {
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    profiles.push(newProfile)
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles))
    return newProfile
  }
}

// Unified database interface that tries Blink DB first, then falls back to localStorage
export const db = {
  async findUserByEmail(email: string) {
    try {
      const existingUsers = await blink.db.users.list({
        where: { email },
        limit: 1
      })
      return existingUsers.length > 0 ? existingUsers[0] : null
    } catch (error) {
      console.warn('Using localStorage fallback for user lookup')
      return userStorage.findByEmail(email)
    }
  },

  async createUser(userData: any) {
    try {
      return await blink.db.users.create(userData)
    } catch (error) {
      console.warn('Using localStorage fallback for user creation')
      return userStorage.create(userData)
    }
  },

  async updateUser(userId: string, updates: any) {
    try {
      return await blink.db.users.update(userId, updates)
    } catch (error) {
      console.warn('Using localStorage fallback for user update')
      return userStorage.update(userId, updates)
    }
  },

  async findProfileByUserId(userId: string) {
    try {
      const profiles = await blink.db.userProfiles.list({
        where: { userId },
        limit: 1
      })
      return profiles.length > 0 ? profiles[0] : null
    } catch (error) {
      console.warn('Using localStorage fallback for profile lookup')
      return profileStorage.findByUserId(userId)
    }
  },

  async createProfile(profileData: any) {
    try {
      return await blink.db.userProfiles.create(profileData)
    } catch (error) {
      console.warn('Using localStorage fallback for profile creation')
      return profileStorage.create(profileData)
    }
  }
}