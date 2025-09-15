import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Subject, AttendanceRecord, User, AttendanceSession, ToastMessage } from '../types';
import { HomeIcon, BookOpenIcon, ClockIcon, LogoutIcon, ShieldIcon, ScanIcon, CheckCircleIcon, UserIcon, UserCircleIcon } from './icons';
import SubjectManager from './SubjectManager';
import AttendanceHistory from './AttendanceHistory';
import AdminPanel from './AdminPanel';
import LiveSessionView from './LiveSessionView';
import ProfilePage from './ProfilePage';


interface DashboardPageProps {
  user: User;
  onLogout: () => void;
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id' | 'teacherUsername'>) => void;
  onDeleteSubject: (subjectId: string) => void;
  attendanceRecords: AttendanceRecord[];
  onAddAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  allSubjectsForContext: Subject[];
  sessions: AttendanceSession[];
  activeSession: AttendanceSession | null;
  onStartSession: (subjectId: string) => void;
  onEndSession: () => void;
  showToast: (message: string, type: ToastMessage['type']) => void;
  setConfirmAction: (action: (() => void) | null) => void;
  setConfirmMessage: (message: { title: string; body: string }) => void;
  onUpdateUserProfile: (updates: Partial<Omit<User, 'username' | 'role'>>) => void;
  
  // Pass all data for stats calculation
  allUsers: User[];
  allSubjects: Subject[];
  allAttendanceRecords: AttendanceRecord[];
  allSessions: AttendanceSession[];

  // Admin props
  onDeleteUser?: (username: string) => void;
  onUpdateUser?: (username: string, updates: Partial<User>) => void;
}

type View = 'home' | 'profile' | 'subjects' | 'history' | 'admin';

export const Avatar = ({ user, size = 'md' }: { user: User, size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
        sm: 'w-10 h-10 text-base',
        md: 'w-20 h-20 text-3xl',
        lg: 'w-24 h-24 text-4xl',
    };
    if (user.profilePicture) {
        return <img src={user.profilePicture} alt={user.username} className={`${sizeClasses[size]} rounded-full object-cover border-2 border-cyan-500/50`} />;
    }
    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-700 flex items-center justify-center font-bold text-cyan-400 border-2 border-cyan-500/50`}>
            {(user.firstName || user.username).charAt(0).toUpperCase()}
        </div>
    );
};

// --- Sidebar Component ---
const Sidebar = ({ user, onLogout, setView, currentView }: { user: User, onLogout: () => void, setView: (view: View) => void, currentView: View }) => {
    const getRoleDisplayName = () => {
        switch(user.role) {
            case 'admin': return <p className="text-amber-400 text-xs font-bold">[ผู้ดูแลระบบ]</p>;
            case 'teacher': return <p className="text-cyan-400 text-xs font-bold">[อาจารย์]</p>;
            case 'student': return <p className="text-green-400 text-xs font-bold">[นักศึกษา]</p>;
        }
    }

    const navItems = [
        { id: 'home', icon: HomeIcon, label: 'หน้าหลัก', roles: ['admin', 'teacher', 'student'] },
        { id: 'profile', icon: UserCircleIcon, label: 'ข้อมูลส่วนตัว', roles: ['admin', 'teacher', 'student'] },
        { id: 'subjects', icon: BookOpenIcon, label: 'จัดการรายวิชา', roles: ['admin', 'teacher'] },
        { id: 'history', icon: ClockIcon, label: 'ประวัติการเช็คชื่อ', roles: ['admin', 'teacher', 'student'] },
        { id: 'admin', icon: ShieldIcon, label: 'จัดการระบบ', roles: ['admin'] },
    ];
    
    const visibleNavItems = navItems.filter(item => item.roles.includes(user.role));

    return (
        <aside className="w-64 bg-black/30 backdrop-blur-lg flex flex-col p-4 border-r border-cyan-500/10">
            <header className="mb-10 flex flex-col items-center text-center">
                <Avatar user={user} size="md" />
                <h1 className="text-xl font-bold text-white mt-4 leading-tight">
                    {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
                </h1>
                { (user.firstName || user.lastName) && <p className="text-sm text-gray-400">@{user.username}</p> }
                <div className="mt-2">{getRoleDisplayName()}</div>
            </header>
            <nav className="flex-1 space-y-2">
                {visibleNavItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id as View)}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                            currentView === item.id 
                            ? 'bg-cyan-500/20 text-cyan-300 shadow-md' 
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                        }`}
                    >
                        <item.icon className="h-5 w-5 mr-4" />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>
            <footer className="mt-auto">
                 <button
                    onClick={onLogout}
                    className="w-full flex items-center px-4 py-3 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                >
                    <LogoutIcon className="h-5 w-5 mr-4" />
                    <span className="font-medium">ออกจากระบบ</span>
                </button>
            </footer>
        </aside>
    );
};

