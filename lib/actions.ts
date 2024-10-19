'use server'

import { db } from '@/lib/firebase'
import { updateDoc, serverTimestamp, doc, getDoc, setDoc, Timestamp, increment, arrayUnion } from 'firebase/firestore'
import { Form } from '@/lib/types';

// Add this interface definition at the top of the file
interface AnalyticsData {
  views: number;
  submissions: number;
  downloads: number;
  locations: string[];
  submissionDates: string[];
  bounceRate: string;
  trafficSources: Record<string, number>;
}

export async function createForm(userId: string, title: string, description: string, displayName: string, fileUrl?: string) {
  try {
    console.log("Creating form for user:", userId);

    const uniqueId = `${displayName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    console.log("Generated unique ID:", uniqueId);

    const formData = {
      id: uniqueId,
      userId,
      title,
      description,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      fileUrl: fileUrl || null, // Add the fileUrl field
    };

    console.log("Attempting to add document to Firestore:", formData);

    const docRef = doc(db, 'forms', uniqueId);
    await setDoc(docRef, formData);

    console.log("Form created successfully with ID:", uniqueId);

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Form with ID ${uniqueId} not found after creation`);
    }

    return uniqueId;
  } catch (error) {
    console.error("Detailed error in createForm:", error);
    throw new Error(`Failed to create form: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function deleteForm(formData: FormData) {
  const formId = formData.get('formId') as string;
  if (!formId) {
    throw new Error('Form ID is required');
  }

  try {
    const formRef = doc(db, 'forms', formId);
    const formSnap = await getDoc(formRef);

    if (!formSnap.exists()) {
      console.log(`Form with ID ${formId} not found. It may have been already deleted.`);
      return null;
    }

    const formData = formSnap.data();
    const updatedForm = {
      id: formId,
      userId: formData.userId,
      title: formData.title,
      description: formData.description,
      status: 'deleted',
      createdAt: formData.createdAt.toDate().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await updateDoc(formRef, {
      status: 'deleted',
      updatedAt: serverTimestamp()
    });

    console.log(`Form ${formId} marked as deleted successfully`);

    return updatedForm; // Return a plain object
  } catch (error) {
    console.error(`Error deleting form ${formId}:`, error);
    throw new Error(`Failed to delete form: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function toggleFormStatus(formData: FormData) {
  const formId = formData.get('formId') as string;
  if (!formId) {
    throw new Error('Form ID is required');
  }

  const formRef = doc(db, 'forms', formId);
  const formSnap = await getDoc(formRef);

  if (!formSnap.exists()) {
    throw new Error('Form not found');
  }

  const currentStatus = formSnap.data().status;
  const newStatus = currentStatus === 'active' ? 'suspended' : 'active';

  await updateDoc(formRef, { status: newStatus });
}

export async function updateForm(formId: string, title: string, description: string) {
  if (!formId) {
    throw new Error('Form ID is required');
  }

  if (!title || !description) {
    throw new Error('Title and description are required');
  }

  try {
    console.log(`Attempting to update form with ID: ${formId}`);
    const formRef = doc(db, 'forms', formId);
    const formSnap = await getDoc(formRef);

    if (!formSnap.exists()) {
      console.error(`Form with ID ${formId} not found in Firestore`);
      throw new Error(`Form with ID ${formId} not found`);
    }

    await updateDoc(formRef, { 
      title, 
      description,
      updatedAt: serverTimestamp()
    });

    console.log(`Form ${formId} updated successfully`);
    return formId;
  } catch (error) {
    console.error(`Error updating form ${formId}:`, error);
    throw new Error(`Failed to update form: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getFormById(formId: string): Promise<Form> {
  const formRef = doc(db, 'forms', formId);
  const formSnap = await getDoc(formRef);

  if (!formSnap.exists()) {
    throw new Error(`Form with ID ${formId} not found`);
  }

  const data = formSnap.data();
  return {
    id: formId,
    userId: data.userId,
    title: data.title,
    description: data.description,
    status: data.status,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt
  };
}

// Function to record a form view
export async function recordFormView(formId: string, location: string, source: string) {
  const analyticsRef = doc(db, 'formAnalytics', formId);
  await setDoc(analyticsRef, {
    views: increment(1),
    locations: arrayUnion(location),
    [`trafficSources.${source}`]: increment(1)
  }, { merge: true });
}

// Function to record a form submission
export async function recordFormSubmission(formId: string) {
  const analyticsRef = doc(db, 'formAnalytics', formId);
  await updateDoc(analyticsRef, {
    submissions: increment(1)
  });
}

// Function to record a file download
export async function recordFileDownload(formId: string) {
  const analyticsRef = doc(db, 'formAnalytics', formId);
  await updateDoc(analyticsRef, {
    downloads: increment(1)
  });
}

// Function to get analytics for a form
export async function getFormAnalytics(formId: string): Promise<AnalyticsData | null> {
  const analyticsRef = doc(db, 'formAnalytics', formId);
  const analyticsSnap = await getDoc(analyticsRef);
  if (analyticsSnap.exists()) {
    const data = analyticsSnap.data();
    const views = data.views || 0;
    const submissions = data.submissions || 0;
    const downloads = data.downloads || 0;
    const bounceRate = views > 0 ? ((views - submissions) / views * 100).toFixed(2) : '0';
    return {
      views,
      submissions,
      downloads,
      locations: data.locations || [],
      submissionDates: data.submissionDates || [],
      bounceRate,
      trafficSources: data.trafficSources || {
        direct: 0,
        'social-facebook': 0,
        'social-twitter': 0,
        'social-linkedin': 0,
        'social-instagram': 0,
        email: 0,
        'search-google': 0,
        'search-bing': 0,
        'search-other': 0,
        referral: 0,
      }
    };
  }
  return null;
}
