'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ClockIcon, 
  BellIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface Medication {
  id: string
  name: string
  dosage: string
  time: string
  taken: boolean
  missed: boolean
}

interface Stats {
  totalMedications: number
  takenToday: number
  missedToday: number
  adherenceRate: number
}

export default function Dashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: 'Metformin', dosage: '500mg', time: '08:00', taken: true, missed: false },
    { id: '2', name: 'Lisinopril', dosage: '10mg', time: '09:00', taken: false, missed: false },
    { id: '3', name: 'Atorvastatin', dosage: '20mg', time: '20:00', taken: false, missed: false },
  ])

  const [stats, setStats] = useState<Stats>({
    totalMedications: 3,
    takenToday: 1,
    missedToday: 0,
    adherenceRate: 85
  })

  const [upcomingMedications, setUpcomingMedications] = useState<Medication[]>([])

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        adherenceRate: Math.min(100, prev.adherenceRate + Math.random() * 2)
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const markAsTaken = (id: string) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === id 
          ? { ...med, taken: true, missed: false }
          : med
      )
    )
    
    setStats(prev => ({
      ...prev,
      takenToday: prev.takenToday + 1,
      adherenceRate: Math.min(100, prev.adherenceRate + 5)
    }))
  }

  const markAsMissed = (id: string) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === id 
          ? { ...med, taken: false, missed: true }
          : med
      )
    )
    
    setStats(prev => ({
      ...prev,
      missedToday: prev.missedToday + 1,
      adherenceRate: Math.max(0, prev.adherenceRate - 10)
    }))
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
        </h1>
        <p className="text-gray-600">Here's your medication overview for today</p>
        <div className="text-sm text-gray-500 mt-2">
          Current time: {getCurrentTime()}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Medications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMedications}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taken Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.takenToday}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-2 bg-danger-100 rounded-lg">
              <XCircleIcon className="w-6 h-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Missed Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.missedToday}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Adherence Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.adherenceRate}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Today's Medications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-primary-600" />
            Today's Medications
          </h2>
          
          <div className="space-y-3">
            {medications.map((medication, index) => (
              <motion.div
                key={medication.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`medication-card ${
                  medication.taken ? 'bg-secondary-50 border-secondary-200' : 
                  medication.missed ? 'bg-danger-50 border-danger-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{medication.name}</h3>
                    <p className="text-sm text-gray-600">{medication.dosage}</p>
                    <p className="text-sm text-gray-500">Time: {medication.time}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {medication.taken ? (
                      <span className="flex items-center text-secondary-600 text-sm">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Taken
                      </span>
                    ) : medication.missed ? (
                      <span className="flex items-center text-danger-600 text-sm">
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Missed
                      </span>
                    ) : (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => markAsTaken(medication.id)}
                          className="btn-primary text-xs py-1 px-2"
                        >
                          Mark Taken
                        </button>
                        <button
                          onClick={() => markAsMissed(medication.id)}
                          className="btn-secondary text-xs py-1 px-2"
                        >
                          Mark Missed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BellIcon className="w-5 h-5 mr-2 text-primary-600" />
            Quick Actions
          </h2>
          
          <div className="space-y-4">
            <button className="w-full btn-primary flex items-center justify-center">
              <CameraIcon className="w-4 h-4 mr-2" />
              Identify Medication
            </button>
            
            <button className="w-full btn-secondary flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Schedule New Medication
            </button>
            
            <button className="w-full btn-secondary flex items-center justify-center">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Notify Family
            </button>
            
            <button className="w-full btn-danger flex items-center justify-center">
              <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              Emergency SOS
            </button>
          </div>

          {/* Adherence Progress */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Weekly Adherence</h3>
            <div className="space-y-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="flex items-center">
                  <span className="w-8 text-sm text-gray-600">{day}</span>
                  <div className="flex-1 mx-3">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${Math.random() * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="w-8 text-sm text-gray-600 text-right">
                    {Math.floor(Math.random() * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

