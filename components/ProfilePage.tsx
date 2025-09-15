import React, { useState, useEffect, ChangeEvent } from 'react';
import { User, ToastMessage, UserTitle } from '../types';
import { Avatar } from './DashboardPage';
import { MailIcon, CalendarIcon, BriefcaseIcon, SpinnerIcon, UserIcon, EditIcon } from './icons';

interface ProfilePageProps {
  user: User;
  onUpdateProfile: (updates: Partial<Omit<User, 'username' | 'role'>>) => void;
  showToast: (message: string, type: ToastMessage['type']) => void;
}

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    isEditing: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    name: string;
    type?: string;
    disabled?: boolean;
}

const InfoRow = ({ icon, label, value, isEditing, onChange, name, type = 'text', disabled }: InfoRowProps) => (
    <div className="flex items-center gap-4">
        <div className="text-cyan-400 w-6 h-6">{icon}</div>
        <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400">{label}</label>
            {isEditing ? (
                 <input 
                    type={type} 
                    name={name}
                    value={value} 
                    onChange={onChange}
                    disabled={disabled}
                    className="w-full bg-transparent border-b border-cyan-500/30 text-white pt-1 pb-1 focus:outline-none focus:border-cyan-500 transition" 
                />
            ) : (
                <p className="text-white font-semibold text-lg">{value || 'N/A'}</p>
            )}
        </div>
    </div>
);

