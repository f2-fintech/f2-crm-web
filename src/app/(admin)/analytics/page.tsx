"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles, TrendingUp, Users, Target, Activity, Calendar, Download } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("This Month");

  // Mock AI Insights
  const aiInsights = [
    { title: "Conversion Anomaly", text: "Home loan conversions dropped 12% in the last 48 hours compared to historical averages.", type: "warning" },
    { title: "Peak Efficiency", text: "Agent processing time has decreased by 2.4 hours per application this week.", type: "success" },
    { title: "Lead Source Prediction", text: "Organic social leads have a 45% higher probability to convert this quarter.", type: "info" }
  ];

  // Chart 1: Revenue / Conversion Trend
  const trendOptions = {
    chart: { type: "area" as const, toolbar: { show: false }, fontFamily: 'inherit' },
    colors: ["#6366f1", "#0ea5e9"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" as const, width: 2 },
    xaxis: { categories: ["Week 1", "Week 2", "Week 3", "Week 4"], labels: { style: { colors: '#64748b' } } },
    yaxis: { labels: { style: { colors: '#64748b' } } },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
    legend: { position: "top" as const, horizontalAlign: "right" as const },
  };
  const trendSeries = [
    { name: "Total Leads", data: [120, 150, 180, 220] },
    { name: "Converted (Customers)", data: [40, 55, 65, 90] }
  ];

  // Chart 2: Product Breakdown (Donut)
  const donutOptions = {
    chart: { type: "donut" as const, fontFamily: 'inherit' },
    labels: ["Personal Loan", "Business Loan", "Home Loan", "Credit Card"],
    colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981"],
    plotOptions: { pie: { donut: { size: '75%', labels: { show: true, name: { show: true }, value: { show: true } } } } },
    dataLabels: { enabled: false },
    legend: { position: "bottom" as const }
  };
  const donutSeries = [45, 25, 20, 10];

  // Chart 3: Agent Performance (Bar)
  const barOptions = {
    chart: { type: "bar" as const, toolbar: { show: false }, fontFamily: 'inherit' },
    plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: { categories: ["Rahul", "Sarah", "Amit", "Priya"], labels: { style: { colors: '#64748b' } } },
    yaxis: { labels: { style: { colors: '#64748b' } } },
    fill: { opacity: 1 },
    colors: ["#6366f1", "#cbd5e1"],
    legend: { position: "top" as const }
  };
  const barSeries = [
    { name: "Processed", data: [44, 55, 41, 67] },
    { name: "Pending", data: [13, 23, 20, 8] }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-2">
        <div>
          <PageBreadcrumb pageTitle="AI Analytics & Insights" />
          <p className="mt-1 text-sm text-gray-500">Comprehensive view of CRM performance and predictive analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="rounded-xl border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <button className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
            <Sparkles size={18} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Athena AI Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.map((insight, idx) => (
            <div key={idx} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
              <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${insight.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : insight.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'}`} />
              <div>
                <h4 className="text-sm font-bold text-gray-900">{insight.title}</h4>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{insight.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Volume", value: "₹4.2 Cr", trend: "+12%", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Conversion Rate", value: "32.4%", trend: "+5.1%", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Avg. Processing Time", value: "1.2 Days", trend: "-8%", icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Active Agents", value: "24", trend: "Stable", icon: Users, color: "text-amber-600", bg: "bg-amber-50" }
        ].map((m, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${m.bg}`}>
                <m.icon className={`h-5 w-5 ${m.color}`} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${m.trend.includes('-') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                {m.trend}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">{m.title}</p>
            <h3 className="mt-1 text-2xl font-extrabold text-gray-900">{m.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Lead to Customer Conversion</h3>
          </div>
          <div className="h-[300px] w-full">
            <Chart options={trendOptions} series={trendSeries} type="area" height="100%" width="100%" />
          </div>
        </div>

        {/* Donut Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-gray-900 mb-4">Product Portfolio</h3>
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <Chart options={donutOptions} series={donutSeries} type="donut" height="320px" width="100%" />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Agent Performance (This Week)</h3>
          </div>
          <div className="h-[300px] w-full">
            <Chart options={barOptions} series={barSeries} type="bar" height="100%" width="100%" />
          </div>
        </div>
      </div>
    </div>
  );
}
