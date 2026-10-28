import React from 'react';
import { AlertCircle, CheckCircle2, Info, TrendingUp, TrendingDown, ArrowRight, Activity, Clock } from 'lucide-react';
import Link from 'next/link';

export type InsightSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface InsightCardProps {
  title: string;
  metric?: string | number;
  explanation?: string;
  severity?: InsightSeverity;
  context?: React.ReactNode;
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  action?: {
    label: string;
    href: string;
  };
  loading?: boolean;
  empty?: boolean;
  error?: string;
}

export default function InsightCard({
  title,
  metric,
  explanation,
  severity = 'info',
  context,
  trend,
  action,
  loading,
  empty,
  error,
}: InsightCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse h-full">
        <div className="h-4 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div className="h-8 w-1/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm h-full flex flex-col justify-center items-center text-center">
        <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
        <h4 className="text-sm font-semibold text-red-700">{title}</h4>
        <p className="text-xs text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm h-full flex flex-col justify-center items-center text-center">
        <Info className="h-6 w-6 text-gray-400 mb-2" />
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">Not enough data to generate insight.</p>
      </div>
    );
  }

  const severityStyles = {
    critical: 'bg-red-50 border-red-100 text-red-700',
    warning: 'bg-amber-50 border-amber-100 text-amber-700',
    info: 'bg-blue-50 border-blue-100 text-blue-700',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  };

  const iconMap = {
    critical: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <Clock className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  };

  return (
    <div className={`rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md flex flex-col h-full bg-white border-gray-100`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {iconMap[severity]}
          {title}
        </h3>
        {severity !== 'info' && (
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${severityStyles[severity]}`}>
            {severity}
          </span>
        )}
      </div>

      <div className="mt-2 flex-grow">
        {metric !== undefined && (
          <div className="text-2xl font-bold text-gray-900 mb-1">{metric}</div>
        )}
        
        {explanation && (
          <p className="text-sm text-gray-600 leading-relaxed">{explanation}</p>
        )}

        {context && (
          <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
            {context}
          </div>
        )}

        {trend && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span
              className={`flex items-center gap-1 font-medium ${
                trend.direction === 'up'
                  ? 'text-emerald-600'
                  : trend.direction === 'down'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : trend.direction === 'down' ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              {trend.value}
            </span>
            {trend.label && <span className="text-gray-500">{trend.label}</span>}
          </div>
        )}
      </div>

      {action && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href={action.href}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {action.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
