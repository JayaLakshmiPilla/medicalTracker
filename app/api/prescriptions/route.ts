import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		// In real app, save to DB and send to pharmacy/doctor
		const id = 'rx_' + Date.now()
		return NextResponse.json({ id, ...body })
	} catch (e: any) {
		return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 })
	}
}



