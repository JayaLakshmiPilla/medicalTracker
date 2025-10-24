import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/database'

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  genericName: z.string().optional(),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  times: z.array(z.string()),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  instructions: z.string().optional(),
  color: z.string().default('blue'),
  reminder: z.boolean().default(true),
  reminderMinutes: z.number().default(15),
  userId: z.string().min(1, 'User ID is required'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const medications = await prisma.medication.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ medications })
  } catch (error) {
    console.error('Failed to fetch medications:', error)
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = medicationSchema.parse(body)

    const medication = await prisma.medication.create({
      data
    })

    return NextResponse.json({ medication }, { status: 201 })
  } catch (error) {
    console.error('Failed to create medication:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ error: 'Failed to create medication' }, { status: 500 })
  }
}

