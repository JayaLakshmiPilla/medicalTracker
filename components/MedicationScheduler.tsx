'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  ClockIcon, 
  CalendarIcon, 
  PencilIcon, 
  TrashIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  CloudIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  startDate: string
  endDate?: string
  instructions: string
  color: string
  reminder: boolean
  reminderMinutes: number
}

interface TimeSlot {
  time: string
  taken: boolean
  missed: boolean
}

export default function MedicationScheduler() {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice Daily',
      times: ['08:00', '20:00'],
      startDate: '2024-01-01',
      instructions: 'Take with food',
      color: 'blue',
      reminder: true,
      reminderMinutes: 15
    },
    {
      id: '2',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once Daily',
      times: ['09:00'],
      startDate: '2024-01-01',
      instructions: 'Take in the morning',
      color: 'green',
      reminder: true,
      reminderMinutes: 10
    }
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    name: '',
    dosage: '',
    frequency: 'Once Daily',
    times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0],
    instructions: '',
    color: 'blue',
    reminder: true,
    reminderMinutes: 15
  })

  const [smartScheduleMode, setSmartScheduleMode] = useState(false)
  const [selectedSmartSchedule, setSelectedSmartSchedule] = useState<string[]>([])
  const [customPattern, setCustomPattern] = useState({
    days: [] as string[],
    interval: 1,
    unit: 'days' as 'days' | 'weeks' | 'months'
  })

  const colorOptions = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  ]

  const frequencyOptions = [
    'Once Daily',
    'Twice Daily',
    'Three Times Daily',
    'Four Times Daily',
    'Every 6 Hours',
    'Every 8 Hours',
    'Every 12 Hours',
    'As Needed',
    'Weekly',
    'Monthly',
    'Every 2 Days',
    'Every 3 Days',
    'Every Week',
    'Every 2 Weeks',
    'Custom Pattern'
  ]

  const smartSchedulingOptions = [
    { value: 'morning', label: 'Morning (6-10 AM)', icon: '🌅' },
    { value: 'afternoon', label: 'Afternoon (12-4 PM)', icon: '☀️' },
    { value: 'evening', label: 'Evening (6-10 PM)', icon: '🌆' },
    { value: 'night', label: 'Night (10 PM-2 AM)', icon: '🌙' },
    { value: 'with_meals', label: 'With Meals', icon: '🍽️' },
    { value: 'empty_stomach', label: 'Empty Stomach', icon: '⏰' },
    { value: 'bedtime', label: 'Bedtime', icon: '🛏️' }
  ]

  useEffect(() => {
    generateTimeSlots()
  }, [medications, selectedDate])

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = []
    medications.forEach(med => {
      med.times.forEach(time => {
        slots.push({
          time,
          taken: Math.random() > 0.3, // Simulate some taken status
          missed: Math.random() > 0.8  // Simulate some missed status
        })
      })
    })
    setTimeSlots(slots.sort((a, b) => a.time.localeCompare(b.time)))
  }

  const addMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      toast.error('Please fill in all required fields')
      return
    }

    const medication: Medication = {
      id: Date.now().toString(),
      name: newMedication.name!,
      dosage: newMedication.dosage!,
      frequency: newMedication.frequency!,
      times: newMedication.times!,
      startDate: newMedication.startDate!,
      endDate: newMedication.endDate,
      instructions: newMedication.instructions || '',
      color: newMedication.color!,
      reminder: newMedication.reminder!,
      reminderMinutes: newMedication.reminderMinutes!
    }

    setMedications([...medications, medication])
    setNewMedication({
      name: '',
      dosage: '',
      frequency: 'Once Daily',
      times: ['08:00'],
      startDate: new Date().toISOString().split('T')[0],
      instructions: '',
      color: 'blue',
      reminder: true,
      reminderMinutes: 15
    })
    setShowAddForm(false)
    toast.success('Medication added successfully!')
  }

  const updateMedication = () => {
    if (!editingMedication) return

    setMedications(medications.map(med => 
      med.id === editingMedication.id ? editingMedication : med
    ))
    setEditingMedication(null)
    toast.success('Medication updated successfully!')
  }

  const deleteMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id))
    toast.success('Medication deleted successfully!')
  }

  const addTimeSlot = () => {
    setNewMedication(prev => ({
      ...prev,
      times: [...(prev.times || []), '08:00']
    }))
  }

  const removeTimeSlot = (index: number) => {
    setNewMedication(prev => ({
      ...prev,
      times: prev.times?.filter((_, i) => i !== index) || []
    }))
  }

  const updateTimeSlot = (index: number, time: string) => {
    setNewMedication(prev => ({
      ...prev,
      times: prev.times?.map((t, i) => i === index ? time : t) || []
    }))
  }

  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0])
    if (hour >= 6 && hour < 12) return <SunIcon className="w-4 h-4 text-yellow-500" />
    if (hour >= 12 && hour < 18) return <CloudIcon className="w-4 h-4 text-blue-500" />
    return <MoonIcon className="w-4 h-4 text-indigo-500" />
  }

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500'
    }
    return colorMap[color] || 'bg-blue-500'
  }

  const generateSmartTimes = (scheduleTypes: string[]) => {
    const timeMap: { [key: string]: string[] } = {
      morning: ['07:00', '08:00', '09:00'],
      afternoon: ['12:00', '13:00', '14:00', '15:00'],
      evening: ['18:00', '19:00', '20:00'],
      night: ['22:00', '23:00'],
      with_meals: ['08:00', '13:00', '19:00'],
      empty_stomach: ['07:00', '21:00'],
      bedtime: ['22:00']
    }
    
    const times = new Set<string>()
    scheduleTypes.forEach(type => {
      timeMap[type]?.forEach(time => times.add(time))
    })
    
    return Array.from(times).sort()
  }

  const applySmartSchedule = () => {
    if (selectedSmartSchedule.length === 0) return
    
    const smartTimes = generateSmartTimes(selectedSmartSchedule)
    setNewMedication(prev => ({
      ...prev,
      times: smartTimes,
      frequency: smartTimes.length === 1 ? 'Once Daily' : 
                 smartTimes.length === 2 ? 'Twice Daily' :
                 smartTimes.length === 3 ? 'Three Times Daily' :
                 smartTimes.length === 4 ? 'Four Times Daily' : 'Custom Pattern'
    }))
    setSmartScheduleMode(false)
    toast.success('Smart schedule applied!')
  }

  const generateRecurringSchedule = (medication: Medication) => {
    // Generate schedule for the next 30 days based on frequency
    const schedule: { [key: string]: string[] } = {}
    const startDate = new Date(medication.startDate)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 30)

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      schedule[dateStr] = medication.times
    }

    return schedule
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Medication Scheduler</h1>
            <p className="text-gray-600">Manage your personalized medication schedule</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Medication
          </button>
        </div>
      </motion.div>

      {/* Date Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarIcon className="w-5 h-5 text-primary-600 mr-2" />
            <span className="font-medium text-gray-900">Schedule for:</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field w-auto"
          />
        </div>
      </motion.div>

      {/* Medications List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {medications.map((medication, index) => (
          <motion.div
            key={medication.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${getColorClass(medication.color)} mr-3`}></div>
                <div>
                  <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                  <p className="text-sm text-gray-600">{medication.dosage}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingMedication(medication)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMedication(medication.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="w-4 h-4 mr-2" />
                <span>{medication.frequency}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <BellIcon className="w-4 h-4 mr-2" />
                <span>Reminder: {medication.reminderMinutes} minutes before</span>
              </div>

              {medication.instructions && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Instructions:</strong> {medication.instructions}
                </p>
              )}

              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Scheduled Times:</h4>
                <div className="flex flex-wrap gap-2">
                  {medication.times.map((time, timeIndex) => (
                    <span
                      key={timeIndex}
                      className="flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs"
                    >
                      {getTimeIcon(time)}
                      <span className="ml-1">{time}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Daily Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h2>
        <div className="space-y-3">
          {timeSlots.map((slot, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                slot.taken ? 'bg-secondary-50 border-secondary-200' :
                slot.missed ? 'bg-danger-50 border-danger-200' :
                'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center">
                {getTimeIcon(slot.time)}
                <span className="ml-2 font-medium">{slot.time}</span>
              </div>
              <div className="flex items-center space-x-2">
                {slot.taken ? (
                  <span className="text-secondary-600 text-sm">✓ Taken</span>
                ) : slot.missed ? (
                  <span className="text-danger-600 text-sm">✗ Missed</span>
                ) : (
                  <div className="flex space-x-1">
                    <button className="btn-primary text-xs py-1 px-2">
                      Mark Taken
                    </button>
                    <button className="btn-secondary text-xs py-1 px-2">
                      Mark Missed
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add/Edit Medication Modal */}
      {(showAddForm || editingMedication) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingMedication ? 'Edit Medication' : 'Add New Medication'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    value={editingMedication?.name || newMedication.name || ''}
                    onChange={(e) => {
                      if (editingMedication) {
                        setEditingMedication({ ...editingMedication, name: e.target.value })
                      } else {
                        setNewMedication({ ...newMedication, name: e.target.value })
                      }
                    }}
                    className="input-field"
                    placeholder="e.g., Metformin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    value={editingMedication?.dosage || newMedication.dosage || ''}
                    onChange={(e) => {
                      if (editingMedication) {
                        setEditingMedication({ ...editingMedication, dosage: e.target.value })
                      } else {
                        setNewMedication({ ...newMedication, dosage: e.target.value })
                      }
                    }}
                    className="input-field"
                    placeholder="e.g., 500mg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={editingMedication?.frequency || newMedication.frequency}
                  onChange={(e) => {
                    if (editingMedication) {
                      setEditingMedication({ ...editingMedication, frequency: e.target.value })
                    } else {
                      setNewMedication({ ...newMedication, frequency: e.target.value })
                    }
                  }}
                  className="input-field"
                >
                  {frequencyOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Times
                </label>
                
                {/* Smart Scheduling Toggle */}
                <div className="mb-4">
                  <button
                    onClick={() => setSmartScheduleMode(!smartScheduleMode)}
                    className={`btn-secondary text-sm py-2 px-4 ${smartScheduleMode ? 'bg-primary-100 text-primary-700' : ''}`}
                  >
                    {smartScheduleMode ? '✓ Smart Schedule Active' : '🧠 Use Smart Schedule'}
                  </button>
                </div>

                {smartScheduleMode && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Choose Smart Schedule Options:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {smartSchedulingOptions.map((option) => (
                        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedSmartSchedule.includes(option.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSmartSchedule([...selectedSmartSchedule, option.value])
                              } else {
                                setSelectedSmartSchedule(selectedSmartSchedule.filter(s => s !== option.value))
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{option.icon} {option.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={applySmartSchedule}
                        className="btn-primary text-sm py-1 px-3"
                        disabled={selectedSmartSchedule.length === 0}
                      >
                        Apply Smart Schedule
                      </button>
                      <button
                        onClick={() => {
                          setSmartScheduleMode(false)
                          setSelectedSmartSchedule([])
                        }}
                        className="btn-secondary text-sm py-1 px-3"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {(editingMedication?.times || newMedication.times || []).map((time, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          if (editingMedication) {
                            const newTimes = [...editingMedication.times]
                            newTimes[index] = e.target.value
                            setEditingMedication({ ...editingMedication, times: newTimes })
                          } else {
                            updateTimeSlot(index, e.target.value)
                          }
                        }}
                        className="input-field flex-1"
                      />
                      {(editingMedication?.times || newMedication.times || []).length > 1 && (
                        <button
                          onClick={() => {
                            if (editingMedication) {
                              const newTimes = editingMedication.times.filter((_, i) => i !== index)
                              setEditingMedication({ ...editingMedication, times: newTimes })
                            } else {
                              removeTimeSlot(index)
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addTimeSlot}
                    className="btn-secondary text-sm py-1 px-2"
                  >
                    Add Time
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editingMedication?.startDate || newMedication.startDate}
                    onChange={(e) => {
                      if (editingMedication) {
                        setEditingMedication({ ...editingMedication, startDate: e.target.value })
                      } else {
                        setNewMedication({ ...newMedication, startDate: e.target.value })
                      }
                    }}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={editingMedication?.endDate || newMedication.endDate || ''}
                    onChange={(e) => {
                      if (editingMedication) {
                        setEditingMedication({ ...editingMedication, endDate: e.target.value })
                      } else {
                        setNewMedication({ ...newMedication, endDate: e.target.value })
                      }
                    }}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  value={editingMedication?.instructions || newMedication.instructions || ''}
                  onChange={(e) => {
                    if (editingMedication) {
                      setEditingMedication({ ...editingMedication, instructions: e.target.value })
                    } else {
                      setNewMedication({ ...newMedication, instructions: e.target.value })
                    }
                  }}
                  className="input-field"
                  rows={3}
                  placeholder="e.g., Take with food, avoid alcohol"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        onClick={() => {
                          if (editingMedication) {
                            setEditingMedication({ ...editingMedication, color: color.value })
                          } else {
                            setNewMedication({ ...newMedication, color: color.value })
                          }
                        }}
                        className={`w-8 h-8 rounded-full ${color.class} ${
                          (editingMedication?.color || newMedication.color) === color.value
                            ? 'ring-2 ring-gray-400' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder (minutes before)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editingMedication?.reminderMinutes || newMedication.reminderMinutes || 15}
                    onChange={(e) => {
                      if (editingMedication) {
                        setEditingMedication({ ...editingMedication, reminderMinutes: parseInt(e.target.value) })
                      } else {
                        setNewMedication({ ...newMedication, reminderMinutes: parseInt(e.target.value) })
                      }
                    }}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingMedication(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={editingMedication ? updateMedication : addMedication}
                className="btn-primary"
              >
                {editingMedication ? 'Update' : 'Add'} Medication
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

