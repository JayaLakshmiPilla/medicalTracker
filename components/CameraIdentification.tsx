'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CameraIcon, 
  PhotoIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import Tesseract from 'tesseract.js'
// @ts-ignore - optional dependency present in package.json
import QrScanner from 'react-qr-scanner'

interface IdentifiedMedication {
  id: string
  name: string
  genericName: string
  dosage: string
  manufacturer: string
  description: string
  sideEffects: string[]
  interactions: string[]
  warnings: string[]
  confidence: number
  imageUrl?: string
}

interface ScanResult {
  id: string
  timestamp: string
  medication: IdentifiedMedication
  imageUrl: string
  status: 'success' | 'warning' | 'error'
}

export default function CameraIdentification() {
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [identifiedMedication, setIdentifiedMedication] = useState<IdentifiedMedication | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [isQrMode, setIsQrMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Enhanced medication database with more comprehensive data
  const medicationDatabase: IdentifiedMedication[] = [
    {
      id: '1',
      name: 'Metformin',
      genericName: 'Metformin Hydrochloride',
      dosage: '500mg',
      manufacturer: 'Generic',
      description: 'Metformin is used to treat type 2 diabetes. It helps control blood sugar levels.',
      sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset', 'Metallic taste'],
      interactions: ['Alcohol', 'Contrast dyes', 'Cimetidine'],
      warnings: ['Kidney problems', 'Liver disease', 'Heart failure'],
      confidence: 95
    },
    {
      id: '2',
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      dosage: '10mg',
      manufacturer: 'Generic',
      description: 'Lisinopril is an ACE inhibitor used to treat high blood pressure and heart failure.',
      sideEffects: ['Dry cough', 'Dizziness', 'Fatigue', 'Headache'],
      interactions: ['Potassium supplements', 'NSAIDs', 'Lithium'],
      warnings: ['Pregnancy', 'Kidney disease', 'High potassium'],
      confidence: 92
    },
    {
      id: '3',
      name: 'Atorvastatin',
      genericName: 'Atorvastatin Calcium',
      dosage: '20mg',
      manufacturer: 'Generic',
      description: 'Atorvastatin is a statin used to lower cholesterol and reduce cardiovascular risk.',
      sideEffects: ['Muscle pain', 'Liver problems', 'Memory issues', 'Digestive problems'],
      interactions: ['Grapefruit juice', 'Warfarin', 'Digoxin'],
      warnings: ['Liver disease', 'Pregnancy', 'Muscle disorders'],
      confidence: 88
    },
    {
      id: '4',
      name: 'Aspirin',
      genericName: 'Acetylsalicylic Acid',
      dosage: '81mg',
      manufacturer: 'Generic',
      description: 'Low-dose aspirin used for cardiovascular protection and pain relief.',
      sideEffects: ['Stomach irritation', 'Bleeding risk', 'Ringing in ears'],
      interactions: ['Warfarin', 'NSAIDs', 'Alcohol'],
      warnings: ['Bleeding disorders', 'Stomach ulcers', 'Allergic reactions'],
      confidence: 90
    },
    {
      id: '5',
      name: 'Omeprazole',
      genericName: 'Omeprazole',
      dosage: '20mg',
      manufacturer: 'Generic',
      description: 'Proton pump inhibitor used to treat acid reflux and stomach ulcers.',
      sideEffects: ['Headache', 'Nausea', 'Diarrhea', 'Vitamin B12 deficiency'],
      interactions: ['Clopidogrel', 'Warfarin', 'Digoxin'],
      warnings: ['Bone fractures', 'Low magnesium', 'C. diff infection'],
      confidence: 87
    }
  ]

  const [searchResults, setSearchResults] = useState<IdentifiedMedication[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [ocrConfidence, setOcrConfidence] = useState(0)

  useEffect(() => {
    checkCameraPermission()
    loadScanHistory()
  }, [])

  const checkCameraPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
      setCameraPermission(permission.state === 'granted')
    } catch (error) {
      console.log('Permission API not supported')
    }
  }

  const loadScanHistory = () => {
    const history = localStorage.getItem('scanHistory')
    if (history) {
      setScanHistory(JSON.parse(history))
    }
  }

  const saveScanHistory = (result: ScanResult) => {
    const newHistory = [result, ...scanHistory].slice(0, 50) // Keep last 50 scans
    setScanHistory(newHistory)
    localStorage.setItem('scanHistory', JSON.stringify(newHistory))
  }

  const startCamera = async () => {
    try {
      setIsScanning(true)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      
      setCameraPermission(true)
      toast.success('Camera started successfully!')
    } catch (error) {
      console.error('Error accessing camera:', error)
      setCameraPermission(false)
      toast.error('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
    setCapturedImage(null)
    setIdentifiedMedication(null)
  }

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL('image/jpeg')
    setCapturedImage(imageData)
    
    // Stop camera after capture
    stopCamera()
    
    // Start processing
    processImage(imageData)
  }, [])

  const processImage = async (imageData: string) => {
    setIsProcessing(true)
    
    try {
      // Enhanced OCR processing with confidence scoring
      const { data } = await Tesseract.recognize(imageData, 'eng', { 
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrConfidence(Math.round(m.progress * 100))
          }
        }
      })
      const ocrText = (data.text || '').toLowerCase()

      // Enhanced medication matching with fuzzy search
      const matches = medicationDatabase.map(med => {
        const nameMatch = med.name.toLowerCase().includes(ocrText) || ocrText.includes(med.name.toLowerCase())
        const genericMatch = med.genericName.toLowerCase().includes(ocrText) || ocrText.includes(med.genericName.toLowerCase())
        const dosageMatch = med.dosage.toLowerCase().includes(ocrText) || ocrText.includes(med.dosage.toLowerCase())
        
        let score = 0
        if (nameMatch) score += 40
        if (genericMatch) score += 30
        if (dosageMatch) score += 20
        
        // Additional scoring based on text similarity
        const textWords = ocrText.split(/\s+/)
        const medWords = `${med.name} ${med.genericName} ${med.dosage}`.toLowerCase().split(/\s+/)
        const commonWords = textWords.filter(word => medWords.some(medWord => medWord.includes(word) || word.includes(medWord)))
        score += commonWords.length * 5
        
        return { ...med, matchScore: Math.min(score, 100) }
      }).filter(med => med.matchScore > 30).sort((a, b) => b.matchScore - a.matchScore)

      if (matches.length > 0) {
        const result = matches[0]
        setIdentifiedMedication({
          ...result,
          confidence: result.matchScore,
          imageUrl: imageData
        })

        saveScanHistory({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          medication: result,
          imageUrl: imageData,
          status: result.matchScore >= 90 ? 'success' : result.matchScore >= 70 ? 'warning' : 'error'
        })

        toast.success(`Medication identified: ${result.name} (${result.matchScore}% confidence)`)
      } else {
        // Fallback to API call if local matching fails
        try {
          const resp = await fetch('/api/identify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageData, ocrText })
          })
          
          if (resp.ok) {
            const payload = await resp.json()
            const result: IdentifiedMedication = {
              ...payload.medication,
              confidence: Math.round(payload.confidence ?? 80),
              imageUrl: imageData
            }
            setIdentifiedMedication(result)
            toast.success(`Medication identified: ${result.name}`)
          } else {
            throw new Error('API call failed')
          }
        } catch (apiError) {
          toast.error('Could not identify medication. Try a clearer photo or manual search.')
          setSearchResults(medicationDatabase.slice(0, 5)) // Show top 5 as suggestions
          setShowSearchResults(true)
        }
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to process image. Try a clearer photo.')
    } finally {
      setIsProcessing(false)
      setOcrConfidence(0)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setIdentifiedMedication(null)
    startCamera()
  }

  const addToMedications = () => {
    if (identifiedMedication) {
      // In a real app, this would add to the user's medication list
      toast.success(`${identifiedMedication.name} added to your medications!`)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setCapturedImage(dataUrl)
      setIdentifiedMedication(null)
      processImage(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleQrScan = (data: { text?: string } | null) => {
    if (!data || !data.text) return
    const payload = data.text.toLowerCase()
    // Very simple mapping from QR payload to medication
    const match = medicationDatabase.find(m => payload.includes(m.name.toLowerCase()) || payload.includes(m.genericName.toLowerCase()))
    const med = match || medicationDatabase[0]
    const result: IdentifiedMedication = { ...med, confidence: match ? 98 : 80 }
    setIdentifiedMedication(result)
    setCapturedImage('')
    setIsQrMode(false)
    saveScanHistory({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      medication: result,
      imageUrl: '',
      status: result.confidence >= 90 ? 'success' : 'warning'
    })
    toast.success(`QR identified: ${result.name}`)
  }

  const handleQrError = () => {
    // Swallow errors silently to avoid noisy UI
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircleIcon className="w-5 h-5" />
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5" />
      case 'error': return <XMarkIcon className="w-5 h-5" />
      default: return <InformationCircleIcon className="w-5 h-5" />
    }
  }

  const searchMedications = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const results = medicationDatabase.filter(med => 
      med.name.toLowerCase().includes(query.toLowerCase()) ||
      med.genericName.toLowerCase().includes(query.toLowerCase()) ||
      med.dosage.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10)

    setSearchResults(results)
    setShowSearchResults(true)
  }

  const selectMedication = (medication: IdentifiedMedication) => {
    setIdentifiedMedication(medication)
    setShowSearchResults(false)
    setSearchQuery('')
    toast.success(`Selected: ${medication.name}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Identification</h1>
            <p className="text-gray-600">Use your camera to identify medications instantly</p>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="btn-secondary flex items-center"
          >
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Scan History
          </button>
        </div>
      </motion.div>

      {/* Camera Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camera Interface */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CameraIcon className="w-5 h-5 mr-2 text-primary-600" />
            Camera Scanner
          </h2>

          {!isScanning && !capturedImage && !isQrMode && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CameraIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Scan</h3>
              <p className="text-gray-600 mb-6">
                Position the medication label clearly in the camera view
              </p>
              <button
                onClick={startCamera}
                className="btn-primary flex items-center mx-auto"
                disabled={cameraPermission === false}
              >
                <CameraIcon className="w-4 h-4 mr-2" />
                Start Camera
              </button>
              {cameraPermission === false && (
                <p className="text-red-600 text-sm mt-2">
                  Camera permission denied. Please enable camera access.
                </p>
              )}
              <div className="mt-6 flex items-center justify-center space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary flex items-center"
                >
                  <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                  Upload Image
                </button>
                <button
                  onClick={() => { setIsQrMode(true); setIdentifiedMedication(null); setCapturedImage(null) }}
                  className="btn-secondary flex items-center"
                >
                  <QrCodeIcon className="w-4 h-4 mr-2" />
                  Scan QR/Barcode
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>
            </div>
          )}

          {isQrMode && (
            <div className="text-center">
              <div className="rounded-lg overflow-hidden">
                {/* @ts-ignore - component types are loose */}
                <QrScanner
                  delay={300}
                  onError={handleQrError}
                  onScan={handleQrScan}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button onClick={() => setIsQrMode(false)} className="btn-secondary">Back</button>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-gray-900 rounded-lg object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white border-dashed rounded-lg w-48 h-32 flex items-center justify-center">
                  <span className="text-white text-sm">Position medication here</span>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={captureImage}
                  className="btn-primary flex items-center"
                >
                  <PhotoIcon className="w-4 h-4 mr-2" />
                  Capture
                </button>
                <button
                  onClick={stopCamera}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {capturedImage && !isProcessing && !identifiedMedication && (
            <div className="text-center">
              <img
                src={capturedImage}
                alt="Captured medication"
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="flex justify-center space-x-4">
                <button
                  onClick={retakePhoto}
                  className="btn-secondary"
                >
                  Retake Photo
                </button>
                <button
                  onClick={() => processImage(capturedImage)}
                  className="btn-primary"
                >
                  Identify Medication
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Image</h3>
              <p className="text-gray-600">AI is identifying your medication...</p>
              {ocrConfidence > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${ocrConfidence}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">OCR Progress: {ocrConfidence}%</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-primary-600" />
            Identification Results
          </h2>

          {!identifiedMedication && !isProcessing && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
              <p className="text-gray-600 mb-4">
                Capture a photo of your medication to see identification results
              </p>
              
              {/* Manual Search */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      searchMedications(e.target.value)
                    }}
                    className="input-field w-full pr-10"
                    placeholder="Search medications manually..."
                  />
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                
                {showSearchResults && searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg">
                    {searchResults.map((medication) => (
                      <button
                        key={medication.id}
                        onClick={() => selectMedication(medication)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{medication.name}</div>
                        <div className="text-sm text-gray-600">{medication.genericName}</div>
                        <div className="text-xs text-gray-500">{medication.dosage}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {identifiedMedication && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{identifiedMedication.name}</h3>
                  <p className="text-gray-600">{identifiedMedication.genericName}</p>
                  <p className="text-sm text-gray-500">{identifiedMedication.manufacturer}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                    identifiedMedication.confidence > 90 ? 'text-green-600 bg-green-100' :
                    identifiedMedication.confidence > 70 ? 'text-yellow-600 bg-yellow-100' :
                    'text-red-600 bg-red-100'
                  }`}>
                    {identifiedMedication.confidence}% Match
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Dosage</h4>
                  <p className="text-gray-600">{identifiedMedication.dosage}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Manufacturer</h4>
                  <p className="text-gray-600">{identifiedMedication.manufacturer}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600 text-sm">{identifiedMedication.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Side Effects</h4>
                <div className="flex flex-wrap gap-2">
                  {identifiedMedication.sideEffects.map((effect, index) => (
                    <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {effect}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Drug Interactions</h4>
                <div className="flex flex-wrap gap-2">
                  {identifiedMedication.interactions.map((interaction, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {interaction}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Warnings</h4>
                <div className="flex flex-wrap gap-2">
                  {identifiedMedication.warnings.map((warning, index) => (
                    <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      {warning}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={addToMedications}
                  className="btn-primary flex-1"
                >
                  Add to My Medications
                </button>
                <button
                  onClick={() => {
                    setIdentifiedMedication(null)
                    setCapturedImage(null)
                  }}
                  className="btn-secondary"
                >
                  Scan Another
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Scan History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Scan History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {scanHistory.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Scan History</h3>
                <p className="text-gray-600">Your medication scans will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scanHistory.map((scan) => (
                  <div key={scan.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={scan.imageUrl}
                        alt="Scanned medication"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{scan.medication.name}</h3>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scan.status)}`}>
                            {getStatusIcon(scan.status)}
                            <span className="ml-1 capitalize">{scan.status}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{scan.medication.dosage}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(scan.timestamp).toLocaleString()}
                        </p>
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">
                            Confidence: {scan.medication.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
