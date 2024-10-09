'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2, Eye, PauseCircle, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { createForm, deleteForm, toggleFormStatus } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Timestamp } from 'firebase/firestore';

interface Form {
  id: string;
  userId: string;
  createdAt: Timestamp;
  title: string;
  description: string;
  status: 'active' | 'suspended' | 'deleted';
}

async function getFormsForUser(userId: string): Promise<Form[]> {
  try {
    const q = query(
      collection(db, 'forms'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Form));
  } catch (error) {
    console.error("Error fetching forms:", error);
    return [];
  }
}

function FormTable({ forms, onStatusChange }: { forms: Form[]; onStatusChange: () => void }) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleToggleStatus = async (formData: FormData) => {
    setIsToggling(true);
    try {
      await toggleFormStatus(formData);
      onStatusChange();
    } catch (error) {
      console.error("Error toggling form status:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDeleteForm = async (formData: FormData) => {
    setIsDeleting(true);
    try {
      await deleteForm(formData);
      onStatusChange();
    } catch (error) {
      console.error("Error deleting form:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {forms.map(form => (
          <TableRow key={form.id}>
            <TableCell>{form.title}</TableCell>
            <TableCell>{form.description}</TableCell>
            <TableCell>{form.status}</TableCell>
            <TableCell>{form.createdAt.toDate().toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="outline" asChild size="sm">
                  <Link href={`/forms/${form.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="sm">
                  <Link href={`/forms/${form.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="sm">
                  <Link href={`/forms/${form.id}/submissions`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <form action={handleToggleStatus}>
                  <input type="hidden" name="formId" value={form.id} />
                  <Button variant="outline" type="submit" disabled={isToggling} size="sm">
                    {form.status === 'active' ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  </Button>
                </form>
                <form action={handleDeleteForm}>
                  <input type="hidden" name="formId" value={form.id} />
                  <Button variant="destructive" type="submit" disabled={isDeleting} size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [activeForms, setActiveForms] = useState<Form[]>([]);
  const [suspendedForms, setSuspendedForms] = useState<Form[]>([]);
  const [deletedForms, setDeletedForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refreshForms = useCallback(async () => {
    if (user) {
      try {
        const fetchedForms = await getFormsForUser(user.uid);
        setForms(fetchedForms);
        setActiveForms(fetchedForms.filter(form => form.status === 'active'));
        setSuspendedForms(fetchedForms.filter(form => form.status === 'suspended'));
        setDeletedForms(fetchedForms.filter(form => form.status === 'deleted'));
      } catch (err) {
        setError("Failed to fetch forms. Please try again later.");
      }
    }
  }, [user]);

  useEffect(() => {
    async function fetchForms() {
      if (user) {
        try {
          const fetchedForms = await getFormsForUser(user.uid);
          setForms(fetchedForms);
          setActiveForms(
            fetchedForms.filter(form => form.status === 'active')
          );
          setSuspendedForms(
            fetchedForms.filter(form => form.status === 'suspended')
          );
          setDeletedForms(
            fetchedForms.filter(form => form.status === 'deleted')
          );
        } catch (err) {
          setError("Failed to fetch forms. Please try again later.");
        }
      }
      setLoading(false);
    }

    fetchForms();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>Please sign in to access the dashboard.</div>;
  }

  const handleCreateForm = async () => {
    if (user) {
      try {
        const newFormId = await createForm(user.uid, 'New Form', 'Form Description');
        router.push(`/forms/${newFormId}/edit`);
      } catch (error) {
        console.error("Error creating form:", error);
        setError("Failed to create a new form. Please try again.");
      }
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <Button onClick={handleCreateForm}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Form
        </Button>
      </div>
      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Forms</TabsTrigger>
          <TabsTrigger value="active">Active Forms</TabsTrigger>
          <TabsTrigger value="suspended">Suspended Forms</TabsTrigger>
          <TabsTrigger value="deleted">Deleted Forms</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Suspense fallback={<div>Loading forms...</div>}>
            <FormTable forms={forms} onStatusChange={refreshForms} />
          </Suspense>
        </TabsContent>
        <TabsContent value="active">
          <Suspense fallback={<div>Loading active forms...</div>}>
            <FormTable forms={activeForms} onStatusChange={refreshForms} />
          </Suspense>
        </TabsContent>
        <TabsContent value="suspended">
          <Suspense fallback={<div>Loading suspended forms...</div>}>
            <FormTable forms={suspendedForms} onStatusChange={refreshForms} />
          </Suspense>
        </TabsContent>
        <TabsContent value="deleted">
          <Suspense fallback={<div>Loading deleted forms...</div>}>
            <FormTable forms={deletedForms} onStatusChange={refreshForms} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}