// --- Home Dashboard View ---
declare global {
  interface Window { BarcodeDetector: any; }
}

const HomeDashboard = (props: DashboardPageProps) => {
  const { user, subjects, onAddAttendanceRecord, onStartSession, showToast, allSubjectsForContext } = props;
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'prompt'>('idle');
  const [scannedData, setScannedData] = useState<{ qrContent: any; timestamp: Date } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (subjects && subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);
  
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);
  
  useEffect(() => stopCamera, [stopCamera]);

  const startScan = async () => {
    if (!('BarcodeDetector' in window)) {
      showToast('เบราว์เซอร์ของคุณไม่รองรับการสแกน QR Code', 'error');
      return;
    }
    setScanState('scanning');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const detectionInterval = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        const barcodes = await barcodeDetector.detect(videoRef.current);
        if (barcodes.length > 0) {
          clearInterval(detectionInterval);
          stopCamera();
          try {
            const parsedData = JSON.parse(barcodes[0].rawValue);
            // Updated QR data validation
            if (parsedData.sessionId && parsedData.subjectId && parsedData.timestamp) {
              const now = Date.now();
              const qrTimestamp = parsedData.timestamp;
              const validity = parsedData.validity || 65000; // 65 seconds
              if (now - qrTimestamp > validity) {
                  showToast("QR Code หมดอายุแล้ว", "error");
                  setScanState('idle');
              } else {
                  setScannedData({ qrContent: parsedData, timestamp: new Date() });
                  setScanState('prompt');
              }
            } else {
              throw new Error("Invalid QR Code data format.");
            }
          } catch (e) {
            showToast("QR Code ไม่ถูกต้องหรือไม่สามารถอ่านได้", "error");
            setScanState('idle');
          }
        }
      }, 500);
    } catch (err) {
      showToast('ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการอนุญาต', 'error');
      setScanState('idle');
    }
  };
  
  const handleAttendanceSubmit = (studentIdentifier: string) => {
    if (!scannedData || !studentIdentifier.trim()) return;
    onAddAttendanceRecord({
      studentIdentifier: studentIdentifier.trim(),
      subjectId: scannedData.qrContent.subjectId,
      sessionId: scannedData.qrContent.sessionId,
      timestamp: scannedData.timestamp.getTime()
    });
    setScanState('success');
  };

  const resetFlow = () => {
    setScanState('idle');
    setScannedData(null);
  };

  if (scanState === 'scanning') {
    return (
      <div className="fade-in max-w-lg mx-auto bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 text-center card-glow">
        <h2 className="text-3xl font-bold text-cyan-400 mb-4">กำลังสแกน...</h2>
        <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-4 border-cyan-400/50 rounded-lg" />
        </div>
        <button onClick={resetFlow} className="mt-6 px-5 py-2 text-sm font-medium text-amber-400 bg-gray-800 border border-amber-500/50 rounded-lg hover:bg-amber-500/10">
            ยกเลิก
        </button>
      </div>
    );
  }
  
  if (scanState === 'prompt') {
      const subject = allSubjectsForContext.find(s => s.id === scannedData?.qrContent.subjectId);
      return (
          <div className="fade-in max-w-lg mx-auto bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 text-center card-glow">
              <h2 className="text-2xl font-bold text-cyan-400 mb-2">ยืนยันการเช็คชื่อ</h2>
              <p className="text-gray-400 mb-4">รายวิชา: <span className="font-semibold text-white">{subject?.name || 'ไม่พบ'}</span></p>
              <form onSubmit={(e) => { e.preventDefault(); handleAttendanceSubmit(user.username); }}>
                  <p className="text-lg text-white mb-4">ยืนยันการเช็คชื่อสำหรับ <span className="font-bold text-cyan-400">{user.username}</span>?</p>
                  <div className="flex gap-4 mt-6">
                    <button type="button" onClick={resetFlow} className="w-full px-5 py-3 text-lg font-bold text-amber-400 bg-gray-800 border border-amber-500/50 rounded-lg hover:bg-amber-500/10">ยกเลิก</button>
                    <button type="submit" className="w-full px-5 py-3 text-lg font-bold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-300">ยืนยัน</button>
                  </div>
              </form>
          </div>
      )
  }

  if (scanState === 'success') {
    return (
      <div className="fade-in max-w-lg mx-auto bg-gray-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-8 flex flex-col items-center text-center card-glow">
        <CheckCircleIcon className="w-24 h-24 text-green-400 mb-6" />
        <h2 className="text-3xl font-bold text-green-400 mb-2">เช็คชื่อสำเร็จ!</h2>
        <p className="text-gray-300 mb-8">บันทึกข้อมูลเรียบร้อยแล้ว</p>
        <button onClick={resetFlow} className="px-6 py-3 text-lg font-bold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-300">กลับไปหน้าหลัก</button>
      </div>
    );
  }

  // Student View
  if (user.role === 'student') {
    return (
        <div className="fade-in space-y-8 flex flex-col items-center justify-center h-full">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 flex flex-col items-center justify-center card-glow w-full max-w-md">
                <h1 className="text-3xl font-bold text-white mb-2">เช็คชื่อเข้าเรียน</h1>
                <p className="text-gray-400 mb-8 text-center">กดปุ่มด้านล่างเพื่อสแกน QR Code จากอาจารย์</p>
                <button onClick={startScan} className="w-full flex items-center justify-center gap-3 px-5 py-4 text-xl font-bold text-cyan-400 bg-gray-800 border-2 border-cyan-500/50 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-300 transition">
                    <ScanIcon className="w-8 h-8" /> เริ่มสแกน
                </button>
            </div>
        </div>
    )
  }

  // Teacher & Admin View - Start Session
  return (
    <div className="fade-in flex items-center justify-center h-full">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 card-glow text-center">
        <h1 className="text-3xl font-bold text-white mb-2">เริ่มเซสชันเช็คชื่อ</h1>
        <p className="text-gray-400 mb-8">เลือกรายวิชาเพื่อเริ่มการเช็คชื่อ</p>
        <div className="space-y-4">
            <div>
              <label htmlFor="subject-select" className="block text-sm font-medium text-cyan-400 mb-2">เลือกรายวิชา</label>
              <select
                id="subject-select"
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {subjects.length > 0 ? (
                  subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)
                ) : (
                  <option disabled>กรุณาเพิ่มรายวิชาก่อน</option>
                )}
              </select>
            </div>
            <button 
              onClick={() => onStartSession(selectedSubjectId)} 
              disabled={!selectedSubjectId}
              className="w-full flex items-center justify-center gap-3 px-5 py-4 text-xl font-bold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition disabled:bg-gray-600"
            >
              <ScanIcon className="w-8 h-8"/> เริ่มเซสชัน
            </button>
          </div>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
