'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Title, ArcElement } from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { ArrowDownTrayIcon, FunnelIcon, CalendarIcon, ChartBarIcon, DocumentTextIcon, PrinterIcon, ShareIcon, TrendingUpIcon, TrendingDownIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Title, ArcElement)

interface AdherenceEvent {
	date: string // yyyy-mm-dd
	medication: string
	plannedDoses: number
	takenDoses: number
}

const generateSampleData = (): AdherenceEvent[] => {
	const meds = ['Metformin', 'Lisinopril', 'Atorvastatin']
	const days = 30
	const today = new Date()
	const data: AdherenceEvent[] = []
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(today)
		d.setDate(today.getDate() - i)
		const dateStr = d.toISOString().split('T')[0]
		meds.forEach(m => {
			const planned = Math.floor(Math.random() * 2) + 1 // 1-2
			const taken = Math.max(0, planned - Math.floor(Math.random() * 2))
			data.push({ date: dateStr, medication: m, plannedDoses: planned, takenDoses: taken })
		})
	}
	return data
}

export default function AdherenceTracking() {
	const [events] = useState<AdherenceEvent[]>(generateSampleData())
	const [startDate, setStartDate] = useState<string>(() => {
		const d = new Date()
		d.setDate(d.getDate() - 29)
		return d.toISOString().split('T')[0]
	})
	const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0])
	const [filterMedication, setFilterMedication] = useState<string>('all')
	const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false)
	const [reportFormat, setReportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv')

	const medications = useMemo(() => Array.from(new Set(events.map(e => e.medication))), [events])

	const filtered = useMemo(() => {
		return events.filter(e => {
			return e.date >= startDate && e.date <= endDate && (filterMedication === 'all' || e.medication === filterMedication)
		})
	}, [events, startDate, endDate, filterMedication])

	const dailySeries = useMemo(() => {
		const map = new Map<string, { planned: number; taken: number }>()
		filtered.forEach(e => {
			const cur = map.get(e.date) || { planned: 0, taken: 0 }
			cur.planned += e.plannedDoses
			cur.taken += e.takenDoses
			map.set(e.date, cur)
		})
		const labels = Array.from(map.keys()).sort()
		const planned = labels.map(d => map.get(d)!.planned)
		const taken = labels.map(d => map.get(d)!.taken)
		const rate = labels.map((_, i) => {
			const p = planned[i] || 0
			const t = taken[i] || 0
			return p === 0 ? 100 : Math.round((t / p) * 100)
		})
		return { labels, planned, taken, rate }
	}, [filtered])

	const overall = useMemo(() => {
		const p = filtered.reduce((acc, e) => acc + e.plannedDoses, 0)
		const t = filtered.reduce((acc, e) => acc + e.takenDoses, 0)
		const rate = p === 0 ? 100 : Math.round((t / p) * 100)
		return { planned: p, taken: t, rate }
	}, [filtered])

	const medicationAnalytics = useMemo(() => {
		const medStats = medications.map(med => {
			const medEvents = filtered.filter(e => e.medication === med)
			const planned = medEvents.reduce((acc, e) => acc + e.plannedDoses, 0)
			const taken = medEvents.reduce((acc, e) => acc + e.takenDoses, 0)
			const rate = planned === 0 ? 100 : Math.round((taken / planned) * 100)
			return { medication: med, planned, taken, rate }
		})
		return medStats.sort((a, b) => b.rate - a.rate)
	}, [filtered, medications])

	const weeklyTrends = useMemo(() => {
		const weeks: { [key: string]: { planned: number; taken: number } } = {}
		filtered.forEach(e => {
			const date = new Date(e.date)
			const weekStart = new Date(date)
			weekStart.setDate(date.getDate() - date.getDay())
			const weekKey = weekStart.toISOString().split('T')[0]
			
			if (!weeks[weekKey]) {
				weeks[weekKey] = { planned: 0, taken: 0 }
			}
			weeks[weekKey].planned += e.plannedDoses
			weeks[weekKey].taken += e.takenDoses
		})
		
		return Object.entries(weeks).map(([week, data]) => ({
			week,
			rate: data.planned === 0 ? 100 : Math.round((data.taken / data.planned) * 100),
			...data
		})).sort((a, b) => a.week.localeCompare(b.week))
	}, [filtered])

	const adherenceInsights = useMemo(() => {
		const insights = []
		const avgRate = overall.rate
		
		if (avgRate >= 90) {
			insights.push({ type: 'success', message: 'Excellent adherence! Keep up the great work.' })
		} else if (avgRate >= 80) {
			insights.push({ type: 'warning', message: 'Good adherence, but there\'s room for improvement.' })
		} else {
			insights.push({ type: 'error', message: 'Adherence needs improvement. Consider setting reminders.' })
		}

		const worstMed = medicationAnalytics[medicationAnalytics.length - 1]
		if (worstMed && worstMed.rate < 70) {
			insights.push({ type: 'error', message: `${worstMed.medication} has the lowest adherence at ${worstMed.rate}%` })
		}

		return insights
	}, [overall.rate, medicationAnalytics])

	const exportCsv = () => {
		const header = ['date', 'medication', 'plannedDoses', 'takenDoses', 'adherenceRate']
		const rows = filtered.map(e => {
			const rate = e.plannedDoses === 0 ? 100 : Math.round((e.takenDoses / e.plannedDoses) * 100)
			return [e.date, e.medication, e.plannedDoses, e.takenDoses, rate]
		})
		const csv = [header, ...rows].map(r => r.join(',')).join('\n')
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `adherence_report_${startDate}_to_${endDate}.csv`
		a.click()
		URL.revokeObjectURL(url)
		toast.success('CSV report exported successfully!')
	}

	const exportPdf = () => {
		// Simulate PDF export
		toast.info('PDF export feature coming soon!')
	}

	const exportExcel = () => {
		// Simulate Excel export
		toast.info('Excel export feature coming soon!')
	}

	const printReport = () => {
		window.print()
		toast.success('Report sent to printer!')
	}

	const shareReport = () => {
		if (navigator.share) {
			navigator.share({
				title: 'Medication Adherence Report',
				text: `Overall adherence: ${overall.rate}%`,
				url: window.location.href
			})
		} else {
			toast.info('Share feature not available on this device')
		}
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Adherence Tracking & Reports</h1>
						<p className="text-gray-600">Monitor medication adherence and export detailed reports</p>
					</div>
					<div className="flex items-center space-x-3">
						<button 
							onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
							className="btn-secondary flex items-center"
						>
							<ChartBarIcon className="w-4 h-4 mr-2" />
							{showAdvancedAnalytics ? 'Hide' : 'Show'} Analytics
						</button>
						<div className="flex items-center space-x-2">
							<select 
								value={reportFormat} 
								onChange={(e) => setReportFormat(e.target.value as any)}
								className="input-field w-auto"
							>
								<option value="csv">CSV</option>
								<option value="pdf">PDF</option>
								<option value="excel">Excel</option>
							</select>
							<button 
								onClick={reportFormat === 'csv' ? exportCsv : reportFormat === 'pdf' ? exportPdf : exportExcel}
								className="btn-primary flex items-center"
							>
								<ArrowDownTrayIcon className="w-4 h-4 mr-2" />
								Export {reportFormat.toUpperCase()}
							</button>
						</div>
						<button onClick={printReport} className="btn-secondary flex items-center">
							<PrinterIcon className="w-4 h-4 mr-2" />
							Print
						</button>
						<button onClick={shareReport} className="btn-secondary flex items-center">
							<ShareIcon className="w-4 h-4 mr-2" />
							Share
						</button>
					</div>
				</div>
			</motion.div>

			{/* Filters */}
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card mb-8">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
						<select value={filterMedication} onChange={(e) => setFilterMedication(e.target.value)} className="input-field">
							<option value="all">All</option>
							{medications.map(m => (
								<option key={m} value={m}>{m}</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
						<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
						<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
					</div>
				</div>
			</motion.div>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="card">
					<div className="flex items-center">
						<div className="p-2 bg-primary-100 rounded-lg">
							<ChartBarIcon className="w-6 h-6 text-primary-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Overall Adherence</p>
							<p className="text-2xl font-bold text-gray-900">{overall.rate}%</p>
						</div>
					</div>
				</motion.div>
				<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="card">
					<div className="flex items-center">
						<div className="p-2 bg-secondary-100 rounded-lg">
							<CalendarIcon className="w-6 h-6 text-secondary-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Doses Taken</p>
							<p className="text-2xl font-bold text-gray-900">{overall.taken}</p>
						</div>
					</div>
				</motion.div>
				<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="card">
					<div className="flex items-center">
						<div className="p-2 bg-warning-100 rounded-lg">
							<DocumentTextIcon className="w-6 h-6 text-warning-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Doses Planned</p>
							<p className="text-2xl font-bold text-gray-900">{overall.planned}</p>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Insights */}
			{adherenceInsights.length > 0 && (
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card mb-8">
					<h2 className="text-lg font-semibold mb-4">Adherence Insights</h2>
					<div className="space-y-3">
						{adherenceInsights.map((insight, index) => (
							<div key={index} className={`p-3 rounded-lg border-l-4 ${
								insight.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
								insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
								'bg-red-50 border-red-500 text-red-800'
							}`}>
								<p className="font-medium">{insight.message}</p>
							</div>
						))}
					</div>
				</motion.div>
			)}

			{/* Advanced Analytics */}
			{showAdvancedAnalytics && (
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card mb-8">
					<h2 className="text-lg font-semibold mb-4">Advanced Analytics</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Medication Performance */}
						<div>
							<h3 className="font-medium text-gray-900 mb-3">Medication Performance</h3>
							<div className="space-y-2">
								{medicationAnalytics.map((med, index) => (
									<div key={med.medication} className="flex items-center justify-between p-2 bg-gray-50 rounded">
										<span className="font-medium">{med.medication}</span>
										<div className="flex items-center space-x-2">
											<span className="text-sm text-gray-600">{med.rate}%</span>
											<div className="w-20 bg-gray-200 rounded-full h-2">
												<div 
													className={`h-2 rounded-full ${
														med.rate >= 90 ? 'bg-green-500' :
														med.rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
													}`}
													style={{ width: `${med.rate}%` }}
												></div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Weekly Trends */}
						<div>
							<h3 className="font-medium text-gray-900 mb-3">Weekly Trends</h3>
							<Line
								data={{
									labels: weeklyTrends.map(w => new Date(w.week).toLocaleDateString()),
									datasets: [{
										label: 'Weekly Adherence %',
										data: weeklyTrends.map(w => w.rate),
										borderColor: 'rgba(59,130,246,1)',
										backgroundColor: 'rgba(59,130,246,0.1)',
										tension: 0.4
									}]
								}}
								options={{ responsive: true, maintainAspectRatio: false }}
								height={200}
							/>
						</div>
					</div>
				</motion.div>
			)}

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
					<h2 className="text-lg font-semibold mb-4">Daily Planned vs Taken</h2>
					<Bar
						data={{
							labels: dailySeries.labels,
							datasets: [
								{ label: 'Planned', data: dailySeries.planned, backgroundColor: 'rgba(59,130,246,0.6)' },
								{ label: 'Taken', data: dailySeries.taken, backgroundColor: 'rgba(34,197,94,0.6)' }
							]
						}}
						options={{ responsive: true, maintainAspectRatio: false }}
						height={280}
					/>
				</motion.div>
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
					<h2 className="text-lg font-semibold mb-4">Daily Adherence Rate</h2>
					<Line
						data={{
							labels: dailySeries.labels,
							datasets: [
								{ label: 'Adherence %', data: dailySeries.rate, borderColor: 'rgba(234,88,12,1)', backgroundColor: 'rgba(234,88,12,0.2)' }
							]
						}}
						options={{ responsive: true, maintainAspectRatio: false }}
						height={280}
					/>
				</motion.div>
			</div>

			{/* Table */}
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card mt-8">
				<h2 className="text-lg font-semibold mb-4">Detailed Log</h2>
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="text-left text-gray-600">
								<th className="py-2 pr-4">Date</th>
								<th className="py-2 pr-4">Medication</th>
								<th className="py-2 pr-4">Planned</th>
								<th className="py-2 pr-4">Taken</th>
								<th className="py-2 pr-4">Adherence</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((e, idx) => {
								const adherence = e.plannedDoses === 0 ? 100 : Math.round((e.takenDoses / e.plannedDoses) * 100)
								return (
									<tr key={`${e.date}-${e.medication}-${idx}`} className="border-t border-gray-100">
										<td className="py-2 pr-4">{e.date}</td>
										<td className="py-2 pr-4">{e.medication}</td>
										<td className="py-2 pr-4">{e.plannedDoses}</td>
										<td className="py-2 pr-4">{e.takenDoses}</td>
										<td className="py-2 pr-4">{adherence}%</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			</motion.div>
		</div>
	)
}



