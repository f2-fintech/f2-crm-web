export enum LeadSource {
  WEBSITE = "WEBSITE",
  FACEBOOK = "FACEBOOK",
  GOOGLE = "GOOGLE",
  DIALER = "DIALER",
  MANUAL = "MANUAL",
  REFERENCE = "REFERENCE",
  WHATSAPP = "WHATSAPP",
  INSTAGRAM = "INSTAGRAM",
  OMS = "OMS",
}

export enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  FOLLOW_UP = "FOLLOW_UP",
  INTERESTED = "INTERESTED",
  DOCUMENT_PENDING = "DOCUMENT_PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  DISBURSED = "DISBURSED",
  LOST = "LOST",
}

export enum LeadPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface Lead {
  _id: string;

  leadId: string;

  omsId?: string;

  applicationId?: string;

  fullName: string;

  phone: string;

  alternatePhone?: string;

  email?: string;

  city: string;

  state?: string;

  loanType: string;

  loanAmount: number;

  monthlyIncome: number;

  employmentType?: string;

  companyName?: string;

  leadSource: LeadSource;

  status: LeadStatus;

  priority: LeadPriority;

  assignedTo?: any;

  branchId?: any;

  departmentId?: any;

  createdBy?: any;

  updatedBy?: any;

  customerId?: any;

  isConverted: boolean;

  remarks?: string;

  lastFollowUp?: string;

  nextFollowUp?: string;

  createdAt: string;

  updatedAt: string;
}

export interface LeadListResponse {
  success: boolean;

  message: string;

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  data: Lead[];
}

export interface LeadResponse {
  success: boolean;
  message: string;
  data: Lead;
}

export interface LeadDashboardStats {
  overview: {
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
    followUpLeads: number;
    interestedLeads: number;
    approvedLeads: number;
    rejectedLeads: number;
    disbursedLeads: number;
    convertedLeads: number;
    unassignedLeads: number;
  };

  performance: {
    todayLeads: number;
    monthlyLeads: number;
    conversionRate: number;
  };

  charts: {
    sourceStats: any[];
    statusStats: any[];
  };
}