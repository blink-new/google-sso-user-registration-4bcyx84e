import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LogOut, Mail, Phone, Building, Briefcase, Calendar, Edit } from 'lucide-react'
import { User, UserProfile } from '@/types/user'
import { blink } from '@/blink/client'

interface DashboardProps {
  user: User
  onEditProfile: () => void
}

export function Dashboard({ user, onEditProfile }: DashboardProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profiles = await blink.db.userProfiles.list({
          where: { userId: user.id },
          limit: 1
        })
        
        if (profiles.length > 0) {
          setUserProfile(profiles[0])
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        // If database fetch fails, continue without profile data
        // This prevents the dashboard from being stuck in loading state
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [user.id])

  const handleSignOut = () => {
    blink.auth.logout()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center pb-4">
                <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-lg">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <CardTitle className="text-xl">{user.name}</CardTitle>
                  <div className="flex items-center justify-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {userProfile ? 'Profile Complete' : 'Profile Pending'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Separator />
                
                {userProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Building className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Organization</p>
                        <p className="text-sm text-gray-600">{userProfile.organization}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Role</p>
                        <p className="text-sm text-gray-600">{userProfile.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <p className="text-sm text-gray-600">{userProfile.phoneNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Member Since</p>
                        <p className="text-sm text-gray-600">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">Profile information not available</p>
                    <p className="text-xs text-gray-400">Complete your profile to see details here</p>
                  </div>
                )}
                
                <Separator />
                
                <Button
                  onClick={onEditProfile}
                  variant="outline"
                  className="w-full"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {userProfile ? 'Edit Profile' : 'Complete Profile'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Welcome & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome back, {user.name.split(' ')[0]}! 👋</CardTitle>
                <CardDescription>
                  {userProfile ? "Your profile is complete and you're all set to get started." : "Please complete your profile to get started."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Account Status</h3>
                    <p className="text-sm text-blue-700">{userProfile ? '✅' : '⏳'} Profile {userProfile ? 'Complete' : 'Pending'}</p>
                    <p className="text-sm text-blue-700">✅ Email Verified</p>
                    <p className="text-sm text-blue-700">{userProfile ? '✅' : '⏳'} {userProfile ? 'Ready to Use' : 'Setup Required'}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">Quick Actions</h3>
                    <Button
                      onClick={onEditProfile}
                      variant="outline"
                      size="sm"
                      className="w-full mb-2"
                    >
                      {userProfile ? 'Update Profile' : 'Complete Profile'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled
                    >
                      View Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent account activity and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Profile completed</p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Account created via Google SSO</p>
                      <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}