"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Search,
  Filter,
  RotateCcw,
  Calendar,
  Users,
  Clock,
  Download,
  Play,
  Pause,
  Volume2,
  Copy,
  Check,
  Building,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Radio,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  dialerService,
  CallLogItem,
  CallLogsResponse,
} from "@/services/dialerService";
import { useAuth } from "@/hooks/useAuth";

export default function DialerPage() {
  const [logs, setLogs] = useState<CallLogItem[]>([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    answeredCalls: 0,
    unansweredCalls: 0,
    uniqueAgents: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [fromDate, setFromDate] = useState<string>(todayStr);
  const [toDate, setToDate] = useState<string>(todayStr);
  const [searchPhone, setSearchPhone] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [selectedCallType, setSelectedCallType] = useState<string>("");
  const [limit, setLimit] = useState<number>(1000);

  // Client-side pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Audio player state
  const [activeAudioLog, setActiveAudioLog] = useState<CallLogItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handlePlayAudio = (log: CallLogItem) => {
    if (!log.Recording_Path) return;
    if (activeAudioLog?.log_id === log.log_id) {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    } else {
      setActiveAudioLog(log);
      setIsPlaying(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.playbackRate = playbackRate;
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, 50);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Fetch call logs
  const fetchCallLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const from = `${fromDate} 00:00:00`;
      const to = `${toDate} 23:59:59`;

      const res: CallLogsResponse = await dialerService.getCallLogs({
        from_date: from,
        from_date_to: to,
        phone_number: searchPhone.trim() || undefined,
        agent: selectedAgent.trim() || undefined,
        limit,
      });

      if (res && res.data) {
        setLogs(res.data);
        if (res.stats) {
          setStats(res.stats);
        }
      } else {
        setLogs([]);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to connect to local dialer (192.168.1.220)"
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, searchPhone, selectedAgent, limit]);

  useEffect(() => {
    fetchCallLogs();
  }, [fetchCallLogs]);

  // Unique agents list combining both Agent Name (employee_code) and Agent Code (agent_name / extension_no)
  const uniqueAgents = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();

    logs.forEach((log) => {
      const code = (log.agent_name || log.extension_no || "").trim();
      const name = (log.employee_code || "").trim();

      if (code || name) {
        const key = code || name;
        if (!map.has(key)) {
          map.set(key, { code, name });
        } else {
          const item = map.get(key)!;
          if (!item.name && name) item.name = name;
          if (!item.code && code) item.code = code;
        }
      }
    });

    return Array.from(map.values())
      .map((ag) => {
        let label = "";
        if (ag.name && ag.code) {
          label = `${ag.name} (${ag.code})`;
        } else if (ag.name) {
          label = ag.name;
        } else {
          label = `Agent ${ag.code}`;
        }
        return {
          id: ag.code || ag.name,
          code: ag.code,
          name: ag.name,
          label,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [logs]);

  // Unique call types
  const uniqueCallTypes = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      if (log.CallType && log.CallType.trim()) {
        set.add(log.CallType.trim());
      }
    });
    return Array.from(set).sort();
  }, [logs]);

  // Client-side search and filters
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedCallType && log.CallType !== selectedCallType) {
        return false;
      }

      if (selectedAgent) {
        const code = (log.agent_name || log.extension_no || "").trim();
        const name = (log.employee_code || "").trim().toLowerCase();
        const target = selectedAgent.toLowerCase();

        const matchCode = code && code === selectedAgent;
        const matchName = name && name === target;
        if (!matchCode && !matchName) {
          return false;
        }
      }

      return true;
    });
  }, [logs, selectedCallType, selectedAgent]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate, searchPhone, selectedAgent, selectedCallType, limit]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedLogs = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, validPage, pageSize]);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = [
      "Log ID",
      "Dialed Number",
      "Call Type",
      "Status",
      "No of Attempts",
      "Campaign",
      "DID No",
      "Agent Code",
      "Agent Name",
      "CRM Duration",
      "Call Duration",
      "Wrapup Duration",
      "Start Time",
      "End Time",
      "Disposition",
      "Sub Disposition",
      "Customer Name",
      "Location",
      "Remark",
    ];

    const rows = filteredLogs.map((l) => [
      l.log_id || "",
      l.dialed_phone_no || l.phone || "",
      `"${l.CallType || ""}"`,
      `"${l.Status || ""}"`,
      l.NoOfAttempts || "",
      `"${l.campaign_name || ""}"`,
      l.DID_No || "",
      l.agent_name || l.extension_no || "",
      `"${l.employee_code || ""}"`,
      l.crm_duration || "",
      l.call_duration || "",
      l.Wrapup_Durn || "",
      l.start_time || "",
      l.end_time || "",
      `"${l.disposition || ""}"`,
      `"${l.sub_disposition || ""}"`,
      `"${l.Customer_Name || ""}"`,
      `"${l.Location || ""}"`,
      `"${l.Remark || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dialer_call_logs_${fromDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { user, role, isManager, isSuperAdmin, isAdmin } = useAuth();
  const isTeamLeader = role === "TEAM_LEADER";

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-[1700px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <PhoneCall size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Dialer Call Logs
                </h1>
                {isManager && (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                    My Team View
                  </span>
                )}
                {isTeamLeader && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold">
                    Direct Reports View
                  </span>
                )}
                {(isAdmin || isSuperAdmin) && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                    All Company View
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {isManager
                  ? "Showing real-time dialer logs for all agents in your team"
                  : isTeamLeader
                  ? "Showing real-time dialer logs for your direct reports"
                  : "Live call monitoring and CDR audit from local dialer"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCallLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-2xs transition active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Syncing..." : "Refresh Logs"}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Error alert if dialer is unreachable */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 text-xs shadow-2xs">
          <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Dialer Connection Error:</span>
            <p className="mt-0.5 text-rose-700">{error}</p>
            <p className="mt-1 text-[11px] text-rose-500">
              Please verify your network connection or contact your administrator if the issue persists.
            </p>
          </div>
          <button
            onClick={fetchCallLogs}
            className="px-3 py-1 bg-white hover:bg-rose-100 border border-rose-300 text-rose-800 rounded-lg font-bold text-[11px] transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <PhoneCall size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Calls
            </span>
            <p className="text-xl font-extrabold text-gray-900 mt-0.5">
              {stats.totalCalls.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Connected / Answered
            </span>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
              {stats.answeredCalls.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <PhoneMissed size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Unanswered / Missed
            </span>
            <p className="text-xl font-extrabold text-rose-600 mt-0.5">
              {stats.unansweredCalls.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Active Agents
            </span>
            <p className="text-xl font-extrabold text-purple-600 mt-0.5">
              {uniqueAgents.length > 0 ? uniqueAgents.length : stats.uniqueAgents}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range: From */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar size={13} className="text-gray-400" />
            <span className="text-[11px] font-bold text-gray-500">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-xs font-semibold text-gray-800 bg-transparent focus:outline-none"
            />
          </div>

          {/* Date Range: To */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar size={13} className="text-gray-400" />
            <span className="text-[11px] font-bold text-gray-500">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-xs font-semibold text-gray-800 bg-transparent focus:outline-none"
            />
          </div>

          {/* Phone Number Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search phone number..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchCallLogs()}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3 py-1.5 text-xs font-medium text-gray-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition shadow-2xs"
            />
          </div>

          {/* Agent Filter (showing all agents with Code and Name) */}
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-indigo-500 focus:outline-none transition shadow-2xs min-w-[200px]"
          >
            <option value="">All Agents ({uniqueAgents.length})</option>
            {uniqueAgents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.label}
              </option>
            ))}
          </select>

          {/* Call Type Filter */}
          {uniqueCallTypes.length > 0 && (
            <select
              value={selectedCallType}
              onChange={(e) => setSelectedCallType(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-indigo-500 focus:outline-none transition shadow-2xs min-w-[150px]"
            >
              <option value="">All Call Types ({uniqueCallTypes.length})</option>
              {uniqueCallTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}

          {/* Limit */}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
          >
            <option value={250}>Limit 250</option>
            <option value={500}>Limit 500</option>
            <option value={1000}>Limit 1,000 (Default)</option>
            <option value={2500}>Limit 2,500</option>
            <option value={5000}>Limit 5,000</option>
          </select>

          {/* Apply Filter Button */}
          <button
            onClick={fetchCallLogs}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer ml-auto"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Main Table Matching Dialer Portal Columns */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-xs text-gray-700 whitespace-nowrap">
            <thead className="bg-[#0b2545] text-white text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 shadow-sm">
              <tr>
                <th className="p-3.5 w-12 text-gray-300">SrNo</th>
                <th className="p-3.5 text-center">Action</th>
                <th className="p-3.5">Log ID</th>
                <th className="p-3.5">Dialed Number</th>
                <th className="p-3.5">Call Type</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Attempts</th>
                <th className="p-3.5">Campaign</th>
                <th className="p-3.5">DID No</th>
                <th className="p-3.5">Agent (Code & Name)</th>
                <th className="p-3.5">CRM Durn</th>
                <th className="p-3.5">Call Durn</th>
                <th className="p-3.5">Wrapup Durn</th>
                <th className="p-3.5">Start Time</th>
                <th className="p-3.5">End Time</th>
                <th className="p-3.5">Disposition</th>
                <th className="p-3.5">Sub Disposition</th>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Remark</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={20} className="p-12 text-center text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Fetching live call logs from F2 dialer...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={20} className="p-12 text-center text-gray-400">
                    <div className="max-w-xs mx-auto">
                      <PhoneMissed size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-700 text-sm">
                        No call logs found
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try changing the date filter or searching for another phone number.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, index) => {
                  const phone = log.dialed_phone_no || log.phone || "--";
                  const hasRecording = Boolean(log.Recording_Path);
                  const isThisAudioPlaying =
                    activeAudioLog?.log_id === log.log_id && isPlaying;
                  const isThisActiveAudio =
                    activeAudioLog?.log_id === log.log_id;

                  const agentCode = log.agent_name || log.extension_no || "";
                  const agentName = log.employee_code || "";

                  return (
                    <tr
                      key={log.log_id || `log-${index}`}
                      className={`transition ${
                        isThisActiveAudio
                          ? "bg-indigo-50/70 border-l-4 border-l-indigo-600"
                          : "hover:bg-slate-50/70"
                      }`}
                    >
                      {/* SrNo */}
                      <td className="p-3.5 text-gray-400 font-mono text-[11px]">
                        {(validPage - 1) * pageSize + index + 1}
                      </td>

                      {/* Action (Audio Player) */}
                      <td className="p-3.5 text-center">
                        {hasRecording ? (
                          <button
                            type="button"
                            onClick={() => handlePlayAudio(log)}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition active:scale-95 cursor-pointer shadow-2xs ${
                              isThisActiveAudio
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                            }`}
                            title="Play Recording"
                          >
                            {isThisAudioPlaying ? (
                              <>
                                <Pause size={12} className="text-white fill-white" />
                                <span className="text-[11px]">Pause</span>
                              </>
                            ) : (
                              <>
                                <Play
                                  size={12}
                                  className={
                                    isThisActiveAudio
                                      ? "text-white fill-white"
                                      : "text-emerald-600 fill-emerald-600"
                                  }
                                />
                                <span className="text-[11px]">{isThisActiveAudio ? "Resume" : "Play"}</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">--</span>
                        )}
                      </td>

                      {/* Log ID */}
                      <td className="p-3.5 font-mono text-xs font-bold text-gray-700">
                        {log.log_id}
                      </td>

                      {/* Dialed Number */}
                      <td className="p-3.5">
                        <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg">
                          <span className="font-mono font-bold text-gray-800 text-xs">
                            {phone}
                          </span>
                          {phone !== "--" && (
                            <button
                              onClick={() => handleCopyPhone(phone)}
                              className="text-gray-400 hover:text-indigo-600 transition cursor-pointer"
                              title="Copy Phone"
                            >
                              {copiedPhone === phone ? (
                                <Check size={11} className="text-emerald-600" />
                              ) : (
                                <Copy size={11} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Call Type */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.CallType === "System Dispose"
                              ? "bg-slate-100 text-slate-700"
                              : log.CallType === "Manual" || log.CallType === "Outbound"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {log.CallType || "--"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.Status === "A"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {log.Status || "--"}
                        </span>
                      </td>

                      {/* Attempts */}
                      <td className="p-3.5 text-center font-mono font-semibold text-gray-700">
                        {log.NoOfAttempts || "1"}
                      </td>

                      {/* Campaign */}
                      <td className="p-3.5">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-[11px]">
                          {log.campaign_name || "--"}
                        </span>
                      </td>

                      {/* DID No */}
                      <td className="p-3.5 font-mono text-gray-600 font-medium">
                        {log.DID_No || "--"}
                      </td>

                      {/* Agent (Code & Name) */}
                      <td className="p-3.5">
                        {agentName || agentCode ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-xs">
                              {agentName || `Agent ${agentCode}`}
                            </span>
                            {agentCode && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                                Ext: <strong className="text-gray-700">{agentCode}</strong>
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 italic">--</span>
                        )}
                      </td>

                      {/* CRM Durn */}
                      <td className="p-3.5 font-mono text-xs font-semibold text-gray-800">
                        {log.crm_duration || "--"}
                      </td>

                      {/* Call Durn */}
                      <td className="p-3.5 font-mono text-xs font-bold text-indigo-700">
                        {log.call_duration || "--"}
                      </td>

                      {/* Wrapup Durn */}
                      <td className="p-3.5 font-mono text-xs text-gray-500">
                        {log.Wrapup_Durn || "--"}
                      </td>

                      {/* Start Time */}
                      <td className="p-3.5 text-gray-700 font-medium text-[11px]">
                        {log.start_time || "--"}
                      </td>

                      {/* End Time */}
                      <td className="p-3.5 text-gray-700 font-medium text-[11px]">
                        {log.end_time || "--"}
                      </td>

                      {/* Disposition */}
                      <td className="p-3.5">
                        {log.disposition ? (
                          <span className="inline-block px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {log.disposition}
                          </span>
                        ) : (
                          <span className="text-gray-300">--</span>
                        )}
                      </td>

                      {/* Sub Disposition */}
                      <td className="p-3.5 text-gray-600 text-xs">
                        {log.sub_disposition || "--"}
                      </td>

                      {/* Customer Name */}
                      <td className="p-3.5 font-bold text-gray-900">
                        {log.Customer_Name || "--"}
                      </td>

                      {/* Location */}
                      <td className="p-3.5 text-gray-600">
                        {log.Location ? (
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin size={11} className="text-indigo-400 shrink-0" />
                            <span>{log.Location}</span>
                          </div>
                        ) : (
                          "--"
                        )}
                      </td>

                      {/* Remark */}
                      <td className="p-3.5 text-gray-500 text-xs max-w-[200px] truncate" title={log.Remark || ""}>
                        {log.Remark || "--"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination Controls */}
        <div className="bg-slate-50/70 p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 font-medium">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Showing{" "}
              <strong className="text-gray-900 font-bold">
                {filteredLogs.length === 0 ? 0 : (validPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-900 font-bold">
                {Math.min(validPage * pageSize, filteredLogs.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-gray-900 font-bold">
                {filteredLogs.length}
              </strong>{" "}
              call logs
            </span>

            {/* Rows per page selector */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-gray-200">
              <span className="text-gray-400 text-[11px]">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Page Navigation Buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={validPage <= 1 || loading}
                title="First Page"
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronsLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validPage <= 1 || loading}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - validPage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    typeof item === "string" ? (
                      <span key={`dots-${idx}`} className="px-1.5 text-gray-400 font-bold">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCurrentPage(item)}
                        className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                          item === validPage
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validPage >= totalPages || loading}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={validPage >= totalPages || loading}
                title="Last Page"
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronsRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Sticky Bottom Audio Player */}
      {activeAudioLog && activeAudioLog.Recording_Path && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[680px] z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                  <Volume2 size={18} className={isPlaying ? "animate-pulse text-indigo-300" : ""} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">
                      {activeAudioLog.Customer_Name || "Customer Call"}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-900/60 px-1.5 py-0.5 rounded border border-indigo-700/50">
                      {activeAudioLog.dialed_phone_no || activeAudioLog.phone}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>
                      Agent:{" "}
                      <strong className="text-slate-200">
                        {activeAudioLog.employee_code || activeAudioLog.agent_name || "Auto"}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Duration:{" "}
                      <strong className="text-slate-200">
                        {activeAudioLog.call_duration ||
                          activeAudioLog.crm_duration ||
                          "00:00"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Speed, Download & Close Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {[1, 1.25, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSpeedChange(s)}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition cursor-pointer ${
                      playbackRate === s
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
                <a
                  href={activeAudioLog.Recording_Path}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                  title="Download Recording (.wav)"
                >
                  <Download size={15} />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (audioRef.current) audioRef.current.pause();
                    setActiveAudioLog(null);
                    setIsPlaying(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer ml-1"
                  title="Close player"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Native HTML5 Audio Controller */}
            <div className="w-full">
              <audio
                ref={audioRef}
                src={activeAudioLog.Recording_Path}
                controls
                autoPlay
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-9 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