const ProfilePage = ({ user, onUpdateProfile, showToast }: ProfilePageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: user.title || 'นาย',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    dateOfBirth: user.dateOfBirth || '',
    academicInfo: (user.role === 'student' ? user.major : user.department) || '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(user.profilePicture || null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      title: user.title || 'นาย',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      dateOfBirth: user.dateOfBirth || '',
      academicInfo: (user.role === 'student' ? user.major : user.department) || '',
    });
    setImagePreview(user.profilePicture || null);
  }, [user, isEditing]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          showToast("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 2MB", 'error');
          return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (newPassword && newPassword !== confirmPassword) {
      showToast('รหัสผ่านใหม่ไม่ตรงกัน', 'error');
      return;
    }
    
    setIsLoading(true);
    
    const updates: Partial<Omit<User, 'username' | 'role'>> = {};
    
    if (formData.title !== (user.title || '')) updates.title = formData.title as UserTitle;
    if (formData.firstName !== (user.firstName || '')) updates.firstName = formData.firstName;
    if (formData.lastName !== (user.lastName || '')) updates.lastName = formData.lastName;
    if (formData.email !== (user.email || '')) updates.email = formData.email;
    if (formData.dateOfBirth !== (user.dateOfBirth || '')) updates.dateOfBirth = formData.dateOfBirth;
    
    if (user.role === 'student' && formData.academicInfo !== (user.major || '')) {
        updates.major = formData.academicInfo;
    }
    if ((user.role === 'teacher' || user.role === 'admin') && formData.academicInfo !== (user.department || '')) {
        updates.department = formData.academicInfo;
    }
    
    if (imagePreview && imagePreview !== user.profilePicture) {
      updates.profilePicture = imagePreview;
    }
    
    if (newPassword) {
      updates.passwordHash = `hashed_${newPassword}`;
    }

    setTimeout(() => {
        onUpdateProfile(updates);
        setIsLoading(false);
        setIsEditing(false);
        setNewPassword('');
        setConfirmPassword('');
        showToast('บันทึกข้อมูลส่วนตัวสำเร็จ!', 'success');
    }, 500);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const getRoleDisplayName = () => {
    switch(user.role) {
        case 'admin': return <p className="text-amber-400 text-lg font-bold">[ผู้ดูแลระบบ]</p>;
        case 'teacher': return <p className="text-cyan-400 text-lg font-bold">[อาจารย์]</p>;
        case 'student': return <p className="text-green-400 text-lg font-bold">[นักศึกษา]</p>;
    }
  }

  const academicLabel = user.role === 'student' ? 'สาขาวิชา' : 'ภาควิชา';

  return (
    <div className="fade-in space-y-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">ข้อมูลส่วนตัว</h1>
          <p className="text-gray-400 mt-1">ดูและจัดการข้อมูลบัญชีของคุณ</p>
        </div>
        {!isEditing && (
           <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 px-4 py-2 font-bold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors">
                <EditIcon className="w-5 h-5"/>
                แก้ไขข้อมูล
            </button>
        )}
      </header>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 card-glow max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="relative">
                {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-cyan-500/50"/>
                ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-4 border-cyan-500/50">
                        <UserIcon className="w-16 h-16 text-gray-400"/>
                    </div>
                )}
                {isEditing && (
                    <label htmlFor="profile-upload" className="absolute -bottom-2 -right-2 bg-cyan-500 text-white p-2 rounded-full cursor-pointer hover:bg-cyan-400 transition">
                        <EditIcon className="w-5 h-5"/>
                        <input id="profile-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isLoading} />
                    </label>
                )}
            </div>
            { isEditing ? (
                 <div className="mt-4 w-full">
                    <div className="flex gap-2">
                        <div className="w-1/3">
                             <label className="block text-sm font-medium text-cyan-400 mb-1">คำนำหน้า</label>
                            <select name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" disabled={isLoading}>
                                <option value="นาย">นาย</option>
                                <option value="นาง">นาง</option>
                                <option value="นางสาว">นางสาว</option>
                            </select>
                        </div>
                        <div className="w-2/3">
                            <label className="block text-sm font-medium text-cyan-400 mb-1">ชื่อจริง</label>
                             <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" disabled={isLoading} />
                        </div>
                    </div>
                    <div className="mt-2">
                         <label className="block text-sm font-medium text-cyan-400 mb-1">นามสกุล</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" disabled={isLoading} />
                    </div>
                </div>
            ) : (
                <div className="mt-4">
                    <h2 className="text-2xl font-bold text-white">{`${user.title || ''} ${user.firstName || ''} ${user.lastName || ''}`.trim()}</h2>
                    <p className="text-gray-400">@{user.username}</p>
                    {getRoleDisplayName()}
                </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex-1 w-full">
            <div className="space-y-6">
                <InfoRow icon={<MailIcon/>} label="อีเมล" value={formData.email} isEditing={isEditing} onChange={handleInputChange} name="email" type="email" disabled={isLoading}/>
                <InfoRow icon={<CalendarIcon/>} label="วันเกิด" value={formData.dateOfBirth} isEditing={isEditing} onChange={handleInputChange} name="dateOfBirth" type="date" disabled={isLoading}/>
                <InfoRow icon={<BriefcaseIcon/>} label={academicLabel} value={formData.academicInfo} isEditing={isEditing} onChange={handleInputChange} name="academicInfo" disabled={isLoading}/>
                
                {isEditing && (
                    <div className="mt-8 pt-6 border-t border-gray-700/50">
                        <h2 className="text-xl font-semibold text-cyan-400">เปลี่ยนรหัสผ่าน</h2>
                        <div className="mt-4 space-y-4">
                            <div>
                               <label className="block text-sm font-medium text-cyan-400 mb-2">รหัสผ่านใหม่</label>
                               <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน" disabled={isLoading} />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-cyan-400 mb-2">ยืนยันรหัสผ่านใหม่</label>
                               <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="ยืนยันรหัสผ่านใหม่ (หากมีการเปลี่ยนแปลง)" disabled={isLoading} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isEditing && (
                <div className="flex gap-4 mt-8">
                    <button onClick={handleCancel} disabled={isLoading} className="w-full px-5 py-3 text-lg font-bold text-amber-400 bg-gray-800 border border-amber-500/50 rounded-lg hover:bg-amber-500/10 disabled:opacity-50">ยกเลิก</button>
                    <button onClick={handleSave} disabled={isLoading} className="w-full flex items-center justify-center px-5 py-3 text-lg font-bold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-300 disabled:bg-gray-600 disabled:cursor-wait">
                        {isLoading ? <SpinnerIcon className="w-6 h-6 animate-spin"/> : 'บันทึกการเปลี่ยนแปลง'}
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;