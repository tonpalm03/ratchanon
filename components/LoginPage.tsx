import React, { useState } from 'react';
import { SpinnerIcon } from './icons';
import { ToastMessage } from '../types';

interface LoginPageProps {
  onLogin: (username: string, passwordHash: string) => boolean;
  onNavigateToRegister: () => void;
  showToast: (message: string, type: ToastMessage['type']) => void;
}

const LoginPage = ({ onLogin, onNavigateToRegister, showToast }: LoginPageProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน', 'error');
      return;
    }
    setIsLoading(true);
    
    setTimeout(() => {
        const passwordHash = `hashed_${password}`;
        const success = onLogin(username, passwordHash);

        if (!success) {
            showToast('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
            setIsLoading(false);
        } else {
            showToast('เข้าสู่ระบบสำเร็จ!', 'success');
            // No need to set loading to false, as the component will unmount
        }
    }, 500); // Simulate network delay
  };

  return (
    <main className="w-full max-w-md">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl shadow-lg card-glow overflow-hidden">
        <div className="p-8">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-cyan-400 text-glow tracking-wide">
              ระบบเช็คชื่อ QR
            </h1>
            <p className="text-gray-400 mt-2">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
          </header>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-cyan-400 mb-2">
                ชื่อผู้ใช้
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                placeholder="เช่น teacher.somchai"
                aria-label="Username"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cyan-400 mb-2">
                รหัสผ่าน
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                placeholder="********"
                aria-label="Password"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-5 py-3 text-lg font-bold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-wait"
            >
              {isLoading ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : 'เข้าสู่ระบบ'}
            </button>
          </form>
           <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              ยังไม่มีบัญชี?{' '}
              <button onClick={onNavigateToRegister} className="font-semibold text-cyan-400 hover:text-cyan-300 transition">
                สร้างบัญชีที่นี่
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
