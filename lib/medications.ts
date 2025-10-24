export interface IdentifiedMedication {
	id: string
	name: string
	genericName: string
	dosage: string
	manufacturer: string
	description: string
	sideEffects: string[]
	interactions: string[]
	warnings: string[]
}

export const medicationDatabase: IdentifiedMedication[] = [
	{
		id: '1',
		name: 'Metformin',
		genericName: 'Metformin Hydrochloride',
		dosage: '500mg',
		manufacturer: 'Generic',
		description: 'Metformin is used to treat type 2 diabetes. It helps control blood sugar levels.',
		sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset', 'Metallic taste'],
		interactions: ['Alcohol', 'Contrast dyes', 'Cimetidine'],
		warnings: ['Kidney problems', 'Liver disease', 'Heart failure']
	},
	{
		id: '2',
		name: 'Lisinopril',
		genericName: 'Lisinopril',
		dosage: '10mg',
		manufacturer: 'Generic',
		description: 'Lisinopril is an ACE inhibitor used to treat high blood pressure and heart failure.',
		sideEffects: ['Dry cough', 'Dizziness', 'Fatigue', 'Headache'],
		interactions: ['Potassium supplements', 'NSAIDs', 'Lithium'],
		warnings: ['Pregnancy', 'Kidney disease', 'High potassium']
	},
	{
		id: '3',
		name: 'Atorvastatin',
		genericName: 'Atorvastatin Calcium',
		dosage: '20mg',
		manufacturer: 'Generic',
		description: 'Atorvastatin is a statin used to lower cholesterol and reduce cardiovascular risk.',
		sideEffects: ['Muscle pain', 'Liver problems', 'Memory issues', 'Digestive problems'],
		interactions: ['Grapefruit juice', 'Warfarin', 'Digoxin'],
		warnings: ['Liver disease', 'Pregnancy', 'Muscle disorders']
	}
]



