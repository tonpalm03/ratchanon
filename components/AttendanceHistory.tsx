import React, { useState, useMemo } from 'react';
import { AttendanceRecord, Subject, User, AttendanceSession } from '../types';
import { DownloadIcon, FileTextIcon, TrendingUpIcon } from './icons';
import { Avatar } from './DashboardPage';
import PercentageBar from './PercentageBar';

declare global {
    interface Window {
        jspdf: any;
    }
}

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
  subjects: Subject[];
  sessions: AttendanceSession[];
  user: User;
  allUsers: User[];
  allRecords: AttendanceRecord[];
  allSessions: AttendanceSession[];
}

const StudentSummaryCard = ({ user, allRecords, allSessions }: { user: User, allRecords: AttendanceRecord[], allSessions: AttendanceSession[] }) => {
    const studentStats = useMemo(() => {
        const studentRecords = allRecords.filter(r => r.studentIdentifier === user.username);
        const attendedCount = studentRecords.length;
        
        if (attendedCount === 0) {
            return { attended: 0, total: 0, percentage: 0 };
        }

        const attendedSubjectIds = [...new Set(studentRecords.map(r => r.subjectId))];
        const totalSessionsForAttendedSubjects = allSessions.filter(s => attendedSubjectIds.includes(s.subjectId)).length;

        if (totalSessionsForAttendedSubjects === 0) {
            return { attended: attendedCount, total: 0, percentage: 0 };
        }
        
        const percentage = (attendedCount / totalSessionsForAttendedSubjects) * 100;
        return { attended: attendedCount, total: totalSessionsForAttendedSubjects, percentage };

    }, [user.username, allRecords, allSessions]);

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 card-glow">
            <div className="flex items-center gap-4">
                <TrendingUpIcon className="w-10 h-10 text-cyan-400"/>
                <div>
                    <h2 className="text-2xl font-bold text-white">ภาพรวมการเข้าเรียน</h2>
                    <p className="text-gray-400">สรุปการเข้าเรียนทั้งหมดของคุณ</p>
                </div>
            </div>
            <div className="mt-4 space-y-3">
                <div className="flex justify-between items-baseline">
                    <p className="text-gray-300">เปอร์เซ็นต์การเข้าเรียน</p>
                    <p className="text-3xl font-bold text-white">{Math.round(studentStats.percentage)}<span className="text-lg text-gray-400">%</span></p>
                </div>
                <PercentageBar percentage={studentStats.percentage} />
                <p className="text-sm text-center text-gray-400">เข้าเรียน {studentStats.attended} ครั้ง จากทั้งหมด {studentStats.total} ครั้ง</p>
            </div>
        </div>
    );
}

const TeacherStatsView = ({ user, allUsers, subjects, allRecords, allSessions }: { user: User, allUsers: User[], subjects: Subject[], allRecords: AttendanceRecord[], allSessions: AttendanceSession[] }) => {
    const teacherSubjectIds = useMemo(() => subjects.map(s => s.id), [subjects]);

    const studentStats = useMemo(() => {
        const relevantStudentUsernames = new Set(allRecords
            .filter(r => teacherSubjectIds.includes(r.subjectId))
            .map(r => r.studentIdentifier));

        const totalTeacherSessions = allSessions.filter(s => teacherSubjectIds.includes(s.subjectId)).length;
        if (totalTeacherSessions === 0) return [];

        return Array.from(relevantStudentUsernames).map(username => {
            const student = allUsers.find(u => u.username === username);
            const attendedCount = allRecords.filter(r => r.studentIdentifier === username && teacherSubjectIds.includes(r.subjectId)).length;
            const percentage = (attendedCount / totalTeacherSessions) * 100;
            return {
                user: student,
                attended: attendedCount,
                total: totalTeacherSessions,
                percentage
            };
        }).sort((a, b) => (a.user?.username || '').localeCompare(b.user?.username || ''));

    }, [teacherSubjectIds, allRecords, allSessions, allUsers]);
    
    if (studentStats.length === 0) {
        return <p className="text-center text-gray-400 py-8">ยังไม่มีข้อมูลสถิติของนักศึกษา</p>
    }

    return (
        <div className="space-y-3">
            {studentStats.map(stat => stat.user && (
                <div key={stat.user.username} className="bg-gray-900/60 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition hover:bg-gray-800/80">
                    <div className="flex items-center gap-4">
                        <Avatar user={stat.user} size="sm" />
                        <div>
                            <p className="font-bold text-white">{`${stat.user.firstName || ''} ${stat.user.lastName || ''}`.trim()}</p>
                            <p className="text-sm text-gray-400 font-mono">@{stat.user.username}</p>
                        </div>
                    </div>
                    <div className="w-full sm:w-1/2 lg:w-1/3">
                        <div className="flex justify-between items-baseline text-sm mb-1">
                            <span className="text-gray-300">เข้าเรียน {stat.attended}/{stat.total} ครั้ง</span>
                            <span className="font-bold text-white">{Math.round(stat.percentage)}%</span>
                        </div>
                        <PercentageBar percentage={stat.percentage} />
                    </div>
                </div>
            ))}
        </div>
    );
};

