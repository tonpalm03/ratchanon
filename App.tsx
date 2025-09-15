import React, { useState, useCallback, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import RegistrationPage from './components/RegistrationPage';
import { User, Subject, AttendanceRecord, UserRole, AttendanceSession, ToastMessage } from './types';
import { ACCOUNTS_STORAGE_KEY, SUBJECTS_STORAGE_KEY, RECORDS_STORAGE_KEY, ATTENDANCE_SESSIONS_STORAGE_KEY } from './constants';
import ToastContainer from './components/Toast';
import ConfirmModal from './components/ConfirmModal';

const generateMockData = () => {
    const baseUsers: User[] = [
      { username: 'tonpalm', passwordHash: 'hashed_palm2334', role: 'admin', title: 'นาย', firstName: 'ธนพล', lastName: 'ใจดี', email: 'admin@system.com', dateOfBirth: '1990-01-01', department: 'IT Department' },
      { 
        username: 'teacher.somchai', 
        passwordHash: 'hashed_teacher123', 
        role: 'teacher',
        title: 'นาย',
        firstName: 'สมชาย',
        lastName: 'สอนดี',
        profilePicture: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiM0QTkwRTIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQ1IiByPSIyMCIgZmlsbD0iI0ZGRTBCMiIvPjxyZWN0IHg9IjM1IiB5PSI2NSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjI1IiBmaWxsPSIjNEE5MEUyIi8+PHBhdGggZD0iTTMwIDgwIEMgNDAgOTAsIDYwIDkwLCA3MCA4MCIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9InRyYW5zcGFyZW50Ii8+PGNpcmNsZSBjeD0iNDAiIGN5PSI0NSIgcj0iMyIgZmlsbD0iIzAwMDAwMCIvPjxjaXJjbGUgY3g9IjYwIiBjeT0iNDUiIHI9IjMiIGZpbGw9IiMwMDAwMDAiLz48cGF0aCBkPSJNNDUgNTUgUSA1MCA2MCwgNTUgNTUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjwvc3ZnPg==',
        email: 'somchai.t@example.com',
        dateOfBirth: '1985-05-15',
        department: 'Computer Science'
      },
      { 
        username: 'teacher.somsri', 
        passwordHash: 'hashed_teacher456', 
        role: 'teacher',
        title: 'นางสาว',
        firstName: 'สมศรี',
        lastName: 'รักเรียน',
        profilePicture: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiNEMDAyMUIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQ1IiByPSIyMCIgZmlsbD0iI0ZGRERDMSIvPjxyZWN0IHg9IjM1IiB5PSI2NSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjI1IiBmaWxsPSIjRDAwMjFCIi8+PHBhdGggZD0iTTMwIDgwIEMgNDAgOTAsIDYwIDkwLCA3MCA4MCIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9InRyYW5zcGFyZW50Ii8+PGNpcmNsZSBjeD0iNDAiIGN5PSI0NSIgcj0iMyIgZmlsbD0iIzAwMDAwMCIvPjxjaXJjbGUgY3g9IjYwIiBjeT0iNDUiIHI9IjMiIGZpbGw9IiMwMDAwMDAiLz48cGF0aCBkPSJNNDUgNTUgUSA1MCA2MCwgNTUgNTUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjxwYXRoIGQ9Ik0zMCAzNSBRIDUwIDIwLCA3MCAzNSIgc3Ryb2tlPSIjNEE0QTRBIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+',
        email: 'somsri.p@example.com',
        dateOfBirth: '1988-11-22',
        department: 'Information Technology'
      },
      { 
        username: '65010001', 
        passwordHash: 'hashed_student123', 
        role: 'student',
        title: 'นาย',
        firstName: 'มานะ',
        lastName: 'ตั้งใจ',
        profilePicture: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiM0Q0FGNTAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQ1IiByPSIyMCIgZmlsbD0iI0Y4RTcxQyIvPjxyZWN0IHg9IjM1IiB5PSI2NSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjI1IiBmaWxsPSIjNENBRjUwIi8+PHBhdGggZD0iTTM1IDgwIFEgNTAgOTUsIDY1IDgwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0idHJhbnNwYXJlbnQiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQ1IiByPSI0IiBmaWxsPSIjMDAwMDAwIi8+PGNpcmNsZSBjeD0iNjAiIGN5PSI0NSIgcj0iNCIgZmlsbD0iIzAwMDAwMCIvPjxwYXRoIGQ9Ik00MCA1NSBRIDUwIDUwLCA2MCA1NSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+',
        email: '65010001@student.example.com',
        dateOfBirth: '2003-08-20',
        major: 'Software Engineering'
      },
      { 
        username: '65010002', 
        passwordHash: 'hashed_student456', 
        role: 'student',
        title: 'นางสาว',
        firstName: 'ปิติ',
        lastName: 'ขยัน',
        profilePicture: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiNGRjY5QjQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQ1IiByPSIyMCIgZmlsbD0iI0ZGRTRFMSIvPjxyZWN0IHg9IjM1IiB5PSI2NSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjI1IiBmaWxsPSIjRkY2OUI0Ii8+PHBhdGggZD0iTTM1IDgwIFEgNTAgOTUsIDY1IDgwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0idHJhbnNwYXJlbnQiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQ1IiByPSI0IiBmaWxsPSIjMDAwMDAwIi8+PGNpcmNsZSBjeD0iNjAiIGN5PSI0NSIgcj0iNCIgZmlsbD0iIzAwMDAwMCIvPjxwYXRoIGQ9Ik00MCA1NSBRIDUwIDUwLCA2MCA1NSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9InRyYW5zcGFyZW50Ii8+PHBhdGggZD0iTTM1IDI1IEwgMzAgMTUgTTY1IDI1IEwgNzAgMTUiIHN0cm9rZT0iIzhCNDUxMyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=',
        email: '65010002@student.example.com',
        dateOfBirth: '2004-01-10',
        major: 'Data Science'
      },
    ];

    const newStudents: User[] = [];
    for (let i = 3; i <= 22; i++) {
        const id = `650100${i.toString().padStart(2, '0')}`;
        newStudents.push({
            username: id,
            passwordHash: `hashed_student${id}`,
            role: 'student',
            title: i % 2 === 0 ? 'นางสาว' : 'นาย',
            firstName: `นักศึกษา${i}`,
            lastName: `ทดสอบ`,
            email: `${id}@student.example.com`,
            dateOfBirth: `2003-01-${i.toString().padStart(2, '0')}`,
            major: i % 3 === 0 ? 'Software Engineering' : 'Data Science',
        });
    }

    const allUsers = [...baseUsers, ...newStudents];
    const allStudents = allUsers.filter(u => u.role === 'student');

    const defaultSubjects: Subject[] = [
        { id: 'subj_1', name: 'Introduction to Programming', code: 'CS101', teacherUsername: 'teacher.somchai' },
        { id: 'subj_2', name: 'Web Development', code: 'IT102', teacherUsername: 'teacher.somsri' },
        { id: 'subj_3', name: 'Data Structures', code: 'CS201', teacherUsername: 'teacher.somchai' },
        { id: 'subj_4', name: 'Networking Fundamentals', code: 'IT202', teacherUsername: 'teacher.somsri' }
    ];

    const defaultSessions: AttendanceSession[] = [];
    const defaultRecords: AttendanceRecord[] = [];
    const now = Date.now();

    defaultSubjects.forEach((subject, subjectIndex) => {
        for (let i = 0; i < 10; i++) { // 10 sessions per subject
            const sessionId = `sess_${subject.id}_${i}`;
            const sessionTime = now - ((subjectIndex * 10 + i) * 3 * 24 * 60 * 60 * 1000); // sessions in the past, spaced 3 days apart
            const session: AttendanceSession = {
                id: sessionId,
                subjectId: subject.id,
                teacherUsername: subject.teacherUsername,
                startTime: sessionTime,
                endTime: sessionTime + (60 * 60 * 1000) // 1 hour duration
            };
            defaultSessions.push(session);

            allStudents.forEach(student => {
                if (Math.random() < 0.7) { // 70% attendance
                    const record: AttendanceRecord = {
                        id: `rec_${sessionId}_${student.username}`,
                        studentIdentifier: student.username,
                        timestamp: sessionTime + (Math.random() * 30 * 60 * 1000), // check in within 30 mins
                        subjectId: subject.id,
                        sessionId: sessionId
                    };
                    defaultRecords.push(record);
                }
            });
        }
    });
    
    return { users: allUsers, subjects: defaultSubjects, sessions: defaultSessions, records: defaultRecords };
};

const { users: defaultUsers, subjects: defaultSubjects, sessions: defaultSessions, records: defaultRecords } = generateMockData();

// Helper function to get data from localStorage with type validation
function useStoredState<T>(key: string, defaultValue: T[], validator: (item: any) => boolean): [T[], React.Dispatch<React.SetStateAction<T[]>>] {
  const [state, setState] = useState<T[]>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every(validator)) {
          return parsed as T[];
        }
      }
      return defaultValue;
    } catch (error) {
      console.error(`Could not parse ${key} from localStorage`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Could not save ${key} to localStorage`, error);
    }
  }, [key, state]);

  return [state, setState];
}

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'register'>('login');
  
  const [accounts, setAccounts] = useStoredState<User>(ACCOUNTS_STORAGE_KEY, defaultUsers, item => 
    typeof item === 'object' && item !== null && 'username' in item && 'passwordHash' in item && 'role' in item
  );
  
  const [subjects, setSubjects] = useStoredState<Subject>(SUBJECTS_STORAGE_KEY, defaultSubjects, item =>
    typeof item === 'object' && item !== null && 'id' in item && 'name' in item && 'code' in item && 'teacherUsername' in item
  );
  
  const [attendanceRecords, setAttendanceRecords] = useStoredState<AttendanceRecord>(RECORDS_STORAGE_KEY, defaultRecords, item =>
    typeof item === 'object' && item !== null && 'id' in item && 'studentIdentifier' in item && 'timestamp' in item && 'subjectId' in item && 'sessionId' in item
  );

  const [sessions, setSessions] = useStoredState<AttendanceSession>(ATTENDANCE_SESSIONS_STORAGE_KEY, defaultSessions, item =>
    typeof item === 'object' && item !== null && 'id' in item && 'subjectId' in item && 'startTime' in item
  );

  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState({ title: '', body: '' });

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const handleLogin = useCallback((username: string, passwordHash: string) => {
    const account = accounts.find(acc => acc.username === username);
    if (account && account.passwordHash === passwordHash) {
      setCurrentUser(account);
      return true;
    }
    return false;
  }, [accounts]);

  const handleRegister = useCallback((newUser: Omit<User, 'passwordHash'> & {password: string}): {success: boolean, message: string} => {
    if (accounts.some(acc => acc.username === newUser.username)) {
        return { success: false, message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' };
    }
    const userToSave: User = {
        username: newUser.username,
        passwordHash: `hashed_${newUser.password}`,
        role: newUser.role,
        title: newUser.title,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        profilePicture: newUser.profilePicture,
        email: newUser.email,
        dateOfBirth: newUser.dateOfBirth,
        major: newUser.major,
        department: newUser.department,
    }
    setAccounts(prev => [...prev, userToSave]);
    return { success: true, message: 'สร้างบัญชีสำเร็จ! กำลังนำคุณไปหน้าเข้าสู่ระบบ' };
  }, [accounts, setAccounts]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setActiveSession(null);
    setView('login');
  }, []);

  // --- Subject Handlers ---
  const addSubject = (subject: Omit<Subject, 'id' | 'teacherUsername'>) => {
    if (!currentUser) return;
    const newSubject: Subject = {
      ...subject,
      id: `sub_${Date.now()}`,
      teacherUsername: currentUser.username,
    };
    setSubjects(prev => [...prev, newSubject]);
  };
  
  const deleteSubject = (subjectId: string) => {
    const recordsToDelete = attendanceRecords.filter(r => r.subjectId === subjectId);
    const sessionsToDelete = sessions.filter(s => s.subjectId === subjectId);
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    setAttendanceRecords(prev => prev.filter(r => r.subjectId !== subjectId));
    setSessions(prev => prev.filter(s => s.subjectId !== subjectId));
  };

  // --- Admin Handlers ---
  const deleteUser = (username: string) => {
    const subjectsToDelete = subjects.filter(s => s.teacherUsername === username).map(s => s.id);
    subjectsToDelete.forEach(deleteSubject);
    setAccounts(prev => prev.filter(acc => acc.username !== username));
  };

  const updateUser = (username: string, updates: Partial<Omit<User, 'username'>>) => {
      setAccounts(prev =>
        prev.map(acc => {
            if (acc.username === username) {
                return { ...acc, ...updates };
            }
            return acc;
        })
      );
  };
  
  // --- Profile Handler ---
  const updateUserProfile = (updates: Partial<Omit<User, 'username' | 'role'>>) => {
    if (!currentUser) return;
    
    let updatedUser: User | null = null;

    setAccounts(prev =>
        prev.map(acc => {
            if (acc.username === currentUser.username) {
                updatedUser = { ...acc, ...updates };
                return updatedUser;
            }
            return acc;
        })
    );
    
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
  };

  // --- Attendance & Session Handlers ---
  const startSession = (subjectId: string) => {
    if (!currentUser) return;
    const newSession: AttendanceSession = {
      id: `sess_${Date.now()}`,
      subjectId,
      teacherUsername: currentUser.username,
      startTime: Date.now(),
    };
    setSessions(prev => [...prev, newSession]);
    setActiveSession(newSession);
  };
  
  const endSession = () => {
    if (!activeSession) return;
    setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, endTime: Date.now() } : s));
    setActiveSession(null);
  };

  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>) => {
    const existingRecord = attendanceRecords.find(
        r => r.sessionId === record.sessionId && r.studentIdentifier === record.studentIdentifier
    );
    if(existingRecord) {
        showToast('คุณได้เช็คชื่อในเซสชันนี้ไปแล้ว', 'info');
        return;
    }
    const newRecord: AttendanceRecord = {
      ...record,
      id: `rec_${Date.now()}`,
    };
    setAttendanceRecords(prev => [newRecord, ...prev]);
    showToast('เช็คชื่อสำเร็จ!', 'success');
  };

  const navigateToRegister = () => setView('register');
  const navigateToLogin = () => setView('login');
  
  const getVisibleData = () => {
      if (!currentUser) return { visibleSubjects: [], visibleRecords: [], allSubjectsForContext: [], visibleSessions: [] };

      switch (currentUser.role) {
          case 'admin':
              return { visibleSubjects: subjects, visibleRecords: attendanceRecords, allSubjectsForContext: subjects, visibleSessions: sessions };
          case 'teacher':
              const teacherSubjects = subjects.filter(s => s.teacherUsername === currentUser.username);
              const teacherSubjectIds = teacherSubjects.map(s => s.id);
              const teacherRecords = attendanceRecords.filter(r => teacherSubjectIds.includes(r.subjectId));
              const teacherSessions = sessions.filter(s => s.teacherUsername === currentUser.username);
              return { visibleSubjects: teacherSubjects, visibleRecords: teacherRecords, allSubjectsForContext: subjects, visibleSessions: teacherSessions };
          case 'student':
              const studentRecords = attendanceRecords.filter(r => r.studentIdentifier === currentUser.username);
              return { visibleSubjects: [], visibleRecords: studentRecords, allSubjectsForContext: subjects, visibleSessions: sessions };
          default:
              return { visibleSubjects: [], visibleRecords: [], allSubjectsForContext: [], visibleSessions: [] };
      }
  };

  const { visibleSubjects, visibleRecords, allSubjectsForContext, visibleSessions } = getVisibleData();

  return (
    <>
      <ToastContainer toasts={toasts} setToasts={setToasts} />
      <ConfirmModal
        isOpen={!!confirmAction}
        title={confirmMessage.title}
        message={confirmMessage.body}
        onConfirm={() => {
          if (confirmAction) confirmAction();
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
      <div className="min-h-screen">
        {currentUser ? (
          <DashboardPage 
            user={currentUser} 
            onLogout={handleLogout}
            subjects={visibleSubjects}
            onAddSubject={addSubject}
            onDeleteSubject={deleteSubject}
            attendanceRecords={visibleRecords}
            onAddAttendanceRecord={addAttendanceRecord}
            allSubjectsForContext={allSubjectsForContext}
            sessions={visibleSessions}
            activeSession={activeSession}
            onStartSession={startSession}
            onEndSession={endSession}
            showToast={showToast}
            setConfirmAction={setConfirmAction}
            setConfirmMessage={setConfirmMessage}
            allUsers={accounts}
            allSubjects={subjects}
            allAttendanceRecords={attendanceRecords}
            allSessions={sessions}
            onDeleteUser={currentUser.role === 'admin' ? deleteUser : undefined}
            onUpdateUser={currentUser.role === 'admin' ? updateUser : undefined}
            onUpdateUserProfile={updateUserProfile}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center p-4">
            {view === 'login' ? (
              <LoginPage onLogin={handleLogin} onNavigateToRegister={navigateToRegister} showToast={showToast} />
            ) : (
              <RegistrationPage onRegister={handleRegister} onNavigateToLogin={navigateToLogin} showToast={showToast} />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default App;
