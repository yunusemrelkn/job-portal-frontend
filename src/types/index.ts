import App from "../App";

// src/types/index.ts - Updated with proper role handling
export interface User {
  userId: number;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  role: UserRole; // Changed to use enum
  companyId?: number;
  companyName?: string;
  createdAt: string;
}

// Define the enum to match backend
export enum UserRole {
  Admin = 0,
  Employer = 1,
  JobSeeker = 2
}

// Helper function to convert role enum to string
export const getRoleString = (role: UserRole | string | number): string => {
  if (typeof role === 'string') {
    return role;
  }
  
  if (typeof role === 'number') {
    switch (role) {
      case 0: return 'Admin';
      case 1: return 'Employer';
      case 2: return 'JobSeeker';
      default: return 'Unknown';
    }
  }
  
  // If it's already the enum
  switch (role) {
    case UserRole.Admin: return 'Admin';
    case UserRole.Employer: return 'Employer';
    case UserRole.JobSeeker: return 'JobSeeker';
    default: return 'Unknown';
  }
};

// Helper function to convert string to role enum
export const getRoleEnum = (roleString: string): UserRole => {
  switch (roleString.toLowerCase()) {
    case 'admin': return UserRole.Admin;
    case 'employer': return UserRole.Employer;
    case 'jobseeker': return UserRole.JobSeeker;
    default: return UserRole.JobSeeker;
  }
};

export interface JobSuggestion extends Job {
  matchScore: number;
  matchingSkills: string[];
  totalSkillsRequired: number;
  matchPercentage: number;
  reasonForSuggestion: string;
}

export interface SkillMatch {
  skill: string;
  inCV: boolean;
  inJob: boolean;
}

export interface Job {
  jobId: number;
  title: string;
  description: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  companyName: string;
  departmentName: string;
  createdAt: string;
  skills: string[];
  isFavorited: boolean;
  hasApplied: boolean;
}

export interface CV {
  cvId: number;
  userId: number;
  summary?: string;
  experienceYears?: number;
  educationLevel?: string;
  skillsText?: string;
  createdAt: string;
  skills: string[];
}

export interface Application {
  applicationId: number;
  userId: number;
  applicantName?: string;
  applicantEmail?: string;
  jobId: number;
  jobTitle?: string;
  companyName?: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
  cv?: CV;
}

export enum ApplicationStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2
}

export const getStatusString = (status: ApplicationStatus | string | number): string => {
  if (typeof status === 'string') {
    return status;
  }
  
  if (typeof status === 'number') {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Accepted';
      case 2: return 'Rejected';
      default: return 'Unknown';
    }
  }
  
  // If it's already the enum
  switch (status) {
    case ApplicationStatus.Pending: return 'Pending';
    case ApplicationStatus.Accepted: return 'Accepted';
    case ApplicationStatus.Rejected: return 'Rejected';
    default: return 'Unknown';
  }
};

// Helper function to convert string to role enum
export const getStatusEnum = (statusString: string): ApplicationStatus => {
  switch (statusString.toLowerCase()) {
    case 'pending': return ApplicationStatus.Pending;
    case 'accepted': return ApplicationStatus.Accepted;
    case 'rejected': return ApplicationStatus.Rejected;
    default: return ApplicationStatus.Pending;
  }
};

export interface Skill {
  skillId: number;
  name: string;
}

export interface Company {
  companyId: number;
  name: string;
  description?: string;
  location?: string;
  sectorName: string;
  employeeCount: number;
  jobCount: number;
}