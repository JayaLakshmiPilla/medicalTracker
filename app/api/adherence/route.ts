import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/database'

const adherenceEventSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  medicationId: z.string().min(1, 'Medication ID is required'),
  plannedDoses: z.number().min(0),
  takenDoses: z.number().min(0),
  notes: z.string().optional(),
  userId: z.string().min(1, 'User ID is required'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const medicationId = searchParams.get('medicationId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const where: any = { userId }
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    
    if (medicationId) {
      where.medicationId = medicationId
    }

    const events = await prisma.adherenceEvent.findMany({
      where,
      include: {
        medication: {
          select: {
            name: true,
            dosage: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    // Calculate statistics
    const totalPlanned = events.reduce((sum, event) => sum + event.plannedDoses, 0)
    const totalTaken = events.reduce((sum, event) => sum + event.takenDoses, 0)
    const adherenceRate = totalPlanned > 0 ? Math.round((totalTaken / totalPlanned) * 100) : 100

    return NextResponse.json({ 
      events, 
      statistics: {
        totalPlanned,
        totalTaken,
        adherenceRate
      }
    })
  } catch (error) {
    console.error('Failed to fetch adherence data:', error)
    return NextResponse.json({ error: 'Failed to fetch adherence data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = adherenceEventSchema.parse(body)

    // Check if event already exists for this date and medication
    const existingEvent = await prisma.adherenceEvent.findUnique({
      where: {
        date_medicationId_userId: {
          date: data.date,
          medicationId: data.medicationId,
          userId: data.userId
        }
      }
    })

    let event
    if (existingEvent) {
      // Update existing event
      event = await prisma.adherenceEvent.update({
        where: { id: existingEvent.id },
        data: {
          plannedDoses: data.plannedDoses,
          takenDoses: data.takenDoses,
          notes: data.notes
        }
      })
    } else {
      // Create new event
      event = await prisma.adherenceEvent.create({
        data
      })
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Failed to save adherence event:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ error: 'Failed to save adherence event' }, { status: 500 })
  }
}

