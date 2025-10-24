import { NextRequest, NextResponse } from 'next/server'

interface ChatBody {
	message: string
	context?: any
}

export async function POST(req: NextRequest) {
	try {
		const body = (await req.json()) as ChatBody
		const { message, context } = body

		const provider = process.env.CHAT_PROVIDER || 'mock'
		if (provider !== 'mock') {
			const key = process.env.OPENAI_API_KEY
			if (!key) return NextResponse.json({ error: 'Provider not configured' }, { status: 400 })
			// Minimal example calling OpenAI Responses API
			const resp = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${key}`
				},
				body: JSON.stringify({
					model: 'gpt-4o-mini',
					messages: [
						{ role: 'system', content: 'You are a helpful medical assistant. Provide safe, general guidance. Do not diagnose. Encourage contacting a professional for urgent or personal medical concerns.' },
						{ role: 'user', content: `Context: ${JSON.stringify(context)}\nQuestion: ${message}` }
					]
				})
			})
			if (!resp.ok) {
				const text = await resp.text()
				return NextResponse.json({ error: text }, { status: 502 })
			}
			const data = await resp.json()
			const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'
			return NextResponse.json({ reply })
		}

		// Mock provider: simple heuristic
		const lower = message.toLowerCase()
		let reply = 'I can help with schedules, side effects, interactions, and reminders. What would you like to know?'
		if (lower.includes('side effect') || lower.includes('side-effect')) reply = 'Common side effects include nausea and dizziness. If you experience severe symptoms, seek medical attention.'
		if (lower.includes('interaction')) reply = 'Avoid mixing with alcohol and check for interactions with NSAIDs or supplements. For personal advice, consult your doctor.'
		if (lower.includes('when') || lower.includes('time')) reply = 'Take it at the scheduled times (e.g., morning and evening) and maintain consistent timing daily.'
		return NextResponse.json({ reply })
	} catch (e: any) {
		return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 })
	}
}



