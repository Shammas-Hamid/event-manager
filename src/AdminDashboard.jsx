import QRCode from 'react-qr-code';
import { db } from './firebaseConfig';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Award,
  QrCode,
  Calendar,
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  FileText,
  Download,
  Upload,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp,
  Check,
  X,
  ChevronRight,
  Filter,
  Activity,
  UserPlus,
  FolderPlus,
  BookOpen,
  Shield,
  Zap,
  Info,
  ChevronDown,
  GraduationCap,
  Trophy,
  Star,
  Send,
  LogOut,
  Camera,
  CheckCircle,
  XCircle,
  Hash,
  Mail,
  User,
  Layers,
  CheckSquare,
  Database
} from 'lucide-react';

const INITIAL_MODULES = [
  {
    id: 'MOD-001',
    code: 'CS-101',
    name: 'Code Sprint Hackathon',
    venue: 'Lab 3, Tech Wing',
    maxPoints: 100,
    coordinator: 'Dr. Alan Turing',
    schedule: '09:00 AM - 12:00 PM',
    description: 'Rapid algorithmic challenge & interactive web developer speedrun.',
    status: 'Active'
  },
  {
    id: 'MOD-002',
    code: 'RB-201',
    name: 'RoboWars Arena',
    venue: 'Main Gymnasium',
    maxPoints: 150,
    coordinator: 'Prof. Sarah Connor',
    schedule: '01:00 PM - 04:00 PM',
    description: 'Autonomous robotics combat and speed obstacle maze clearing.',
    status: 'Active'
  },
  {
    id: 'MOD-003',
    code: 'QZ-301',
    name: 'Grand Inter-School Quiz',
    venue: 'Auditorium Hall B',
    maxPoints: 80,
    coordinator: 'Mr. Ken Jennings',
    schedule: '10:30 AM - 12:30 PM',
    description: 'General science, innovation history, and rapid-fire trivia.',
    status: 'Upcoming'
  },
  {
    id: 'MOD-004',
    code: 'DS-401',
    name: 'UI/UX Designathon',
    venue: 'Design Studio 1',
    maxPoints: 100,
    coordinator: 'Ms. Jony Ive',
    schedule: '02:00 PM - 05:00 PM',
    description: 'User-centered design sprint and interactive interface prototyping.',
    status: 'Upcoming'
  }
];

const INITIAL_ADMINS = [
  {
    id: 'ADM-101',
    name: 'Alexander Wright',
    email: 'alexander.w@eventhub.edu',
    role: 'Super Admin',
    assignedVenue: 'All Venues',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 'ADM-102',
    name: 'Elena Rostova',
    email: 'elena.r@eventhub.edu',
    role: 'Module Leader',
    assignedVenue: 'Main Gymnasium (RoboWars)',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    id: 'ADM-103',
    name: 'Marcus Vance',
    email: 'marcus.v@eventhub.edu',
    role: 'Scoring Official',
    assignedVenue: 'Lab 3 (Code Sprint)',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'ADM-104',
    name: 'Sophia Chen',
    email: 'sophia.c@eventhub.edu',
    role: 'Event Staff',
    assignedVenue: 'Registration Desk',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
  }
];

