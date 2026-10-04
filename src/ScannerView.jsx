import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export default function QRScannerTab({ processCode, selectedModule }) {
  useEffect(() => {
    // Initialize scanner with 10 FPS and a 250x250 scanning box
    const scanner = new Html5QrcodeScanner('qr-reader-container', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    });

    scanner.render(
      (decodedText) => {
        // Pass decoded text directly into your attendance processor
        processCode(decodedText);
      },
      (error) => {
        // Optional scan frame parsing errors
      }
    );

    // Clean up media stream when component unmounts or tab switches
    return () => {
      scanner.clear().catch((err) => console.error("Failed to clear scanner:", err));
    };
  }, [selectedModule]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h3 className="text-lg font-semibold mb-2">
        Scanning for Module: <span className="text-blue-600">{selectedModule}</span>
      </h3>
      
      {/* Target container for camera stream */}
      <div id="qr-reader-container" className="w-full max-w-md overflow-hidden rounded-lg shadow-lg"></div>
    </div>
  );
}
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