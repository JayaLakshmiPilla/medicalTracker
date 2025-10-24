'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface ChatMessage {
	role: 'user' | 'assistant'
	content: string
}

export default function MedicationChatbot() {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{ role: 'assistant', content: 'Hi! I’m your medication assistant. How can I help today?' }
	])
	const [input, setInput] = useState('')
	const [loading, setLoading] = useState(false)
	const listRef = useRef<HTMLDivElement>(null)

	const send = async () => {
		if (!input.trim()) return
		const userMsg: ChatMessage = { role: 'user', content: input.trim() }
		setMessages(prev => [...prev, userMsg])
		setInput('')
		setLoading(true)
		try {
			const resp = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: userMsg.content })
			})
			const data = await resp.json()
			const reply: ChatMessage = { role: 'assistant', content: data.reply || 'Sorry, I could not respond.' }
			setMessages(prev => [...prev, reply])
		} catch (e) {
			setMessages(prev => [...prev, { role: 'assistant', content: 'There was an error. Please try again.' }])
		} finally {
			setLoading(false)
			setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50)
		}
	}

	return (
		<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900">Medication Chatbot</h1>
				<p className="text-gray-600">Ask about schedules, side effects, or interactions</p>
			</motion.div>

			<div className="card">
				<div ref={listRef} className="h-96 overflow-y-auto space-y-3 pr-2">
					{messages.map((m, i) => (
						<div key={i} className={`chatbot-message ${m.role === 'user' ? 'chatbot-user' : 'chatbot-bot'}`}>{m.content}</div>
					))}
					{loading && (
						<div className="chatbot-message chatbot-bot">Typing…</div>
					)}
				</div>
				<div className="mt-4 flex items-center gap-2">
					<input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' ? send() : undefined} className="input-field flex-1" placeholder="Type your question…" />
					<button onClick={send} className="btn-primary flex items-center">
						<PaperAirplaneIcon className="w-4 h-4 mr-2" />Send
					</button>
				</div>
				<div className="mt-3 text-xs text-gray-500 flex items-center"><SparklesIcon className="w-3 h-3 mr-1" />This assistant provides general guidance only. For urgent concerns, contact a professional.</div>
			</div>
		</div>
	)
}



