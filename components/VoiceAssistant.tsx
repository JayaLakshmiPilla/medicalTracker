'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MicrophoneIcon, StopIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline'

declare global { interface Window { webkitSpeechRecognition: any } }

export default function VoiceAssistant() {
	const [listening, setListening] = useState(false)
	const [transcript, setTranscript] = useState('')
	const [response, setResponse] = useState('')
	const recognitionRef = useRef<any>(null)

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const Rec = window.SpeechRecognition || window.webkitSpeechRecognition
			if (Rec) {
				const rec = new Rec()
				rec.lang = 'en-US'
				rec.interimResults = false
				rec.maxAlternatives = 1
				rec.onresult = (e: any) => {
					const text = e.results?.[0]?.[0]?.transcript || ''
					setTranscript(text)
					handleIntent(text)
				}
				rec.onend = () => setListening(false)
				rec.onerror = () => setListening(false)
				rec.continuous = false
				recognitionRef.current = rec
			}
		}
	}, [])

	const speak = (text: string) => {
		try {
			const utter = new SpeechSynthesisUtterance(text)
			utter.rate = 1
			speechSynthesis.cancel()
			speechSynthesis.speak(utter)
		} catch {}
	}

	const start = () => {
		if (!recognitionRef.current) {
			setResponse('Voice recognition not supported in this browser.')
			return
		}
		setTranscript('')
		setResponse('Listening…')
		setListening(true)
		recognitionRef.current.start()
	}

	const stop = () => {
		try { recognitionRef.current?.stop() } catch {}
		setListening(false)
	}

	const handleIntent = (text: string) => {
		const t = text.toLowerCase()
		let reply = "I'm here to help."
		if (t.includes('next medication') || t.includes('what is next')) {
			reply = 'Your next medication is Metformin 500mg at 8 PM.'
		}
		if (t.includes('mark') && t.includes('metformin') && (t.includes('taken') || t.includes('done'))) {
			reply = 'Okay, I have marked Metformin as taken.'
		}
		if (t.includes('side effect')) {
			reply = 'Common side effects include nausea. For severe symptoms, seek medical advice.'
		}
		setResponse(reply)
		speak(reply)
	}

	return (
		<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900">Voice Assistant</h1>
				<p className="text-gray-600">Hands-free help for your medications</p>
			</motion.div>

			<div className="card text-center">
				<div className={`mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center ${listening ? 'voice-listening' : 'bg-gray-100 text-gray-500'}`}>
					<MicrophoneIcon className="w-10 h-10" />
				</div>
				<div className="flex items-center justify-center gap-3">
					<button onClick={start} disabled={listening} className="btn-primary flex items-center"><MicrophoneIcon className="w-4 h-4 mr-2" />Listen</button>
					<button onClick={stop} disabled={!listening} className="btn-secondary flex items-center"><StopIcon className="w-4 h-4 mr-2" />Stop</button>
					<button onClick={() => speak('Hello, how can I help with your medications?')} className="btn-secondary flex items-center"><SpeakerWaveIcon className="w-4 h-4 mr-2" />Test Voice</button>
				</div>
				<div className="mt-6 text-left">
					<div className="text-sm text-gray-500 mb-1">You said:</div>
					<div className="p-3 bg-gray-50 rounded">{transcript || '—'}</div>
					<div className="text-sm text-gray-500 mt-4 mb-1">Assistant:</div>
					<div className="p-3 bg-gray-50 rounded">{response || '—'}</div>
				</div>
			</div>
		</div>
	)
}



