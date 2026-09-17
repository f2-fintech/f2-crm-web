export interface DashboardStats {
  totalLeads: number;

  todayLeads: number;

  monthlyLeads: number;

  customers: number;

  applications: number;

  approved: number;

  rejected: number;

  followUps: number;
}

export interface LeadStatusChart {
  new: number;

  contacted: number;

  followUp: number;

  approved: number;

  rejected: number;
}

export interface LeadSourceChart {
  website: number;

  facebook: number;

  google: number;

  instagram: number;

  manual: number;

  dialer: number;
}

export interface PerformanceChart {
  categories: string[];

  leads: number[];

  applications: number[];
}

export interface MonthlyLeadChart {
  data: number[];
}

export interface RecentLead {
  _id: string;

  fullName: string;

  phone: string;

  loanAmount: number;

  source: string;

  status: string;

  createdAt: string;

  assignedTo?: {
    _id: string;

    firstName: string;

    lastName: string;
  };
}

export interface RecentApplication {
  _id: string;

  applicationNo: string;

  customerName: string;

  lender: string;

  loanAmount: number;

  status: string;

  createdAt: string;
}

export interface RecentCustomer {
  _id: string;

  customerId: string;

  fullName: string;

  phone: string;

  email: string;

  city: string;

  status: string;

  createdAt: string;
}

export interface DashboardActivity {
  _id: string;

  title: string;

  description: string;

  type:
    | "LEAD"
    | "CUSTOMER"
    | "APPLICATION"
    | "FOLLOWUP"
    | "APPROVED";

  createdAt: string;

  href?: string;
}

export interface DashboardResponse {
  stats: DashboardStats;

  leadStatus: LeadStatusChart;

  leadSource: LeadSourceChart;

  monthlyChart: MonthlyLeadChart;

  performance: PerformanceChart;

  recentLeads: RecentLead[];

  recentApplications: RecentApplication[];

  recentCustomers: RecentCustomer[];

  activities: DashboardActivity[];
}