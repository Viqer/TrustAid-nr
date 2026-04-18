export type Role = 'DONOR' | 'NGO' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

export type NgoVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface NGO {
  _id: string;
  userId: string | { _id: string; email?: string; firstName?: string; lastName?: string };
  organizationName: string;
  description: string;
  registrationNumber: string;
  website?: string | null;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  verificationStatus: NgoVerificationStatus;
}

/** Form fields used by apply dialogs before mapping to the API body. */
export interface NgoApplyForm {
  name: string;
  registrationNumber: string;
  description: string;
  website?: string;
  phone: string;
  country: string;
  address: string;
}

export interface Campaign {
  _id: string;
  /** Normalized from populated `ngoId` for display (see `use-campaigns`). */
  ngo?: { _id: string; name: string };
  ngoId?: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  totalDonors: number;
  category: string;
  /** API uses uppercase enums; some UI still checks lowercase. */
  status:
    | 'active'
    | 'closed'
    | 'completed'
    | 'DRAFT'
    | 'ACTIVE'
    | 'PAUSED'
    | 'COMPLETED'
    | 'FAILED'
    | 'CLOSED';
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
