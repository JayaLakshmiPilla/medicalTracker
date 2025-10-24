import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		// In a real app: look up caregivers and send SMS/email/push with location link
		await new Promise(r => setTimeout(r, 400))
		return NextResponse.json({ ok: true })
	} catch (e: any) {
		return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 })
	}
}



