export type UserRole = 'admin' | 'teacher' | 'student';
export type UserTitle = 'นาย' | 'นาง' | 'นางสาว';

export interface User {
  username: string;
  passwordHash: string; // In a real app, this would be a hash, not the plain password.
  role: UserRole;
  title?: UserTitle;
  firstName?: string;
  lastName?: string;
  profilePicture?: string; // Base64 encoded image
  email?: string;
  dateOfBirth?: string;
  major?: string; // For students
  department?: string; // for teachers
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherUsername: string;
}

export interface AttendanceSession {
  id: string;
  subjectId: string;
  teacherUsername: string;
  startTime: number;
  endTime?: number;
}

export interface AttendanceRecord {
  id: string;
  studentIdentifier: string;
  timestamp: number;
  subjectId: string;
  sessionId: string;
}

export type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};