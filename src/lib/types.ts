export type ReferenceCategory = "core" | "domain" | "proof" | "brand";

export const REFERENCE_CATEGORIES: ReferenceCategory[] = ["core", "domain", "proof", "brand"];

export const CORE_FILE_KEYS = ["soul", "offer", "audience", "voice"] as const;
export type CoreFileKey = (typeof CORE_FILE_KEYS)[number];

export interface ReferenceFile {
  name: string;
  path: string;
  category: ReferenceCategory;
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
  categoryCounts: Record<ReferenceCategory, number>;
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
