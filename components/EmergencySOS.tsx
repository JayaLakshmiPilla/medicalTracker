'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ExclamationTriangleIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline'

export default function EmergencySOS() {
	const [countdown, setCountdown] = useState<number | null>(null)
	const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
	const [status, setStatus] = useState('')
	const timerRef = useRef<any>(null)

	useEffect(() => {
		if (!('geolocation' in navigator)) return
		navigator.geolocation.getCurrentPosition(
			(pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
			() => setCoords(null),
			{ enableHighAccuracy: true, timeout: 5000 }
		)
	}, [])

	useEffect(() => {
		if (countdown === null) return
		if (countdown <= 0) {
			triggerSOS()
			setCountdown(null)
			return
		}
		timerRef.current = setTimeout(() => setCountdown((c) => (c ?? 0) - 1), 1000)
		return () => clearTimeout(timerRef.current)
	}, [countdown])

	const startSOS = () => {
		setStatus('')
		setCountdown(5)
	}

	const cancelSOS = () => {
		setCountdown(null)
		setStatus('Cancelled')
	}

	const triggerSOS = async () => {
		try {
			setStatus('Sending alerts…')
			await fetch('/api/sos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coords, time: new Date().toISOString() }) })
			setStatus('Alerts sent to caregivers')
		} catch {
			setStatus('Failed to send alerts')
		}
	}

	return (
		<div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900">Emergency SOS</h1>
				<p className="text-gray-600">Quickly alert your caregivers in emergencies</p>
			</motion.div>

			<div className="card">
				<div className="mb-6">
					<div className={`sos-button inline-flex items-center ${countdown !== null ? 'sos-active' : ''}`}> 
						<ExclamationTriangleIcon className="w-6 h-6 mr-2" />
						<button onClick={startSOS} disabled={countdown !== null}>Start SOS</button>
					</div>
					{countdown !== null && (
						<div className="mt-4">
							<div className="text-4xl font-bold text-danger-600">{countdown}</div>
							<button onClick={cancelSOS} className="btn-secondary mt-3">Cancel</button>
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
					<div className="p-3 bg-gray-50 rounded">
						<div className="text-sm text-gray-500 mb-1">Location</div>
						<div className="flex items-center"> 
							<MapPinIcon className="w-4 h-4 mr-2" />
							<span>{coords ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}` : 'Unknown'}</span>
						</div>
					</div>
					<div className="p-3 bg-gray-50 rounded">
						<div className="text-sm text-gray-500 mb-1">Emergency Contact</div>
						<div className="flex items-center"><PhoneIcon className="w-4 h-4 mr-2" />Family & caregivers will be notified</div>
					</div>
				</div>

				{status && <div className="mt-6 text-sm text-gray-700">{status}</div>}
			</div>
		</div>
	)
}



