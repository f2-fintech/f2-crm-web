"use client";

import React, { useState } from "react";
import { Calendar, Clock, CheckCircle2, AlertCircle, Phone, Mail, MoreHorizontal, Check } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const mockTasks = [
  { id: 1, title: "Call regarding pending KYC", type: "Call", lead: "Rahul Sharma", time: "10:30 AM", status: "Overdue", priority: "High" },
  { id: 2, title: "Send loan term sheet", type: "Email", lead: "Priya Singh", time: "02:00 PM", status: "Today", priority: "Medium" },
  { id: 3, title: "Follow up on CIBIL query", type: "Meeting", lead: "Amit Patel", time: "04:30 PM", status: "Today", priority: "High" },
  { id: 4, title: "Welcome call (Converted)", type: "Call", lead: "Neha Gupta", time: "Tomorrow", status: "Upcoming", priority: "Low" },
];

export default function FollowUpsPage() {
  const [filter, setFilter] = useState("All");
  const [tasks, setTasks] = useState(mockTasks);

  const completeTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => filter === "All" || t.status === filter);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-4">
        <div>
          <PageBreadcrumb pageTitle="Agent Follow-Ups & Tasks" />
          <p className="mt-1 text-sm text-gray-500">Manage your daily calls, emails, and meetings.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        {["All", "Overdue", "Today", "Upcoming"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-3 px-1 text-sm font-semibold transition-colors border-b-2 ${filter === f ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {f} 
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {f === "All" ? tasks.length : tasks.filter(t => t.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16">
            <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
            <p className="text-sm text-gray-500">You have no pending tasks in this view.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="group relative flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all hover:shadow-md hover:border-indigo-100">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => completeTask(task.id)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 text-transparent transition-colors hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-500"
                >
                  <Check size={20} />
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{task.title}</h3>
                    {task.status === "Overdue" && (
                      <span className="flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600">
                        <AlertCircle size={12} /> Overdue
                      </span>
                    )}
                    {task.priority === "High" && (
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">High Priority</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                    <span className="flex items-center gap-1.5 text-indigo-600">
                      {task.type === "Call" ? <Phone size={14} /> : task.type === "Email" ? <Mail size={14} /> : <Calendar size={14} />}
                      {task.lead}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {task.time}
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-700">
                <MoreHorizontal size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
