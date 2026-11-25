"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { DashboardStats } from "@/lib/data/admin";

const tooltipStyle = {
  backgroundColor: "#14110f",
  border: "none",
  borderRadius: 2,
  color: "#fff",
  fontSize: 12,
};

export function RevenueChart({ data }: { data: DashboardStats["revenueSeries"] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b4533a" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#b4533a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e1d8" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8c857c" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: "#8c857c" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`GH₵${value.toFixed(2)}`, "Revenue"]} />
          <Area type="monotone" dataKey="revenue" stroke="#b4533a" strokeWidth={2} fill="url(#revenueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersChart({ data }: { data: DashboardStats["revenueSeries"] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e1d8" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8c857c" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: "#8c857c" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="orders" fill="#26221f" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProductPerformanceChart({ data }: { data: DashboardStats["topProducts"] }) {
  if (!data.length) return <p className="py-12 text-center text-sm text-stone">No sales data yet.</p>;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e7e1d8" />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#8c857c" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#8c857c" }} axisLine={false} tickLine={false} width={110} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} units`, "Sold"]} />
          <Bar dataKey="units" fill="#b4533a" radius={[0, 2, 2, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
