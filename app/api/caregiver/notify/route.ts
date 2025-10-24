import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/database'
import nodemailer from 'nodemailer'
import twilio from 'twilio'

const notifySchema = z.object({
  caregiver: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    channels: z.array(z.string()),
  }),
  message: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  userId: z.string().optional(),
})

// Email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

// Twilio client
const createTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null
  }
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { caregiver, message, priority, userId } = notifySchema.parse(body)
		
		const results = []
		
		// Send email notification
		if (caregiver.channels.includes('email') && caregiver.email) {
			try {
				const transporter = createEmailTransporter()
				await transporter.sendMail({
					from: process.env.SMTP_FROM || 'noreply@medicare-ai.com',
					to: caregiver.email,
					subject: `MediCare AI Alert - ${priority.toUpperCase()}`,
					html: `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
							<h2 style="color: #2563eb;">MediCare AI Notification</h2>
							<p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
							<p><strong>Message:</strong> ${message}</p>
							<p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
							<hr style="margin: 20px 0;">
							<p style="color: #666; font-size: 12px;">
								This is an automated message from MediCare AI. Please do not reply to this email.
							</p>
						</div>
					`
				})
				results.push({ channel: 'email', status: 'sent' })
			} catch (error) {
				console.error('Email sending failed:', error)
				results.push({ channel: 'email', status: 'failed', error: error.message })
			}
		}
		
		// Send SMS notification
		if (caregiver.channels.includes('sms') && caregiver.phone) {
			try {
				const twilioClient = createTwilioClient()
				if (twilioClient) {
					await twilioClient.messages.create({
						body: `MediCare AI Alert (${priority.toUpperCase()}): ${message}`,
						from: process.env.TWILIO_PHONE_NUMBER,
						to: caregiver.phone
					})
					results.push({ channel: 'sms', status: 'sent' })
				} else {
					results.push({ channel: 'sms', status: 'skipped', reason: 'Twilio not configured' })
				}
			} catch (error) {
				console.error('SMS sending failed:', error)
				results.push({ channel: 'sms', status: 'failed', error: error.message })
			}
		}
		
		// Save notification to database
		if (userId) {
			try {
				await prisma.notification.create({
					data: {
						type: priority === 'urgent' ? 'emergency' : 'medication',
						title: `Alert for ${caregiver.name}`,
						message,
						priority,
						channels: caregiver.channels,
						isActive: true,
						userId,
						caregiverId: caregiver.id,
						sentAt: new Date()
					}
				})
			} catch (dbError) {
				console.error('Failed to save notification:', dbError)
			}
		}
		
		return NextResponse.json({ 
			success: true, 
			message: 'Notification sent',
			results 
		})
		
	} catch (error) {
		console.error('Caregiver notification error:', error)
		
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid request data', details: error.errors },
				{ status: 400 }
			)
		}
		
		return NextResponse.json({ error: error?.message || 'Bad request' }, { status: 400 })
	}
}



