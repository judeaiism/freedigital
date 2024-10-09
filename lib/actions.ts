'use server'

import { db } from '@/lib/firebase'
import { addDoc, collection, getDocs, query, where, doc, updateDoc, getDoc, Timestamp, serverTimestamp } from 'firebase/firestore'

export async function createForm(userId: string, title: string, description: string) {
  try {
    const docRef = await addDoc(collection(db, 'forms'), {
      userId,
      title,
      description,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating form:", error);
    throw new Error('Failed to create form');
  }
}

// Add this function to fetch forms
export async function getFormsForUser(userId: string) {
  try {
    const formsQuery = query(collection(db, 'forms'), where('userId', '==', userId))
    const querySnapshot = await getDocs(formsQuery)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error fetching forms:", error)
    throw error
  }
}

export async function deleteForm(formData: FormData) {
  const formId = formData.get('formId') as string
  const formRef = doc(db, 'forms', formId)
  await updateDoc(formRef, { status: 'deleted' })
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

export async function updateForm(formData: FormData) {
  const formId = formData.get('formId') as string;
  if (!formId) {
    throw new Error('Form ID is required');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  if (!title || !description) {
    throw new Error('Title and description are required');
  }

  const formRef = doc(db, 'forms', formId);
  const formSnap = await getDoc(formRef);

  if (!formSnap.exists()) {
    throw new Error('Form not found');
  }

  await updateDoc(formRef, { 
    title, 
    description,
    updatedAt: new Date()
  });

  return formId;
}