import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample user
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@medicare-ai.com' },
    update: {},
    create: {
      email: 'demo@medicare-ai.com',
      name: 'Demo User',
      phone: '+1-555-0123',
    },
  })

  console.log('✅ Created user:', user.email)

  // Create sample medications
  const medications = await Promise.all([
    prisma.medication.create({
      data: {
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        dosage: '500mg',
        frequency: 'Twice Daily',
        times: ['08:00', '20:00'],
        startDate: new Date('2024-01-01'),
        instructions: 'Take with food',
        color: 'blue',
        reminder: true,
        reminderMinutes: 15,
        userId: user.id,
      },
    }),
    prisma.medication.create({
      data: {
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once Daily',
        times: ['09:00'],
        startDate: new Date('2024-01-01'),
        instructions: 'Take in the morning',
        color: 'green',
        reminder: true,
        reminderMinutes: 10,
        userId: user.id,
      },
    }),
    prisma.medication.create({
      data: {
        name: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium',
        dosage: '20mg',
        frequency: 'Once Daily',
        times: ['22:00'],
        startDate: new Date('2024-01-01'),
        instructions: 'Take at bedtime',
        color: 'red',
        reminder: true,
        reminderMinutes: 15,
        userId: user.id,
      },
    }),
  ])

  console.log('✅ Created medications:', medications.length)

  // Create sample caregivers
  const caregivers = await Promise.all([
    prisma.caregiver.create({
      data: {
        name: 'Alice Kumar',
        relationship: 'Daughter',
        email: 'alice@example.com',
        phone: '+1-555-1000',
        channels: ['email', 'push'],
        quietHours: { start: '22:00', end: '07:00' },
        userId: user.id,
      },
    }),
    prisma.caregiver.create({
      data: {
        name: 'Ravi Kumar',
        relationship: 'Son',
        email: 'ravi@example.com',
        phone: '+1-555-2000',
        channels: ['sms'],
        userId: user.id,
      },
    }),
  ])

  console.log('✅ Created caregivers:', caregivers.length)

  // Create emergency contacts
  const emergencyContacts = await Promise.all([
    prisma.emergencyContact.create({
      data: {
        name: 'Dr. Sarah Johnson',
        phone: '+1-555-0100',
        relationship: 'Primary Care Doctor',
        priority: 1,
        userId: user.id,
      },
    }),
    prisma.emergencyContact.create({
      data: {
        name: 'Emergency Services',
        phone: '911',
        relationship: 'Emergency',
        priority: 0,
        userId: user.id,
      },
    }),
    prisma.emergencyContact.create({
      data: {
        name: 'Local Pharmacy',
        phone: '+1-555-0200',
        relationship: 'Pharmacy',
        priority: 3,
        userId: user.id,
      },
    }),
  ])

  console.log('✅ Created emergency contacts:', emergencyContacts.length)

  // Create escalation rules
  const escalationRules = await Promise.all([
    prisma.escalationRule.create({
      data: {
        condition: 'missed',
        thresholdMinutes: 30,
        caregiverId: caregivers[0].id,
        userId: user.id,
      },
    }),
    prisma.escalationRule.create({
      data: {
        condition: 'urgent',
        caregiverId: caregivers[1].id,
        userId: user.id,
      },
    }),
  ])

  console.log('✅ Created escalation rules:', escalationRules.length)

  // Create sample adherence events for the last 30 days
  const adherenceEvents = []
  const today = new Date()
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    for (const medication of medications) {
      const plannedDoses = medication.times.length
      const takenDoses = Math.random() > 0.2 ? plannedDoses : Math.floor(Math.random() * plannedDoses)
      
      adherenceEvents.push({
        date,
        medicationId: medication.id,
        plannedDoses,
        takenDoses,
        notes: takenDoses < plannedDoses ? 'Missed some doses' : null,
        userId: user.id,
      })
    }
  }

  await prisma.adherenceEvent.createMany({
    data: adherenceEvents,
  })

  console.log('✅ Created adherence events:', adherenceEvents.length)

  // Create sample notifications
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        type: 'medication',
        title: 'Time for Metformin',
        message: 'Take your 500mg Metformin dose now',
        priority: 'high',
        channels: ['push', 'in-app'],
        isActive: true,
        scheduledTime: new Date(Date.now() + 60000), // 1 minute from now
        userId: user.id,
        medicationId: medications[0].id,
      },
    }),
    prisma.notification.create({
      data: {
        type: 'reminder',
        title: 'Refill Reminder',
        message: 'Your Lisinopril prescription needs refilling in 3 days',
        priority: 'medium',
        channels: ['email', 'in-app'],
        isActive: true,
        userId: user.id,
      },
    }),
    prisma.notification.create({
      data: {
        type: 'warning',
        title: 'Drug Interaction Alert',
        message: 'Potential interaction between Metformin and new medication',
        priority: 'urgent',
        channels: ['push', 'email', 'sms', 'in-app'],
        isActive: true,
        userId: user.id,
      },
    }),
  ])

  console.log('✅ Created notifications:', notifications.length)

  // Create medication interactions
  const interactions = await Promise.all([
    prisma.medicationInteraction.create({
      data: {
        medication1Name: 'Metformin',
        medication2Name: 'Alcohol',
        severity: 'moderate',
        description: 'Alcohol can increase the risk of lactic acidosis with metformin',
        recommendations: 'Limit alcohol consumption and monitor for symptoms',
      },
    }),
    prisma.medicationInteraction.create({
      data: {
        medication1Name: 'Lisinopril',
        medication2Name: 'Potassium supplements',
        severity: 'high',
        description: 'ACE inhibitors can increase potassium levels',
        recommendations: 'Monitor potassium levels regularly',
      },
    }),
    prisma.medicationInteraction.create({
      data: {
        medication1Name: 'Atorvastatin',
        medication2Name: 'Grapefruit juice',
        severity: 'moderate',
        description: 'Grapefruit juice can increase statin levels',
        recommendations: 'Avoid grapefruit juice while taking statins',
      },
    }),
  ])

  console.log('✅ Created medication interactions:', interactions.length)

  console.log('🎉 Database seed completed successfully!')
  console.log('')
  console.log('Demo credentials:')
  console.log('Email: demo@medicare-ai.com')
  console.log('Password: password123')
  console.log('')
  console.log('You can now start the application with: npm run dev')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




