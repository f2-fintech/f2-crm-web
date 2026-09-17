"use client";

import Link from "next/link";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface StatsCardProps {
  title: string;
  value: number | string;

  icon?: React.ReactNode;

  color?: string;

  description?: string;

  trend?: number;

  href?: string;

  loading?: boolean;
}

export default function StatsCard({
  title,
  value,

  icon,

  color = "bg-blue-500",

  description,

  trend,

  href,

  loading = false,
}: StatsCardProps) {
  const CardContent = (
    <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
      {/* Top */}

      <div className="flex items-center justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl text-white ${color}`}
        >
          {icon}
        </div>

        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              trend >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {trend >= 0 ? (
              <TrendingUpIcon fontSize="small" />
            ) : (
              <TrendingDownIcon fontSize="small" />
            )}

            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Title */}

      <p className="mt-6 text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>

      {/* Value */}

      {loading ? (
        <div className="mt-3 h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      ) : (
        <h2 className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
          {value}
        </h2>
      )}

      {/* Description */}

      {description && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}