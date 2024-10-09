'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { updateForm } from '@/lib/actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditForm({ params }: { params: { formId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchForm() {
      if (!user) return;
      try {
        const formRef = doc(db, 'forms', params.formId);
        const formSnap = await getDoc(formRef);
        if (formSnap.exists()) {
          setForm(formSnap.data() as { title: string; description: string });
        } else {
          setError('Form not found');
        }
      } catch (err) {
        setError('Failed to fetch form');
      } finally {
        setLoading(false);
      }
    }
    fetchForm();
  }, [user, params.formId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    try {
      const formData = new FormData(event.currentTarget);
      formData.append('formId', params.formId);
      await updateForm(formData);
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to update form');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please sign in to edit this form.</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Edit Form</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <Input
            type="text"
            id="title"
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <Textarea
            id="description"
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <Button type="submit">Update Form</Button>
      </form>
    </div>
  );
}