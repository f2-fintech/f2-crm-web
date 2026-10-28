"use client";

import React, { useEffect, useMemo, useState } from "react";
import { 
  Search, Mail, Phone, Building2, Users, 
  LayoutGrid, List, ChevronDown, X,
  MoreVertical, Filter, Briefcase, Activity
} from "lucide-react";
import api from "@/lib/axios";

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  roleId?: { name: string; displayName?: string };
  departmentId?: { name: string; departmentName?: string };
  teamId?: { _id: string; name: string };
}

type ViewMode = "grid" | "table";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Premium Gradients for Avatars & Covers
const gradients = [
  "from-violet-500 to-fuchsia-500",
  "from-blue-500 to-cyan-400",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-indigo-500 to-blue-600",
];

const getGradient = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
};

function Avatar({ user, className = "" }: { user: IUser; className?: string }) {
  if (user.profileImage) {
    return (
      <img 
        src={user.profileImage} 
        alt={user.firstName} 
        className={`object-cover ${className}`} 
      />
    );
  }
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  return (
    <div className={`flex items-center justify-center font-bold text-white bg-gradient-to-br ${getGradient(user._id)} ${className}`}>
      {initials}
    </div>
  );
}

export default function ContactsPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  
  const [filterDept, setFilterDept] = useState("");
  const [filterTeam, setFilterTeam] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/users", { params: { limit: 1000 } });
        setUsers(Array.isArray(data) ? data : data.data || []);
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  const departments = useMemo(() => [...new Set(users.map(u => u.departmentId?.departmentName || u.departmentId?.name).filter(Boolean))] as string[], [users]);
  const teams = useMemo(() => [...new Set(users.map(u => u.teamId?.name).filter(Boolean))] as string[], [users]);
  const activeCount = useMemo(() => users.filter(u => u.isActive !== false).length, [users]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter(u => {
      const matchSearch = !term || 
        u.firstName?.toLowerCase().includes(term) || 
        u.lastName?.toLowerCase().includes(term) || 
        u.email?.toLowerCase().includes(term) || 
        u.phone?.includes(term);
      const matchDept = !filterDept || u.departmentId?.departmentName === filterDept || u.departmentId?.name === filterDept;
      const matchTeam = !filterTeam || u.teamId?.name === filterTeam;
      const matchLetter = !activeLetter || u.firstName?.[0]?.toUpperCase() === activeLetter;
      return matchSearch && matchDept && matchTeam && matchLetter;
    });
  }, [users, search, filterDept, filterTeam, activeLetter]);

  const clearFilters = () => { setSearch(""); setFilterDept(""); setFilterTeam(""); setActiveLetter(null); };

  return (
    <div className="flex flex-col gap-8 min-h-full pb-10">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Directory</h1>
        <p className="text-gray-500 mt-1">Manage and connect with your team members across the organization.</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Members</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Employees</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Departments</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{departments.length}</h3>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center z-10 sticky top-4">
        
        {/* Search */}
        <div className="relative w-full xl:w-96">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 px-3 h-11 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={filterDept} 
              onChange={e => setFilterDept(e.target.value)} 
              className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 outline-none w-32 cursor-pointer"
            >
              <option value="">All Depts</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 h-11 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <Building2 size={16} className="text-gray-400" />
            <select 
              value={filterTeam} 
              onChange={e => setFilterTeam(e.target.value)} 
              className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 outline-none w-28 cursor-pointer"
            >
              <option value="">All Teams</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 h-11">
            <button 
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center h-full w-10 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode("table")}
              className={`flex items-center justify-center h-full w-10 rounded-lg transition-all ${viewMode === "table" ? "bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ALPHABET FILTER */}
      <div className="flex flex-wrap gap-1 px-1">
        <button
          onClick={() => setActiveLetter(null)}
          className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${!activeLetter ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900" : "bg-transparent text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"}`}
        >
          All
        </button>
        {ALPHABET.map(letter => {
          const isActive = activeLetter === letter;
          const exists = users.some(u => u.firstName?.[0]?.toUpperCase() === letter);
          return (
            <button
              key={letter}
              onClick={() => exists && setActiveLetter(isActive ? null : letter)}
              disabled={!exists}
              className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                isActive ? "bg-brand-500 text-white shadow-md" : 
                exists ? "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800" : 
                "text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-50"
              }`}
            >
              {letter}
            </button>
          )
        })}
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-72 bg-gray-100 dark:bg-gray-800/50 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-800 rounded-3xl">
          <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Search size={24} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">No contacts found</h3>
          <p className="text-gray-500 mt-2 max-w-sm">We couldn't find any employees matching your current filters.</p>
          <button onClick={clearFilters} className="mt-6 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md">
            Clear All Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        
        /* GRID VIEW (PREMIUM CARDS) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(user => (
            <div key={user._id} className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              
              {/* Card Header Background */}
              <div className={`h-24 w-full bg-gradient-to-r ${getGradient(user._id)} opacity-80 group-hover:opacity-100 transition-opacity`} />
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-white/30 text-white shadow-sm border border-white/20`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${user.isActive !== false ? "bg-green-400" : "bg-gray-300 shadow-none"}`}></span>
                  {user.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Card Body */}
              <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center">
                
                {/* Avatar */}
                <Avatar user={user} className="h-20 w-20 rounded-2xl ring-4 ring-white dark:ring-gray-900 -mt-10 shadow-md rotate-3 group-hover:rotate-0 transition-transform duration-300" />
                
                {/* Info */}
                <div className="mt-4 w-full">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mt-1 truncate">
                    {user.roleId?.displayName || user.roleId?.name || "Employee"}
                  </p>
                </div>

                <div className="w-full mt-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 group-hover:border-gray-200 dark:group-hover:border-gray-700 transition-colors">
                    <Mail size={16} className="text-gray-400" />
                    <a href={`mailto:${user.email}`} className="truncate hover:text-brand-600 transition-colors">{user.email}</a>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 group-hover:border-gray-200 dark:group-hover:border-gray-700 transition-colors">
                    <Phone size={16} className="text-gray-400" />
                    {user.phone ? (
                      <a href={`tel:${user.phone}`} className="truncate hover:text-brand-600 transition-colors">{user.phone}</a>
                    ) : (
                      <span className="opacity-50">Not Provided</span>
                    )}
                  </div>
                </div>

                {/* Footer Badges */}
                <div className="w-full mt-5 flex flex-wrap justify-center gap-2">
                  {user.departmentId && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
                      <Building2 size={12} />
                      {user.departmentId.departmentName || user.departmentId.name}
                    </span>
                  )}
                  {user.teamId && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
                      <Users size={12} />
                      {user.teamId.name}
                    </span>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

      ) : (

        /* TABLE VIEW */
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role & Dept</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar user={user} className="h-12 w-12 rounded-xl shadow-sm" />
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white text-sm">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">ID: {user._id.slice(-6).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Mail size={14} className="text-gray-400" />
                          <a href={`mailto:${user.email}`} className="hover:text-brand-600 transition-colors">{user.email}</a>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Phone size={14} className="text-gray-400" />
                            <a href={`tel:${user.phone}`} className="hover:text-brand-600 transition-colors">{user.phone}</a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20">
                          {user.roleId?.displayName || user.roleId?.name || "Employee"}
                        </span>
                        {user.departmentId && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Building2 size={12} /> {user.departmentId.departmentName || user.departmentId.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        user.isActive !== false 
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20" 
                          : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.isActive !== false ? "bg-green-500" : "bg-gray-400"}`}></span>
                        {user.isActive !== false ? "Active" : "Offline"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`mailto:${user.email}`} className="h-9 w-9 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-brand-600 hover:border-brand-300 dark:hover:border-brand-600 shadow-sm transition-all">
                          <Mail size={16} />
                        </a>
                        {user.phone && (
                          <a href={`tel:${user.phone}`} className="h-9 w-9 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-300 dark:hover:border-emerald-600 shadow-sm transition-all">
                            <Phone size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      )}
    </div>
  );
}
