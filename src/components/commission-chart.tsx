'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Award, IndianRupee, BarChart3, HelpCircle } from 'lucide-react';

interface ChartPoint {
  label: string;
  value: number;
}

interface CommissionChartProps {
  earningsData?: ChartPoint[];
  productData?: { name: string; clients: number; mrr: number; color: string }[];
}

export default function CommissionChart({ 
  earningsData: propsEarningsData, 
  productData: propsProductData 
}: CommissionChartProps) {
  const [activeTab, setActiveTab] = useState<'earnings' | 'products'>('earnings');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fallback data for Monthly Earnings Trend
  const defaultEarningsData: ChartPoint[] = [
    { label: 'Feb', value: 4500 },
    { label: 'Mar', value: 9200 },
    { label: 'Apr', value: 16800 },
    { label: 'May', value: 24000 },
    { label: 'Jun', value: 31500 },
    { label: 'Jul', value: 48000 }
  ];

  // Fallback data for Product Referral Distribution
  const defaultProductData = [
    { name: 'ANSH Tasks', clients: 4, mrr: 58000, color: 'from-purple-500 to-indigo-500' },
    { name: 'ANSH HR', clients: 3, mrr: 38000, color: 'from-indigo-500 to-blue-500' },
    { name: 'ANSH Expense', clients: 2, mrr: 18000, color: 'from-pink-500 to-rose-500' },
    { name: 'ANSH Visitor', clients: 1, mrr: 6000, color: 'from-emerald-500 to-teal-500' }
  ];

  const earningsData = propsEarningsData && propsEarningsData.some(d => d.value > 0) 
    ? propsEarningsData 
    : defaultEarningsData;

  const productData = propsProductData && propsProductData.some(p => p.clients > 0) 
    ? propsProductData 
    : defaultProductData;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // SVG dimensions for Line Chart
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const maxVal = Math.max(...earningsData.map(d => d.value));

  // Compute coordinates for line points
  const points = earningsData.map((d, index) => {
    const x = paddingX + (index / (earningsData.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.value / maxVal) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  // SVG path string for line
  const pathD = points.reduce((path, p, index) => {
    return index === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, '');

  // SVG path string for area under the line
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-5 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10">
        <div>
          <h3 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
            <TrendingUp className="text-primary-bright w-5 h-5" />
            <span>Saathi Performance Analytics</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Visualize your client referral conversions and recurring commission monthly growth.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex items-center gap-1.5 border border-glass-border/60 bg-white/[0.01] p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'earnings'
                ? 'bg-primary text-white shadow-md'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Earnings Trend</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-primary text-white shadow-md'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Product Split</span>
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative flex-1 flex items-center justify-center min-h-[200px] w-full mt-2">
        <AnimatePresence mode="wait">
          {activeTab === 'earnings' ? (
            <motion.div
              key="earnings-chart"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full relative"
            >
              {/* Tooltip Overlay */}
              {hoveredIndex !== null && (
                <div 
                  className="absolute p-2.5 rounded-xl border border-glass-border bg-bg-accent/90 backdrop-blur-md shadow-2xl z-20 text-[10px] space-y-0.5"
                  style={{
                    left: `${(points[hoveredIndex].x / width) * 100}%`,
                    top: `${(points[hoveredIndex].y / height) * 100 - 30}%`,
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'none'
                  }}
                >
                  <div className="text-text-muted font-bold uppercase tracking-wider">
                    {points[hoveredIndex].label} Payout
                  </div>
                  <div className="text-emerald-400 font-mono font-bold text-xs">
                    {formatCurrency(points[hoveredIndex].value)}
                  </div>
                </div>
              )}

              {/* SVG Curve */}
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                  {/* Glowing line gradient */}
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#d946ef" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  {/* Area fill gradient */}
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 1, 2, 3].map((g) => {
                  const y = paddingY + (g / 3) * (height - paddingY * 2);
                  return (
                    <line
                      key={g}
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Fill Area */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  d={areaD}
                  fill="url(#areaGrad)"
                />

                {/* Line Path */}
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  d={pathD}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    {/* Outer glow circle */}
                    {hoveredIndex === idx && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="8"
                        className="fill-purple-500/30 animate-ping"
                      />
                    )}
                    {/* Interactive dot */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={hoveredIndex === idx ? '5' : '3.5'}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={`cursor-pointer transition-all duration-200 fill-bg-accent stroke-purple-400 ${
                        hoveredIndex === idx ? 'stroke-2' : 'stroke-1'
                      }`}
                    />
                    {/* Month Label */}
                    <text
                      x={p.x}
                      y={height - 8}
                      textAnchor="middle"
                      className="fill-text-muted text-[10px] font-medium font-outfit"
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="products-chart"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {productData.map((prod) => (
                  <div 
                    key={prod.name}
                    className="p-4 rounded-xl border border-glass-border bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col justify-between gap-2 group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-white group-hover:text-primary-bright transition-colors">
                          {prod.name}
                        </span>
                        <span className="block text-[10px] text-text-muted mt-0.5">
                          {prod.clients} Active Customer{prod.clients === 1 ? '' : 's'}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        MRR Shared
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-text-muted">Estimated Commission</span>
                        <span className="font-mono font-bold text-white">
                          {formatCurrency(prod.mrr * 0.15)}/mo
                        </span>
                      </div>
                      {/* Bar indicator */}
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(prod.clients / 5) * 100}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className={`h-full bg-gradient-to-r ${prod.color}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info footer row */}
      <div className="pt-3 border-t border-glass-border/40 flex items-center justify-between text-[10px] text-text-muted z-10">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Calculated on active customers recurring contract values</span>
        </span>
        <span>Updated 10m ago</span>
      </div>
    </div>
  );
}
