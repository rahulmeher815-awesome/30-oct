export type UserRole = 'farmer' | 'expert';

export type ProblemCategory = 'Pest' | 'Disease' | 'Soil' | 'Irrigation' | 'Fertilizer' | 'Other';

export type ConsultationStatus = 'Pending' | 'Accepted' | 'Declined' | 'Completed';

export type PaymentStatus = 'Paid' | 'Unpaid';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: string; // village/district/state for farmer
  expertise?: ProblemCategory[]; // multi-select for expert
  experience?: number; // years of experience
  bio?: string;
  fee?: number; // consultation fee in INR
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Consultation {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  expertId: string;
  expertName: string;
  cropName: string;
  category: ProblemCategory;
  description: string;
  fee: number;
  paymentStatus: PaymentStatus;
  status: ConsultationStatus;
  createdAt: any;
  updatedAt?: any;
  lastMessage?: string;
  lastMessageTime?: any;
}

export interface ChatMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  createdAt: any;
}
