export type Role = 'DONOR' | 'NGO' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

export interface NGO {
  _id: string;
  user: string;
  name: string;
  description: string;
  registrationNumber: string;
  website: string;
  contactEmail: string;
  status: 'pending' | 'verified' | 'rejected';
  categories: string[];
  country: string;
  address: string;
}

export interface Campaign {
  _id: string;
  ngo: Pick<NGO, '_id' | 'name'>;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  totalDonors: number;
  category: string;
  status: 'active' | 'closed' | 'completed';
  startDate: string;
  endDate: string;
  beneficiaries: string;
  createdAt: string;
}

export interface Donation {
  _id: string;
  campaign: Pick<Campaign, '_id' | 'title'>;
  donor: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  blockchainTxHash?: string;
  createdAt: string;
}
