export interface Student {
  id: string;
  socketId: string;
  name: string;
  hasAnswered: boolean;
  joinedAt: number;
}

export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  timeLimit: number;
  startTime: number;
  active: boolean;
  answers: Map<string, number> | { [key: string]: number };
  createdBy: string;
  endTime?: number;
}

export interface PollResult {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  active: boolean;
}

export interface ChatMessage {
  id: string;
  message: string;
  sender: string;
  isTeacher: boolean;
  timestamp: number;
}

export type UserRole = 'teacher' | 'student' | null;

export interface AppState {
  role: UserRole;
  studentName: string;
  currentPoll: Poll | null;
  students: Student[];
  chatMessages: ChatMessage[];
  pollHistory: Poll[];
  isConnected: boolean;
  error: string | null;
  isKickedOut: boolean;
}
