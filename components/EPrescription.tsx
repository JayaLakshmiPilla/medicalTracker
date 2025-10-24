'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { DocumentPlusIcon, UserCircleIcon, BuildingOfficeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

interface Doctor { id: string; name: string; specialization: string; clinic: string }
interface RxItem { name: string; dosage: string; frequency: string; duration: string; notes?: string }

export default function EPrescription() {
	const [doctors, setDoctors] = useState<Doctor[]>([])
	const [selectedDoctor, setSelectedDoctor] = useState<string>('')
	const [patientName, setPatientName] = useState('')
	const [patientAge, setPatientAge] = useState('')
	const [items, setItems] = useState<RxItem[]>([{ name: '', dosage: '', frequency: '', duration: '' }])
	const [notes, setNotes] = useState('')
	const [rxId, setRxId] = useState<string>('')

	useEffect(() => {
		fetch('/api/doctors').then(r => r.json()).then(d => setDoctors(d.doctors || [])).catch(() => setDoctors([]))
	}, [])

	const addItem = () => setItems(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '' }])
	const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))

	const submit = async () => {
		if (!selectedDoctor || !patientName || !items[0].name) return
		const payload = { doctorId: selectedDoctor, patient: { name: patientName, age: patientAge }, items, notes, date: new Date().toISOString() }
		const res = await fetch('/api/prescriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
		if (!res.ok) return
		const data = await res.json()
		setRxId(data.id)
	}

	const downloadPdf = () => {
		const lines = [
			`Prescription ID: ${rxId}`,
			`Doctor: ${doctors.find(d => d.id === selectedDoctor)?.name || ''}`,
			`Patient: ${patientName} (${patientAge})`,
			'',
			'Items:'
		]
		items.forEach((it, i) => lines.push(`${i + 1}. ${it.name} ${it.dosage} - ${it.frequency} for ${it.duration}${it.notes ? ' - ' + it.notes : ''}`))
		if (notes) lines.push('', 'Notes: ' + notes)
		const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `prescription_${rxId || 'draft'}.txt`
		a.click()
		URL.revokeObjectURL(url)
	}

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900">E-Prescription & Doctor Connectivity</h1>
				<p className="text-gray-600">Create and share digital prescriptions</p>
			</motion.div>

			<div className="card space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
						<select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} className="input-field">
							<option value="">Select doctor…</option>
							{doctors.map(d => (
								<option key={d.id} value={d.id}>{d.name} · {d.specialization}</option>
							))}
						</select>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
							<input className="input-field" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g., Ramesh" />
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
							<input className="input-field" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} placeholder="e.g., 45" />
						</div>
					</div>
				</div>

				<div>
					<h2 className="text-lg font-semibold mb-2 flex items-center"><DocumentPlusIcon className="w-5 h-5 mr-2 text-primary-600" />Prescription Items</h2>
					<div className="space-y-3">
						{items.map((it, idx) => (
							<div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3">
								<input className="input-field" placeholder="Medicine" value={it.name} onChange={(e) => setItems(prev => prev.map((p, i) => i === idx ? { ...p, name: e.target.value } : p))} />
								<input className="input-field" placeholder="Dosage" value={it.dosage} onChange={(e) => setItems(prev => prev.map((p, i) => i === idx ? { ...p, dosage: e.target.value } : p))} />
								<input className="input-field" placeholder="Frequency" value={it.frequency} onChange={(e) => setItems(prev => prev.map((p, i) => i === idx ? { ...p, frequency: e.target.value } : p))} />
								<input className="input-field" placeholder="Duration" value={it.duration} onChange={(e) => setItems(prev => prev.map((p, i) => i === idx ? { ...p, duration: e.target.value } : p))} />
								<input className="input-field" placeholder="Notes (optional)" value={it.notes || ''} onChange={(e) => setItems(prev => prev.map((p, i) => i === idx ? { ...p, notes: e.target.value } : p))} />
								<div className="md:col-span-5 flex justify-end">
									<button onClick={() => removeItem(idx)} className="btn-secondary text-xs">Remove</button>
								</div>
							</div>
						))}
						<button onClick={addItem} className="btn-secondary text-sm">Add Item</button>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
					<textarea className="input-field" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="General instructions" />
				</div>

				<div className="flex justify-end gap-3">
					<button onClick={submit} className="btn-primary">Send to Doctor</button>
					<button onClick={downloadPdf} disabled={!rxId} className="btn-secondary flex items-center"><ArrowDownTrayIcon className="w-4 h-4 mr-2" />Download</button>
				</div>
				{rxId && <div className="text-sm text-gray-600 mt-2">Created prescription ID: {rxId}</div>}
			</div>
		</div>
	)
}



