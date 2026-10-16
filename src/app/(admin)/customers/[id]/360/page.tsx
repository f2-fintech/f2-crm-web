'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { 
  User, Phone, Mail, MapPin, Briefcase, Activity, 
  Clock, FileText, CheckCircle, AlertCircle, Calendar,
  ExternalLink, FileStack, MessageSquare
} from 'lucide-react';
import Client360Insights from './Client360Insights';

export default function Client360Page() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [omsData, setOmsData] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [lifecycleCurrent, setLifecycleCurrent] = useState<any>(null);
  const [lifecycleTimeline, setLifecycleTimeline] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [remarksInput, setRemarksInput] = useState('');
  const [savingRemarks, setSavingRemarks] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch CRM Customer
      const custRes = await api.get(`/customers/${id}`).catch(() => null);
      const custData = custRes?.data?.data;
      setCustomer(custData);

      if (custData) {
        // Parallel requests now that we have customer
        const [
          omsRes, 
          currRes, 
          timelineRes, 
          appsRes,
          followRes
        ] = await Promise.allSettled([
          api.get(`/customers/${id}/oms-summary`),
          api.get(`/lifecycle-events/Customer/${id}/current`),
          api.get(`/lifecycle-events/Customer/${id}/timeline`),
          api.get(`/applications?customerId=${custData.customerId}`),
          api.get(`/follow-ups?customerId=${id}`)
        ]);

        if (omsRes.status === 'fulfilled') setOmsData(omsRes.value?.data?.data?.omsSummary);
        if (currRes.status === 'fulfilled') setLifecycleCurrent(currRes.value?.data?.data);
        if (timelineRes.status === 'fulfilled') setLifecycleTimeline(timelineRes.value?.data?.data || []);
        if (appsRes.status === 'fulfilled') setApplications(appsRes.value?.data?.data || []);
        if (followRes.status === 'fulfilled') setFollowUps(followRes.value?.data?.data || []);
      } else {
        setError('Customer not found');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load Client 360 data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/10">
        <AlertCircle className="mb-2 h-10 w-10" />
        <h2 className="text-lg font-semibold">{error || 'Customer not found'}</h2>
      </div>
    );
  }

  // Next Action logic
  let nextAction = 'No pending action';
  if (applications.some(a => a.status === 'DRAFT')) nextAction = 'Application pending submission';
  else if (applications.some(a => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW')) nextAction = 'Verification / Approval pending';
  else if (applications.some(a => a.status === 'APPROVED')) nextAction = 'Disbursement pending';
  else if (followUps.some(f => f.status === 'PENDING')) nextAction = 'Follow-up due';

  const formatStageAge = (seconds: number) => {
    if (!seconds && seconds !== 0) return 'N/A';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    if (d > 0) return `${d}d ${h}h`;
    return `${h}h`;
  };

  const handleSaveRemarks = async () => {
    setSavingRemarks(true);
    try {
      await api.patch(`/customers/${id}`, { remarks: remarksInput });
      setCustomer({ ...customer, remarks: remarksInput });
      setIsEditingRemarks(false);
    } catch (err) {
      console.error('Failed to update remarks', err);
      alert('Failed to update remarks. Please try again.');
    } finally {
      setSavingRemarks(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {customer.fullName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1"><User className="h-4 w-4"/> {customer.customerId}</span>
            <span className="flex items-center gap-1"><Phone className="h-4 w-4"/> {customer.phone}</span>
            <span className="flex items-center gap-1"><Mail className="h-4 w-4"/> {customer.email || 'N/A'}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20 md:items-end md:bg-transparent md:p-0 md:dark:bg-transparent">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Stage:</span>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {lifecycleCurrent?.currentStage || customer.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Stage Age:</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatStageAge(lifecycleCurrent?.currentStageAgeSeconds)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">SLA State:</span>
            <span className={`text-sm font-semibold ${lifecycleCurrent?.slaState === 'BREACHED' ? 'text-red-600' : lifecycleCurrent?.slaState === 'AT_RISK' ? 'text-amber-600' : lifecycleCurrent?.slaState === 'WITHIN_SLA' ? 'text-emerald-600' : 'text-gray-500'}`}>
              {lifecycleCurrent?.slaState ? lifecycleCurrent.slaState.replace('_', ' ') : 'Not Configured'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Action:</span>
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{nextAction}</span>
          </div>
        </div>
      </div>

      {/* ONBOARDING PROGRESS */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10">
        <h3 className="text-sm font-bold text-gray-900 mb-4 dark:text-white">Client Journey Progress</h3>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {[
            { label: 'Lead', completed: true },
            { label: 'Qualified', completed: lifecycleTimeline.some(t => t.toStage === 'QUALIFIED' || t.stage === 'QUALIFIED' || t.toStage === 'CONVERTED' || t.stage === 'CONVERTED') },
            { label: 'Converted', completed: lifecycleTimeline.some(t => t.toStage === 'CONVERTED' || t.stage === 'CONVERTED') },
            { label: 'Application', completed: applications.length > 0 },
            { label: 'Approved', completed: applications.some(a => a.status === 'APPROVED' || a.status === 'DISBURSED') },
            { label: 'Disbursed', completed: applications.some(a => a.status === 'DISBURSED') },
            { label: 'Active', completed: customer.status === 'ACTIVE' },
          ].map((step, idx, arr) => (
            <div key={step.label} className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-center mb-2">
                <div className={`h-1 flex-1 ${idx === 0 ? 'bg-transparent' : step.completed ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600'}`}>
                  {step.completed ? <CheckCircle className="w-5 h-5" /> : <span className="text-xs">{idx + 1}</span>}
                </div>
                <div className={`h-1 flex-1 ${idx === arr.length - 1 ? 'bg-transparent' : arr[idx+1].completed ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              </div>
              <span className={`text-xs font-medium ${step.completed ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Section */}
      <Client360Insights
        customer={customer}
        lifecycleCurrent={lifecycleCurrent}
        applications={applications}
        followUps={followUps}
        omsData={omsData}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* APPLICATIONS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-gray-800">
              <FileStack className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Applications</h2>
            </div>
            {applications.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {applications.map(app => (
                  <div key={app._id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">{app.applicationId}</span>
                      <span className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {app.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{app.loanType} - ₹{app.loanAmount?.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-gray-500">Provider: {app.lenderName || 'N/A'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No applications found.</p>
            )}
          </section>

          {/* LIFECYCLE TIMELINE */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-gray-800">
              <Activity className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lifecycle Timeline</h2>
            </div>
            {lifecycleTimeline.length > 0 ? (
              <div className="relative border-l border-gray-200 ml-3 dark:border-gray-700">
                {lifecycleTimeline.map((item, idx) => (
                  <div key={idx} className="mb-6 ml-6">
                    <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 ring-4 ring-white dark:bg-blue-900 dark:ring-gray-900">
                      <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                    </span>
                    <div className="flex flex-col">
                      <time className="mb-1 text-xs font-normal leading-none text-gray-400 dark:text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </time>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.recordType === 'EVENT' ? (
                          <>
                            {item.eventType?.replace(/_/g, ' ')}
                            {item.fromStage && item.toStage && <span className="ml-2 font-normal text-gray-500">({item.fromStage} &rarr; {item.toStage})</span>}
                          </>
                        ) : (
                          `Entered Stage: ${item.stage}`
                        )}
                      </h3>
                      {item.recordType === 'STAGE_HISTORY' && item.exitedAt && (
                        <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                          <Clock className="inline h-3 w-3 mr-1" />
                          Duration: {formatStageAge(Math.floor((new Date(item.exitedAt).getTime() - new Date(item.enteredAt).getTime()) / 1000))}
                        </p>
                      )}
                      {(item.source || item.performedBy) && (
                        <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                          Source: <span className="font-medium text-gray-700 dark:text-gray-300">{item.source || 'CRM'}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No lifecycle history available.</p>
            )}
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* OMS SUMMARY */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">OMS Details</h2>
              </div>
            </div>
            {omsData ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-50 pb-2 dark:border-gray-800">
                  <span className="text-gray-500">OMS Status</span>
                  <span className="font-medium text-gray-900 dark:text-white">{omsData.status || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2 dark:border-gray-800">
                  <span className="text-gray-500">Gender</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{omsData.gender || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2 dark:border-gray-800">
                  <span className="text-gray-500">DOB</span>
                  <span className="font-medium text-gray-900 dark:text-white">{omsData.dob || 'N/A'}</span>
                </div>
                {omsData.info && (
                  <>
                    <div className="flex justify-between border-b border-gray-50 pb-2 dark:border-gray-800">
                      <span className="text-gray-500">PAN</span>
                      <span className="font-medium text-gray-900 dark:text-white uppercase">{omsData.info.pan || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2 dark:border-gray-800">
                      <span className="text-gray-500">Salary</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{omsData.info.salary?.toLocaleString() || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">OMS details unavailable.</p>
            )}
          </section>

          {/* FOLLOW UPS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-gray-800">
              <Calendar className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Follow-ups</h2>
            </div>
            {followUps.length > 0 ? (
              <div className="space-y-3">
                {followUps.slice(0, 3).map(fu => (
                  <div key={fu._id} className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-white/[0.02]">
                    <div className="flex justify-between font-medium text-gray-900 dark:text-white">
                      <span>{fu.title || 'Follow-up'}</span>
                      <span className={`text-xs ${fu.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>
                        {fu.status}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-500">{new Date(fu.dueDate).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No pending follow-ups.</p>
            )}
          </section>

          {/* CUSTOMER CRM DETAILS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-gray-800">
              <User className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">CRM Details</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>{customer.city || 'Location unknown'} {customer.state && `, ${customer.state}`}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Briefcase className="h-4 w-4" />
                <span>{customer.employmentType || 'Employment unknown'}</span>
              </div>
            </div>
          </section>

          {/* CLIENT CONTEXT / REMARKS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-pink-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Client Context</h2>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 border border-gray-100 dark:bg-white/[0.02] dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Internal Remarks</h3>
                  {!isEditingRemarks && (
                    <button 
                      onClick={() => {
                        setRemarksInput(customer.remarks || '');
                        setIsEditingRemarks(true);
                      }}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                    >
                      Edit
                    </button>
                  )}
                </div>
                
                {isEditingRemarks ? (
                  <div className="mt-2 space-y-2">
                    <textarea 
                      className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      rows={4}
                      value={remarksInput}
                      onChange={(e) => setRemarksInput(e.target.value)}
                      placeholder="Enter internal remarks..."
                      disabled={savingRemarks}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setIsEditingRemarks(false)}
                        className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                        disabled={savingRemarks}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveRemarks}
                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        disabled={savingRemarks}
                      >
                        {savingRemarks ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {customer.remarks ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap dark:text-gray-300">
                        {customer.remarks}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No internal remarks available.</p>
                    )}
                  </>
                )}
              </div>

              <div className="rounded-lg bg-gray-50 p-4 border border-gray-100 dark:bg-white/[0.02] dark:border-gray-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notion Context</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <FileText className="h-4 w-4" />
                  <span>No Notion document directly linked to this customer.</span>
                </div>
              </div>
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}