const INITIAL_PARTICIPANTS = [];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'LOG-001',
    timestamp: '2026-10-03 09:00:12',
    action: 'SYSTEM_START',
    category: 'System',
    details: 'EventHub Inter-School Management System initialized successfully.',
    user: 'System Admin'
  },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('admin');

  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
  const [admins, setAdmins] = useState(INITIAL_ADMINS);
  const [modules, setModules] = useState(INITIAL_MODULES);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  const [participantSearch, setParticipantSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL');

  const [adminSearch, setAdminSearch] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState('ALL');

  const [moduleSearch, setModuleSearch] = useState('');
  const [moduleStatusFilter, setModuleStatusFilter] = useState('ALL');

  const [logSearch, setLogSearch] = useState('');
  const [logCategoryFilter, setLogCategoryFilter] = useState('ALL');

  const [participantModal, setParticipantModal] = useState({ open: false, mode: 'add', data: null });
  const [adminModal, setAdminModal] = useState({ open: false, mode: 'add', data: null });
  const [moduleModal, setModuleModal] = useState({ open: false, mode: 'add', data: null });
  const [csvImportModal, setCsvImportModal] = useState({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', id: null, name: '', warningMsg: '' });
  const [qrCardModal, setQrCardModal] = useState({ open: false, participant: null });
  const [scoreModal, setScoreModal] = useState({ open: false, participant: null });

  const [portalParticipantId, setPortalParticipantId] = useState('PAR-801');
  const [firestoreSynced, setFirestoreSynced] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Firestore Real-Time Subscriptions
  useEffect(() => {
    if (!firestoreSynced) return;

    const unsubParticipants = onSnapshot(collection(db, 'participants'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setParticipants(list);
      }
    }, (err) => console.warn("Firestore Participants Listener Notice:", err.message));

    const unsubAdmins = onSnapshot(collection(db, 'admins'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAdmins(list);
      }
    }, (err) => console.warn("Firestore Admins Listener Notice:", err.message));

    const unsubModules = onSnapshot(collection(db, 'modules'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setModules(list);
      }
    }, (err) => console.warn("Firestore Modules Listener Notice:", err.message));

    const unsubLogs = onSnapshot(collection(db, 'auditLogs'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAuditLogs(list);
      }
    }, (err) => console.warn("Firestore Logs Listener Notice:", err.message));

    return () => {
      unsubParticipants();
      unsubAdmins();
      unsubModules();
      unsubLogs();
    };
  }, [firestoreSynced]);

  const addToast = (title, message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const addAuditLog = async (action, category, details, user = 'Current Admin') => {
    const logId = `LOG-${Date.now().toString().slice(-4)}`;
    const newLog = {
      id: logId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action,
      category,
      details,
      user
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    if (firestoreSynced) {
      try {
        await setDoc(doc(db, 'auditLogs', logId), newLog);
      } catch (e) {
        console.error("Error persisting audit log to Firestore:", e);
      }
    }
  };

  const handleSaveParticipant = async (formData) => {
    if (participantModal.mode === 'add') {
      const newPartId = `PAR-${Math.floor(800 + Math.random() * 100)}`;
      const qrCode = formData.qrCode?.trim() || `EVT-2026-${Math.floor(100 + Math.random() * 899)}`;
      const newParticipant = {
        ...formData,
        id: newPartId,
        qrCode,
        points: Number(formData.points) || 0,
        enrolledModules: formData.enrolledModules || [],
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setParticipants((prev) => [newParticipant, ...prev]);
      if (firestoreSynced) {
        await setDoc(doc(db, 'participants', newPartId), newParticipant);
      }
      addAuditLog('PARTICIPANT_ADD', 'Participant', `Added participant ${newParticipant.name} (${newParticipant.school}).`);
      addToast('Participant Created', `${newParticipant.name} has been enrolled successfully.`);
    } else {
      const updatedParticipant = { ...formData, points: Number(formData.points) || 0 };
      setParticipants((prev) =>
        prev.map((p) => (p.id === formData.id ? updatedParticipant : p))
      );
      if (firestoreSynced) {
        await setDoc(doc(db, 'participants', formData.id), updatedParticipant, { merge: true });
      }
      addAuditLog('PARTICIPANT_EDIT', 'Participant', `Updated details for participant ${formData.name} (${formData.id}).`);
      addToast('Participant Updated', `Saved changes for ${formData.name}.`);
    }
    setParticipantModal({ open: false, mode: 'add', data: null });
  };

  const handleBatchImportParticipants = async (importedRows) => {
    if (!importedRows || importedRows.length === 0) return;

    const formatted = importedRows.map((row, idx) => {
      const randId = Math.floor(810 + Math.random() * 890);
      return {
        id: row.id || `PAR-${randId + idx}`,
        qrCode: row.qrCode || `EVT-2026-${randId + idx}`,
        name: row.name || row.Name || 'Unnamed Participant',
        school: row.school || row.School || 'Unassigned School',
        class: row.class || row.Class || 'Grade 11',
        team: row.team || row.Team || 'General Team',
        points: Number(row.points || row.Points) || 0,
        attendance: row.attendance || row.Attendance || 'Present',
        enrolledModules: typeof row.enrolledModules === 'string' ? row.enrolledModules.split(';') : ['CS-101'],
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
    });

    setParticipants((prev) => [...formatted, ...prev]);

    if (firestoreSynced) {
      for (const item of formatted) {
        await setDoc(doc(db, 'participants', item.id), item);
      }
    }

    addAuditLog('BATCH_CSV_IMPORT', 'Participant', `Batch imported ${formatted.length} participants via CSV.`);
    addToast('Import Successful', `Added ${formatted.length} new participants to event roster.`);
    setCsvImportModal({ open: false });
  };

  const exportParticipantsCSV = () => {
    const headers = ['Participant ID', 'QR Code', 'Name', 'School', 'Class', 'Team', 'Points', 'Attendance', 'Modules', 'Created At'];
    const rows = filteredParticipants.map((p) => [
      p.id,
      p.qrCode,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.school || '').replace(/"/g, '""')}"`,
      `"${(p.class || '').replace(/"/g, '""')}"`,
      `"${(p.team || '').replace(/"/g, '""')}"`,
      p.points,
      p.attendance,
      `"${(p.enrolledModules || []).join(';')}"`,
      p.createdAt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EventHub_Participants_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Export Complete', 'Exported participants list to CSV.', 'info');
  };

  const handleDeleteParticipant = async (id) => {
    const target = participants.find((p) => p.id === id);
    if (!target) return;
    setParticipants((prev) => prev.filter((p) => p.id !== id));

    if (firestoreSynced) {
      await deleteDoc(doc(db, 'participants', id));
    }

    addAuditLog('PARTICIPANT_DELETE', 'Participant', `Removed participant ${target.name} (${target.id}) from system.`);
    addToast('Participant Removed', `${target.name} has been deleted.`, 'warning');
    setDeleteConfirm({ open: false, type: '', id: null, name: '', warningMsg: '' });
  };

  const handleUpdatePoints = async (participantId, pointsToAdd, reason) => {
    let updatedParticipantName = '';
    let finalPoints = 0;

    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          finalPoints = Math.max(0, (Number(p.points) || 0) + pointsToAdd);
          updatedParticipantName = p.name;
          return { ...p, points: finalPoints };
        }
        return p;
      })
    );

    if (firestoreSynced) {
      await updateDoc(doc(db, 'participants', participantId), { points: finalPoints });
    }

    if (updatedParticipantName) {
      addAuditLog('POINTS_UPDATED', 'Participant', `Adjusted points for ${updatedParticipantName} by ${pointsToAdd > 0 ? '+' : ''}${pointsToAdd} pts (${reason || 'Manual'}).`);
      addToast('Points Updated', `${updatedParticipantName} now has ${finalPoints} points.`);
    }
  };

  const handleToggleAttendance = async (participantId, status) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, attendance: status } : p))
    );

    if (firestoreSynced) {
      await updateDoc(doc(db, 'participants', participantId), { attendance: status });
    }

    const target = participants.find((p) => p.id === participantId);
    if (target) {
      addAuditLog('ATTENDANCE_CHANGE', 'Participant', `Updated attendance status for ${target.name} to '${status}'.`);
      addToast('Attendance Updated', `${target.name} status changed to ${status}.`, 'info');
    }
  };

  const handleSaveAdmin = async (formData) => {
    if (adminModal.mode === 'add') {
      const newAdminId = `ADM-${Math.floor(100 + Math.random() * 899)}`;
      const newAdmin = {
        ...formData,
        id: newAdminId,
        avatar: formData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      };
      setAdmins((prev) => [newAdmin, ...prev]);

      if (firestoreSynced) {
        await setDoc(doc(db, 'admins', newAdminId), newAdmin);
      }

      addAuditLog('ADMIN_ADD', 'Admin', `Added new admin/staff user ${newAdmin.name} (${newAdmin.role}).`);
      addToast('Admin Account Created', `${newAdmin.name} added to staff directory.`);
    } else {
      setAdmins((prev) => prev.map((a) => (a.id === formData.id ? { ...formData } : a)));

      if (firestoreSynced) {
        await setDoc(doc(db, 'admins', formData.id), formData, { merge: true });
      }

      addAuditLog('ADMIN_EDIT', 'Admin', `Modified privileges/details for admin user ${formData.name}.`);
      addToast('Admin Profile Saved', `Updated info for ${formData.name}.`);
    }
    setAdminModal({ open: false, mode: 'add', data: null });
  };

  const handleDeleteAdmin = async (id) => {
    const target = admins.find((a) => a.id === id);
    if (!target) return;
    setAdmins((prev) => prev.filter((a) => a.id !== id));

    if (firestoreSynced) {
      await deleteDoc(doc(db, 'admins', id));
    }

    addAuditLog('ADMIN_DELETE', 'Admin', `Revoked access and deleted admin ${target.name} (${target.email}).`);
    addToast('Admin Access Revoked', `${target.name} removed from admin team.`, 'warning');
    setDeleteConfirm({ open: false, type: '', id: null, name: '', warningMsg: '' });
  };

  const handleSaveModule = async (formData) => {
    if (moduleModal.mode === 'add') {
      const newModId = `MOD-${Math.floor(100 + Math.random() * 899)}`;
      const newMod = {
        ...formData,
        id: newModId,
        maxPoints: Number(formData.maxPoints) || 100
      };
      setModules((prev) => [newMod, ...prev]);

      if (firestoreSynced) {
        await setDoc(doc(db, 'modules', newModId), newMod);
      }

      addAuditLog('MODULE_ADD', 'Module', `Created new competition module: ${newMod.name} [${newMod.code}].`);
      addToast('Module Added', `Competition module '${newMod.name}' is now active.`);
    } else {
      const updatedModule = { ...formData, maxPoints: Number(formData.maxPoints) || 0 };
      setModules((prev) =>
        prev.map((m) => (m.id === formData.id ? updatedModule : m))
      );

      if (firestoreSynced) {
        await setDoc(doc(db, 'modules', formData.id), updatedModule, { merge: true });
      }

      addAuditLog('MODULE_EDIT', 'Module', `Updated parameters for module ${formData.name} [${formData.code}].`);
      addToast('Module Updated', `Saved parameters for ${formData.name}.`);
    }
    setModuleModal({ open: false, mode: 'add', data: null });
  };

  const handleDeleteModule = async (id) => {
    const target = modules.find((m) => m.id === id);
    if (!target) return;

    const enrolledCount = participants.filter((p) => p.enrolledModules?.includes(target.code)).length;

    setParticipants((prev) =>
      prev.map((p) => ({
        ...p,
        enrolledModules: p.enrolledModules?.filter((code) => code !== target.code) || []
      }))
    );

    setModules((prev) => prev.filter((m) => m.id !== id));

    if (firestoreSynced) {
      await deleteDoc(doc(db, 'modules', id));
    }

    addAuditLog('MODULE_DELETE', 'Module', `Deleted module ${target.name} [${target.code}]. Unenrolled ${enrolledCount} participants.`);
    addToast('Module Removed', `Deleted module ${target.name}.`, 'warning');
    setDeleteConfirm({ open: false, type: '', id: null, name: '', warningMsg: '' });
  };

  const filteredParticipants = useMemo(() => {
    const query = (participantSearch || '').toLowerCase();
    return participants.filter((p) => {
      const matchesSearch =
        (p.name || '').toLowerCase().includes(query) ||
        (p.school || '').toLowerCase().includes(query) ||
        (p.team || '').toLowerCase().includes(query) ||
        (p.qrCode || '').toLowerCase().includes(query);
      const matchesSchool = schoolFilter === 'ALL' || p.school === schoolFilter;
      const matchesAttendance = attendanceFilter === 'ALL' || p.attendance === attendanceFilter;
      return matchesSearch && matchesSchool && matchesAttendance;
    });
  }, [participants, participantSearch, schoolFilter, attendanceFilter]);

  const uniqueSchools = useMemo(() => {
    const set = new Set(participants.map((p) => p.school).filter(Boolean));
    return Array.from(set);
  }, [participants]);

  const filteredAdmins = useMemo(() => {
    const query = (adminSearch || '').toLowerCase();
    return admins.filter((a) => {
      const matchesSearch =
        (a.name || '').toLowerCase().includes(query) ||
        (a.email || '').toLowerCase().includes(query) ||
        (a.assignedVenue || '').toLowerCase().includes(query);
      const matchesRole = adminRoleFilter === 'ALL' || a.role === adminRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [admins, adminSearch, adminRoleFilter]);

  const filteredModules = useMemo(() => {
    const query = (moduleSearch || '').toLowerCase();
    return modules.filter((m) => {
      const matchesSearch =
        (m.name || '').toLowerCase().includes(query) ||
        (m.code || '').toLowerCase().includes(query) ||
        (m.venue || '').toLowerCase().includes(query) ||
        (m.coordinator || '').toLowerCase().includes(query);
      const matchesStatus = moduleStatusFilter === 'ALL' || m.status === moduleStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [modules, moduleSearch, moduleStatusFilter]);

  const filteredAuditLogs = useMemo(() => {
    const query = (logSearch || '').toLowerCase();
    return auditLogs.filter((log) => {
      const matchesSearch =
        (log.details || '').toLowerCase().includes(query) ||
        (log.user || '').toLowerCase().includes(query) ||
        (log.action || '').toLowerCase().includes(query);
      const matchesCategory = logCategoryFilter === 'ALL' || log.category === logCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [auditLogs, logSearch, logCategoryFilter]);

  const downloadLogsCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Category', 'Action', 'Details', 'User'];
    const rows = filteredAuditLogs.map((log) => [
      log.id,
      log.timestamp,
      log.category,
      log.action,
      `"${(log.details || '').replace(/"/g, '""')}"`,
      log.user
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EventHub_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Audit Log Exported', 'Downloaded audit logs as CSV.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased">
      {/* Toast Host */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all transform ${
              toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-100'
                : toast.type === 'info'
                ? 'bg-sky-950/90 border-sky-500/50 text-sky-100'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100'
            }`}
          >
            {toast.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-sm">
              <h4 className="font-semibold text-white">{toast.title}</h4>
              <p className="opacity-90 leading-snug">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Navbar */}
      <header className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  EventHub
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Inter-School Suite
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFirestoreSynced(!firestoreSynced)}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  firestoreSynced
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
                title="Toggle Firebase Firestore real-time state sync mode"
              >
                <Database className="w-3.5 h-3.5" />
                {firestoreSynced ? 'Firestore Sync: Active' : 'Offline Mode'}
              </button>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setViewMode('admin')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'admin'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Dashboard
                </button>
                <button
                  onClick={() => setViewMode('participant')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'participant'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Participant Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      {viewMode === 'participant' ? (
        <ParticipantPortalView
          participants={participants}
          modules={modules}
          portalParticipantId={portalParticipantId}
          setPortalParticipantId={setPortalParticipantId}
        />
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
          {/* Admin Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'participants'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              Participants ({participants.length})
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'admins'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin Users ({admins.length})
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'modules'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Modules ({modules.length})
            </button>
            <button
              onClick={() => setActiveTab('qr-scanner')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'qr-scanner'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              Live QR Check-In
            </button>
            <button
              onClick={() => setActiveTab('audit-logs')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'audit-logs'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Audit Stream ({auditLogs.length})
            </button>
          </div>

          {/* Tab Views */}
          {activeTab === 'dashboard' && (
            <DashboardTab
              participants={participants}
              admins={admins}
              modules={modules}
              auditLogs={auditLogs}
              setActiveTab={setActiveTab}
              setParticipantModal={setParticipantModal}
              setAdminModal={setAdminModal}
              setModuleModal={setModuleModal}
              setCsvImportModal={setCsvImportModal}
            />
          )}

          {activeTab === 'participants' && (
            <ParticipantsTab
              participants={filteredParticipants}
              allParticipants={participants}
              uniqueSchools={uniqueSchools}
              search={participantSearch}
              setSearch={setParticipantSearch}
              schoolFilter={schoolFilter}
              setSchoolFilter={setSchoolFilter}
              attendanceFilter={attendanceFilter}
              setAttendanceFilter={setAttendanceFilter}
              setParticipantModal={setParticipantModal}
              setCsvImportModal={setCsvImportModal}
              exportParticipantsCSV={exportParticipantsCSV}
              setDeleteConfirm={setDeleteConfirm}
              setQrCardModal={setQrCardModal}
              setScoreModal={setScoreModal}
              handleToggleAttendance={handleToggleAttendance}
            />
          )}

          {activeTab === 'admins' && (
            <AdminsTab
              admins={filteredAdmins}
              search={adminSearch}
              setSearch={setAdminSearch}
              roleFilter={adminRoleFilter}
              setRoleFilter={setAdminRoleFilter}
              setAdminModal={setAdminModal}
              setDeleteConfirm={setDeleteConfirm}
            />
          )}

          {activeTab === 'modules' && (
            <ModulesTab
              modules={filteredModules}
              search={moduleSearch}
              setSearch={setModuleSearch}
              statusFilter={moduleStatusFilter}
              setStatusFilter={setModuleStatusFilter}
              setModuleModal={setModuleModal}
              setDeleteConfirm={setDeleteConfirm}
              participants={participants}
            />
          )}

          {activeTab === 'qr-scanner' && (
            <QRScannerTab
              participants={participants}
              handleToggleAttendance={handleToggleAttendance}
              handleUpdatePoints={handleUpdatePoints}
              modules={modules}
            />
          )}

          {activeTab === 'audit-logs' && (
            <AuditLogsTab
              auditLogs={filteredAuditLogs}
              search={logSearch}
              setSearch={setLogSearch}
              categoryFilter={logCategoryFilter}
              setCategoryFilter={setLogCategoryFilter}
              downloadLogsCSV={downloadLogsCSV}
            />
          )}
        </div>
      )}

      {/* CSV Batch Import Modal */}
      {csvImportModal.open && (
        <CSVImportModal
          onClose={() => setCsvImportModal({ open: false })}
          onImport={handleBatchImportParticipants}
        />
      )}

      {/* Participant Form Modal */}
      {participantModal.open && (
        <ParticipantFormModal
          mode={participantModal.mode}
          initialData={participantModal.data}
          modules={modules}
          onClose={() => setParticipantModal({ open: false, mode: 'add', data: null })}
          onSave={handleSaveParticipant}
        />
      )}

      {/* Admin Form Modal */}
      {adminModal.open && (
        <AdminFormModal
          mode={adminModal.mode}
          initialData={adminModal.data}
          modules={modules}
          onClose={() => setAdminModal({ open: false, mode: 'add', data: null })}
          onSave={handleSaveAdmin}
        />
      )}

      {/* Module Form Modal */}
      {moduleModal.open && (
        <ModuleFormModal
          mode={moduleModal.mode}
          initialData={moduleModal.data}
          admins={admins}
          onClose={() => setModuleModal({ open: false, mode: 'add', data: null })}
          onSave={handleSaveModule}
        />
      )}

      {/* Score / Points Modal */}
      {scoreModal.open && scoreModal.participant && (
        <AdjustPointsModal
          participant={scoreModal.participant}
          onClose={() => setScoreModal({ open: false, participant: null })}
          onUpdate={handleUpdatePoints}
        />
      )}

      {/* QR Code Pass Modal */}
      {qrCardModal.open && qrCardModal.participant && (
        <QRCardModal
          participant={qrCardModal.participant}
          onClose={() => setQrCardModal({ open: false, participant: null })}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Confirm Removal</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">
              Are you sure you want to remove <strong className="text-white">{deleteConfirm.name}</strong>?
            </p>
            {deleteConfirm.warningMsg && (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 mb-4">
                {deleteConfirm.warningMsg}
              </p>
            )}
            <p className="text-xs text-slate-400 mb-6">
              This action will be permanently recorded in the system audit logs.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ open: false, type: '', id: null, name: '', warningMsg: '' })}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirm.type === 'participant') handleDeleteParticipant(deleteConfirm.id);
                  if (deleteConfirm.type === 'admin') handleDeleteAdmin(deleteConfirm.id);
                  if (deleteConfirm.type === 'module') handleDeleteModule(deleteConfirm.id);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30 transition-colors"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ParticipantPortalView({ participants = [], modules = [], portalParticipantId, setPortalParticipantId }) {
  const currentParticipant = participants.find((p) => p.id === portalParticipantId) || participants[0];

  if (!currentParticipant) {
    return <div className="p-8 text-center text-slate-400">No participant profiles found.</div>;
  }

  const enrolled = modules.filter((m) => currentParticipant.enrolledModules?.includes(m.code));

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            Participant Self-Service Portal
          </h2>
          <p className="text-xs text-slate-400">View real-time event badge, schedule, and live standings.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-400 shrink-0">Switch Profile:</span>
          <select
            value={currentParticipant.id}
            onChange={(e) => setPortalParticipantId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-emerald-500 w-full sm:w-60"
          >
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.school})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center text-center space-y-4 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
            Official Access Pass
          </span>

          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-indigo-500/30">
            {currentParticipant.name?.charAt(0) || 'P'}
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">{currentParticipant.name}</h3>
            <p className="text-xs text-indigo-400 font-medium">{currentParticipant.team}</p>
            <p className="text-xs text-slate-400 mt-1">{currentParticipant.school} • {currentParticipant.class}</p>
          </div>

          {/* Dynamic QR barcode */}
          <div className="p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center border border-slate-700">
            <QRCode
              value={currentParticipant.qrCode || currentParticipant.id || 'EVT-2026-000'}
              size={130}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          </div>
          <span className="font-mono text-xs text-indigo-400 tracking-wider font-semibold">
            {currentParticipant.qrCode || currentParticipant.id}
          </span>

          <div className="grid grid-cols-2 gap-3 w-full pt-2 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Current Rank</span>
              <span className="text-lg font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <Trophy className="w-4 h-4" /> Top 5
              </span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Total Points</span>
              <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{currentParticipant.points} pts</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Enrolled Competition Modules ({enrolled.length})
            </h3>

            {enrolled.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No competition modules currently assigned.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrolled.map((mod) => (
                  <div key={mod.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                        {mod.code}
                      </span>
                      <span className="text-[11px] text-amber-400 font-medium">Max {mod.maxPoints} pts</span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{mod.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {mod.venue}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> {mod.schedule}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Live Venue Status & Announcements
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
                <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">Main Gymnasium Check-In Open</p>
                  <p className="text-slate-400">RoboWars Arena participants please report for safety check by 12:45 PM.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardTab({ participants = [], admins = [], modules = [], auditLogs = [], setActiveTab, setParticipantModal, setAdminModal, setModuleModal, setCsvImportModal }) {
  const totalPoints = participants.reduce((sum, p) => sum + (Number(p.points) || 0), 0);
  const presentCount = participants.filter((p) => p.attendance === 'Present').length;
  const attendanceRate = Math.round((presentCount / (participants.length || 1)) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Participants</span>
            <span className="text-2xl font-bold text-white mt-1 block">{participants.length}</span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Enrolled across schools
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
            <span className="text-2xl font-bold text-white mt-1 block">{attendanceRate}%</span>
            <span className="text-[11px] text-slate-400 mt-1 block">{presentCount} of {participants.length} Present</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Modules</span>
            <span className="text-2xl font-bold text-white mt-1 block">{modules.length}</span>
            <span className="text-[11px] text-indigo-400 mt-1 block">Competitions Live</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Points Awarded</span>
            <span className="text-2xl font-bold text-white mt-1 block">{totalPoints}</span>
            <span className="text-[11px] text-teal-400 mt-1 block">Across all scores</span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" /> Quick Operations
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setParticipantModal({ open: true, mode: 'add', data: null })}
              className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all"
            >
              <UserPlus className="w-5 h-5 text-indigo-400 mb-1" />
              <span className="text-xs font-semibold text-white block">Add Participant</span>
              <span className="text-[10px] text-slate-400">Enroll new student</span>
            </button>
            <button
              onClick={() => setCsvImportModal({ open: true })}
              className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all"
            >
              <FileSpreadsheet className="w-5 h-5 text-sky-400 mb-1" />
              <span className="text-xs font-semibold text-white block">Import CSV / Excel</span>
              <span className="text-[10px] text-slate-400">Batch add roster</span>
            </button>
            <button
              onClick={() => setModuleModal({ open: true, mode: 'add', data: null })}
              className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all"
            >
              <FolderPlus className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-xs font-semibold text-white block">Add Module</span>
              <span className="text-[10px] text-slate-400">New competition</span>
            </button>
            <button
              onClick={() => setActiveTab('qr-scanner')}
              className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all flex flex-col justify-between"
            >
              <QrCode className="w-5 h-5 text-amber-400 mb-1" />
              <span className="text-xs font-semibold text-white block">Live Check-In</span>
              <span className="text-[10px] text-slate-400">QR Scanner</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Recent System Audit Logs
            </h3>
            <button
              onClick={() => setActiveTab('audit-logs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View All ({auditLogs.length})
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-start justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-slate-200">{log.action}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {log.category}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0 font-mono ml-2">
                  {log.timestamp?.slice(11, 16) || log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParticipantsTab({
  participants = [],
  allParticipants = [],
  uniqueSchools = [],
  search,
  setSearch,
  schoolFilter,
  setSchoolFilter,
  attendanceFilter,
  setAttendanceFilter,
  setParticipantModal,
  setCsvImportModal,
  exportParticipantsCSV,
  setDeleteConfirm,
  setQrCardModal,
  setScoreModal,
  handleToggleAttendance
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, team, school, or QR..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Schools</option>
            {uniqueSchools.map((sch) => (
              <option key={sch} value={sch}>
                {sch}
              </option>
            ))}
          </select>

          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Attendance</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
          </select>

          <button
            onClick={() => setCsvImportModal({ open: true })}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            title="Import participants from CSV / Excel spreadsheet"
          >
            <Upload className="w-3.5 h-3.5" /> CSV Import
          </button>

          <button
            onClick={exportParticipantsCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            title="Export filtered participants to CSV file"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>

          <button
            onClick={() => setParticipantModal({ open: true, mode: 'add', data: null })}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" /> Add Participant
          </button>
        </div>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Participant</th>
                <th className="p-4">School & Class</th>
                <th className="p-4">QR / ID Pass</th>
                <th className="p-4">Attendance</th>
                <th className="p-4">Points Score</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {participants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No participants found matching current filters.
                  </td>
                </tr>
              ) : (
                participants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{p.name}</div>
                      <div className="text-[11px] text-indigo-400">{p.team}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-200">{p.school}</div>
                      <div className="text-[11px] text-slate-500">{p.class}</div>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      <button
                        onClick={() => setQrCardModal({ open: true, participant: p })}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-indigo-300 transition-all"
                      >
                        <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                        {p.qrCode}
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          const nextStatus = p.attendance === 'Present' ? 'Late' : p.attendance === 'Late' ? 'Absent' : 'Present';
                          handleToggleAttendance(p.id, nextStatus);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          p.attendance === 'Present'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : p.attendance === 'Late'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {p.attendance}
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white text-sm">{p.points}</span>
                      <span className="text-slate-500 text-[10px] ml-1">pts</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setScoreModal({ open: true, participant: p })}
                          title="Adjust Points Score"
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg border border-slate-800"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setParticipantModal({ open: true, mode: 'edit', data: p })}
                          title="Edit Details"
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-400 rounded-lg border border-slate-800"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              open: true,
                              type: 'participant',
                              id: p.id,
                              name: p.name,
                              warningMsg: 'Permanently deletes participant and score records.'
                            })
                          }
                          title="Delete Participant"
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-rose-400 rounded-lg border border-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminsTab({ admins = [], search, setSearch, roleFilter, setRoleFilter, setAdminModal, setDeleteConfirm }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admins by name, email, venue..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Module Leader">Module Leader</option>
            <option value="Scoring Official">Scoring Official</option>
            <option value="Event Staff">Event Staff</option>
          </select>

          <button
            onClick={() => setAdminModal({ open: true, mode: 'add', data: null })}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all ml-auto"
          >
            <Plus className="w-4 h-4" /> Add Admin User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {admins.map((admin) => (
          <div key={admin.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-start gap-4 relative">
            <img src={admin.avatar} alt="" className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/30" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm truncate">{admin.name}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${admin.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {admin.status}
                </span>
              </div>
              <p className="text-xs text-indigo-400 font-medium">{admin.role}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{admin.email}</p>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-600" /> {admin.assignedVenue}
              </p>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-900">
                <button
                  onClick={() => setAdminModal({ open: true, mode: 'edit', data: admin })}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded-lg text-xs font-medium border border-slate-800 flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() =>
                    setDeleteConfirm({
                      open: true,
                      type: 'admin',
                      id: admin.id,
                      name: admin.name,
                      warningMsg: 'Revokes administrative panel access.'
                    })
                  }
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-rose-400 rounded-lg text-xs font-medium border border-slate-800 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Revoke
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModulesTab({ modules = [], search, setSearch, statusFilter, setStatusFilter, setModuleModal, setDeleteConfirm, participants = [] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules by code, name, venue..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            onClick={() => setModuleModal({ open: true, mode: 'add', data: null })}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all ml-auto"
          >
            <Plus className="w-4 h-4" /> Add Module
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod) => {
          const count = participants.filter((p) => p.enrolledModules?.includes(mod.code)).length;
          return (
            <div key={mod.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-bold font-mono">
                    {mod.code}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${mod.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {mod.status}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base">{mod.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{mod.description}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-900 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {mod.venue}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /> {mod.schedule}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>Coordinator: <strong className="text-slate-200">{mod.coordinator}</strong></span>
                  <span className="text-indigo-300 font-medium">{count} Enrolled</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-900">
                <button
                  onClick={() => setModuleModal({ open: true, mode: 'edit', data: mod })}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() =>
                    setDeleteConfirm({
                      open: true,
                      type: 'module',
                      id: mod.id,
                      name: mod.name,
                      warningMsg: 'Permanently deletes module and removes participant enrollments.'
                    })
                  }
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-rose-400 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QRScannerTab({ participants = [], handleToggleAttendance, handleUpdatePoints, modules = [] }) {
  const [scanCode, setScanCode] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [selectedModuleCode, setSelectedModuleCode] = useState(modules[0]?.code || 'CS-101');
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    if (isScanning) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => {});
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    }
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isScanning]);

  const processCode = (code) => {
    if (!code) return;
    const query = code.trim().toLowerCase();
    const found = participants.find(
      (p) => (p.qrCode || '').toLowerCase() === query || (p.id || '').toLowerCase() === query
    );

    if (found) {
      handleToggleAttendance(found.id, 'Present');
      handleUpdatePoints(found.id, 10, `Check-in scanner verified (${selectedModuleCode})`);
      setLastScanned({ success: true, participant: found, time: new Date().toLocaleTimeString() });
    } else {
      setLastScanned({ success: false, query, time: new Date().toLocaleTimeString() });
    }
    setScanCode('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            Live Camera Check-In Scanner
          </h3>
          <button
            onClick={() => setIsScanning(!isScanning)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold ${isScanning ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}
          >
            {isScanning ? 'Stop Camera' : 'Start Camera'}
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-medium text-slate-400">Target Competition Module for Check-in:</label>
          <select
            value={selectedModuleCode}
            onChange={(e) => setSelectedModuleCode(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
          >
            {modules.map((m) => (
              <option key={m.id} value={m.code}>
                {m.code} - {m.name} ({m.venue})
              </option>
            ))}
          </select>
        </div>

        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
          {isScanning ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <div className="text-xs text-slate-500 flex flex-col items-center gap-2">
              <Camera className="w-8 h-8 opacity-40" />
              Camera stream paused
            </div>
          )}
          <div className="absolute inset-0 border-2 border-dashed border-emerald-500/30 rounded-xl pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-emerald-400 rounded-lg animate-pulse opacity-60"></div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Or simulate manual barcode / QR code entry:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && processCode(scanCode)}
              placeholder="e.g. EVT-2026-801 or PAR-801"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => processCode(scanCode)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
            >
              Verify Pass
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Verification Feed & Result
          </h3>

          {lastScanned ? (
            lastScanned.success ? (
              <div className="p-5 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 space-y-4 animate-fade-in">
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle className="w-6 h-6 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Pass Verified Successfully!</h4>
                    <p className="text-xs text-slate-400">Recorded at {lastScanned.time}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Participant Name:</span>
                    <strong className="text-white">{lastScanned.participant?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">School & Team:</span>
                    <span className="text-slate-200">{lastScanned.participant?.school} ({lastScanned.participant?.team})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned QR ID:</span>
                    <span className="font-mono text-indigo-400">{lastScanned.participant?.qrCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Points Awarded:</span>
                    <span className="text-emerald-400 font-bold">+10 pts (Check-in Bonus)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-rose-950/40 rounded-2xl border border-rose-500/30 space-y-3">
                <div className="flex items-center gap-3 text-rose-400">
                  <XCircle className="w-6 h-6 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Pass Verification Failed</h4>
                    <p className="text-xs text-slate-400">Attempted at {lastScanned.time}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300">
                  No matching participant found for code <strong className="text-white">"{lastScanned.query}"</strong>. Please register the participant first or check the ID.
                </p>
              </div>
            )
          ) : (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3 border border-dashed border-slate-800 rounded-2xl">
              <QrCode className="w-12 h-12 opacity-30" />
              <p className="text-xs">Scan a participant's QR code pass or enter an ID number to verify attendance and award check-in points instantly.</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">💡 Pro Scanning Tip</p>
          Each successful scan automatically updates participant status to <strong>Present</strong> and awards 10 attendance points.
        </div>
      </div>
    </div>
  );
}

function AuditLogsTab({ auditLogs = [], search, setSearch, categoryFilter, setCategoryFilter, downloadLogsCSV }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search log details, user, action..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="System">System</option>
            <option value="Participant">Participant</option>
            <option value="Admin">Admin</option>
            <option value="Module">Module</option>
          </select>

          <button
            onClick={downloadLogsCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all ml-auto"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Category</th>
                <th className="p-4">Action</th>
                <th className="p-4">Details</th>
                <th className="p-4">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-sans">
                    No matching audit log entries found.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 text-indigo-300 border border-slate-800 text-[10px]">
                        {log.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-200">{log.action}</td>
                    <td className="p-4 text-slate-300 font-sans">{log.details}</td>
                    <td className="p-4 text-slate-400">{log.user}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CSVImportModal({ onClose, onImport }) {
  const [fileText, setFileText] = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result || '';
      setFileText(text);
      parseCSVText(text);
    };
    reader.readAsText(file);
  };

  const parseCSVText = (text) => {
    const lines = text.split(/\r\n|\n/);
    if (lines.length < 2) return;
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"(.*)"$/, '$1'));

    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map((v) => v.trim().replace(/^"(.*)"$/, '$1'));
      const item = {};
      headers.forEach((h, idx) => {
        item[h] = values[idx] || '';
      });
      parsed.push(item);
    }
    setParsedPreview(parsed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-400" /> Batch CSV / Excel Participant Import
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Upload a <strong>.csv</strong> file containing participant records. Expected headers include: <code>Name</code>, <code>School</code>, <code>Class</code>, <code>Team</code>, <code>Points</code>.
        </p>

        <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/50">
          <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" id="csv-file-input" />
          <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200">Click to choose or drag CSV file</span>
            <span className="text-[10px] text-slate-500">Supported formats: CSV, plain text</span>
          </label>
        </div>

        {parsedPreview.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-emerald-400 block">
              ✓ Ready to import {parsedPreview.length} rows:
            </span>
            <div className="max-h-36 overflow-y-auto bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1">
              {parsedPreview.slice(0, 5).map((row, i) => (
                <div key={i} className="text-slate-300 truncate">
                  • {row.Name || row.name || 'Student'} ({row.School || row.school || 'School'}) - {row.Team || row.team || 'Team'}
                </div>
              ))}
              {parsedPreview.length > 5 && (
                <div className="text-slate-500 italic">+ {parsedPreview.length - 5} more rows...</div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedPreview.length === 0}
            onClick={() => onImport(parsedPreview)}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30"
          >
            Import {parsedPreview.length} Participants
          </button>
        </div>
      </div>
    </div>
  );
}

function ParticipantFormModal({ mode, initialData, modules = [], onClose, onSave }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      school: '',
      class: 'Grade 11',
      team: '',
      qrCode: `EVT-2026-${Math.floor(200 + Math.random() * 700)}`,
      attendance: 'Present',
      points: 0,
      enrolledModules: ['CS-101']
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.school?.trim()) return;
    onSave(formData);
  };

  const toggleModuleSelection = (code) => {
    const current = formData.enrolledModules || [];
    if (current.includes(code)) {
      setFormData({ ...formData, enrolledModules: current.filter((c) => c !== code) });
    } else {
      setFormData({ ...formData, enrolledModules: [...current, code] });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            {mode === 'add' ? 'Enroll New Participant' : 'Edit Participant Profile'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alexander Pierce"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">School / Institution</label>
              <input
                type="text"
                required
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                placeholder="e.g. Apex STEM Academy"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Class / Grade</label>
              <input
                type="text"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                placeholder="e.g. Grade 11"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Team Name</label>
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                placeholder="e.g. CyberKnights"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Initial Points</label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Assigned QR Pass ID</label>
            <input
              type="text"
              value={formData.qrCode}
              onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-indigo-400 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-2">Enrolled Modules & Competitions</label>
            <div className="grid grid-cols-2 gap-2">
              {modules.map((m) => {
                const checked = formData.enrolledModules?.includes(m.code);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleModuleSelection(m.code)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${checked ? 'bg-indigo-600/10 border-indigo-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                  >
                    <div>
                      <span className="font-bold block text-xs">{m.code}</span>
                      <span className="text-[10px] opacity-80 truncate block">{m.name}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${checked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700'}`}>
                      {checked && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold shadow-lg shadow-indigo-600/30"
            >
              {mode === 'add' ? 'Save & Enroll' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminFormModal({ mode, initialData, modules = [], onClose, onSave }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      email: '',
      role: 'Module Leader',
      assignedVenue: 'Main Gymnasium',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            {mode === 'add' ? 'Add Admin User' : 'Edit Admin Profile'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Jonathan Crane"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. jonathan.c@eventhub.edu"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Admin Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Module Leader">Module Leader</option>
                <option value="Scoring Official">Scoring Official</option>
                <option value="Event Staff">Event Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Assigned Venue</label>
            <input
              type="text"
              value={formData.assignedVenue}
              onChange={(e) => setFormData({ ...formData, assignedVenue: e.target.value })}
              placeholder="e.g. Lab 3, Tech Wing"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold shadow-lg shadow-indigo-600/30"
            >
              {mode === 'add' ? 'Create Account' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModuleFormModal({ mode, initialData, admins = [], onClose, onSave }) {
  const [formData, setFormData] = useState(
    initialData || {
      code: 'CS-105',
      name: '',
      venue: 'Innovation Hall A',
      maxPoints: 100,
      coordinator: admins[0]?.name || 'Dr. Alan Turing',
      schedule: '02:00 PM - 04:00 PM',
      description: '',
      status: 'Active'
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.code?.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            {mode === 'add' ? 'Create Competition Module' : 'Edit Module Parameters'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Module Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. CS-102"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Module Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Code Sprint Hackathon"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Venue / Location</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Lab 3, Tech Wing"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Max Points Possible</label>
              <input
                type="number"
                value={formData.maxPoints}
                onChange={(e) => setFormData({ ...formData, maxPoints: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Coordinator / Official</label>
              <input
                type="text"
                value={formData.coordinator}
                onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                placeholder="e.g. Dr. Alan Turing"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Schedule / Time Window</label>
              <input
                type="text"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                placeholder="e.g. 09:00 AM - 12:00 PM"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
            >
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Module Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of rules, requirements, or format..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold shadow-lg shadow-indigo-600/30"
            >
              {mode === 'add' ? 'Create Module' : 'Save Parameters'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdjustPointsModal({ participant, onClose, onUpdate }) {
  const [pointsToAdd, setPointsToAdd] = useState(10);
  const [reason, setReason] = useState('Competition Bonus');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(participant.id, Number(pointsToAdd), reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Adjust Points Score
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-white text-sm block">{participant.name}</span>
            <span className="text-slate-400">{participant.school} • {participant.team}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Current Score</span>
            <span className="text-base font-bold text-emerald-400">{participant.points} pts</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Points Adjustment (+ or -)</label>
            <input
              type="number"
              required
              value={pointsToAdd}
              onChange={(e) => setPointsToAdd(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-2">
            {[5, 10, 25, 50, -5, -10].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setPointsToAdd(val)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                  val > 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                }`}
              >
                {val > 0 ? `+${val}` : val}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Reason / Event Note</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Round 1 Speed Winner"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold shadow-lg shadow-indigo-600/30"
            >
              Apply Score
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QRCardModal({ participant, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative flex flex-col items-center text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-white">Event Identification Pass</h3>
        <p className="text-xs text-slate-400 mt-0.5">{participant.school}</p>

        <div className="p-4 bg-white rounded-2xl shadow-xl my-4 border border-slate-700">
          <QRCode
            value={participant.qrCode || participant.id || 'EVT-2026-000'}
            size={160}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
          />
        </div>

        <span className="font-mono text-sm text-indigo-400 font-bold tracking-wider mb-2">
          {participant.qrCode || participant.id}
        </span>

        <div className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1 my-2 text-left">
          <div className="flex justify-between">
            <span className="text-slate-400">Name:</span>
            <span className="font-semibold text-white">{participant.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Team:</span>
            <span className="text-indigo-300">{participant.team}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Class:</span>
            <span className="text-slate-300">{participant.class}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all mt-2"
        >
          Close Pass
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;