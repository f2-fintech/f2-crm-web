"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Plus, Search, Eye, MoreHorizontal, User, Calendar, CreditCard, ChevronRight } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";

interface Application {
  _id: string;
  applicationId: string;
  applicantName: string;
  loanType: string;
  loanAmount: number;
  status: string;
  createdAt: string;
}

const KANBAN_COLUMNS = [
  { id: "SUBMITTED", title: "New Applications", color: "bg-blue-500", light: "bg-blue-50", border: "border-blue-200" },
  { id: "UNDER_REVIEW", title: "Underwriting", color: "bg-amber-500", light: "bg-amber-50", border: "border-amber-200" },
  { id: "APPROVED", title: "Approved", color: "bg-emerald-500", light: "bg-emerald-50", border: "border-emerald-200" },
  { id: "DISBURSED", title: "Disbursed", color: "bg-purple-500", light: "bg-purple-50", border: "border-purple-200" }
];

export default function ApplicationsKanbanPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/applications?limit=100"); // fetch all for kanban
      setApplications(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateApplicationStatus = async (appId: string, newStatus: string) => {
    try {
      setApplications(prev => 
        prev.map(app => app._id === appId ? { ...app, status: newStatus } : app)
      );
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      fetchApplications(); // revert on fail
    }
  };

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData("text/plain", appId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData("text/plain");
    if (appId && draggedAppId) {
      updateApplicationStatus(appId, statusId);
    }
    setDraggedAppId(null);
  };

  const filteredApps = applications.filter(app => 
    app.applicantName?.toLowerCase().includes(search.toLowerCase()) || 
    app.applicationId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="flex justify-between items-end mb-6">
        <div>
          <PageBreadcrumb pageTitle="Application Pipeline" />
          <p className="mt-1 text-sm text-gray-500">Drag and drop applications to move them through the underwriting pipeline.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
            <Plus size={18} /> New Application
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {KANBAN_COLUMNS.map((column) => (
            <div 
              key={column.id} 
              className={`flex flex-col min-w-[320px] max-w-[320px] rounded-2xl ${column.light} border ${column.border} overflow-hidden`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="p-4 border-b border-white/40 flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${column.color}`}></div>
                  <h3 className="font-bold text-gray-800">{column.title}</h3>
                </div>
                <span className="bg-white/60 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {filteredApps.filter(app => app.status === column.id || (column.id === 'SUBMITTED' && app.status === 'DRAFT')).length}
                </span>
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {filteredApps
                  .filter(app => app.status === column.id || (column.id === 'SUBMITTED' && app.status === 'DRAFT'))
                  .map((app) => (
                    <div
                      key={app._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app._id)}
                      className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md transition-all ${draggedAppId === app._id ? 'opacity-50 scale-95' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-gray-500 tracking-wider bg-gray-100 px-2 py-0.5 rounded uppercase">
                          {app.applicationId}
                        </span>
                        <button className="text-gray-400 hover:text-gray-700"><MoreHorizontal size={16} /></button>
                      </div>
                      
                      <h4 className="font-bold text-gray-900 mb-1">{app.applicantName}</h4>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <CreditCard size={14} className="text-blue-500" />
                          <span className="font-semibold text-gray-700">₹{app.loanAmount?.toLocaleString()}</span>
                          <span className="text-gray-400">({app.loanType})</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar size={14} className="text-emerald-500" />
                          <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                        <div className="flex -space-x-2">
                          <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600"><User size={12}/></div>
                        </div>
                        <Link href={`/applications/${app._id}`} className="text-xs font-bold text-blue-600 flex items-center hover:text-blue-700">
                          View <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                  
                {filteredApps.filter(app => app.status === column.id || (column.id === 'SUBMITTED' && app.status === 'DRAFT')).length === 0 && (
                  <div className="h-24 flex items-center justify-center text-sm font-medium text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
