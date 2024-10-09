import { Timestamp } from 'firebase/firestore';

export interface Form {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;  // Changed from 'string | Timestamp'
  updatedAt: string;  // Changed from 'string | Timestamp'
}