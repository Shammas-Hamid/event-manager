import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

// Firebase Firestore imports
import { db } from './firebaseConfig';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState(() => {
  const savedData = localStorage.getItem('app_participants');
  return savedData ? JSON.parse(savedData) : [];
});

// Sync main state to localStorage whenever it changes
useEffect(() => {
  localStorage.setItem('app_participants', JSON.stringify(participants));
}, [participants]);
  const [loading, setLoading] = useState(true);

  // 1. Real-time Firestore sync: Listen for participant updates
  useEffect(() => {
    const colRef = collection(db, 'participants');

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const participantData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));
        setParticipants(participantData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching participants from Firestore:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Authentication Handlers
  const handleLogin = (userData) => {
    console.log('User logged in successfully:', userData);
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // 3. Firestore Action Handlers
  const handleAddParticipant = async (newParticipant) => {
    try {
      await addDoc(collection(db, 'participants'), {
        ...newParticipant,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to add participant:', error);
    }
  };

  const handleUpdateParticipant = async (id, updatedFields) => {
    try {
      const docRef = doc(db, 'participants', id);
      await updateDoc(docRef, updatedFields);
    } catch (error) {
      console.error('Failed to update participant:', error);
    }
  };

  const handleDeleteParticipant = async (id) => {
    try {
      const docRef = doc(db, 'participants', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete participant:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {!user ? (
        <AdminLogin onLogin={handleLogin} />
      ) : (
        <AdminDashboard
          user={user}
          onLogout={handleLogout}
          participants={participants}
          isLoadingParticipants={loading}
          onAddParticipant={handleAddParticipant}
          onUpdateParticipant={handleUpdateParticipant}
          onDeleteParticipant={handleDeleteParticipant}
        />
      )}
    </div>
  );
}