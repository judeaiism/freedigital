'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

// Define an interface for the form structure
interface Form {
  id: string;
  userId: string;
  createdAt: Date;
  // Add other form fields as needed
}

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    if (user) {
      const fetchForms = async () => {
        const q = query(collection(db, 'forms'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        setForms(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Form)));
      };
      fetchForms();
    }
  }, [user]);

  const createForm = async () => {
    if (user) {
      const docRef = await addDoc(collection(db, 'forms'), {
        userId: user.uid,
        createdAt: new Date(),
        // Add other form fields as needed
      });
      // Update forms state with the new form
      setForms([...forms, { id: docRef.id, userId: user.uid, createdAt: new Date() }]);
    }
  };

  if (!user) return <div>Please sign in to access the dashboard.</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={createForm}>Create New Form</button>
      <ul>
        {forms.map(form => (
          <li key={form.id}>
            <Link href={`/forms/${form.id}`}>{form.id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}