export interface AdminDashboardStats {
  totalUsers: number;
  jobSeekers: number;
  employers: number;
  admins: number;
  totalCompanies: number;
  totalJobs: number;
  activeJobs: number;
  filledJobs: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  companiesBySector: { sector: string; count: number }[];
  jobsByDepartment: { department: string; count: number }[];
  recentUsers: RecentUser[];
  recentJobs: RecentJob[];
  recentApplications: RecentApplication[];
  userGrowth: GrowthStats;
  jobGrowth: GrowthStats;
  applicationGrowth: GrowthStats;
}

export interface GrowthStats {
  total: number;
  last30Days: number;
  last7Days: number;
}

export interface RecentUser {
  name: string;
  surname: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface RecentJob {
  title: string;
  company: string;
  department: string;
  createdAt: string;
  isFilled: boolean;
}

export interface RecentApplication {
  applicant: string;
  job: string;
  status: string;
  createdAt: string;
}

export interface AdminUser {
  userId: number;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  role: string;
  companyId?: number;
  companyName?: string;
  createdAt: string;
}

export interface AdminCompany {
  companyId: number;
  name: string;
  description?: string;
  location?: string;
  sectorName: string;
  employeeCount: number;
  jobCount: number;
}

export interface AdminJob {
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
  isFilled?: boolean;
}

export interface AdminApplication {
  applicationId: number;
  userId: number;
  applicantName: string;
  applicantEmail: string;
  jobId: number;
  jobTitle: string;
  companyName: string;
  status: string;
  createdAt: string;
}

export interface CreateUserForm {
  name: string;
  surname: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  companyId?: number;
}

export interface CreateCompanyForm {
  name: string;
  description?: string;
  location?: string;
  sectorId: number;
}

export interface UpdateCompanyForm {
  name: string;
  description?: string;
  location?: string;
  sectorId: number;
}

export interface Sector {
  sectorId: number;
  name: string;
}

export interface AdminDepartment {
  departmentId: number;
  name: string;
}

export interface AdminSkill {
  skillId: number;
  name: string;
}

// Admin Navigation Items
export interface AdminNavItem {
  name: string;
  path: string;
  icon: string;
  description: string;
}

export const adminNavItems: AdminNavItem[] = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: '📊',
    description: 'Overview and statistics'
  },
  {
    name: 'Users',
    path: '/admin/users',
    icon: '👥',
    description: 'Manage system users'
  },
  {
    name: 'Companies',
    path: '/admin/companies',
    icon: '🏢',
    description: 'Manage companies'
  },
  {
    name: 'Jobs',
    path: '/admin/jobs',
    icon: '💼',
    description: 'Manage job postings'
  },
  {
    name: 'Applications',
    path: '/admin/applications',
    icon: '📄',
    description: 'View all applications'
  },
  {
    name: 'System',
    path: '/admin/system',
    icon: '⚙️',
    description: 'System settings'
  }
];

// Utility functions for admin panel
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const getGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' };
    case 'employer':
      return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' };
    case 'jobseeker':
      return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
    default:
      return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
  }
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' };
    case 'accepted':
      return { bg: '#d1fae5', text: '#065f46', border: '#10b981' };
    case 'rejected':
      return { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' };
    default:
      return { bg: '#f3f4f6', text: '#374151', border: '#6b7280' };
  }
};