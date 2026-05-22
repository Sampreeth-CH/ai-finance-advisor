import React, { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import api from '../services/api'
import { User, MapPin, Phone, Map, Camera, Loader2, Save } from 'lucide-react'
import { motion } from 'framer-motion'

const ProfilePage = () => {
  const { user, fetchUser } = useAppStore()
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mobile_no: '',
    place: '',
    address: '',
    profile_pic: '',
  })

  // Load existing user data into the form
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        mobile_no: user.mobile_no || '',
        place: user.place || '',
        address: user.address || '',
        profile_pic: user.profile_pic || '',
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Convert uploaded image to Base64 string to save in database directly!
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Basic validation
      if (file.size > 2 * 1024 * 1024) {
        alert('Image is too large! Please upload a file smaller than 2MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, profile_pic: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await api.put('/me', formData)
      await fetchUser() // Refresh global user state
      alert('Profile updated successfully! 🎉')
    } catch (error) {
      console.error('Failed to update profile', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6 pb-8 max-w-4xl mx-auto'
    >
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-white'>My Profile</h1>
      </div>

      <div className='glass-panel p-8'>
        <form onSubmit={handleSubmit} className='space-y-8'>
          {/* Avatar Section */}
          <div className='flex flex-col items-center sm:flex-row sm:items-start gap-6 border-b border-slate-800 pb-8'>
            <div className='relative group'>
              <div className='w-32 h-32 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-900 flex items-center justify-center'>
                {formData.profile_pic ? (
                  <img
                    src={formData.profile_pic}
                    alt='Profile'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <User size={48} className='text-slate-600' />
                )}
              </div>
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='absolute bottom-0 right-0 p-3 bg-brand-glow text-white rounded-full shadow-lg hover:scale-110 transition-transform'
              >
                <Camera size={18} />
              </button>
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept='image/*'
                className='hidden'
              />
            </div>
            <div className='text-center sm:text-left pt-2'>
              <h2 className='text-xl font-bold text-white'>Profile Picture</h2>
              <p className='text-sm text-slate-400 mt-1'>
                Upload a photo to personalize your account.
                <br />
                Max size: 2MB.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-400 flex items-center gap-2'>
                <User size={16} /> First Name
              </label>
              <input
                type='text'
                name='first_name'
                value={formData.first_name}
                onChange={handleChange}
                className='glass-input w-full'
                placeholder='Rahul'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-400 flex items-center gap-2'>
                <User size={16} /> Last Name
              </label>
              <input
                type='text'
                name='last_name'
                value={formData.last_name}
                onChange={handleChange}
                className='glass-input w-full'
                placeholder='Sharma'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-400 flex items-center gap-2'>
                <Phone size={16} /> Mobile Number
              </label>
              <input
                type='tel'
                name='mobile_no'
                value={formData.mobile_no}
                onChange={handleChange}
                className='glass-input w-full'
                placeholder='+91 9876543210'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-400 flex items-center gap-2'>
                <MapPin size={16} /> City / Place
              </label>
              <input
                type='text'
                name='place'
                value={formData.place}
                onChange={handleChange}
                className='glass-input w-full'
                placeholder='Bengaluru'
              />
            </div>

            <div className='space-y-2 md:col-span-2'>
              <label className='text-sm font-medium text-slate-400 flex items-center gap-2'>
                <Map size={16} /> Full Address
              </label>
              <textarea
                name='address'
                value={formData.address}
                onChange={handleChange}
                rows='3'
                className='glass-input w-full resize-none'
                placeholder='123 Tech Park, HSR Layout...'
              ></textarea>
            </div>
          </div>

          <div className='flex justify-end pt-4'>
            <button
              type='submit'
              disabled={isSaving}
              className='flex items-center gap-2 bg-brand-glow text-white px-6 py-3 rounded-xl font-medium hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50'
            >
              {isSaving ? (
                <Loader2 size={20} className='animate-spin' />
              ) : (
                <Save size={20} />
              )}
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default ProfilePage
