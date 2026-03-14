export interface ReferenceFile {
  name: string;
  path: string;
  exists: boolean;
  content?: string;
  wordCount: number;
  lastModified?: string;
  score: number;
  maxScore: number;
  status: "missing" | "skeleton" | "draft" | "solid" | "strong";
}

export interface ContextScore {
  total: number;
  maxTotal: number;
  percentage: number;
  grade: string;
  files: ReferenceFile[];
  recommendations: string[];
}

export interface InterviewQuestion {
  id: string;
  section: string;
  question: string;
  placeholder: string;
  helpText: string;
  required: boolean;
}

export interface InterviewState {
  currentIndex: number;
  answers: Record<string, string>;
  file: string;
}
