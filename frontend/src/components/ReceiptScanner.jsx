import React, { useState, useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import api from '../services/api' // Make sure this path is correct for your Axios instance!

// Notice we now pass BOTH merchant and amount back to the parent
const ReceiptScanner = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false)
  const fileInputRef = useRef(null)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsScanning(true)

    try {
      // 1. Pack the image into a FormData object
      const formData = new FormData()
      formData.append('file', file)

      // 2. Send it to our new Vision AI backend
      const response = await api.post('/scan-receipt/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data.error) {
        throw new Error(response.data.error)
      }

      const { merchant, amount } = response.data

      // 3. Send the AI's findings back to your main form!
      onScanComplete(amount > 0 ? amount : '', merchant || '')
    } catch (error) {
      console.error('Vision API Error:', error)
      alert('AI failed to read the receipt. Please ensure the image is clear.')
    } finally {
      setIsScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className='w-full'>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept='image/*'
        capture='environment'
        className='hidden'
      />

      <button
        type='button'
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed transition-all ${
          isScanning
            ? 'border-brand-glow bg-brand-glow/10 text-brand-glow'
            : 'border-slate-600 hover:border-brand-glow hover:bg-slate-800 text-slate-300'
        }`}
      >
        {isScanning ? (
          <>
            <Loader2 className='animate-spin' size={20} />
            AI is analyzing receipt...
          </>
        ) : (
          <>
            <Camera size={20} />
            Snap a Receipt
          </>
        )}
      </button>
    </div>
  )
}

export default ReceiptScanner
