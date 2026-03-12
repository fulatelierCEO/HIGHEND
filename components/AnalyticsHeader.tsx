"use client";

import { DollarSign, Repeat, Package } from 'lucide-react';

interface AnalyticsHeaderProps {
  totalRevenue: number;
  activeSubs: number;
  templateSales: number;
}

export default function AnalyticsHeader({ totalRevenue, activeSubs, templateSales }: AnalyticsHeaderProps) {
  const stats = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      label: 'Active SaaS Subscriptions',
      value: activeSubs,
      icon: Repeat,
    },
    {
      label: 'Template Sales',
      value: templateSales,
      icon: Package,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-[#1A1A1A]/10 p-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 bg-[#1A1A1A] text-white">
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 mb-3">
            {stat.label}
          </p>
          <p className="font-serif text-4xl text-[#1A1A1A]">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
