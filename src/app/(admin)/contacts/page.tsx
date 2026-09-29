"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Mail, Phone, Building2, Users, LayoutGrid, List, LayoutList, ChevronDown, X } from "lucide-react";
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

type ViewMode = "table" | "grid" | "modern";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const initials = (f?: string, l?: string) =>
  `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase() || "?";

const avatarGradients = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-600",
  "from-amber-400 to-orange-500",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
];

const getGradient = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

function Avatar({ user, size = "md" }: { user: IUser; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-9 w-9 text-xs" : size === "lg" ? "h-16 w-16 text-xl" : "h-11 w-11 text-sm";
  if (user.profileImage)
    return <img src={user.profileImage} alt={user.firstName} className={`${sz} rounded-full object-cover ring-2 ring-white dark:ring-gray-900`} />;
  return (
    <div className={`${sz} shrink-0 rounded-full bg-gradient-to-br ${getGradient(user._id)} flex items-center justify-center font-bold text-white ring-2 ring-white dark:ring-gray-900`}>
      {initials(user.firstName, user.lastName)}
    </div>
  );
}

function ContactActions({ user, compact = false }: { user: IUser; compact?: boolean }) {
  if (compact)
    return (
      <div className="flex items-center gap-1.5">
        {user.phone && (
          <a href={`tel:${user.phone}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-500 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white" title={`Call ${user.phone}`}>
            <Phone size={14} />
          </a>
        )}
        <a href={`mailto:${user.email}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all hover:bg-blue-500 hover:text-white dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white" title={`Email ${user.email}`}>
          <Mail size={14} />
        </a>
      </div>
    );
  return (
    <div className="flex gap-2">
      <a
        href={user.phone ? `tel:${user.phone}` : "#"}
        onClick={!user.phone ? (e) => e.preventDefault() : undefined}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 ${
          user.phone
            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white hover:shadow-md dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white"
            : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
        }`}
      >
        <Phone size={13} />{user.phone ? "Call" : "No Phone"}
      </a>
      <a href={`mailto:${user.email}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 py-2.5 text-xs font-semibold text-blue-700 transition-all duration-200 hover:bg-blue-500 hover:text-white hover:shadow-md dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white">
        <Mail size={13} />Mail
      </a>
    </div>
  );
}

export default function ContactsPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("modern");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [filterDept, setFilterDept] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/users", { params: { limit: 1000 } });
        setUsers(Array.isArray(data) ? data : data.data || []);
      } catch { /* silent */ } finally { setLoading(false); }
    })();
  }, []);

  const departments = useMemo(
    () => [...new Set(users.map(u => u.departmentId?.departmentName || u.departmentId?.name).filter(Boolean))] as string[],
    [users]
  );
  const teams = useMemo(
    () => [...new Set(users.map(u => u.teamId?.name).filter(Boolean))] as string[],
    [users]
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter(u => {
      const ms = !term || u.firstName?.toLowerCase().includes(term) || u.lastName?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term) || u.phone?.includes(term) || u.teamId?.name?.toLowerCase().includes(term);
      const md = !filterDept || u.departmentId?.departmentName === filterDept || u.departmentId?.name === filterDept;
      const mt = !filterTeam || u.teamId?.name === filterTeam;
      const ml = !activeLetter || u.firstName?.[0]?.toUpperCase() === activeLetter;
      return ms && md && mt && ml;
    });
  }, [users, search, filterDept, filterTeam, activeLetter]);

  const grouped = useMemo(() => {
    const acc: Record<string, IUser[]> = {};
    filtered.forEach(u => { const l = u.firstName?.[0]?.toUpperCase() || "#"; if (!acc[l]) acc[l] = []; acc[l].push(u); });
    return acc;
  }, [filtered]);

  const sortedLetters = useMemo(
    () => Object.keys(grouped).sort((a, b) => { if (a === "#") return 1; if (b === "#") return -1; return a.localeCompare(b); }),
    [grouped]
  );

  const activeAlphabet = useMemo(
    () => new Set(users.map(u => u.firstName?.[0]?.toUpperCase()).filter(Boolean)),
    [users]
  );

  const clearFilters = () => { setSearch(""); setFilterDept(""); setFilterTeam(""); setActiveLetter(null); };
  const hasActive = !!(search || filterDept || filterTeam || activeLetter);

  const viewButtons: { mode: ViewMode; Icon: React.ElementType; label: string }[] = [
    { mode: "modern", Icon: LayoutGrid, label: "Modern" },
    { mode: "grid", Icon: LayoutList, label: "Grid" },
    { mode: "table", Icon: List, label: "Table" },
  ];

  return (
    <div className="flex min-h-full flex-col gap-6">

      {/* ── Hero Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 px-6 py-7 shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-10 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute right-40 top-5 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-blue-600 shadow-lg shadow-brand-500/30">
                <Users size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Contacts Directory</h1>
                <p className="mt-0.5 text-xs text-gray-400">Internal employee phonebook</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300"><Users size={11} />{users.length} Members</span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300"><Building2 size={11} />{teams.length} Teams</span>
              <span className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300 sm:flex"><Building2 size={11} />{departments.length} Depts</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-10 w-64 rounded-xl border border-white/10 bg-white/10 pl-9 pr-4 text-sm text-white placeholder-gray-400 outline-none transition focus:border-brand-400/60 focus:bg-white/15 focus:ring-2 focus:ring-brand-400/30"
              />
            </div>
            {/* Filters */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all ${
                showFilters || filterDept || filterTeam
                  ? "border-brand-400/60 bg-brand-500/20 text-brand-300"
                  : "border-white/10 bg-white/10 text-gray-300 hover:bg-white/15"
              }`}
            >
              <Building2 size={14} />
              Filters
              <ChevronDown size={13} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
            {/* View toggle */}
            <div className="flex h-10 items-center gap-0.5 rounded-xl border border-white/10 bg-white/10 p-1">
              {viewButtons.map(({ mode, Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  title={label}
                  className={`flex h-full items-center justify-center rounded-lg px-3 text-sm transition-all ${
                    viewMode === mode ? "bg-brand-500 text-white shadow-md" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="relative mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="h-9 rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-gray-300 outline-none focus:border-brand-400/60">
              <option value="" className="bg-gray-900">All Departments</option>
              {departments.map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
            </select>
            <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} className="h-9 rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-gray-300 outline-none focus:border-brand-400/60">
              <option value="" className="bg-gray-900">All Teams</option>
              {teams.map(t => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
            </select>
            {hasActive && (
              <button onClick={clearFilters} className="flex h-9 items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-sm text-red-400 hover:bg-red-500/20">
                <X size={13} />Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── A-Z Quick Nav ───────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveLetter(null)}
          className={`flex h-8 min-w-[2.5rem] items-center justify-center rounded-lg px-2 text-xs font-bold transition-all ${
            !activeLetter ? "bg-brand-500 text-white shadow-md shadow-brand-500/40" : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          All
        </button>
        {ALPHABET.map(l => {
          const has = activeAlphabet.has(l);
          const active = activeLetter === l;
          return (
            <button
              key={l}
              onClick={() => setActiveLetter(active ? null : l)}
              disabled={!has}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                active
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/40"
                  : has
                  ? "bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-brand-500/20 dark:hover:text-brand-400"
                  : "cursor-default text-gray-300 dark:text-gray-700"
              }`}
            >
              {l}
            </button>
          );
        })}
        {hasActive && (
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 ring-1 ring-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/30">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            <button onClick={clearFilters} className="ml-0.5 hover:opacity-70"><X size={11} /></button>
          </span>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800/60" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-24 dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
            <Users size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No contacts found</h3>
          <p className="mt-1 text-sm text-gray-400">Try a different search or clear your filters.</p>
          {hasActive && (
            <button onClick={clearFilters} className="mt-5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-10">

          {/* Modern View */}
          {viewMode === "modern" && sortedLetters.map(letter => (
            <section key={letter}>
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-blue-600 text-lg font-black text-white shadow-lg shadow-brand-500/30">
                  {letter}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-200 via-gray-100 to-transparent dark:from-gray-700 dark:via-gray-800" />
                <span className="text-xs font-semibold text-gray-400">
                  {grouped[letter].length} {grouped[letter].length === 1 ? "contact" : "contacts"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {grouped[letter].map(user => (
                  <div key={user._id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-400 via-blue-500 to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="flex flex-col p-5">
                      <div className="flex items-start justify-between gap-2">
                        <Avatar user={user} size="lg" />
                        <div className="flex flex-col items-end gap-1.5">
                          {user.teamId && (
                            <span className="inline-flex max-w-[110px] truncate items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                              <Users size={8} />{user.teamId.name}
                            </span>
                          )}
                          <span className={`inline-flex h-2 w-2 rounded-full ${user.isActive !== false ? "bg-emerald-400" : "bg-gray-300"}`} title={user.isActive !== false ? "Active" : "Inactive"} />
                        </div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h3>
                        <p className="mt-0.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
                          {user.roleId?.displayName || user.roleId?.name || "Team Member"}
                        </p>
                        {user.departmentId && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
                            <Building2 size={11} />{user.departmentId.departmentName || user.departmentId.name}
                          </p>
                        )}
                      </div>
                      <div className="my-4 h-px bg-gray-100 dark:bg-gray-800" />
                      <a href={`mailto:${user.email}`} className="mb-4 flex items-center gap-2 text-xs text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                        <Mail size={12} /><span className="truncate">{user.email}</span>
                      </a>
                      <ContactActions user={user} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="space-y-8">
              {sortedLetters.map(letter => (
                <section key={letter}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 text-sm font-black text-brand-600 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400">
                      {letter}
                    </div>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                    <span className="text-xs text-gray-400">{grouped[letter].length}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {grouped[letter].map(user => (
                      <div key={user._id} className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 transition-all duration-200 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-800">
                        <Avatar user={user} size="md" />
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h4>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.roleId?.displayName || user.roleId?.name || "Member"}</p>
                        </div>
                        <ContactActions user={user} compact />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-800/50">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Contact</th>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Role</th>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Dept / Team</th>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Email</th>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Phone</th>
                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-widest text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {sortedLetters.map(letter => (
                      <React.Fragment key={letter}>
                        <tr>
                          <td colSpan={6} className="bg-gradient-to-r from-brand-50/80 to-transparent px-5 py-2.5 dark:from-brand-500/5">
                            <span className="text-xs font-black tracking-widest text-brand-500 dark:text-brand-400">{letter}</span>
                          </td>
                        </tr>
                        {grouped[letter].map(user => (
                          <tr key={user._id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                            <td className="whitespace-nowrap px-5 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar user={user} size="sm" />
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-brand-600 dark:text-brand-400">{user.roleId?.displayName || user.roleId?.name || "—"}</td>
                            <td className="whitespace-nowrap px-5 py-4">
                              <div className="flex flex-col gap-0.5 text-xs">
                                {user.departmentId && <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><Building2 size={11} />{user.departmentId.departmentName || user.departmentId.name}</span>}
                                {user.teamId && <span className="flex items-center gap-1 text-gray-400"><Users size={11} />{user.teamId.name}</span>}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4"><a href={`mailto:${user.email}`} className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">{user.email}</a></td>
                            <td className="whitespace-nowrap px-5 py-4">
                              {user.phone
                                ? <a href={`tel:${user.phone}`} className="text-sm text-gray-600 transition-colors hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400">{user.phone}</a>
                                : <span className="text-sm text-gray-300 dark:text-gray-600">—</span>}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-right"><ContactActions user={user} compact /></td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-gray-100 px-5 py-3.5 dark:border-gray-800">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-bold text-gray-700 dark:text-gray-200">{filtered.length}</span> of <span className="font-bold text-gray-700 dark:text-gray-200">{users.length}</span> contacts
                </p>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}


