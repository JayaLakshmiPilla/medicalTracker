import { NextRequest, NextResponse } from 'next/server'
import { medicationDatabase } from '@/lib/medications'
import { prisma } from '@/lib/database'
import { z } from 'zod'

const identifySchema = z.object({
	imageData: z.string().min(1, 'Image data is required'),
	ocrText: z.string().optional(),
	userId: z.string().optional(),
})

interface IdentifyRequestBody {
	imageData: string // data URL
	ocrText?: string
	userId?: string
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { imageData, ocrText, userId } = identifySchema.parse(body)

		const provider = process.env.ID_PROVIDER || 'mock'

		if (provider !== 'mock') {
			const url = process.env.DRUG_ID_API_URL
			const key = process.env.DRUG_ID_API_KEY
			if (!url || !key) {
				return NextResponse.json({ error: 'Provider not configured' }, { status: 400 })
			}

			try {
				const resp = await fetch(url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${key}`
					},
					body: JSON.stringify({ imageData, ocrText })
				})

				if (!resp.ok) {
					const text = await resp.text()
					return NextResponse.json({ error: `Provider error: ${text}` }, { status: 502 })
				}

				const data = await resp.json()
				return NextResponse.json({
					medication: data.medication,
					confidence: data.confidence ?? 80
				})
			} catch (e: any) {
				return NextResponse.json({ error: e?.message || 'External provider failed' }, { status: 502 })
			}
		}

		// Mock matching using OCR text
		const text = (ocrText || '').toLowerCase()
		const scored = medicationDatabase.map(med => {
			const searchable = [med.name, med.genericName, med.dosage, med.manufacturer]
				.filter(Boolean)
				.join(' ').toLowerCase()
			const tokens = searchable.split(/[^a-z0-9]+/).filter(Boolean)
			let score = 0
			tokens.forEach(t => { if (text.includes(t)) score += 1 })
			return { med, score }
		}).sort((a, b) => b.score - a.score)

		const best = scored[0]?.med || medicationDatabase[0]
		const confidence = Math.min(99, Math.max(50, (scored[0]?.score || 0) * 15)) || 75

		// Save scan history if user is provided
		if (userId) {
			try {
				await prisma.scanHistory.create({
					data: {
						imageUrl: imageData,
						ocrText: ocrText || '',
						confidence,
						status: confidence >= 90 ? 'success' : confidence >= 70 ? 'warning' : 'error',
						userId
					}
				})
			} catch (dbError) {
				console.error('Failed to save scan history:', dbError)
			}
		}

		return NextResponse.json({ medication: best, confidence })
	} catch (e: any) {
		console.error('Medication identification error:', e)
		
		if (e instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid request data', details: e.errors },
				{ status: 400 }
			)
		}
		
		return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 })
	}
}



