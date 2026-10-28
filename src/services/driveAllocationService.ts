import api from "@/lib/axios";

export interface DiscoveredDriveFile {
  fileId: string;
  fileName: string;
  folderPath: string;
  exportUrl: string;
  totalRecords: number;
  availableRecords: number;
  allocatedRecords: number;
  lastSyncedAt?: string;
}

export interface DriveRecordItem {
  _id: string;
  sourceFileId: string;
  sourceFileName: string;
  folderPath: string;
  rowIndex: number;
  phone: string;
  customerName: string;
  branch: string;
  eligibilityAmount: number;
  state: string;
  status: "AVAILABLE" | "ALLOCATED";
  allocationDocId?: string;
  assignedManagerId?: string;
  assignedManagerName?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  notionPageId?: string;
  notionPageTitle?: string;
  allocatedAt?: string;
  remarks?: string;
  disposition?: string;
  callingRemark?: string;
  rawData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeSheet {
  _id: string;
  title: string;
  rowCount: number;
  updatedAt: string;
}

export interface EmployeeInfo {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  managerName?: string;
}

export interface ManagerHierarchy {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  employees: EmployeeInfo[];
}

export interface HierarchyResponse {
  managers: ManagerHierarchy[];
  allEmployees: EmployeeInfo[];
}

export interface FileFilterOptions {
  headers?: string[];
  cities: string[];
  states: string[];
  years: string[];
  categories?: string[];
  lenders?: string[];
  hasCibil?: boolean;
  minAmount: number;
  maxAmount: number;
  totalAvailable: number;
  columnUniqueValues?: Record<string, string[]>;
}

export interface DriveStats {
  totalFiles: number;
  totalRecords: number;
  availableRecords: number;
  allocatedRecords: number;
}

export interface CustomFilterItem {
  id?: string;
  column: string;
  value?: string;
  values?: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface AllocatePayload {
  sourceFileId: string;
  managerId: string;
  employeeId: string;
  recordIds?: string[];
  count?: number;
  remarks?: string;
  targetSheetName?: string;
  targetPageId?: string;
  city?: string;
  state?: string;
  year?: string;
  category?: string;
  cibilMin?: number;
  lender?: string;
  customColumn?: string;
  customValue?: string;
  minAmount?: number;
  maxAmount?: number;
  filters?: CustomFilterItem[] | string;
}

export interface ReturnPayload {
  recordIds: string[];
  reason?: string;
}

export interface ReassignPayload {
  recordIds: string[];
  managerId: string;
  employeeId: string;
  remarks?: string;
}

export interface AllocationHistoryItem {
  _id: string;
  action: "ALLOCATED" | "REASSIGNED" | "RETURNED";
  sourceFileId: string;
  sourceFileName: string;
  folderPath?: string;
  count: number;
  toEmployeeId?: string;
  toEmployeeName?: string;
  toManagerId?: string;
  toManagerName?: string;
  fromEmployeeId?: string;
  fromEmployeeName?: string;
  fromManagerId?: string;
  fromManagerName?: string;
  targetSheetTitle?: string;
  performedBy?: string;
  remarks?: string;
  dispositionSummary?: Record<string, number>;
  recordsSummary?: Array<{
    rowIndex?: number;
    customerName?: string;
    phone?: string;
    branch?: string;
    state?: string;
    eligibilityAmount?: number;
    disposition?: string;
    remarks?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const driveAllocationService = {
  // Get all discovered files in the Google Drive folder
  async getFiles(): Promise<DiscoveredDriveFile[]> {
    const res = await api.get("/drive-allocation/files");
    return res.data;
  },

  // Re-scan Drive folder link
  async scanFolder(folderUrl?: string): Promise<DiscoveredDriveFile[]> {
    const res = await api.post("/drive-allocation/scan", { folderUrl });
    return res.data;
  },

  // Ingest / Sync data for a specific file
  async syncFile(fileId: string): Promise<{
    message: string;
    totalImported: number;
    newAdded: number;
    duplicatesSkipped?: number;
    available: number;
    allocated: number;
  }> {
    const res = await api.post(`/drive-allocation/sync/${fileId}`);
    return res.data;
  },

  // Get Managers with their Employees
  async getHierarchy(): Promise<HierarchyResponse> {
    const res = await api.get("/drive-allocation/hierarchy");
    return res.data;
  },

  // Get Notion sheets/files of a specific employee
  async getEmployeeSheets(employeeId: string): Promise<EmployeeSheet[]> {
    const res = await api.get(`/drive-allocation/employee-sheets/${employeeId}`);
    return res.data;
  },

  // Get dynamic filter options for a file (Cities, States, Years, Categories, Amount range)
  async getFilterOptions(fileId: string): Promise<FileFilterOptions> {
    const res = await api.get(`/drive-allocation/filter-options/${fileId}`);
    return res.data;
  },

  // Search unique column values directly from backend
  async searchColumnValues(
    fileId: string,
    column: string,
    search = ""
  ): Promise<string[]> {
    const res = await api.get(`/drive-allocation/column-values/${fileId}`, {
      params: { column, search, limit: 100 },
    });
    return res.data;
  },

  // Get Available Unallocated records for a file (with City, State, Year, Category, CIBIL, Lender, Custom Column, Amount filters)
  async getAvailableRecords(
    fileId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      city?: string;
      state?: string;
      year?: string;
      category?: string;
      cibilMin?: number;
      lender?: string;
      customColumn?: string;
      customValue?: string;
      minAmount?: number;
      maxAmount?: number;
      filters?: string;
    } = {}
  ): Promise<{
    data: DriveRecordItem[];
    total: number;
    page: number;
    limit: number;
    headers?: string[];
  }> {
    const res = await api.get(`/drive-allocation/available/${fileId}`, { params });
    return res.data;
  },

  // Get Allocated records with optional filters
  async getAllocatedRecords(
    params: {
      fileId?: string;
      managerId?: string;
      employeeId?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    data: DriveRecordItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    const res = await api.get("/drive-allocation/allocated", { params });
    return res.data;
  },

  // Allocate records to Manager -> Employee
  async allocateRecords(payload: AllocatePayload): Promise<{
    message: string;
    allocatedCount: number;
    managerName: string;
    employeeName: string;
    sheetTitle?: string;
    sheetId?: string;
  }> {
    const res = await api.post("/drive-allocation/allocate", payload);
    return res.data;
  },

  // Return allocated records back to the source file
  async returnRecordsToFile(payload: ReturnPayload): Promise<{
    message: string;
    returnedCount: number;
  }> {
    const res = await api.post("/drive-allocation/return", payload);
    return res.data;
  },

  // Reassign allocated records
  async reassignRecords(payload: ReassignPayload): Promise<{
    message: string;
    reassignedCount: number;
    newManagerName: string;
    newEmployeeName: string;
  }> {
    const res = await api.post("/drive-allocation/reassign", payload);
    return res.data;
  },
  // Get overall Drive stats
  async getStats(): Promise<DriveStats> {
    const res = await api.get("/drive-allocation/stats");
    return res.data;
  },

  // Get permanent allocation audit history logs
  async getAllocationHistory(
    params: {
      page?: number;
      limit?: number;
      action?: string;
      employeeId?: string;
      fileId?: string;
      search?: string;
    } = {}
  ): Promise<{
    data: AllocationHistoryItem[];
    total: number;
    page: number;
    limit: number;
    stats: Record<string, { count: number; leads: number }>;
  }> {
    const res = await api.get("/drive-allocation/history", { params });
    return res.data;
  },
};
