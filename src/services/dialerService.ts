import api from "@/lib/axios";

export interface CallLogItem {
  log_id: string;
  camaign_id?: string;
  master_id?: string;
  map_id?: string;
  TransferredTo?: string | null;
  TransferredFrom?: string | null;
  cdr_id?: string;
  dialed_phone_no?: string;
  CallType?: string;
  Status?: string;
  NoOfAttempts?: string;
  campaign_name?: string;
  extension_no?: string | null;
  DID_No?: string | null;
  agent_name?: string | null;
  employee_code?: string | null;
  crm_duration?: string;
  Wrapup_Durn?: string | null;
  call_duration?: string | null;
  HangupCause?: string;
  crm_id?: string | null;
  start_time?: string;
  end_time?: string;
  callback_time?: string | null;
  callback_no?: string | null;
  disposition?: string | null;
  sub_disposition?: string | null;
  Transfer_To?: string | null;
  Transfer_No?: string | null;
  feedback?: string | null;
  Latitude?: string | null;
  Recording_Path?: string | null;
  Doc_Attached?: string | null;
  phone?: string;
  Customer_Name?: string;
  Location?: string;
  Remark?: string | null;
  Video?: string | null;
  meeting_id?: string | null;
}

export interface CallLogsResponse {
  success: boolean;
  total: number;
  data: CallLogItem[];
  stats: {
    totalCalls: number;
    answeredCalls: number;
    unansweredCalls: number;
    uniqueAgents: number;
  };
}

export const dialerService = {
  async getCallLogs(
    params: {
      process_id?: number;
      report_type?: string;
      campaigns?: string;
      agent?: string;
      from_date?: string;
      from_date_to?: string;
      phone_number?: string;
      limit?: number;
    } = {}
  ): Promise<CallLogsResponse> {
    const res = await api.get("/dialer/call-logs", { params });
    return res.data;
  },
};
