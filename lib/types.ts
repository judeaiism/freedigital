export interface Form {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  updatedAt: string;
}