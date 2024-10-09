// app/dashboard/forms/[formId]/submissions/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const SubmissionsPage = () => {
  const params = useParams();
  const formId = params.formId as string;

  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const q = query(collection(db, 'formResponses'), where('formId', '==', formId));
      const querySnapshot = await getDocs(q);
      const submissionsData = querySnapshot.docs.map((doc) => doc.data());
      setSubmissions(submissionsData);
    };

    fetchSubmissions();
  }, [formId]);

  return (
    <div>
      <h1>Submissions for form {formId}</h1>
      {submissions.map((submission, index) => (
        <div key={index}>
          <p>Email: {submission.email}</p>
          <p>First Name: {submission.firstName}</p>
          <p>Last Name: {submission.lastName}</p>
          <p>Twitter Handle: {submission.twitterHandle}</p>
          <p>Submitted At: {submission.submittedAt.toDate().toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default SubmissionsPage;