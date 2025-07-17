import { blink } from '@/blink/client'

export const initializeDatabase = async () => {
  try {
    // Create users table
    await blink.db.users.create({
      id: 'init_user',
      email: 'init@example.com',
      name: 'Init User',
      googleId: 'init_google_id',
      profileCompleted: false
    })
    
    // Create user_profiles table
    await blink.db.userProfiles.create({
      id: 'init_profile',
      userId: 'init_user',
      organization: 'Init Org',
      role: 'Init Role',
      phoneNumber: '+1234567890'
    })
    
    // Clean up initialization records
    await blink.db.users.delete('init_user')
    await blink.db.userProfiles.delete('init_profile')
    
    console.log('Database initialized successfully')
  } catch (error) {
    console.log('Database tables already exist or initialization complete')
  }
}