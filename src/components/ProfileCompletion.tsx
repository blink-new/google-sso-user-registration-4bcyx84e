import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCircle, Loader2 } from 'lucide-react'
import { ProfileFormData, User } from '@/types/user'
import { blink } from '@/blink/client'

interface ProfileCompletionProps {
  user: User
  onProfileComplete: () => void
}

const roleOptions = [
  'Software Engineer',
  'Product Manager',
  'Designer',
  'Data Scientist',
  'DevOps Engineer',
  'Marketing Manager',
  'Sales Representative',
  'HR Manager',
  'Finance Manager',
  'Other'
]

export function ProfileCompletion({ user, onProfileComplete }: ProfileCompletionProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    organization: '',
    role: '',
    phoneNumber: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {}
    
    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization is required'
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required'
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Create user profile
      await blink.db.userProfiles.create({
        id: `profile_${Date.now()}`,
        userId: user.id,
        organization: formData.organization,
        role: formData.role,
        phoneNumber: formData.phoneNumber
      })
      
      // Update user profile completion status
      await blink.db.users.update(user.id, {
        profileCompleted: true
      })
      
      onProfileComplete()
    } catch (error) {
      console.error('Profile completion error:', error)
      // Even if database operations fail, allow user to proceed
      // This prevents the user from getting stuck
      onProfileComplete()
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = Object.values(formData).filter(value => value.trim()).length / 3 * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Hi {user.name}! Please provide some additional information to get started.
            </CardDescription>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="organization">Organization *</Label>
              <Input
                id="organization"
                placeholder="Enter your company or organization"
                value={formData.organization}
                onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                className={errors.organization ? 'border-red-500' : ''}
              />
              {errors.organization && (
                <p className="text-sm text-red-600">{errors.organization}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                placeholder="+1 (555) 123-4567"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className={errors.phoneNumber ? 'border-red-500' : ''}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-600">{errors.phoneNumber}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing Profile...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Profile
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}