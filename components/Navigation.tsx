'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HomeIcon, 
  ClockIcon, 
  BellIcon, 
  CameraIcon, 
  ChartBarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline'

interface Module {
  id: string
  name: string
  icon: string
}

interface NavigationProps {
  modules: Module[]
  activeModule: string
  onModuleChange: (moduleId: string) => void
}

const iconMap = {
  'dashboard': HomeIcon,
  'scheduler': ClockIcon,
  'notifications': BellIcon,
  'camera': CameraIcon,
  'adherence': ChartBarIcon,
  'family': UserGroupIcon,
  'chatbot': ChatBubbleLeftRightIcon,
  'voice': MicrophoneIcon,
  'eprescription': DocumentTextIcon,
  'sos': ShieldExclamationIcon,
  'interactions': ExclamationTriangleIcon,
}

export default function Navigation({ modules, activeModule, onModuleChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MA</span>
              </div>
              <span className="text-xl font-bold text-gradient">MediCare AI</span>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {modules.map((module) => {
              const IconComponent = iconMap[module.id as keyof typeof iconMap]
              const isActive = activeModule === module.id
              
              return (
                <motion.button
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  <span className="hidden lg:inline">{module.name}</span>
                </motion.button>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            <div className="grid grid-cols-2 gap-2">
              {modules.map((module) => {
                const IconComponent = iconMap[module.id as keyof typeof iconMap]
                const isActive = activeModule === module.id
                
                return (
                  <button
                    key={module.id}
                    onClick={() => {
                      onModuleChange(module.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    <span>{module.name}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

