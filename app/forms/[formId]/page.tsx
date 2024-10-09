'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';

export default function FormPage() {
  const params = useParams();
  const formId = params.formId as string;
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    twitterHandle: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    const fetchFormDetails = async () => {
      const docRef = doc(db, 'forms', formId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Set form details, including download URL
        setDownloadUrl(docSnap.data().fileUrl || '');
      }
    };
    fetchFormDetails();
  }, [formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'submissions'), {
      formId,
      ...formData,
      submittedAt: new Date(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div>
        <h2>Thank you for your submission!</h2>
        {downloadUrl && (
          <a href={downloadUrl} download>
            <button>Download File</button>
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="text"
        value={formData.firstName}
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        placeholder="First Name"
        required
      />
      <input
        type="text"
        value={formData.lastName}
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        placeholder="Last Name"
        required
      />
      <input
        type="text"
        value={formData.twitterHandle}
        onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
        placeholder="Twitter Handle"
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
}