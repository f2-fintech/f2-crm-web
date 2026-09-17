"use client";

import dynamic from "next/dynamic";

const ReactApexChart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
);

interface LeadSourceChartProps {
  data: {
    website: number;
    facebook: number;
    google: number;
    instagram: number;
    manual: number;
    dialer: number;
  };
}

export default function LeadSourceChart({
  data,
}: LeadSourceChartProps) {
  const series = [
    {
      name: "Leads",
      data: [
        data.website,
        data.facebook,
        data.google,
        data.instagram,
        data.manual,
        data.dialer,
      ],
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
    },

    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "45%",
      },
    },

    xaxis: {
      categories: [
        "Website",
        "Facebook",
        "Google",
        "Instagram",
        "Manual",
        "Dialer",
      ],
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },

    colors: ["#3B82F6"],

    grid: {
      borderColor: "#E5E7EB",
    },

    tooltip: {
      y: {
        formatter(value) {
          return `${value} Leads`;
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Lead Sources
        </h3>

        <p className="text-sm text-gray-500">
          Leads generated from different channels
        </p>
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