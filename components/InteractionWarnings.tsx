'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ExclamationTriangleIcon, ShieldExclamationIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface Medication { name: string; class: string }

const KNOWN_INTERACTIONS: Array<{ a: string; b: string; severity: 'minor' | 'moderate' | 'major'; note: string }> = [
	{ a: 'Metformin', b: 'Contrast dyes', severity: 'major', note: 'Risk of lactic acidosis; pause metformin before imaging.' },
	{ a: 'Lisinopril', b: 'Potassium supplements', severity: 'moderate', note: 'Hyperkalemia risk; monitor potassium closely.' },
	{ a: 'Atorvastatin', b: 'Grapefruit juice', severity: 'moderate', note: 'Increases statin levels; limit grapefruit intake.' },
	{ a: 'Atorvastatin', b: 'Warfarin', severity: 'moderate', note: 'Monitor INR; interaction may increase bleeding risk.' }
]

export default function InteractionWarnings() {
	const [list, setList] = useState<Medication[]>([
		{ name: 'Metformin', class: 'Biguanide' },
		{ name: 'Lisinopril', class: 'ACE inhibitor' }
	])
	const [query, setQuery] = useState('')

	const addFromQuery = () => {
		const name = query.trim()
		if (!name) return
		setList(prev => [...prev, { name, class: '' }])
		setQuery('')
	}

	const remove = (name: string) => setList(prev => prev.filter(m => m.name !== name))

	const interactions = useMemo(() => {
		const pairs: Array<{ a: string; b: string; severity: 'minor' | 'moderate' | 'major'; note: string }> = []
		for (let i = 0; i < list.length; i++) {
			for (let j = i + 1; j < list.length; j++) {
				const a = list[i].name
				const b = list[j].name
				const found = KNOWN_INTERACTIONS.find(k => (k.a === a && k.b === b) || (k.a === b && k.b === a))
				if (found) pairs.push(found)
			}
		}
		return pairs
	}, [list])

	const severityClass = (s: 'minor' | 'moderate' | 'major') => (
		s === 'major' ? 'interaction-danger' : s === 'moderate' ? 'interaction-warning' : 'border-l-4 border-gray-300 bg-gray-50 p-4'
	)

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900">Medication Interaction Warnings</h1>
				<p className="text-gray-600">Check for known interactions between your medications</p>
			</motion.div>

			<div className="card mb-6">
				<div className="flex gap-2 items-end">
					<div className="flex-1">
						<label className="block text-sm font-medium text-gray-700 mb-1">Add medication</label>
						<div className="flex items-center gap-2">
							<input value={query} onChange={(e) => setQuery(e.target.value)} className="input-field flex-1" placeholder="e.g., Atorvastatin or Grapefruit juice" />
							<button onClick={addFromQuery} className="btn-primary flex items-center"><MagnifyingGlassIcon className="w-4 h-4 mr-2" />Add</button>
						</div>
					</div>
				</div>
				<div className="mt-4 flex gap-2 flex-wrap">
					{list.map(m => (
						<span key={m.name} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{m.name} <button className="ml-2 text-gray-500" onClick={() => remove(m.name)}>×</button></span>
					))}
				</div>
			</div>

			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
				{interactions.length === 0 ? (
					<div className="p-4 bg-green-50 border border-green-200 rounded flex items-center"><ShieldExclamationIcon className="w-5 h-5 text-green-600 mr-2" />No known interactions found in your list.</div>
				) : (
					interactions.map((ix, i) => (
						<div key={i} className={severityClass(ix.severity)}>
							<div className="flex items-center">
								<ExclamationTriangleIcon className="w-5 h-5 mr-2" />
								<span className="font-medium capitalize">{ix.severity}</span>
							</div>
							<div className="mt-1 text-sm text-gray-700">{ix.a} × {ix.b}: {ix.note}</div>
						</div>
					))
				)}
			</motion.div>
		</div>
	)
}



