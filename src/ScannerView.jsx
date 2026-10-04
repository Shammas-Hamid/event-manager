import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function ScannerView() {
  const [participant, setParticipant] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize scanner inside the #reader div
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

    scanner.render(async (scannedId) => {
      try {
        const docRef = doc(db, "participants", scannedId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setParticipant({ id: docSnap.id, ...docSnap.data() });
          setError('');
        } else {
          setError('Participant ID not found.');
        }
      } catch (err) {
        setError('Database lookup failed.');
      }
    }, () => {
      // Handles frame scanning errors silently
    });

    // Cleanup camera stream when leaving the page
    return () => scanner.clear().catch(() => {});
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto">
      <div id="reader" className="w-full"></div>

      {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}

      {participant && (
        <div className="mt-4 p-4 border rounded-lg shadow-md bg-white">
          <h3 className="text-lg font-bold text-gray-800">{participant.name}</h3>
          <p className="text-sm text-gray-600">Team: {participant.team}</p>
          <p className="text-xl font-bold text-blue-600 mt-2">Points: {participant.points}</p>
        </div>
      )}
    </div>
  );
}