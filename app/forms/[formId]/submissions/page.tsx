// app/dashboard/forms/[formId]/submissions/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, getDoc, doc } from 'firebase/firestore';

// Define an interface for the submission data
interface Submission {
  email: string;
  firstName: string;
  lastName: string;
  twitterHandle: string;
  submittedAt: Timestamp;
  downloadedFile: boolean;
}

// Define an interface for the analytics data
interface Analytics {
  views: number;
  submissions: number;
  bounceRate: string;
  [key: string]: number | string; // For any additional properties
}

const SubmissionsPage = () => {
  const params = useParams();
  const formId = params.formId as string;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch submissions
      const q = query(collection(db, 'formResponses'), where('formId', '==', formId));
      const querySnapshot = await getDocs(q);
      const submissionsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          twitterHandle: data.twitterHandle,
          submittedAt: data.submittedAt as Timestamp,
          downloadedFile: data.downloadedFile || false,
        } as Submission;
      });
      setSubmissions(submissionsData);

      // Fetch analytics
      const analyticsRef = doc(db, 'formAnalytics', formId);
      const analyticsSnap = await getDoc(analyticsRef);
      if (analyticsSnap.exists()) {
        const data = analyticsSnap.data();
        const views = data.views || 0;
        const submissions = data.submissions || 0;
        const bounceRate = views > 0 ? ((views - submissions) / views * 100).toFixed(2) : '0';
        setAnalytics({ ...data, views, submissions, bounceRate });
      }
    };

    fetchData();
  }, [formId]);

  const totalSubmissions = submissions.length;
  const downloadsCount = submissions.filter(s => s.downloadedFile).length;
  const dropOffRate = totalSubmissions > 0 
    ? ((totalSubmissions - downloadsCount) / totalSubmissions * 100).toFixed(2)
    : 0;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Submissions for form {formId}</h1>
      <p className="mb-2">Drop-off Rate: {dropOffRate}% of users filled the form but did not download the file</p>
      {analytics && (
        <p className="mb-5">Bounce Rate: {analytics.bounceRate}% of users viewed the page without submitting the form</p>
      )}
      {submissions.map((submission, index) => (
        <div key={index} className="border p-4 mb-4 rounded">
          <p>Email: {submission.email}</p>
          <p>First Name: {submission.firstName}</p>
          <p>Last Name: {submission.lastName}</p>
          <p>Twitter Handle: {submission.twitterHandle}</p>
          <p>Submitted At: {submission.submittedAt.toDate().toLocaleString()}</p>
          <p>Downloaded File: {submission.downloadedFile ? 'Yes' : 'No'}</p>
        </div>
      ))}
    </div>
  );
};

export default SubmissionsPage;
