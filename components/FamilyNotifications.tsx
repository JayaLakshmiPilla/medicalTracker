'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, PencilIcon, TrashIcon, BellIcon, EnvelopeIcon, DevicePhoneMobileIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon, ChatBubbleLeftRightIcon, PhoneIcon, VideoCameraIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'

type Channel = 'push' | 'email' | 'sms'

interface Caregiver {
	id: string
	name: string
	relationship: string
	email?: string
	phone?: string
	channels: Channel[]
	quietHours?: { start: string; end: string }
}

interface EscalationRule {
	id: string
	condition: 'missed' | 'urgent' | 'warning'
	thresholdMinutes?: number
	caregiverId: string
}

interface NotificationHistory {
	id: string
	caregiverId: string
	caregiverName: string
	message: string
	timestamp: string
	status: 'sent' | 'delivered' | 'failed'
	channel: Channel
	type: 'medication' | 'emergency' | 'reminder' | 'test'
}

interface EmergencyContact {
	id: string
	name: string
	phone: string
	relationship: string
	priority: number
	isActive: boolean
}

export default function FamilyNotifications() {
	const [caregivers, setCaregivers] = useState<Caregiver[]>([
		{ id: '1', name: 'Alice Kumar', relationship: 'Daughter', email: 'alice@example.com', phone: '+1 555-1000', channels: ['email', 'push'], quietHours: { start: '22:00', end: '07:00' } },
		{ id: '2', name: 'Ravi Kumar', relationship: 'Son', email: 'ravi@example.com', phone: '+1 555-2000', channels: ['sms'] }
	])

	const [rules, setRules] = useState<EscalationRule[]>([
		{ id: 'r1', condition: 'missed', thresholdMinutes: 30, caregiverId: '1' },
		{ id: 'r2', condition: 'urgent', caregiverId: '2' }
	])

	const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | null>(null)
	const [showForm, setShowForm] = useState(false)
	const [newCaregiver, setNewCaregiver] = useState<Partial<Caregiver>>({ name: '', relationship: '', email: '', phone: '', channels: ['email'] })
	
	const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([
		{ id: '1', caregiverId: '1', caregiverName: 'Alice Kumar', message: 'Medication reminder: Metformin due at 8:00 AM', timestamp: '2024-01-15T08:00:00Z', status: 'delivered', channel: 'email', type: 'medication' },
		{ id: '2', caregiverId: '2', caregiverName: 'Ravi Kumar', message: 'Emergency: Missed medication for 2 hours', timestamp: '2024-01-15T10:30:00Z', status: 'sent', channel: 'sms', type: 'emergency' },
		{ id: '3', caregiverId: '1', caregiverName: 'Alice Kumar', message: 'Test notification from MediCare AI', timestamp: '2024-01-15T14:00:00Z', status: 'delivered', channel: 'push', type: 'test' }
	])
	
	const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
		{ id: '1', name: 'Dr. Sarah Johnson', phone: '+1 555-0100', relationship: 'Primary Care Doctor', priority: 1, isActive: true },
		{ id: '2', name: 'Emergency Services', phone: '911', relationship: 'Emergency', priority: 0, isActive: true },
		{ id: '3', name: 'Local Pharmacy', phone: '+1 555-0200', relationship: 'Pharmacy', priority: 3, isActive: true }
	])
	
	const [showHistory, setShowHistory] = useState(false)
	const [showEmergencyContacts, setShowEmergencyContacts] = useState(false)
	const [isEmergencyMode, setIsEmergencyMode] = useState(false)

	const channelBadges: Record<Channel, JSX.Element> = {
		push: <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center"><BellIcon className="w-3 h-3 mr-1" />Push</span>,
		email: <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center"><EnvelopeIcon className="w-3 h-3 mr-1" />Email</span>,
		sms: <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center"><DevicePhoneMobileIcon className="w-3 h-3 mr-1" />SMS</span>
	}

	const addCaregiver = () => {
		if (!newCaregiver.name || !newCaregiver.relationship) {
			toast.error('Name and relationship are required')
			return
		}
		const cg: Caregiver = {
			id: Date.now().toString(),
			name: newCaregiver.name!,
			relationship: newCaregiver.relationship!,
			email: newCaregiver.email,
			phone: newCaregiver.phone,
			channels: (newCaregiver.channels as Channel[]) || ['email'],
			quietHours: newCaregiver.quietHours
		}
		setCaregivers(prev => [...prev, cg])
		setShowForm(false)
		setNewCaregiver({ name: '', relationship: '', email: '', phone: '', channels: ['email'] })
		toast.success('Caregiver added')
	}

	const updateCaregiver = () => {
		if (!editingCaregiver) return
		setCaregivers(prev => prev.map(c => c.id === editingCaregiver.id ? editingCaregiver : c))
		setEditingCaregiver(null)
		toast.success('Caregiver updated')
	}

	const deleteCaregiver = (id: string) => {
		setCaregivers(prev => prev.filter(c => c.id !== id))
		toast.success('Caregiver deleted')
	}

	const sendTest = async (caregiver: Caregiver) => {
		try {
			const res = await fetch('/api/caregiver/notify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ caregiver, message: 'Test notification from MediCare AI' })
			})
			if (!res.ok) throw new Error(await res.text())
			toast.success('Test notification sent')
		} catch (e) {
			toast.error('Failed to send')
		}
	}

	const addRule = () => {
		const caregiverId = caregivers[0]?.id
		if (!caregiverId) return
		const rule: EscalationRule = { id: Date.now().toString(), condition: 'missed', thresholdMinutes: 30, caregiverId }
		setRules(prev => [...prev, rule])
	}

	const updateRule = (id: string, patch: Partial<EscalationRule>) => {
		setRules(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
	}

	const deleteRule = (id: string) => setRules(prev => prev.filter(r => r.id !== id))

	const sendEmergencyAlert = async () => {
		setIsEmergencyMode(true)
		const emergencyMessage = 'EMERGENCY: Immediate medical attention needed!'
		
		// Send to all caregivers
		for (const caregiver of caregivers) {
			try {
				await fetch('/api/caregiver/notify', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ 
						caregiver, 
						message: emergencyMessage,
						priority: 'emergency'
					})
				})
				
				// Add to history
				setNotificationHistory(prev => [...prev, {
					id: Date.now().toString(),
					caregiverId: caregiver.id,
					caregiverName: caregiver.name,
					message: emergencyMessage,
					timestamp: new Date().toISOString(),
					status: 'sent',
					channel: caregiver.channels[0] || 'email',
					type: 'emergency'
				}])
			} catch (error) {
				console.error('Failed to send emergency alert:', error)
			}
		}
		
		toast.error('EMERGENCY ALERT SENT TO ALL CAREGIVERS!')
		setTimeout(() => setIsEmergencyMode(false), 5000)
	}

	const callEmergencyContact = (contact: EmergencyContact) => {
		if (contact.phone === '911') {
			toast.error('Calling 911 - Emergency Services')
		} else {
			toast.info(`Calling ${contact.name} at ${contact.phone}`)
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'delivered': return 'text-green-600 bg-green-100'
			case 'sent': return 'text-blue-600 bg-blue-100'
			case 'failed': return 'text-red-600 bg-red-100'
			default: return 'text-gray-600 bg-gray-100'
		}
	}

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'emergency': return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
			case 'medication': return <BellIcon className="w-4 h-4 text-blue-500" />
			case 'test': return <CheckCircleIcon className="w-4 h-4 text-green-500" />
			default: return <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-500" />
		}
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">Family & Caregiver Notifications</h1>
							<p className="text-gray-600">Manage caregivers, channels, and escalation rules</p>
						</div>
						<div className="flex items-center space-x-3">
							<button 
								onClick={sendEmergencyAlert}
								disabled={isEmergencyMode}
								className={`btn-danger flex items-center ${isEmergencyMode ? 'animate-pulse' : ''}`}
							>
								<ExclamationTriangleIcon className="w-4 h-4 mr-2" />
								{isEmergencyMode ? 'EMERGENCY SENT!' : 'Emergency Alert'}
							</button>
							<button onClick={() => setShowHistory(true)} className="btn-secondary flex items-center">
								<ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
								History
							</button>
							<button onClick={() => setShowEmergencyContacts(true)} className="btn-secondary flex items-center">
								<ShieldCheckIcon className="w-4 h-4 mr-2" />
								Emergency Contacts
							</button>
							<button onClick={() => setShowForm(true)} className="btn-primary flex items-center">
								<PlusIcon className="w-4 h-4 mr-2" />
								Add Caregiver
							</button>
						</div>
					</div>
			</motion.div>

			{/* Caregivers */}
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card mb-8">
				<h2 className="text-lg font-semibold mb-4">Caregivers</h2>
				<div className="space-y-3">
					{caregivers.map(c => (
						<div key={c.id} className="p-4 border border-gray-200 rounded-lg">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="font-medium text-gray-900">{c.name} <span className="text-gray-500 font-normal">· {c.relationship}</span></h3>
									<div className="text-sm text-gray-600">{c.email || '—'} · {c.phone || '—'}</div>
									<div className="mt-2 flex gap-2 flex-wrap">
										{c.channels.map(ch => (
											<span key={ch}>{channelBadges[ch]}</span>
										))}
										{c.quietHours && (
											<span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs flex items-center"><ClockIcon className="w-3 h-3 mr-1" />Quiet {c.quietHours.start}-{c.quietHours.end}</span>
										)}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<button onClick={() => sendTest(c)} className="btn-secondary text-xs">Send Test</button>
									<button onClick={() => setEditingCaregiver(c)} className="p-2 text-gray-400 hover:text-gray-600"><PencilIcon className="w-4 h-4" /></button>
									<button onClick={() => deleteCaregiver(c.id)} className="p-2 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
								</div>
							</div>
						</div>
					))}
				</div>
			</motion.div>

			{/* Escalation Rules */}
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold">Escalation Rules</h2>
					<button onClick={addRule} className="btn-secondary text-sm">Add Rule</button>
				</div>
				<div className="space-y-3">
					{rules.map(r => (
						<div key={r.id} className="p-4 border border-gray-200 rounded-lg">
							<div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
									<select value={r.condition} onChange={(e) => updateRule(r.id, { condition: e.target.value as any })} className="input-field">
										<option value="missed">Missed dose</option>
										<option value="urgent">Urgent alert</option>
										<option value="warning">Warning</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">After (minutes)</label>
									<input type="number" min="0" value={r.thresholdMinutes ?? 0} onChange={(e) => updateRule(r.id, { thresholdMinutes: parseInt(e.target.value) })} className="input-field" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Notify</label>
									<select value={r.caregiverId} onChange={(e) => updateRule(r.id, { caregiverId: e.target.value })} className="input-field">
										{caregivers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
									</select>
								</div>
								<div className="flex items-center justify-end">
									<button onClick={() => deleteRule(r.id)} className="btn-danger text-sm">Delete</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</motion.div>

			{/* Notification History Modal */}
			{showHistory && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">Notification History</h3>
							<button onClick={() => setShowHistory(false)} className="p-2 text-gray-400 hover:text-gray-600">
								<TrashIcon className="w-5 h-5" />
							</button>
						</div>
						<div className="space-y-3">
							{notificationHistory.map(notification => (
								<div key={notification.id} className="p-4 border border-gray-200 rounded-lg">
									<div className="flex items-start justify-between">
										<div className="flex items-start space-x-3">
											{getTypeIcon(notification.type)}
											<div>
												<div className="flex items-center space-x-2 mb-1">
													<h4 className="font-medium text-gray-900">{notification.caregiverName}</h4>
													<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
														{notification.status}
													</span>
												</div>
												<p className="text-sm text-gray-600 mb-1">{notification.message}</p>
												<div className="flex items-center space-x-4 text-xs text-gray-500">
													<span>{new Date(notification.timestamp).toLocaleString()}</span>
													<span className="capitalize">{notification.channel}</span>
													<span className="capitalize">{notification.type}</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Emergency Contacts Modal */}
			{showEmergencyContacts && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">Emergency Contacts</h3>
							<button onClick={() => setShowEmergencyContacts(false)} className="p-2 text-gray-400 hover:text-gray-600">
								<TrashIcon className="w-5 h-5" />
							</button>
						</div>
						<div className="space-y-3">
							{emergencyContacts.sort((a, b) => a.priority - b.priority).map(contact => (
								<div key={contact.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
									<div>
										<h4 className="font-medium text-gray-900">{contact.name}</h4>
										<p className="text-sm text-gray-600">{contact.relationship}</p>
										<p className="text-sm text-gray-500">{contact.phone}</p>
									</div>
									<div className="flex items-center space-x-2">
										<button 
											onClick={() => callEmergencyContact(contact)}
											className="btn-primary flex items-center"
										>
											<PhoneIcon className="w-4 h-4 mr-1" />
											Call
										</button>
										{contact.phone !== '911' && (
											<button className="btn-secondary flex items-center">
												<VideoCameraIcon className="w-4 h-4 mr-1" />
												Video
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Caregiver Modal */}
			{(showForm || editingCaregiver) && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-xl mx-4">
						<h3 className="text-lg font-semibold mb-4">{editingCaregiver ? 'Edit Caregiver' : 'Add Caregiver'}</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
								<input type="text" className="input-field" value={editingCaregiver?.name || newCaregiver.name || ''} onChange={(e) => editingCaregiver ? setEditingCaregiver({ ...editingCaregiver, name: e.target.value }) : setNewCaregiver({ ...newCaregiver, name: e.target.value })} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
								<input type="text" className="input-field" value={editingCaregiver?.relationship || newCaregiver.relationship || ''} onChange={(e) => editingCaregiver ? setEditingCaregiver({ ...editingCaregiver, relationship: e.target.value }) : setNewCaregiver({ ...newCaregiver, relationship: e.target.value })} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
								<input type="email" className="input-field" value={editingCaregiver?.email || newCaregiver.email || ''} onChange={(e) => editingCaregiver ? setEditingCaregiver({ ...editingCaregiver, email: e.target.value }) : setNewCaregiver({ ...newCaregiver, email: e.target.value })} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
								<input type="tel" className="input-field" value={editingCaregiver?.phone || newCaregiver.phone || ''} onChange={(e) => editingCaregiver ? setEditingCaregiver({ ...editingCaregiver, phone: e.target.value }) : setNewCaregiver({ ...newCaregiver, phone: e.target.value })} />
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-1">Channels</label>
								<div className="flex gap-3">
									{(['push','email','sms'] as Channel[]).map(ch => (
										<label key={ch} className="flex items-center gap-2">
											<input type="checkbox" checked={(editingCaregiver?.channels || (newCaregiver.channels as Channel[]) || []).includes(ch)} onChange={(e) => {
												const prev = editingCaregiver ? editingCaregiver.channels : (newCaregiver.channels as Channel[]) || []
												const next = e.target.checked ? Array.from(new Set([...prev, ch])) : prev.filter(c => c !== ch)
												editingCaregiver ? setEditingCaregiver({ ...editingCaregiver, channels: next }) : setNewCaregiver({ ...newCaregiver, channels: next })
											}} />
											<span className="capitalize">{ch}</span>
										</label>
									))}
								</div>
							</div>
							<div className="md:col-span-2 grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Quiet Start</label>
									<input type="time" className="input-field" value={editingCaregiver?.quietHours?.start || (newCaregiver.quietHours?.start || '')} onChange={(e) => editingCaregiver ? setEditingCaregiver({ ...editingCaregiver, quietHours: { ...(editingCaregiver.quietHours || { start: '', end: '' }), start: e.target.value } }) : setNewCaregiver({ ...newCaregiver, quietHours: { ...(newCaregiver.quietHours || { start: '', end: '' }), start: e.target.value } })} />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Quiet End</label>
									<input type="time" className="input-field" value={editingCaregiver?.quietHours?.end || (newCaregiver.quietHours?.end || '')} onChange={(e) => editingCaregiver ? setEditingCaregiver({ ...editingCaregiver, quietHours: { ...(editingCaregiver.quietHours || { start: '', end: '' }), end: e.target.value } }) : setNewCaregiver({ ...newCaregiver, quietHours: { ...(newCaregiver.quietHours || { start: '', end: '' }), end: e.target.value } })} />
								</div>
							</div>
						</div>
						<div className="flex justify-end gap-3 mt-6">
							<button onClick={() => { setShowForm(false); setEditingCaregiver(null) }} className="btn-secondary">Cancel</button>
							<button onClick={editingCaregiver ? updateCaregiver : addCaregiver} className="btn-primary">{editingCaregiver ? 'Update' : 'Add'} Caregiver</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}



