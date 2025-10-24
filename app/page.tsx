'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Dashboard from '@/components/Dashboard'
import MedicationScheduler from '@/components/MedicationScheduler'
import SmartNotifications from '@/components/SmartNotifications'
import CameraIdentification from '@/components/CameraIdentification'
import AdherenceTracking from '@/components/AdherenceTracking'
import FamilyNotifications from '@/components/FamilyNotifications'
import MedicationChatbot from '@/components/MedicationChatbot'
import VoiceAssistant from '@/components/VoiceAssistant'
import EPrescription from '@/components/EPrescription'
import EmergencySOS from '@/components/EmergencySOS'
import InteractionWarnings from '@/components/InteractionWarnings'

export default function Home() {
  const [activeModule, setActiveModule] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
    { id: 'scheduler', name: 'Medication Scheduler', icon: '⏰' },
    { id: 'notifications', name: 'Smart Notifications', icon: '🔔' },
    { id: 'camera', name: 'Camera ID', icon: '📷' },
    { id: 'adherence', name: 'Adherence Tracking', icon: '📊' },
    { id: 'family', name: 'Family Notifications', icon: '👨‍👩‍👧‍👦' },
    { id: 'chatbot', name: 'AI Chatbot', icon: '🤖' },
    { id: 'voice', name: 'Voice Assistant', icon: '🎤' },
    { id: 'eprescription', name: 'E-Prescription', icon: '📋' },
    { id: 'sos', name: 'Emergency SOS', icon: '🚨' },
    { id: 'interactions', name: 'Drug Interactions', icon: '⚠️' },
  ]

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />
      case 'scheduler':
        return <MedicationScheduler />
      case 'notifications':
        return <SmartNotifications />
      case 'camera':
        return <CameraIdentification />
      case 'adherence':
        return <AdherenceTracking />
      case 'family':
        return <FamilyNotifications />
      case 'chatbot':
        return <MedicationChatbot />
      case 'voice':
        return <VoiceAssistant />
      case 'eprescription':
        return <EPrescription />
      case 'sos':
        return <EmergencySOS />
      case 'interactions':
        return <InteractionWarnings />
      default:
        return <Dashboard />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="loading-spinner mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-primary-600 mb-2">MediCare AI</h2>
          <p className="text-gray-600">Loading your smart medication assistant...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        modules={modules}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      />
      
      <main className="pt-16">
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderModule()}
        </motion.div>
      </main>
    </div>
  )
}