const DashboardPage = (props: DashboardPageProps) => {
  const [view, setView] = useState<View>('home');
  const { user, activeSession, showToast } = props;

  const renderView = () => {
    // If there's an active session and user is a teacher/admin, always show the session view from home tab
    if (view === 'home' && activeSession && (user.role === 'teacher' || user.role === 'admin')) {
        return <LiveSessionView 
            session={activeSession}
            records={props.attendanceRecords}
            onEndSession={props.onEndSession}
            onManualAdd={props.onAddAttendanceRecord}
            allUsers={props.allUsers || []}
            showToast={showToast}
            subject={props.allSubjectsForContext.find(s => s.id === activeSession.subjectId)}
        />;
    }

    switch (view) {
      case 'profile':
        return <ProfilePage 
            user={props.user}
            onUpdateProfile={props.onUpdateUserProfile}
            showToast={props.showToast}
        />;
      case 'subjects':
        if (props.user.role === 'teacher' || props.user.role === 'admin') {
          return <SubjectManager 
                    subjects={props.subjects} 
                    onAddSubject={props.onAddSubject} 
                    onDeleteSubject={props.onDeleteSubject}
                    showToast={props.showToast}
                    setConfirmAction={props.setConfirmAction}
                    setConfirmMessage={props.setConfirmMessage}
                />;
        }
        return null;
      case 'history':
        return <AttendanceHistory 
                    records={props.attendanceRecords} 
                    subjects={props.allSubjectsForContext} 
                    sessions={props.sessions}
                    user={props.user} 
                    allUsers={props.allUsers}
                    allRecords={props.allAttendanceRecords}
                    allSessions={props.allSessions}
                />;
      case 'admin':
        if (props.user.role === 'admin' && props.allUsers && props.onDeleteUser && props.allSubjects && props.onUpdateUser) {
            return <AdminPanel 
                        allUsers={props.allUsers} 
                        onDeleteUser={props.onDeleteUser}
                        allSubjects={props.allSubjects}
                        allRecords={props.allAttendanceRecords}
                        allSessions={props.allSessions}
                        onDeleteSubject={props.onDeleteSubject}
                        currentUser={props.user}
                        onUpdateUser={props.onUpdateUser}
                        showToast={props.showToast}
                        setConfirmAction={props.setConfirmAction}
                        setConfirmMessage={props.setConfirmMessage}
                    />;
        }
        return null;
      case 'home':
      default:
        return <HomeDashboard {...props} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900/80">
      <Sidebar user={props.user} onLogout={props.onLogout} setView={setView} currentView={view} />
      <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default DashboardPage;