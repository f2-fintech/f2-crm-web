"use client";

import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);

interface LeadStatusChartProps {
  data: {
    new: number;
    contacted: number;
    followUp: number;
    approved: number;
    rejected: number;
  };
}

export default function LeadStatusChart({
  data,
}: LeadStatusChartProps) {
  const series = [
    data.new,
    data.contacted,
    data.followUp,
    data.approved,
    data.rejected,
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      toolbar: {
        show: false,
      },
    },

    labels: [
      "New",
      "Contacted",
      "Follow Up",
      "Approved",
      "Rejected",
    ],

    legend: {
      position: "bottom",
      fontSize: "14px",
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      width: 0,
    },

    colors: [
      "#3B82F6",
      "#06B6D4",
      "#F59E0B",
      "#22C55E",
      "#EF4444",
    ],

    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 320,
          },
        },
      },
    ],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Lead Status
        </h3>

        <p className="text-sm text-gray-500">
          Current lead distribution
        </p>
      </div>

      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={350}
      />
    </div>
  );
}