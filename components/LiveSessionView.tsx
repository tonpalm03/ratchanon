import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AttendanceSession, AttendanceRecord, User, Subject, ToastMessage } from '../types';
import { RefreshCwIcon } from './icons';
import { Avatar } from './DashboardPage';

const QR_CODE_LIFESPAN = 60; // seconds

interface LiveSessionViewProps {
    session: AttendanceSession;
    records: AttendanceRecord[];
    onEndSession: () => void;
    onManualAdd: (record: Omit<AttendanceRecord, 'id'>) => void;
    allUsers: User[];
    showToast: (message: string, type: ToastMessage['type']) => void;
    subject?: Subject;
}

const LiveSessionView = ({ session, records, onEndSession, onManualAdd, allUsers, showToast, subject }: LiveSessionViewProps) => {
    const [qrData, setQrData] = useState('');
    const [timeLeft, setTimeLeft] = useState(QR_CODE_LIFESPAN);
    const [manualStudentId, setManualStudentId] = useState('');
    
    const sessionRecords = useMemo(() => {
        return records.filter(r => r.sessionId === session.id)
            .sort((a,b) => b.timestamp - a.timestamp);
    }, [records, session.id]);

    const generateQRCode = useCallback(() => {
        const data = JSON.stringify({
            sessionId: session.id,
            subjectId: session.subjectId,
            timestamp: Date.now(),
            validity: (QR_CODE_LIFESPAN + 5) * 1000 // Add a 5s grace period
        });
        setQrData(data);
        setTimeLeft(QR_CODE_LIFESPAN);
    }, [session.id, session.subjectId]);

    useEffect(() => {
        generateQRCode();
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    generateQRCode();
                    return QR_CODE_LIFESPAN;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [generateQRCode]);

    const handleManualAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualStudentId.trim()) {
            showToast('กรุณากรอกรหัสนักศึกษา', 'error');
            return;
        }
        
        const studentExists = allUsers.some(u => u.username === manualStudentId.trim() && u.role === 'student');
        if(!studentExists) {
            showToast('ไม่พบรหัสนักศึกษานี้ในระบบ', 'error');
            return;
        }

        onManualAdd({
            studentIdentifier: manualStudentId.trim(),
            subjectId: session.subjectId,
            sessionId: session.id,
            timestamp: Date.now(),
        });
        setManualStudentId('');
    };

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`;

    return (
        <div className="fade-in space-y-8">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white">Live Session: {subject?.name || 'Loading...'}</h1>
                    <p className="text-gray-400 mt-1">กำลังเช็คชื่อสำหรับวิชา {subject?.code}</p>
                </div>
                <button onClick={onEndSession} className="px-6 py-3 text-lg font-bold text-gray-900 bg-red-500 rounded-lg hover:bg-red-600 transition">
                    สิ้นสุดเซสชัน
                </button>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* QR Code and Manual Add */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 card-glow">
                        <h2 className="text-2xl font-semibold text-cyan-400 mb-4 text-center">สแกนเพื่อเช็คชื่อ</h2>
                        <div className="bg-white p-4 rounded-lg shadow-inner mx-auto max-w-xs relative">
                            {qrData ? <img src={qrImageUrl} alt="QR Code" width="256" height="256" /> : <div className="w-full aspect-square bg-gray-200 flex items-center justify-center rounded"><p className="text-gray-500">กำลังสร้าง...</p></div>}
                             <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-mono rounded-full px-2 py-1">
                                หมดอายุใน: {timeLeft}s
                             </div>
                        </div>
                        <button onClick={generateQRCode} className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition">
                            <RefreshCwIcon className="w-4 h-4"/> สร้างใหม่
                        </button>
                    </div>
                     <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 card-glow">
                        <h2 className="text-xl font-semibold text-cyan-400 mb-4">เช็คชื่อด้วยตนเอง</h2>
                        <form onSubmit={handleManualAdd} className="space-y-3">
                            <input
                                type="text"
                                value={manualStudentId}
                                onChange={(e) => setManualStudentId(e.target.value)}
                                className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="กรอกรหัสนักศึกษา"
                            />
                            <button type="submit" className="w-full px-5 py-2 font-bold text-gray-900 bg-amber-400 rounded-lg hover:bg-amber-300 transition">
                                เพิ่ม
                            </button>
                        </form>
                    </div>
                </div>

                {/* Attendance List */}
                <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 card-glow min-h-[400px]">
                    <h2 className="text-2xl font-semibold text-cyan-400 mb-4">
                        รายชื่อผู้เข้าเรียน ({sessionRecords.length})
                    </h2>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {sessionRecords.length > 0 ? (
                            sessionRecords.map(record => {
                                const user = allUsers.find(u => u.username === record.studentIdentifier);
                                return (
                                    <div key={record.id} className="bg-gray-900/60 p-3 rounded-lg flex justify-between items-center transition hover:bg-gray-800/80">
                                        <div className="flex items-center gap-3">
                                            {user ? <Avatar user={user} size="sm" /> : <div className="w-10 h-10 rounded-full bg-gray-700"></div>}
                                            <div>
                                                <p className="font-bold text-white">
                                                    {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : record.studentIdentifier}
                                                </p>
                                                {user && <p className="text-xs text-gray-400 font-mono">@{record.studentIdentifier}</p>}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400">{new Date(record.timestamp).toLocaleTimeString('th-TH')}</p>
                                    </div>
                                )
                            })
                        ) : (
                            <p className="text-center text-gray-400 py-16">ยังไม่มีนักศึกษาเช็คชื่อ</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveSessionView;