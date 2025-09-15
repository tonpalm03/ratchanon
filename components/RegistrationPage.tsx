import React, { useState, useEffect, ChangeEvent } from 'react';
import { User, UserRole, ToastMessage, UserTitle } from '../types';
import { UserIcon, SpinnerIcon } from './icons';

interface RegistrationPageProps {
  onRegister: (newUser: Omit<User, 'passwordHash'> & {password: string}) => {success: boolean, message: string};
  onNavigateToLogin: () => void;
  showToast: (message: string, type: ToastMessage['type']) => void;
}

const RegistrationPage = ({ onRegister, onNavigateToLogin, showToast }: RegistrationPageProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [title, setTitle] = useState<UserTitle>('นาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [academicInfo, setAcademicInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

  useEffect(() => {
    if (confirmPassword || password) {
      setPasswordsMatch(password === confirmPassword && password !== '');
    } else {
      setPasswordsMatch(null);
    }
  }, [password, confirmPassword]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          showToast("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 2MB", 'error');
          return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicture(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim() || !confirmPassword.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !dateOfBirth.trim() || !academicInfo.trim()) {
      showToast('กรุณากรอกข้อมูลให้ครบทุกช่อง', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน', 'error');
      return;
    }
    
    setIsLoading(true);

    setTimeout(() => {
        const result = onRegister({ 
            username, 
            password, 
            role, 
            title,
            firstName,
            lastName,
            profilePicture: profilePicture ?? undefined,
            email,
            dateOfBirth,
            major: role === 'student' ? academicInfo : undefined,
            department: role === 'teacher' ? academicInfo : undefined
        });

        if (result.success) {
            showToast(result.message, 'success');
            setTimeout(() => {
                onNavigateToLogin();
            }, 1500);
        } else {
            showToast(result.message, 'error');
            setIsLoading(false);
        }
    }, 500); // Simulate network delay
  };
  
  const getConfirmPasswordClass = (): string => {
    const baseClasses = "w-full bg-gray-900/70 border text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition";
    if (passwordsMatch === true) {
      return `${baseClasses} border-green-500/50 focus:ring-green-500`;
    }
    if (passwordsMatch === false && confirmPassword) {
      return `${baseClasses} border-red-500/50 focus:ring-red-500`;
    }
    return `${baseClasses} border-cyan-500/30 focus:ring-cyan-500`;
  };

  return (
    <main className="w-full max-w-lg">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl shadow-lg card-glow overflow-hidden">
        <div className="p-8">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-cyan-400 text-glow tracking-wide">
              สร้างบัญชีใหม่
            </h1>
            <p className="text-gray-400 mt-2">เข้าร่วมระบบเช็คชื่อ QR</p>
          </header>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
                <label htmlFor="profile-picture-upload" className="cursor-pointer">
                    {profilePicture ? (
                        <img src={profilePicture} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400"/>
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-500">
                           <UserIcon className="w-10 h-10 text-gray-400"/>
                        </div>
                    )}
                </label>
                <input id="profile-picture-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isLoading}/>
                <p className="text-sm text-gray-400">เลือกรูปโปรไฟล์ (ไม่บังคับ)</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                    <label htmlFor="reg-title" className="block text-sm font-medium text-cyan-400 mb-2">คำนำหน้า</label>
                    <select id="reg-title" value={title} onChange={(e) => setTitle(e.target.value as UserTitle)} className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" disabled={isLoading}>
                        <option value="นาย">นาย</option>
                        <option value="นาง">นาง</option>
                        <option value="นางสาว">นางสาว</option>
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="reg-firstname" className="block text-sm font-medium text-cyan-400 mb-2">ชื่อจริง</label>
                    <input id="reg-firstname" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" placeholder="ชื่อจริง" required disabled={isLoading} />
                </div>
            </div>
             <div>
                <label htmlFor="reg-lastname" className="block text-sm font-medium text-cyan-400 mb-2">นามสกุล</label>
                <input id="reg-lastname" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" placeholder="นามสกุล" required disabled={isLoading} />
            </div>
            
            <div>
              <label htmlFor="reg-username" className="block text-sm font-medium text-cyan-400 mb-2">
                ชื่อผู้ใช้ / รหัสนักศึกษา
              </label>
              <input
                id="reg-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                placeholder="เลือกชื่อผู้ใช้ของคุณ"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-cyan-400 mb-2">
                อีเมล
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                placeholder="example@email.com"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="reg-dob" className="block text-sm font-medium text-cyan-400 mb-2">
                วันเกิด
              </label>
              <input
                id="reg-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="reg-academic" className="block text-sm font-medium text-cyan-400 mb-2">
                {role === 'student' ? 'สาขาวิชา' : 'ภาควิชา'}
              </label>
              <input
                id="reg-academic"
                type="text"
                value={academicInfo}
                onChange={(e) => setAcademicInfo(e.target.value)}
                className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                placeholder={role === 'student' ? 'เช่น วิศวกรรมซอฟต์แวร์' : 'เช่น ภาควิชาวิทยาการคอมพิวเตอร์'}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="reg-password"className="block text-sm font-medium text-cyan-400 mb-2">
                รหัสผ่าน
              </label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                placeholder="********"
                required
                disabled={isLoading}
              />
            </div>
             <div>
              <label htmlFor="confirm-password"className="block text-sm font-medium text-cyan-400 mb-2">
                ยืนยันรหัสผ่าน
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={getConfirmPasswordClass()}
                placeholder="********"
                required
                aria-invalid={passwordsMatch === false}
                aria-describedby="password-match-status"
                disabled={isLoading}
              />
              <div id="password-match-status" className="h-4 mt-1 text-xs" aria-live="polite">
                {passwordsMatch === true && <p className="text-green-400">รหัสผ่านตรงกัน</p>}
                {passwordsMatch === false && confirmPassword && <p className="text-red-400">รหัสผ่านไม่ตรงกัน</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">คุณคือ?</label>
              <div className="flex gap-4">
                  <button type="button" onClick={() => setRole('teacher')} className={`w-full py-2 rounded-lg transition ${role === 'teacher' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300'}`} disabled={isLoading}>อาจารย์</button>
                  <button type="button" onClick={() => setRole('student')} className={`w-full py-2 rounded-lg transition ${role === 'student' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300'}`} disabled={isLoading}>นักศึกษา</button>
              </div>
            </div>

            <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || passwordsMatch === false}
                  className="w-full flex items-center justify-center px-5 py-3 text-lg font-bold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-wait"
                >
                  {isLoading ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : 'สร้างบัญชี'}
                </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              มีบัญชีอยู่แล้ว?{' '}
              <button onClick={onNavigateToLogin} className="font-semibold text-cyan-400 hover:text-cyan-300 transition">
                เข้าสู่ระบบที่นี่
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegistrationPage;