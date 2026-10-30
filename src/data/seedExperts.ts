import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile } from '../types';

export const DEMO_EXPERTS: UserProfile[] = [
  {
    id: 'demo-expert-1',
    name: 'Dr. Ramesh Patel',
    email: 'ramesh.patel@kisanexpert.demo',
    role: 'expert',
    expertise: ['Pest', 'Disease', 'Other'],
    experience: 14,
    bio: 'Ph.D. in Agricultural Entomology from IARI. 14+ years advising cotton, paddy, sugarcane, and mustard farmers on pest control and disease mitigation.',
    fee: 250,
    isAvailable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-expert-2',
    name: 'Sunita Sharma',
    email: 'sunita.sharma@kisanexpert.demo',
    role: 'expert',
    expertise: ['Soil', 'Irrigation'],
    experience: 9,
    bio: 'M.Sc. in Soil Science. Specialist in micro-irrigation layout, pH soil correction, drip scheduling, and soil nutrient health restoration.',
    fee: 180,
    isAvailable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-expert-3',
    name: 'Dr. Anand Verma',
    email: 'anand.verma@kisanexpert.demo',
    role: 'expert',
    expertise: ['Fertilizer', 'Disease', 'Other'],
    experience: 16,
    bio: 'Senior Agronomist specializing in horticultural crops, precision fertilizer dosage, balanced NPK nutrition, and organic bio-fertilizers.',
    fee: 300,
    isAvailable: true,
    createdAt: new Date().toISOString(),
  },
];

export const DEMO_FARMER: UserProfile = {
  id: 'demo-farmer-1',
  name: 'Rajesh Kumar',
  email: 'rajesh.farmer@kisanexpert.demo',
  role: 'farmer',
  location: 'Rampur Village, Varanasi District, Uttar Pradesh',
  createdAt: new Date().toISOString(),
};

export async function seedDemoExpertsIfMissing(): Promise<void> {
  try {
    for (const expert of DEMO_EXPERTS) {
      const docRef = doc(db, 'users', expert.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, expert);
      }
    }
  } catch (err) {
    console.warn('Seeding demo experts check:', err);
  }
}
