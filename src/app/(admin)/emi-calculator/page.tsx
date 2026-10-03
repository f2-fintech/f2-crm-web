"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Calculator, ShieldCheck, TrendingUp, PiggyBank } from "lucide-react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type CalcType = "SIP" | "FD" | "RD" | "EMI";

export default function NativeCalculatorsHub() {
  const [activeTab, setActiveTab] = useState<CalcType>("SIP");

  // Common State
  const [amount, setAmount] = useState<number>(10000);
  const [rate, setRate] = useState<number>(12);
  const [years, setYears] = useState<number>(10);

  // Results
  const [invested, setInvested] = useState<number>(0);
  const [returns, setReturns] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    let p = amount;
    let r = rate / 100;
    let t = years;

    if (activeTab === "SIP") {
      let i = r / 12;
      let n = t * 12;
      let maturity = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      let totalInvested = p * n;
      setInvested(totalInvested);
      setTotal(maturity);
      setReturns(maturity - totalInvested);
    } else if (activeTab === "FD") {
      let n = 4;
      let maturity = p * Math.pow(1 + r / n, n * t);
      setInvested(p);
      setTotal(maturity);
      setReturns(maturity - p);
    } else if (activeTab === "RD") {
      let n = t * 12;
      let maturity = 0;
      for (let month = 1; month <= n; month++) {
        let timeRemaining = (n - month + 1) / 12;
        maturity += p * Math.pow(1 + r / 4, 4 * timeRemaining);
      }
      let totalInvested = p * n;
      setInvested(totalInvested);
      setTotal(maturity);
      setReturns(maturity - totalInvested);
    } else if (activeTab === "EMI") {
      let i = r / 12;
      let n = t * 12;
      let emi = (p * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
      let totalPayment = emi * n;
      setInvested(p);
      setTotal(totalPayment);
      setReturns(totalPayment - p);
    }
  }, [amount, rate, years, activeTab]);

  const formatRupee = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const chartOptions = useMemo(
    () => ({
      chart: { type: "donut" as const, fontFamily: "inherit" },
      labels:
        activeTab === "EMI"
          ? ["Principal Amount", "Total Interest"]
          : ["Invested Amount", "Est. Returns"],
      colors: ["#4f46e5", "#10b981"],
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: "75%",
            labels: {
              show: true,
              name: { show: true },
              value: { show: true, formatter: (val: any) => formatRupee(val) },
            },
          },
        },
      },
      legend: { position: "bottom" as const },
    }),
    [activeTab]
  );

  const tabs: { id: CalcType; name: string; icon: any }[] = [
    { id: "SIP", name: "SIP Calculator", icon: TrendingUp },
    { id: "FD", name: "FD Calculator", icon: ShieldCheck },
    { id: "RD", name: "RD Calculator", icon: PiggyBank },
    { id: "EMI", name: "EMI Calculator", icon: Calculator },
  ];

  const labels = useMemo(() => {
    switch (activeTab) {
      case "SIP":
      case "RD":
        return {
          amount: "Monthly Investment",
          minAmt: 500,
          maxAmt: 100000,
          step: 500,
        };
      case "FD":
        return {
          amount: "Total Investment",
          minAmt: 10000,
          maxAmt: 5000000,
          step: 10000,
        };
      case "EMI":
        return {
          amount: "Loan Amount",
          minAmt: 100000,
          maxAmt: 10000000,
          step: 50000,
        };
    }
  }, [activeTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 p-8 sm:p-10 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white opacity-5 blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 flex items-center gap-3">
            Financial Tools
          </h1>
          <p className="text-indigo-100 max-w-3xl text-sm sm:text-base leading-relaxed">
            Beautifully integrated, fully native financial calculators. No branding, no extra sidebars, just pure performance.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "EMI" || tab.id === "FD") setAmount(500000);
                else setAmount(10000);
              }}
              className={"flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 " + (isActive ? "bg-indigo-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200")}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xl shadow-gray-200/40">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-gray-700">
                    {labels.amount}
                  </label>
                  <div className="rounded-lg bg-indigo-50 px-4 py-2 text-lg font-extrabold text-indigo-700 border border-indigo-100">
                    {formatRupee(amount)}
                  </div>
                </div>
                <input
                  type="range"
                  min={labels.minAmt}
                  max={labels.maxAmt}
                  step={labels.step}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-gray-700">
                    Expected Return Rate (p.a)
                  </label>
                  <div className="rounded-lg bg-gray-50 px-4 py-2 text-lg font-extrabold text-gray-700 border border-gray-100">
                    {rate}%
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-gray-700">
                    Time Period (Years)
                  </label>
                  <div className="rounded-lg bg-gray-50 px-4 py-2 text-lg font-extrabold text-gray-700 border border-gray-100">
                    {years} Yr
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase">
                {activeTab === "EMI" ? "Principal Amount" : "Invested Amount"}
              </p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                {formatRupee(invested)}
              </h3>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase">
                {activeTab === "EMI" ? "Total Interest" : "Est. Returns"}
              </p>
              <h3 className="text-xl font-bold text-indigo-600 mt-1">
                {formatRupee(returns)}
              </h3>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xl shadow-gray-200/40 text-center">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
              {activeTab === "EMI"
                ? "Total Payment (Prin + Int)"
                : "Total Value"}
            </p>
            <h2 className="text-4xl font-black text-gray-900">
              {formatRupee(total)}
            </h2>

            <div className="mt-8 h-64 flex justify-center">
              {typeof window !== "undefined" && (
                <Chart
                  options={chartOptions}
                  series={[Math.round(invested), Math.round(returns)]}
                  type="donut"
                  width="100%"
                  height="100%"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
