export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  googleId: string
  profileCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  userId: string
  organization: string
  role: string
  phoneNumber: string
  createdAt: string
  updatedAt: string
}

export interface ProfileFormData {
  organization: string
  role: string
  phoneNumber: string
}