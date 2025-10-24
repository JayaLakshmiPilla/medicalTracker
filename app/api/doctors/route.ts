import { NextResponse } from 'next/server'

export async function GET() {
	// Mock doctors list
	return NextResponse.json({
		doctors: [
			{ id: 'd1', name: 'Dr. Sarah Patel', specialization: 'Internal Medicine', clinic: 'City Health Clinic' },
			{ id: 'd2', name: 'Dr. Amit Verma', specialization: 'Cardiology', clinic: 'Heart Care Center' },
			{ id: 'd3', name: 'Dr. Neha Rao', specialization: 'Endocrinology', clinic: 'Metro Medical' }
		]
	})
}