const AttendanceHistory = ({ records, subjects, sessions, user, allUsers, allRecords, allSessions }: AttendanceHistoryProps) => {
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'stats'>('list');

  const getSubjectName = (subjectId: string): string => {
    return subjects.find(s => s.id === subjectId)?.name || 'ไม่พบรายวิชา';
  };

  const relevantSessions = useMemo(() => {
    let userSessions = sessions;
    if(user.role === 'teacher') {
        userSessions = sessions.filter(s => s.teacherUsername === user.username);
    }
    if(user.role === 'student') {
        const attendedSessionIds = new Set(records.filter(r => r.studentIdentifier === user.username).map(r => r.sessionId));
        userSessions = sessions.filter(s => attendedSessionIds.has(s.id));
    }
    
    const filtered = filterSubjectId === 'all'
      ? userSessions
      : userSessions.filter(session => session.subjectId === filterSubjectId);
      
    return filtered.sort((a, b) => b.startTime - a.startTime);

  }, [sessions, records, user, filterSubjectId]);

  const getRecordsForSession = (sessionId: string) => {
    return records.filter(r => r.sessionId === sessionId);
  };
  
  const exportToCSV = () => {
    const headers = "Session_Date,Subject,Student_ID,Check_In_Time\n";
    const rows = relevantSessions.flatMap(session => {
        const sessionRecords = getRecordsForSession(session.id);
        const sessionDate = `"${new Date(session.startTime).toLocaleDateString('th-TH')}"`;
        const subjectName = `"${getSubjectName(session.subjectId)}"`;
        return sessionRecords.map(r => {
            const studentId = `"${r.studentIdentifier}"`;
            const checkInTime = `"${new Date(r.timestamp).toLocaleTimeString('th-TH')}"`;
            return [sessionDate, subjectName, studentId, checkInTime].join(',');
        });
    }).join('\n');

    const csvContent = headers + rows;
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'attendance_history.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.addSarabanFont();
    doc.setFont('Saraban', 'normal');

    doc.text('ประวัติการเช็คชื่อ', 14, 22);
    
    const headers = [['วันที่', 'รายวิชา', 'รหัสนักศึกษา', 'เวลาเช็คชื่อ']];
    
    const body = relevantSessions.flatMap(session => {
        const sessionRecords = getRecordsForSession(session.id);
        const sessionDate = new Date(session.startTime).toLocaleDateString('th-TH');
        const subjectName = getSubjectName(session.subjectId);
        return sessionRecords.map(r => [
            sessionDate,
            subjectName,
            r.studentIdentifier,
            new Date(r.timestamp).toLocaleTimeString('th-TH')
        ]);
    });

    doc.autoTable({
      head: headers,
      body: body,
      startY: 30,
      styles: { 
        font: 'Saraban',
        fontStyle: 'normal'
      },
      headStyles: {
        fontStyle: 'bold'
      }
    });

    doc.save('attendance_history.pdf');
  };

  return (
    <div className="fade-in space-y-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">ประวัติการเช็คชื่อ</h1>
          <p className="text-gray-400 mt-1">
            {user.role === 'student' 
              ? 'ประวัติการเข้าเรียนทั้งหมดของคุณ' 
              : 'ดูและจัดการบันทึกการเข้าเรียนทั้งหมด'}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={exportToPDF}
                disabled={relevantSessions.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-2 font-bold text-gray-900 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                <FileTextIcon className="w-5 h-5"/>
                ส่งออกเป็น PDF
            </button>
            <button 
                onClick={exportToCSV}
                disabled={relevantSessions.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-2 font-bold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                <DownloadIcon className="w-5 h-5"/>
                ส่งออกเป็น CSV
            </button>
        </div>
      </header>
      
      {user.role === 'student' && <StudentSummaryCard user={user} allRecords={allRecords} allSessions={allSessions} />}

      <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 card-glow">
        {user.role !== 'student' && (
            <div className="flex border-b border-cyan-500/20 mb-6">
                <button onClick={() => setView('list')} className={`px-4 py-2 text-sm sm:text-base font-semibold transition-colors ${view === 'list' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>
                    ประวัติเซสชัน
                </button>
                <button onClick={() => setView('stats')} className={`px-4 py-2 text-sm sm:text-base font-semibold transition-colors ${view === 'stats' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>
                    สถิตินักศึกษา
                </button>
            </div>
        )}

        {view === 'list' && (
            <>
                {user.role !== 'student' && (
                <div className="mb-4">
                    <label htmlFor="subject-filter" className="block text-sm font-medium text-cyan-400 mb-2">กรองตามรายวิชา</label>
                    <select
                    id="subject-filter"
                    value={filterSubjectId}
                    onChange={e => setFilterSubjectId(e.target.value)}
                    className="w-full max-w-sm bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                    <option value="all">ทุกรายวิชา</option>
                    {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                    ))}
                    </select>
                </div>
                )}
                
                <div className="space-y-3">
                {relevantSessions.length > 0 ? (
                    relevantSessions.map(session => {
                    const sessionRecords = getRecordsForSession(session.id);
                    const isExpanded = expandedSessionId === session.id;
                    return (
                        <div key={session.id} className="bg-gray-900/60 rounded-lg overflow-hidden">
                        <button onClick={() => setExpandedSessionId(isExpanded ? null : session.id)} className="w-full p-4 flex justify-between items-center text-left hover:bg-gray-800/80 transition">
                            <div>
                            <p className="font-bold text-white">{getSubjectName(session.subjectId)}</p>
                            <p className="text-sm text-gray-400">{new Date(session.startTime).toLocaleString('th-TH')}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-cyan-400 text-lg">{sessionRecords.length} คน</p>
                                <p className="text-xs text-gray-500">คลิกเพื่อดูรายละเอียด</p>
                            </div>
                        </button>
                        {isExpanded && (
                            <div className="bg-gray-900/80 p-4 border-t border-cyan-500/20">
                            <h4 className="text-cyan-400 font-semibold mb-2">รายชื่อผู้เข้าเรียน:</h4>
                            {sessionRecords.length > 0 ? (
                                <ul className="space-y-1 text-sm list-disc list-inside">
                                {sessionRecords.map(r => (
                                    <li key={r.id} className="text-gray-300">
                                    <span className="font-mono text-white">{r.studentIdentifier}</span>
                                    <span className="text-gray-500 ml-2">({new Date(r.timestamp).toLocaleTimeString('th-TH')})</span>
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">ไม่มีบันทึกการเข้าเรียนในเซสชันนี้</p>
                            )}
                            </div>
                        )}
                        </div>
                    )
                    })
                ) : (
                    <p className="text-center text-gray-400 py-8">ไม่พบข้อมูลเซสชันการเช็คชื่อ</p>
                )}
                </div>
            </>
        )}
        {view === 'stats' && user.role !== 'student' && (
            <TeacherStatsView user={user} allUsers={allUsers} subjects={subjects} allRecords={allRecords} allSessions={allSessions} />
        )}

      </div>
    </div>
  );
};


export default AttendanceHistory;