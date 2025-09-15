import React, { useState } from 'react';
import { Subject, ToastMessage } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface SubjectManagerProps {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id' | 'teacherUsername'>) => void;
  onDeleteSubject: (subjectId: string) => void;
  showToast: (message: string, type: ToastMessage['type']) => void;
  setConfirmAction: (action: (() => void) | null) => void;
  setConfirmMessage: (message: { title: string; body: string }) => void;
}

const SubjectManager = ({ subjects, onAddSubject, onDeleteSubject, showToast, setConfirmAction, setConfirmMessage }: SubjectManagerProps) => {
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !subjectCode.trim()) {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }
    onAddSubject({ name: subjectName, code: subjectCode });
    showToast(`เพิ่มรายวิชา "${subjectName}" สำเร็จ`, 'success');
    setSubjectName('');
    setSubjectCode('');
  };

  const confirmDelete = (subject: Subject) => {
    setConfirmMessage({
        title: `ยืนยันการลบรายวิชา`,
        body: `คุณต้องการลบวิชา "${subject.name}" ใช่หรือไม่? การกระทำนี้จะลบประวัติการเช็คชื่อทั้งหมดของวิชานี้ด้วย`
    });
    setConfirmAction(() => () => {
        onDeleteSubject(subject.id);
        showToast(`ลบรายวิชา "${subject.name}" เรียบร้อยแล้ว`, 'success');
    });
  };

  return (
    <div className="fade-in space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-white">จัดการรายวิชา</h1>
        <p className="text-gray-400 mt-1">เพิ่ม ลบ และแก้ไขรายวิชาของคุณ</p>
      </header>

      {/* Add Subject Form */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 card-glow">
        <h2 className="text-2xl font-semibold text-cyan-400 mb-4">เพิ่มรายวิชาใหม่</h2>
        <form onSubmit={handleAddSubject} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-1">
            <label htmlFor="subject-code" className="block text-sm font-medium text-cyan-400 mb-2">รหัสวิชา</label>
            <input
              id="subject-code"
              type="text"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="เช่น CS101"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="subject-name" className="block text-sm font-medium text-cyan-400 mb-2">ชื่อรายวิชา</label>
            <input
              id="subject-name"
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full bg-gray-900/70 border border-cyan-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="เช่น Introduction to Programming"
            />
          </div>
          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 font-bold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors"
            >
              <PlusIcon className="w-5 h-5"/>
              เพิ่มรายวิชา
            </button>
          </div>
        </form>
      </div>

      {/* Subjects List */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 card-glow">
        <h2 className="text-2xl font-semibold text-cyan-400 mb-4">รายวิชาทั้งหมด</h2>
        <div className="space-y-3">
          {subjects.length > 0 ? (
            subjects.map(subject => (
              <div key={subject.id} className="bg-gray-900/60 p-4 rounded-lg flex justify-between items-center transition hover:bg-gray-800/80">
                <div>
                  <p className="font-bold text-white">{subject.name}</p>
                  <p className="text-sm text-cyan-400 font-mono">{subject.code}</p>
                </div>
                <button
                  onClick={() => confirmDelete(subject)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                  aria-label={`Delete ${subject.name}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-4">ยังไม่มีรายวิชาที่สร้างไว้</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectManager;
