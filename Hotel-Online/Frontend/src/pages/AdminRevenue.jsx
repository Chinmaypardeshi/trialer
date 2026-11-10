import { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api/axios';
import DashboardCard from '../components/cards/DashboardCard';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  RotateCw,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  FileDown,
  Layers,
  Receipt,
  Wallet,
} from 'lucide-react';

export default function AdminRevenue({ defaultPreset = 'thisMonth' }) {
  // Helper for preset date ranges
  const getDatesForPreset = (preset) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    switch (preset) {
      case 'daily':
      case 'today':
        return { from: todayStr, to: todayStr };

      case 'weekly':
      case 'last7Days': {
        const past = new Date();
        past.setDate(today.getDate() - 6);
        return { from: past.toISOString().split('T')[0], to: todayStr };
      }

      case 'monthly':
      case 'thisMonth': {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from: firstDay.toISOString().split('T')[0], to: todayStr };
      }

      case 'last30Days': {
        const past = new Date();
        past.setDate(today.getDate() - 29);
        return { from: past.toISOString().split('T')[0], to: todayStr };
      }

      case 'yearly':
      case 'thisYear': {
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        return { from: firstDayOfYear.toISOString().split('T')[0], to: todayStr };
      }

      case 'allTime':
      default:
        return { from: '2025-01-01', to: '2026-12-31' };
    }
  };

  const initialRange = getDatesForPreset(defaultPreset);
  const [fromDate, setFromDate] = useState(initialRange.from);
  const [toDate, setToDate] = useState(initialRange.to);
  const [activePreset, setActivePreset] = useState(defaultPreset);

  const [data, setData] = useState(null);
  const [topGroups, setTopGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active chart view tabs
  const [pieMode, setPieMode] = useState('status'); // 'status' | 'categories'

  // Fetch Revenue & Analytics Data
  const fetchRevenueData = async (from = fromDate, to = toDate) => {
    setLoading(true);
    setError('');

    try {
      // 1. Fetch dashboard KPI data (contains paidOrders, activeOrders, cancelledOrders, totalRevenue)
      const dashPromise = api.get(
        `/api/admin/dashboard?fromDate=${from}&toDate=${to}`
      );

      // 2. Fetch top menu groups for category sales and bar chart
      const groupsPromise = api.get(
        `/api/admin/analytics/top-groups?fromDate=${from}&toDate=${to}`
      ).catch(() => ({ data: [] }));

      const [dashRes, groupsRes] = await Promise.all([dashPromise, groupsPromise]);

      setData(dashRes.data);
      setTopGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
    } catch (err) {
      console.error('Failed to fetch revenue data:', err);
      setError('Unable to load revenue data. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData(fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyPreset = (presetKey) => {
    setActivePreset(presetKey);
    const range = getDatesForPreset(presetKey);
    setFromDate(range.from);
    setToDate(range.to);
    fetchRevenueData(range.from, range.to);
  };

  const handleCustomApply = () => {
    setActivePreset('custom');
    fetchRevenueData(fromDate, toDate);
  };

  // KPI Calculations
  const totalOrders = useMemo(() => {
    if (!data) return 0;
    return (data.paidOrders || 0) + (data.activeOrders || 0) + (data.cancelledOrders || 0);
  }, [data]);

  const totalRevenueNum = parseFloat(data?.totalRevenue || 0);
  const paidOrdersNum = parseInt(data?.paidOrders || 0, 10);

  // Average Order Value (AOV)
  const averageOrderValue = useMemo(() => {
    if (!paidOrdersNum || paidOrdersNum === 0) return 0;
    return totalRevenueNum / paidOrdersNum;
  }, [totalRevenueNum, paidOrdersNum]);

  const paidPercent = totalOrders > 0 ? (((data?.paidOrders || 0) / totalOrders) * 100).toFixed(1) : 0;
  const cancelledPercent = totalOrders > 0 ? (((data?.cancelledOrders || 0) / totalOrders) * 100).toFixed(1) : 0;

  // Pie chart datasets
  const statusPieData = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'Paid Orders', value: data.paidOrders || 0, color: '#10b981' },
      { label: 'Active Orders', value: data.activeOrders || 0, color: '#f59e0b' },
      { label: 'Cancelled', value: data.cancelledOrders || 0, color: '#ef4444' },
    ].filter((item) => item.value > 0);
  }, [data]);

  const categoryPieData = useMemo(() => {
    if (!topGroups || topGroups.length === 0) return [];
    const colors = ['#f97316', '#6366f1', '#10b981', '#ec4899', '#06b6d4', '#8b5cf6', '#eab308'];
    return topGroups.map((g, idx) => ({
      label: g.groupName,
      value: g.totalQuantity,
      color: colors[idx % colors.length],
    }));
  }, [topGroups]);

  // Bar chart dataset
  const barChartData = useMemo(() => {
    if (!topGroups || topGroups.length === 0) return [];
    return topGroups.map((g) => ({
      label: g.groupName,
      value: g.totalQuantity,
    }));
  }, [topGroups]);

  const topGroupsTotalQty = useMemo(() => {
    return topGroups.reduce((sum, g) => sum + (g.totalQuantity || 0), 0);
  }, [topGroups]);

  return (
    <div className="space-y-8 p-1 sm:p-2 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <IndianRupee size={22} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Revenue & Financial Analytics
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Complete overview of restaurant revenue, average order value, sales distribution, and category earnings.
          </p>
        </div>

        {/* Action Shortcuts & Refresh */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <NavLink
            to="/admin/export/excel"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            <FileDown size={14} className="text-orange-500" />
            Export Reports
          </NavLink>

          <button
            onClick={() => fetchRevenueData(fromDate, toDate)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
          >
            <RotateCw size={14} className={loading ? 'animate-spin text-emerald-600' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Date Filter & Presets Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Preset Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'today', label: 'Daily / Today' },
            { id: 'last7Days', label: 'Weekly (7 Days)' },
            { id: 'thisMonth', label: 'Monthly' },
            { id: 'last30Days', label: 'Last 30 Days' },
            { id: 'thisYear', label: 'Yearly' },
            { id: 'allTime', label: 'All Time' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activePreset === preset.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Range Picker */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-700 dark:text-slate-200 font-medium"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-700 dark:text-slate-200 font-medium"
            />
          </div>
          <button
            onClick={handleCustomApply}
            className="px-3 py-2 bg-slate-800 dark:bg-emerald-600 hover:bg-slate-900 dark:hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchRevenueData()}
            className="underline font-semibold ml-3"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top 4 Revenue KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <DashboardCard
          title="Total Gross Revenue"
          value={
            loading
              ? 'Loading...'
              : `₹${totalRevenueNum.toLocaleString('en-IN')}`
          }
          subtext="Net Settled Earnings"
          icon={<IndianRupee size={20} />}
          gradient="from-emerald-500 to-teal-600"
          badge={{ text: 'VERIFIED PAID', color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-transparent dark:border-emerald-800/60' }}
        />

        <DashboardCard
          title="Paid Orders"
          value={loading ? '...' : paidOrdersNum.toLocaleString('en-IN')}
          subtext="Completed transactions"
          icon={<CheckCircle2 size={20} />}
          gradient="from-blue-500 to-indigo-600"
          badge={{ text: `${paidPercent}% Rate`, color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800/60' }}
        />

        <DashboardCard
          title="Average Order Value (AOV)"
          value={
            loading
              ? '...'
              : `₹${averageOrderValue.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
          }
          subtext="Revenue per paid order"
          icon={<Wallet size={20} />}
          gradient="from-indigo-500 to-purple-600"
          badge={{ text: 'Per Ticket', color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-transparent dark:border-indigo-800/60' }}
        />

        <DashboardCard
          title="Active vs Cancelled"
          value={
            loading
              ? '...'
              : `${data?.activeOrders || 0} / ${data?.cancelledOrders || 0}`
          }
          subtext="Active in Kitchen / Voided"
          icon={<Receipt size={20} />}
          gradient="from-amber-500 to-rose-600"
          badge={{
            text: `${cancelledPercent}% Cancelled`,
            color: data?.cancelledOrders > 0 ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-transparent dark:border-rose-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-700',
          }}
        />
      </div>

      {/* Charts Grid: Pie Chart (Left) & Bar Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PIE / DONUT REVENUE CHART (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <PieIcon size={18} />
                </span>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                  Revenue &amp; Sales Distribution
                </h2>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setPieMode('status')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    pieMode === 'status'
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Status
                </button>
                <button
                  onClick={() => setPieMode('categories')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    pieMode === 'categories'
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Categories
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              {pieMode === 'status'
                ? 'Proportion of paid orders generating revenue vs active and cancelled orders.'
                : 'Share of ordered volume across top menu groups.'}
            </p>
          </div>

          <div className="mt-4">
            {pieMode === 'status' ? (
              <PieChart
                data={statusPieData}
                centerLabel="Total Orders"
                centerValue={totalOrders.toLocaleString('en-IN')}
                height={260}
              />
            ) : (
              <PieChart
                data={categoryPieData}
                centerLabel="Total Items"
                centerValue={topGroupsTotalQty.toLocaleString('en-IN')}
                height={260}
              />
            )}
          </div>
        </div>

        {/* REVENUE BAR CHART (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <BarChart3 size={18} />
                </span>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                  Category Sales Breakdown
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Volume Sold
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Menu category sales comparison for the selected period ({fromDate} to {toDate}).
            </p>
          </div>

          <div className="mt-4">
            <BarChart
              data={barChartData}
              valueSuffix=" items"
              height={260}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Categories Breakdown Table & Financial Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories Share Table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                <Layers size={18} />
              </span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Menu Category Sales Volume Ranking
              </h3>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {topGroupsTotalQty.toLocaleString('en-IN')} Total Items Sold
            </span>
          </div>

          {topGroups.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">
              No category sales recorded in this date range.
            </p>
          ) : (
            <div className="space-y-3">
              {topGroups.slice(0, 6).map((group, idx) => {
                const pct = topGroupsTotalQty > 0
                  ? Math.round((group.totalQuantity / topGroupsTotalQty) * 100)
                  : 0;

                const medalColors = [
                  'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
                  'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
                  'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800',
                ];

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    {/* Rank */}
                    <span
                      className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center border ${
                        medalColors[idx] || 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    {/* Group Name & Progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800 dark:text-white truncate">
                          {group.groupName}
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {group.totalQuantity.toLocaleString('en-IN')} items
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Percentage */}
                    <span className="text-xs font-bold text-slate-500 w-10 text-right">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Financial Actions & Export Shortcuts (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
              Financial Actions
            </span>
            <h3 className="text-lg font-bold mt-1 text-white">
              Revenue Reports & Exports
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Export verified sales spreadsheets, download signed PDFs, or manage staff certificates.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <NavLink
              to="/admin/export/excel"
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition flex flex-col gap-2 group"
            >
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg w-fit group-hover:scale-110 transition">
                <FileDown size={16} />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Excel Spreadsheet
              </span>
            </NavLink>

            <NavLink
              to="/admin/export/pdf"
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition flex flex-col gap-2 group"
            >
              <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg w-fit group-hover:scale-110 transition">
                <FileDown size={16} />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                PDF Statement
              </span>
            </NavLink>

            <NavLink
              to="/admin/orders"
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition flex flex-col gap-2 group"
            >
              <span className="p-2 bg-orange-500/20 text-orange-400 rounded-lg w-fit group-hover:scale-110 transition">
                <Receipt size={16} />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Paid Orders Log
              </span>
            </NavLink>

            <NavLink
              to="/admin/salary-certificate"
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition flex flex-col gap-2 group"
            >
              <span className="p-2 bg-amber-500/20 text-amber-400 rounded-lg w-fit group-hover:scale-110 transition">
                <Wallet size={16} />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Salary Certificates
              </span>
            </NavLink>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Siddhu's Maharashtrian Thali</span>
            <span className="text-emerald-400 font-semibold">Financial Year 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
