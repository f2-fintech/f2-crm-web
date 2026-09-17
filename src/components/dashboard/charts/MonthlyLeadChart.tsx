"use client";

import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);

interface MonthlyLeadChartProps {
  data: number[];
}

export default function MonthlyLeadChart({
  data,
}: MonthlyLeadChartProps) {
  const series = [
    {
      name: "Leads",
      data,
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },

    stroke: {
      curve: "smooth",
      width: 3,
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
      },
    },

    dataLabels: {
      enabled: false,
    },

    colors: ["#3B82F6"],

    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
    },

    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },

    yaxis: {
      labels: {
        formatter(value) {
          return `${value}`;
        },
      },
    },

    tooltip: {
      y: {
        formatter(value) {
          return `${value} Leads`;
        },
      },
    },

    legend: {
      show: false,
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Monthly Leads
        </h3>

        <p className="text-sm text-gray-500">
          Lead growth throughout the year
        </p>
      </div>

      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={350}
      />
    </div>
  );
}