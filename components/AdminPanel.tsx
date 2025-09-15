import React, { useState, useMemo, useEffect } from 'react';
import { User, Subject, UserRole, ToastMessage, AttendanceRecord, AttendanceSession } from '../types';
import { TrashIcon, EditIcon, UsersIcon, UserIcon, ShieldIcon } from './icons';
import { Avatar } from './DashboardPage';
import PercentageBar from './PercentageBar';

interface AdminPanelProps {
  allUsers: User[];
  allSubjects: Subject[];
  allRecords: AttendanceRecord[];
  allSessions: AttendanceSession[];
  currentUser: User;
  onDeleteUser: (username: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onUpdateUser: (username: string, updates: Partial<User>) => void;
  showToast: (message: string, type: ToastMessage['type']) => void;
  setConfirmAction: (action: (() => void) | null) => void;
  setConfirmMessage: (message: { title: string; body: string }) => void;
}

// --- Stat Card Component ---
interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    color: string;
}

const StatCard = ({ icon, title, value, color }: StatCardProps) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-5 flex items-center gap-5 card-glow">
        <div className={`text-3xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);


// --- Edit User Modal Component ---
interface EditUserModalProps {
    user: User;
    currentUser: User;
    onClose: () => void;
    onUpdateUser: (username: string, updates: Partial<User>) => void;
}

const EditUserModal = ({ user, currentUser, onClose, onUpdateUser }: EditUserModalProps) => {
    const [formData, setFormData] = useState({
        role: user.role,
        title: user.title || 'นาย',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth || '',
        academicInfo: (user.role === 'student' ? user.major : user.department) || '',
    });
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        // Sync form data with user prop in case it changes
        setFormData({
            role: user.role,
            title: user.title || 'นาย',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            dateOfBirth: user.dateOfBirth || '',
            academicInfo: (user.role === 'student' ? user.major : user.department) || '',
        });
    }, [user]);

    useEffect(() => {
        const mainEl = document.getElementById('main-content');
        if (mainEl) {
            mainEl.style.overflow = 'hidden';
        }
        return () => {
            const mainElOnCleanup = document.getElementById('main-content');
            if (mainElOnCleanup) {
                mainElOnCleanup.style.overflow = 'auto';
            }
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const updates: Partial<Omit<User, 'username'>> = {};

        if (formData.title !== (user.title || 'นาย')) updates.title = formData.title as User['title'];
        if (formData.firstName !== (user.firstName || '')) updates.firstName = formData.firstName;
        if (formData.lastName !== (user.lastName || '')) updates.lastName = formData.lastName;
        if (formData.email !== (user.email || '')) updates.email = formData.email;
        if (formData.dateOfBirth !== (user.dateOfBirth || '')) updates.dateOfBirth = formData.dateOfBirth;
        if (formData.role !== user.role) updates.role = formData.role;

        const originalAcademicInfo = (user.role === 'student' ? user.major : user.department) || '';
        if (formData.academicInfo !== originalAcademicInfo) {
            if (formData.role === 'student') {
                updates.major = formData.academicInfo;
                updates.department = undefined;
            } else {
                updates.department = formData.academicInfo;
                updates.major = undefined;
            }
        } else if (formData.role !== user.role) {
            if (formData.role === 'student') {
                updates.major = formData.academicInfo;
                updates.department = undefined;
            } else {
                updates.department = formData.academicInfo;
                updates.major = undefined;
            }
        }

        if (newPassword.trim()) {
            updates.passwordHash = `hashed_${newPassword.trim()}`;
        }

        if (Object.keys(updates).length > 0) {
            onUpdateUser(user.username, updates);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in" aria-modal="true" role="dialog">
            <div className="w-full max-w-lg bg-gray-800 border border-cyan-500/30 rounded-xl shadow-lg card-glow max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <header className="mb-6">
                        <h2 className="text-2xl font-bold text-cyan-400">แก้ไขข้อมูลผู้ใช้</h2>
                        <p className="text-gray-400 font-mono mt-1">UID: <span className="text-white">{user.username}</span></p>
                        <p className="text-gray-400 font-mono">Email: <span className="text-white">{user.email || 'N/A'}</span></p>
                    </header>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-cyan-400 mb-2">คำนำหน้า</label>
                                <select name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    <option value="นาย">นาย</option>
                                    <option value="นาง">นาง</option>
                                    <option value="นางสาว">นางสาว</option>
                                </select>
                            </div>
                            <div className="sm:col-span-3 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-cyan-400 mb-2">ชื่อจริง</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-cyan-400 mb-2">นามสกุล</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-cyan-400 mb-2">อีเมล</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-cyan-400 mb-2">วันเกิด</label>
                                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-cyan-400 mb-2">บทบาทผู้ใช้</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    disabled={user.username === currentUser.username}
                                    className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-700/60 disabled:cursor-not-allowed"
                                >
                                    <option value="student">นักศึกษา</option>
                                    <option value="teacher">อาจารย์</option>
                                    <option value="admin">ผู้ดูแลระบบ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-cyan-400 mb-2">{formData.role === 'student' ? 'สาขาวิชา' : 'ภาควิชา'}</label>
                                <input type="text" name="academicInfo" value={formData.academicInfo} onChange={handleInputChange} className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-cyan-400 mb-2">
                                รหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="กรอกรหัสผ่านใหม่"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <button onClick={onClose} className="w-full px-5 py-3 text-lg font-bold text-amber-400 bg-gray-800 border border-amber-500/50 rounded-lg hover:bg-amber-500/10">ยกเลิก</button>
                        <button onClick={handleSave} className="w-full px-5 py-3 text-lg font-bold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-300">บันทึกการเปลี่ยนแปลง</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AdminPanel = (props: AdminPanelProps) => {
  const { allUsers, allSubjects, allRecords, allSessions, currentUser, onDeleteUser, onDeleteSubject, onUpdateUser, showToast, setConfirmAction, setConfirmMessage } = props;
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const userCounts = useMemo(() => {
    return {
      total: allUsers.length,
      students: allUsers.filter(u => u.role === 'student').length,
      teachers: allUsers.filter(u => u.role === 'teacher').length,
      admins: allUsers.filter(u => u.role === 'admin').length,
    }
  }, [allUsers]);

  const confirmDeleteUser = (username: string) => {
    if (username === currentUser.username) {
      showToast("ไม่สามารถลบบัญชีของผู้ดูแลระบบที่ใช้งานอยู่ได้", "error");
      return;
    }
    setConfirmMessage({
        title: `ยืนยันการลบบัญชี`,
        body: `คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้ "${username}"? การกระทำนี้จะลบรายวิชาและประวัติการเช็คชื่อทั้งหมดที่เกี่ยวข้องกับผู้ใช้นี้อย่างถาวร`
    });
    setConfirmAction(() => () => {
        onDeleteUser(username);
        showToast(`ลบบัญชี "${username}" เรียบร้อยแล้ว`, 'success');
    });
  };

  const confirmDeleteSubject = (subject: Subject) => {
     setConfirmMessage({
        title: `ยืนยันการลบรายวิชา`,
        body: `คุณแน่ใจหรือไม่ว่าต้องการลบรายวิชา "${subject.name}" ของ "${subject.teacherUsername}"? ประวัติการเช็คชื่อทั้งหมดของวิชานี้จะถูกลบไปด้วย`
    });
    setConfirmAction(() => () => {
        onDeleteSubject(subject.id);
        showToast(`ลบรายวิชา "${subject.name}" เรียบร้อยแล้ว`, 'success');
    });
  };
  
  const handleUpdateUser = (username: string, updates: Partial<User>) => {
    onUpdateUser(username, updates);
    showToast(`อัปเดตข้อมูลผู้ใช้ "${username}" เรียบร้อยแล้ว`, 'success');
    const updatedUser = allUsers.find(u => u.username === username);
    if (updatedUser) {
        setEditingUser({ ...updatedUser, ...updates });
    }
  }

  const getRoleDisplayName = (user: User) => {
    switch(user.role) {
        case 'admin': return <p className="text-xs text-amber-400 font-bold">ผู้ดูแลระบบ</p>;
        case 'teacher': return <p className="text-xs text-cyan-400">อาจารย์</p>;
        case 'student': return <p className="text-xs text-green-400">นักศึกษา</p>;
    }
  }

  const studentAttendancePercentages = useMemo(() => {
    const percentages = new Map<string, number>();
    const students = allUsers.filter(u => u.role === 'student');
    students.forEach(student => {
        const studentRecords = allRecords.filter(r => r.studentIdentifier === student.username);
        if (studentRecords.length === 0) {
            percentages.set(student.username, 0);
            return;
        }

        const attendedSubjectIds = [...new Set(studentRecords.map(r => r.subjectId))];
        const totalApplicableSessions = allSessions.filter(s => attendedSubjectIds.includes(s.subjectId)).length;

        if (totalApplicableSessions === 0) {
            percentages.set(student.username, 0);
            return;
        }
        
        const percentage = (studentRecords.length / totalApplicableSessions) * 100;
        percentages.set(student.username, percentage);
    });
    return percentages;
  }, [allUsers, allRecords, allSessions]);

  return (
    <div className="fade-in space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-white">แผงควบคุมผู้ดูแลระบบ</h1>
        <p className="text-gray-400 mt-1">จัดการข้อมูลทั้งหมดในระบบ</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<UsersIcon/>} title="บัญชีทั้งหมด" value={userCounts.total} color="text-purple-400" />
          <StatCard icon={<UserIcon/>} title="นักศึกษา" value={userCounts.students} color="text-green-400" />
          <StatCard icon={<UserIcon/>} title="อาจารย์" value={userCounts.teachers} color="text-cyan-400" />
          <StatCard icon={<ShieldIcon/>} title="ผู้ดูแลระบบ" value={userCounts.admins} color="text-amber-400" />
      </div>

      {/* User Management */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 card-glow">
        <h2 className="text-2xl font-semibold text-cyan-400 mb-4">จัดการบัญชีผู้ใช้</h2>
        <div className="space-y-3">
          {allUsers.length > 0 ? (
            allUsers.map(user => (
              <div key={user.username} className="bg-gray-900/60 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-start gap-4 transition hover:bg-gray-800/80">
                <div className="flex items-start gap-4 flex-grow">
                  <Avatar user={user} size="sm" />
                  <div className="flex-grow">
                    <p className="font-bold text-white">{`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}</p>
                    { (user.firstName || user.lastName) && <p className="text-sm text-gray-400 font-mono">@{user.username}</p> }
                    <div className="mt-1">{getRoleDisplayName(user)}</div>
                    {user.role === 'student' && (
                        <div className="mt-2">
                           <div className="flex justify-between items-baseline text-xs mb-1">
                                <span className="text-gray-400">การเข้าเรียนรวม</span>
                                <span className="font-bold text-white">{Math.round(studentAttendancePercentages.get(user.username) || 0)}%</span>
                            </div>
                           <PercentageBar percentage={studentAttendancePercentages.get(user.username) || 0} height="sm" />
                        </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 self-start">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-colors"
                    aria-label={`Edit user ${user.username}`}
                  >
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => confirmDeleteUser(user.username)}
                    disabled={user.username === currentUser.username}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    aria-label={`Delete user ${user.username}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-4">ไม่พบบัญชีผู้ใช้</p>
          )}
        </div>
      </div>
      
      {/* Subject Management */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 card-glow">
        <h2 className="text-2xl font-semibold text-cyan-400 mb-4">จัดการรายวิชาทั้งหมด</h2>
        <div className="space-y-3">
          {allSubjects.length > 0 ? (
            allSubjects.map(subject => (
              <div key={subject.id} className="bg-gray-900/60 p-4 rounded-lg flex justify-between items-center transition hover:bg-gray-800/80">
                <div>
                  <p className="font-bold text-white">{subject.name} <span className="text-sm text-gray-400 font-mono">({subject.code})</span></p>
                  <p className="text-sm text-cyan-400">ผู้สอน: {subject.teacherUsername}</p>
                </div>
                <button
                  onClick={() => confirmDeleteSubject(subject)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                  aria-label={`Delete subject ${subject.name}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-4">ยังไม่มีรายวิชาในระบบ</p>
          )}
        </div>
      </div>
      
      {editingUser && (
        <EditUserModal 
            user={editingUser} 
            currentUser={currentUser}
            onClose={() => setEditingUser(null)} 
            onUpdateUser={handleUpdateUser}
        />
      )}
    </div>
  );
};

export default AdminPanel;