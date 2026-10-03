import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, Users, Calendar, Award, CheckCircle, XCircle, 
  Plus, Search, ShieldCheck, BarChart3, Settings, AlertCircle,
  Camera, ArrowLeft, RefreshCw, Trash2, Edit, Download, Upload, Check
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [events, setEvents] = useState([
    { id: '1', name: 'Inter-School Coding Championship', date: '2026-10-15', venue: 'Tech Hall A', capacity: 100, registered: 45, status: 'Active' },
    { id: '2', name: 'Robotics Hackathon 2026', date: '2026-10-22', venue: 'Innovation Lab', capacity: 50, registered: 32, status: 'Active' },
    { id: '3', name: 'Science Fair & Exhibition', date: '2026-11-05', venue: 'Main Auditorium', capacity: 200, registered: 120, status: 'Upcoming' },
  ]);

  const [participants, setParticipants] = useState([
    { id: 'REG-1001', name: 'Alex Johnson', email: 'alex@school.edu', eventId: '1', school: 'Lincoln High', checkedIn: false, checkInTime: null },
    { id: 'REG-1002', name: 'Sarah Smith', email: 'sarah@academy.org', eventId: '1', school: 'Oakridge Academy', checkedIn: true, checkInTime: '10:15 AM' },
    { id: 'REG-1003', name: 'Michael Chen', email: 'mchen@techhigh.edu', eventId: '2', school: 'Silicon Valley High', checkedIn: false, checkInTime: null },
  ]);

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    if (isScannerOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isScannerOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check permissions or use manual code entry below.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleVerifyCode = (codeToVerify) => {
    const cleanCode = codeToVerify.trim();
    if (!cleanCode) {
      setScanResult({ success: false, message: 'Please enter a valid participant ID or email.' });
      return;
    }
    const participant = participants.find(p => p.id.toLowerCase() === cleanCode.toLowerCase() || p.email.toLowerCase() === cleanCode.toLowerCase());

    if (participant) {
      if (participant.checkedIn) {
        setScanResult({ success: true, message: `${participant.name} is already checked in!`, participant });
      } else {
        // Update checked-in status
        setParticipants(prev => prev.map(p => p.id === participant.id ? { ...p, checkedIn: true, checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : p));
        setScanResult({ success: true, message: `Successfully checked in ${participant.name}!`, participant: { ...participant, checkedIn: true } });
      }
    } else {
      setScanResult({ success: false, message: `Participant with code "${cleanCode}" not found in database.` });
    }
    setManualCode('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">EventHub Pro</h1>
            <p className="text-xs text-slate-400">Inter-School Event & QR Check-In System</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => { setScanResult(null); setIsScannerOpen(true); }}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Pass</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-900/50 border-r border-slate-800/80 p-4 hidden md:flex flex-col space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('events')} 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'events' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Calendar className="w-4 h-4" />
            <span>Events</span>
          </button>
          <button 
            onClick={() => setActiveTab('participants')} 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'participants' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Users className="w-4 h-4" />
            <span>Participants</span>
          </button>
        </aside>

        {/* Dynamic Tab Views */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-950">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                  <p className="text-slate-400 text-sm font-medium">Total Events</p>
                  <h3 className="text-3xl font-bold mt-2 text-white">{events.length}</h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                  <p className="text-slate-400 text-sm font-medium">Total Registered</p>
                  <h3 className="text-3xl font-bold mt-2 text-white">{participants.length}</h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                  <p className="text-slate-400 text-sm font-medium">Checked-In Today</p>
                  <h3 className="text-3xl font-bold mt-2 text-emerald-400">{participants.filter(p => p.checkedIn).length}</h3>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Check-In Actions</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => { setScanResult(null); setIsScannerOpen(true); }}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white p-6 rounded-xl flex items-center justify-center space-x-3 shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-lg font-semibold">Launch Live Camera QR Scanner</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Managed Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(ev => (
                  <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-white">{ev.name}</h3>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-medium">{ev.status}</span>
                    </div>
                    <p className="text-sm text-slate-400">📅 {ev.date} | 📍 {ev.venue}</p>
                    <p className="text-sm text-slate-300">Registered: <strong className="text-white">{ev.registered}</strong> / {ev.capacity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Registered Participants</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase bg-slate-900/50">
                      <th className="p-4">Reg ID</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">School</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {participants.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-mono text-indigo-400">{p.id}</td>
                        <td className="p-4 font-medium text-white">{p.name}</td>
                        <td className="p-4 text-slate-300">{p.school}</td>
                        <td className="p-4">
                          {p.checkedIn ? (
                            <span className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Checked In ({p.checkInTime})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-medium">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Live QR Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                <span>Live QR Check-In Scanner</span>
              </h3>
              <button 
                onClick={() => { setIsScannerOpen(false); setScanResult(null); }}
                className="text-slate-400 hover:text-white text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              {cameraError ? (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-300 text-sm flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              ) : (
                <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-slate-800">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-indigo-500/40 rounded-xl pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-dashed border-indigo-400/80 rounded-lg animate-pulse" />
                  </div>
                </div>
              )}

              {/* Manual input fallback */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Or enter Participant ID (e.g. REG-1001) or Email:</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="e.g. REG-1001"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode(manualCode)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={() => handleVerifyCode(manualCode)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  >
                    Verify
                  </button>
                </div>
              </div>

              {/* Scan feedback result */}
              {scanResult && (
                <div className={`p-4 rounded-xl border flex items-start space-x-3 ${scanResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
                  {scanResult.success ? <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" /> : <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{scanResult.message}</p>
                    {scanResult.participant && (
                      <div className="mt-2 text-xs opacity-90 space-y-1">
                        <p><strong>Name:</strong> {scanResult.participant.name}</p>
                        <p><strong>School:</strong> {scanResult.participant.school}</p>
                        <p><strong>ID:</strong> {scanResult.participant.id}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => { setIsScannerOpen(false); setScanResult(null); }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              >
                Close Scanner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}