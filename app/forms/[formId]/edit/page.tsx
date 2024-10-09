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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchFormData() {
      if (!user) {
        setError("You must be logged in to edit a form.");
        setLoading(false);
        return;
      }

      try {
        const formRef = doc(db, 'forms', params.formId);
        const formSnap = await getDoc(formRef);

        if (formSnap.exists()) {
          const formData = formSnap.data();
          setTitle(formData.title || '');
          setDescription(formData.description || '');
        } else {
          setError(`Form with ID ${params.formId} not found.`);
        }
      } catch (err) {
        setError(`Error fetching form data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }

    fetchFormData();
  }, [params.formId, user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await updateForm(params.formId, title, description);
      router.push('/dashboard');
    } catch (error) {
      setError(`Failed to update form: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Edit Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            rows={3}
            required
          />
        </div>
        <Button type="submit">Update Form</Button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}