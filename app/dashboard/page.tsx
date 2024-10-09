'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2, Eye, PauseCircle, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { createForm, deleteForm, toggleFormStatus, getFormById } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateProfile } from 'firebase/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { auth } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { Form } from '@/lib/types';
import { signOut } from 'firebase/auth';

async function getFormsForUser(userId: string): Promise<Form[]> {
  try {
    const q = query(
      collection(db, 'forms'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        status: data.status,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt
      } as Form;
    });
  } catch (error) {
    console.error("Error fetching forms:", error);
    return [];
  }
}

function FormTable({ 
  forms, 
  onStatusChange, 
  onDeleteForm, 
  isDeleting, 
  isToggling 
}: { 
  forms: Form[]; 
  onStatusChange: (formData: FormData) => Promise<void>;
  onDeleteForm: (formId: string) => Promise<void>;
  isDeleting: boolean;
  isToggling: boolean;
}) {
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
            <TableCell>
              {new Date(form.createdAt).toLocaleDateString()}
            </TableCell>
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
                <form onSubmit={(e) => {
                  e.preventDefault();
                  onStatusChange(new FormData(e.currentTarget));
                }}>
                  <input type="hidden" name="formId" value={form.id} />
                  <Button variant="outline" type="submit" disabled={isToggling} size="sm">
                    {form.status === 'active' ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  </Button>
                </form>
                <Button 
                  variant="destructive" 
                  onClick={() => onDeleteForm(form.id)} 
                  disabled={isDeleting} 
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [activeForms, setActiveForms] = useState<Form[]>([]);
  const [suspendedForms, setSuspendedForms] = useState<Form[]>([]);
  const [deletedForms, setDeletedForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const refreshForms = useCallback(async () => {
    if (user) {
      try {
        const fetchedForms = await getFormsForUser(user.uid);
        // Only include non-deleted forms
        const nonDeletedForms = fetchedForms.filter(form => form.status !== 'deleted');
        setForms(nonDeletedForms);
        setActiveForms(nonDeletedForms.filter(form => form.status === 'active'));
        setSuspendedForms(nonDeletedForms.filter(form => form.status === 'suspended'));
        // Don't update deletedForms here
      } catch (error) {
        console.error("Error refreshing forms:", error);
        setError("Failed to fetch forms. Please try again later.");
      }
    }
  }, [user]);

  useEffect(() => {
    async function fetchForms() {
      if (user) {
        try {
          const fetchedForms = await getFormsForUser(user.uid);
          // Filter out deleted forms for the 'All Forms' tab
          const nonDeletedForms = fetchedForms.filter(form => form.status !== 'deleted');
          setForms(nonDeletedForms);
          setActiveForms(fetchedForms.filter(form => form.status === 'active'));
          setSuspendedForms(fetchedForms.filter(form => form.status === 'suspended'));
          setDeletedForms(fetchedForms.filter(form => form.status === 'deleted'));
        } catch (error) {
          console.error("Error fetching forms:", error);
          setError("Failed to fetch forms. Please try again later.");
        }
      }
      setLoading(false);
    }

    fetchForms();
  }, [user]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
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
        console.log("Attempting to create form for user:", user.uid);
        const displayName = user.displayName || 'user';
        const newFormId = await createForm(user.uid, 'New Form', 'Form Description', displayName);
        console.log("Form created successfully, redirecting to:", `/forms/${newFormId}/edit`);
        
        // Fetch the newly created form
        const newForm = await getFormById(newFormId);
        
        // Update the state, excluding deleted forms
        setForms(prevForms => [...prevForms.filter(form => form.status !== 'deleted'), newForm]);
        setActiveForms(prevForms => [...prevForms, newForm]);
        
        router.push(`/forms/${newFormId}/edit`);
      } catch (error) {
        console.error("Detailed error in handleCreateForm:", error);
        setError(`Failed to create a new form: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.error("User not authenticated in handleCreateForm");
      setError("User not authenticated. Please sign in to create a form.");
    }
  };

  const handleUpdateDisplayName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName });
        setUser({ ...auth.currentUser, displayName });
        setIsDialogOpen(false);
        setError(null);
      } catch (error) {
        console.error("Error updating display name:", error);
        setError("Failed to update display name. Please try again.");
      }
    }
  };

  const handleDeleteForm = async (formId: string) => {
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append('formId', formId);
      await deleteForm(formData);
      
      // Update the local state to remove the deleted form
      setForms(prevForms => prevForms.filter(form => form.id !== formId));
      setActiveForms(prevForms => prevForms.filter(form => form.id !== formId));
      setSuspendedForms(prevForms => prevForms.filter(form => form.id !== formId));
      setDeletedForms(prevForms => prevForms.filter(form => form.id !== formId));

      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error deleting form:", error);
      setError("Failed to delete form. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (formData: FormData) => {
    setIsToggling(true);
    try {
      await toggleFormStatus(formData);
      await refreshForms();
    } catch (error) {
      console.error("Error toggling form status:", error);
      setError("Failed to toggle form status. Please try again.");
    } finally {
      setIsToggling(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to home page after sign out
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          {user?.displayName && (
            <p className="text-lg mt-2">Welcome, {user.displayName}!</p>
          )}
        </div>
        <div className="flex space-x-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                {user?.displayName ? 'Change Display Name' : 'Add Display Name'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{user?.displayName ? 'Change Display Name' : 'Add Display Name'}</DialogTitle>
                <DialogDescription>
                  Enter your new display name below. This name will be visible to others.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateDisplayName} className="space-y-4">
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                />
                <Button type="submit">Save</Button>
              </form>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </DialogContent>
          </Dialog>
          <Button onClick={handleCreateForm}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Form
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
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
            <FormTable 
              forms={forms} // This now contains only non-deleted forms
              onStatusChange={handleToggleStatus} 
              onDeleteForm={handleDeleteForm}
              isDeleting={isDeleting}
              isToggling={isToggling}
            />
          </Suspense>
        </TabsContent>
        <TabsContent value="active">
          <Suspense fallback={<div>Loading active forms...</div>}>
            <FormTable 
              forms={activeForms} 
              onStatusChange={handleToggleStatus} 
              onDeleteForm={handleDeleteForm}
              isDeleting={isDeleting}
              isToggling={isToggling}
            />
          </Suspense>
        </TabsContent>
        <TabsContent value="suspended">
          <Suspense fallback={<div>Loading suspended forms...</div>}>
            <FormTable 
              forms={suspendedForms} 
              onStatusChange={handleToggleStatus} 
              onDeleteForm={handleDeleteForm}
              isDeleting={isDeleting}
              isToggling={isToggling}
            />
          </Suspense>
        </TabsContent>
        <TabsContent value="deleted">
          <Suspense fallback={<div>Loading deleted forms...</div>}>
            <FormTable 
              forms={deletedForms} 
              onStatusChange={handleToggleStatus} 
              onDeleteForm={handleDeleteForm}
              isDeleting={isDeleting}
              isToggling={isToggling}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}