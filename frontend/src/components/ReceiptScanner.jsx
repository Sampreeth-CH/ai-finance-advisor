import React, { useState, useRef } from 'react'
import Tesseract from 'tesseract.js'
import { Camera, Loader2, CheckCircle } from 'lucide-react'

const ReceiptScanner = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsScanning(true)
    setProgress(0)

    try {
      // Run Tesseract OCR on the image
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
      })

      const text = result.data.text

      // Clever Regex to find currency amounts (e.g., 150.00, ₹150, Rs. 150)
      const amountRegex =
        /(?:rs\.?|inr|₹|\$)?\s*(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/gi
      const matches = [...text.matchAll(amountRegex)]

      let highestAmount = 0

      if (matches.length > 0) {
        // Assume the highest number on the receipt is the Total Amount
        matches.forEach((match) => {
          const num = parseFloat(match[1].replace(/,/g, ''))
          if (num > highestAmount) highestAmount = num
        })
      }

      // Pass the found amount back to the parent component
      onScanComplete(highestAmount > 0 ? highestAmount.toFixed(2) : '')
    } catch (error) {
      console.error('OCR Error:', error)
      alert('Failed to read the receipt. Please try a clearer image.')
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
        capture='environment' // Opens camera on mobile!
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
            Scanning Receipt... {progress}%
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
