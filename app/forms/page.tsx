'use client';

import { useEffect, useState } from 'react';
import { getFormsForUser } from '@/lib/actions';
// Remove or comment out the line below if you don't have an auth context
// import { useAuth } from '@/lib/auth';

// Define an interface for the form structure
interface Form {
  id: string;
  title: string;
  description: string;
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    async function fetchForms() {
      // Replace 'user.uid' with the actual user ID if you're not using an auth context
      try {
        const userForms = await getFormsForUser('your-user-id-here');
        // Cast the returned forms to the Form interface
        setForms(userForms as Form[]);
      } catch (error) {
        console.error("Error fetching forms:", error);
      }
    }

    fetchForms();
  }, []); // Remove 'user' from the dependency array if not using auth context

  return (
    <div>
      <h1>Your Forms</h1>
      {forms.map(form => (
        <div key={form.id}>
          <h2>{form.title}</h2>
          <p>{form.description}</p>
        </div>
      ))}
    </div>
  );
}