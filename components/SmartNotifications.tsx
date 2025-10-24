'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BellIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  SpeakerWaveIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'

interface Notification {
  id: string
  type: 'medication' | 'reminder' | 'warning' | 'appointment' | 'refill'
  title: string
  message: string
  time: string
  isRead: boolean
  isActive: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  channels: ('push' | 'email' | 'sms' | 'in-app')[]
  medicationId?: string
  scheduledTime?: string
}

interface NotificationSettings {
  pushNotifications: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  inAppNotifications: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  reminderAdvance: number
  maxDailyNotifications: number
}

export default function SmartNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'medication',
      title: 'Time for Metformin',
      message: 'Take your 500mg Metformin dose now',
      time: '08:00',
      isRead: false,
      isActive: true,
      priority: 'high',
      channels: ['push', 'in-app'],
      medicationId: '1',
      scheduledTime: '08:00'
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Refill Reminder',
      message: 'Your Lisinopril prescription needs refilling in 3 days',
      time: '10:30',
      isRead: true,
      isActive: true,
      priority: 'medium',
      channels: ['email', 'in-app']
    },
    {
      id: '3',
      type: 'warning',
      title: 'Drug Interaction Alert',
      message: 'Potential interaction between Metformin and new medication',
      time: '14:15',
      isRead: false,
      isActive: true,
      priority: 'urgent',
      channels: ['push', 'email', 'sms', 'in-app']
    },
    {
      id: '4',
      type: 'appointment',
      title: 'Doctor Appointment',
      message: 'Your appointment with Dr. Smith is tomorrow at 2:00 PM',
      time: '16:45',
      isRead: true,
      isActive: true,
      priority: 'medium',
      channels: ['push', 'email']
    }
  ])

  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '07:00'
    },
    reminderAdvance: 15,
    maxDailyNotifications: 10
  })

  const [showSettings, setShowSettings] = useState(false)
  const [showAddNotification, setShowAddNotification] = useState(false)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)

  const [newNotification, setNewNotification] = useState<Partial<Notification>>({
    type: 'medication',
    title: '',
    message: '',
    time: '',
    priority: 'medium',
    channels: ['push', 'in-app']
  })

  const [emailSettings, setEmailSettings] = useState({
    email: '',
    smtpConfigured: false,
    testEmailSent: false
  })

  const [notificationTemplates, setNotificationTemplates] = useState([
    {
      id: '1',
      name: 'Medication Reminder',
      template: 'Time for {medicationName} - Take your {dosage} dose now',
      type: 'medication'
    },
    {
      id: '2', 
      name: 'Refill Alert',
      template: 'Your {medicationName} prescription needs refilling in {days} days',
      type: 'refill'
    },
    {
      id: '3',
      name: 'Appointment Reminder',
      template: 'Your appointment with {doctorName} is {time} at {location}',
      type: 'appointment'
    }
  ])

  const notificationTypes = [
    { value: 'medication', label: 'Medication Reminder', icon: '💊', color: 'blue' },
    { value: 'reminder', label: 'General Reminder', icon: '⏰', color: 'green' },
    { value: 'warning', label: 'Warning Alert', icon: '⚠️', color: 'red' },
    { value: 'appointment', label: 'Appointment', icon: '📅', color: 'purple' },
    { value: 'refill', label: 'Refill Reminder', icon: '🔄', color: 'orange' }
  ]

  const priorityColors = {
    low: 'text-gray-600 bg-gray-100',
    medium: 'text-blue-600 bg-blue-100',
    high: 'text-orange-600 bg-orange-100',
    urgent: 'text-red-600 bg-red-100'
  }

  const channelIcons = {
    push: <BellIcon className="w-4 h-4" />,
    email: <EnvelopeIcon className="w-4 h-4" />,
    sms: <DevicePhoneMobileIcon className="w-4 h-4" />,
    'in-app': <ComputerDesktopIcon className="w-4 h-4" />
  }

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const now = new Date()
      const currentTime = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })

      // Check for scheduled notifications
      notifications.forEach(notification => {
        if (notification.scheduledTime === currentTime && notification.isActive) {
          showNotification(notification)
        }
      })
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [notifications])

  const showNotification = (notification: Notification) => {
    if (notification.channels.includes('push')) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        })
      }
    }
    
    toast.info(notification.message, {
      position: 'top-right',
      autoClose: 5000
    })
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        toast.success('Notifications enabled!')
      } else {
        toast.error('Notifications blocked')
      }
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    )
    toast.success('All notifications marked as read')
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
    toast.success('Notification deleted')
  }

  const toggleNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isActive: !notif.isActive } : notif
      )
    )
  }

  const addNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Please fill in all required fields')
      return
    }

    const notification: Notification = {
      id: Date.now().toString(),
      type: newNotification.type!,
      title: newNotification.title!,
      message: newNotification.message!,
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      isRead: false,
      isActive: true,
      priority: newNotification.priority!,
      channels: newNotification.channels!,
      scheduledTime: newNotification.scheduledTime
    }

    setNotifications([...notifications, notification])
    setNewNotification({
      type: 'medication',
      title: '',
      message: '',
      time: '',
      priority: 'medium',
      channels: ['push', 'in-app']
    })
    setShowAddNotification(false)
    toast.success('Notification created successfully!')
  }

  const updateNotification = () => {
    if (!editingNotification) return

    setNotifications(prev => 
      prev.map(notif => 
        notif.id === editingNotification.id ? editingNotification : notif
      )
    )
    setEditingNotification(null)
    toast.success('Notification updated successfully!')
  }

  const updateSettings = () => {
    setShowSettings(false)
    toast.success('Settings updated successfully!')
  }

  const sendTestEmail = async () => {
    if (!emailSettings.email) {
      toast.error('Please enter your email address')
      return
    }

    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000))
      setEmailSettings(prev => ({ ...prev, testEmailSent: true }))
      toast.success('Test email sent successfully!')
    } catch (error) {
      toast.error('Failed to send test email')
    }
  }

  const applyTemplate = (template: any) => {
    setNewNotification(prev => ({
      ...prev,
      type: template.type,
      title: template.name,
      message: template.template
    }))
    toast.success('Template applied!')
  }

  const scheduleRecurringNotification = (notification: Notification, frequency: string) => {
    // Simulate scheduling recurring notifications
    toast.success(`Recurring notification scheduled for ${frequency}`)
  }

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.isRead).length
  }

  const getActiveCount = () => {
    return notifications.filter(notif => notif.isActive).length
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Notifications</h1>
            <p className="text-gray-600">Manage your medication alerts and reminders</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddNotification(true)}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Notification
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="btn-secondary flex items-center"
            >
              <CogIcon className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BellIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
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
            <div className="p-2 bg-warning-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{getUnreadCount()}</p>
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
            <div className="p-2 bg-secondary-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{getActiveCount()}</p>
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
            <div className="p-2 bg-danger-100 rounded-lg">
              <SpeakerWaveIcon className="w-6 h-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.priority === 'urgent').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Notification Permission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BellIcon className="w-5 h-5 text-primary-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Browser Notifications</h3>
              <p className="text-sm text-gray-600">
                {Notification.permission === 'granted' 
                  ? 'Notifications are enabled' 
                  : 'Click to enable browser notifications'
                }
              </p>
            </div>
          </div>
          {Notification.permission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="btn-primary"
            >
              Enable Notifications
            </button>
          )}
        </div>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Notifications</h2>
          <button
            onClick={markAllAsRead}
            className="btn-secondary text-sm"
          >
            Mark All as Read
          </button>
        </div>

        <div className="space-y-4">
          {notifications.map((notification, index) => {
            const typeInfo = notificationTypes.find(t => t.value === notification.type)
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  notification.isRead 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-gray-300 shadow-sm'
                } ${!notification.isActive ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{typeInfo?.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[notification.priority]}`}>
                          {notification.priority}
                        </span>
                        {!notification.isActive && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {notification.time}
                        </span>
                        <div className="flex items-center space-x-1">
                          {notification.channels.map(channel => (
                            <span key={channel} className="flex items-center">
                              {channelIcons[channel]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-primary-600"
                        title="Mark as read"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setEditingNotification(notification)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleNotification(notification.id)}
                      className={`p-1 ${notification.isActive ? 'text-green-600' : 'text-gray-400'} hover:text-gray-600`}
                      title={notification.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {notification.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Add/Edit Notification Modal */}
      {(showAddNotification || editingNotification) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingNotification ? 'Edit Notification' : 'Add New Notification'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={editingNotification?.type || newNotification.type}
                    onChange={(e) => {
                      if (editingNotification) {
                        setEditingNotification({ ...editingNotification, type: e.target.value as any })
                      } else {
                        setNewNotification({ ...newNotification, type: e.target.value as any })
                      }
                    }}
                    className="input-field"
                  >
                    {notificationTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={editingNotification?.priority || newNotification.priority}
                    onChange={(e) => {
                      if (editingNotification) {
                        setEditingNotification({ ...editingNotification, priority: e.target.value as any })
                      } else {
                        setNewNotification({ ...newNotification, priority: e.target.value as any })
                      }
                    }}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editingNotification?.title || newNotification.title || ''}
                  onChange={(e) => {
                    if (editingNotification) {
                      setEditingNotification({ ...editingNotification, title: e.target.value })
                    } else {
                      setNewNotification({ ...newNotification, title: e.target.value })
                    }
                  }}
                  className="input-field"
                  placeholder="e.g., Time for Metformin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={editingNotification?.message || newNotification.message || ''}
                  onChange={(e) => {
                    if (editingNotification) {
                      setEditingNotification({ ...editingNotification, message: e.target.value })
                    } else {
                      setNewNotification({ ...newNotification, message: e.target.value })
                    }
                  }}
                  className="input-field"
                  rows={3}
                  placeholder="e.g., Take your 500mg Metformin dose now"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Channels
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(channelIcons).map(([channel, icon]) => (
                    <label key={channel} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(editingNotification?.channels || newNotification.channels || []).includes(channel as any)}
                        onChange={(e) => {
                          const channels = editingNotification?.channels || newNotification.channels || []
                          const newChannels = e.target.checked
                            ? [...channels, channel as any]
                            : channels.filter(c => c !== channel)
                          
                          if (editingNotification) {
                            setEditingNotification({ ...editingNotification, channels: newChannels })
                          } else {
                            setNewNotification({ ...newNotification, channels: newChannels })
                          }
                        }}
                        className="rounded"
                      />
                      <span className="flex items-center space-x-1">
                        {icon}
                        <span className="capitalize">{channel}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Time (Optional)
                </label>
                <input
                  type="time"
                  value={editingNotification?.scheduledTime || newNotification.scheduledTime || ''}
                  onChange={(e) => {
                    if (editingNotification) {
                      setEditingNotification({ ...editingNotification, scheduledTime: e.target.value })
                    } else {
                      setNewNotification({ ...newNotification, scheduledTime: e.target.value })
                    }
                  }}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddNotification(false)
                  setEditingNotification(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={editingNotification ? updateNotification : addNotification}
                className="btn-primary"
              >
                {editingNotification ? 'Update' : 'Create'} Notification
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Settings</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Notification Channels</h3>
                <div className="space-y-3">
                  {[
                    { key: 'pushNotifications', label: 'Push Notifications', icon: <BellIcon className="w-5 h-5" /> },
                    { key: 'emailNotifications', label: 'Email Notifications', icon: <EnvelopeIcon className="w-5 h-5" /> },
                    { key: 'smsNotifications', label: 'SMS Notifications', icon: <DevicePhoneMobileIcon className="w-5 h-5" /> },
                    { key: 'inAppNotifications', label: 'In-App Notifications', icon: <ComputerDesktopIcon className="w-5 h-5" /> }
                  ].map(({ key, label, icon }) => (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings[key as keyof NotificationSettings] as boolean}
                        onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="flex items-center space-x-2">
                        {icon}
                        <span>{label}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Quiet Hours</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.quietHours.enabled}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        quietHours: { ...prev.quietHours, enabled: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    <span>Enable quiet hours</span>
                  </label>
                  
                  {settings.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={settings.quietHours.start}
                          onChange={(e) => setSettings(prev => ({ 
                            ...prev, 
                            quietHours: { ...prev.quietHours, start: e.target.value }
                          }))}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          value={settings.quietHours.end}
                          onChange={(e) => setSettings(prev => ({ 
                            ...prev, 
                            quietHours: { ...prev.quietHours, end: e.target.value }
                          }))}
                          className="input-field"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Email Integration</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        value={emailSettings.email}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, email: e.target.value }))}
                        className="input-field flex-1"
                        placeholder="your@email.com"
                      />
                      <button
                        onClick={sendTestEmail}
                        disabled={!emailSettings.email || emailSettings.testEmailSent}
                        className="btn-secondary"
                      >
                        {emailSettings.testEmailSent ? '✓ Sent' : 'Test'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={emailSettings.smtpConfigured}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpConfigured: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">SMTP configured</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Notification Templates</h3>
                <div className="space-y-2">
                  {notificationTemplates.map(template => (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.template}</p>
                      </div>
                      <button
                        onClick={() => applyTemplate(template)}
                        className="btn-secondary text-sm py-1 px-3"
                      >
                        Use Template
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Advance (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.reminderAdvance}
                    onChange={(e) => setSettings(prev => ({ ...prev, reminderAdvance: parseInt(e.target.value) }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Daily Notifications
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={settings.maxDailyNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxDailyNotifications: parseInt(e.target.value) }))}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={updateSettings}
                className="btn-primary"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

