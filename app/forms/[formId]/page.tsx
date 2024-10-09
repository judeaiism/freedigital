'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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
  const [formTitle, setFormTitle] = useState('');

  useEffect(() => {
    const fetchFormDetails = async () => {
      const docRef = doc(db, 'forms', formId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormTitle(docSnap.data().title || 'Untitled Form');
        setDownloadUrl(docSnap.data().fileUrl || '');
      }
    };
    fetchFormDetails();
  }, [formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'formResponses'), {
      formId,
      ...formData,
      submittedAt: new Date(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className="w-[350px] mx-auto mt-10">
        <CardHeader>
          <CardTitle>Thank you for your submission!</CardTitle>
        </CardHeader>
        <CardContent>
          {downloadUrl && (
            <Button asChild>
              <a href={downloadUrl} download>Download File</a>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[350px] mx-auto mt-10">
      <CardHeader>
        <CardTitle>{formTitle}</CardTitle>
        <CardDescription>Please fill out the form below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="First Name"
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Last Name"
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Input
                type="text"
                value={formData.twitterHandle}
                onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                placeholder="Twitter Handle"
                required
              />
            </div>
          </div>
          <CardFooter className="flex justify-between mt-4">
            <Button type="submit">Submit</Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}