"use client";

import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);

interface PerformanceChartProps {
  data: {
    categories: string[];
    leads: number[];
    applications: number[];
  };
}

export default function PerformanceChart({
  data,
}: PerformanceChartProps) {
  const series = [
    {
      name: "Leads",
      data: data.leads,
    },
    {
      name: "Applications",
      data: data.applications,
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
      stacked: false,
    },

    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "45%",
      },
    },

    colors: [
      "#3B82F6",
      "#22C55E",
    ],

    dataLabels: {
      enabled: false,
    },

    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },

    legend: {
      position: "top",
      horizontalAlign: "right",
    },

    xaxis: {
      categories: data.categories,
    },

    yaxis: {
      title: {
        text: "Count",
      },
    },

    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
    },

    tooltip: {
      shared: true,
      intersect: false,
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Performance
          </h3>

          <p className="text-sm text-gray-500">
            Leads vs Applications
          </p>
        </div>
      </div>

      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={350}
      />
    </div>
  );
}