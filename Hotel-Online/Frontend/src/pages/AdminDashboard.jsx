import { useEffect, useState, useMemo, useCallback } from 'react';
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
  Award,
  FileDown,
  FileUp,
  ShoppingCart,
  UtensilsCrossed,
  Layers,
  Store,
} from 'lucide-react';

const FALLBACK_SHOPS = [
  { shopId: 1, shopName: 'MAIN BRANCH', location: 'Pune', isActive: true },
  { shopId: 2, shopName: 'Somwar Peth', location: 'Somwar Peth, Pune', isActive: true },
  { shopId: 3, shopName: 'Market Yard', location: 'Market Yard, Pune', isActive: false },
];

export default function AdminDashboard() {
  // Helper for preset date ranges
  const getDatesForPreset = (preset) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    switch (preset) {
      case 'today':
        return { from: todayStr, to: todayStr };

      case 'last7Days': {
        const past = new Date();
        past.setDate(today.getDate() - 6);
        return { from: past.toISOString().split('T')[0], to: todayStr };
      }

      case 'thisMonth': {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from: firstDay.toISOString().split('T')[0], to: todayStr };
      }

      case 'last30Days': {
        const past = new Date();
        past.setDate(today.getDate() - 29);
        return { from: past.toISOString().split('T')[0], to: todayStr };
      }

      case 'thisYear': {
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        return { from: firstDayOfYear.toISOString().split('T')[0], to: todayStr };
      }

      case 'allTime':
      default:
        return { from: '2025-01-01', to: '2026-12-31' };
    }
  };

  const initialRange = getDatesForPreset('thisMonth');
  const [fromDate, setFromDate] = useState(initialRange.from);
  const [toDate, setToDate] = useState(initialRange.to);
  const [activePreset, setActivePreset] = useState('thisMonth');

  // Shop / Branch Filter State ('ALL' is default)
  const [shops, setShops] = useState(FALLBACK_SHOPS);
  const [selectedShopId, setSelectedShopId] = useState('ALL');

  const [data, setData] = useState(null);
  const [topGroups, setTopGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active chart view tabs
  const [pieMode, setPieMode] = useState('status'); // 'status' | 'categories'

  // Fetch Shops list on mount
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await api.get('/api/admin/shops');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setShops(res.data);
        } else {
          const alt = await api.get('/api/admin/menus/shops');
          if (Array.isArray(alt.data) && alt.data.length > 0) {
            setShops(alt.data);
          }
        }
      } catch (e) {
        try {
          const alt = await api.get('/api/admin/menus/shops');
          if (Array.isArray(alt.data) && alt.data.length > 0) {
            setShops(alt.data);
          }
        } catch {}
      }
    };
    fetchShops();
  }, []);

  // Fetch Dashboard & Analytics Data
  const fetchDashboardData = useCallback(async (from = fromDate, to = toDate, shopId = selectedShopId) => {
    setLoading(true);
    setError('');

    try {
      const shopParam = shopId && shopId !== 'ALL' ? `&shopId=${shopId}` : '';

      // 1. Fetch primary dashboard KPI data
      const dashPromise = api.get(
        `/api/admin/dashboard?fromDate=${from}&toDate=${to}${shopParam}`
      );

      // 2. Fetch top menu groups for the bar chart & category distribution
      const groupsPromise = api.get(
        `/api/admin/analytics/top-groups?fromDate=${from}&toDate=${to}${shopParam}`
      ).catch(() => ({ data: [] }));

      const [dashRes, groupsRes] = await Promise.all([dashPromise, groupsPromise]);

      setData(dashRes.data);
      setTopGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Unable to load dashboard data. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedShopId]);

  useEffect(() => {
    fetchDashboardData(fromDate, toDate, selectedShopId);
  }, [fetchDashboardData, fromDate, toDate, selectedShopId]);

  const handleApplyPreset = (presetKey) => {
    setActivePreset(presetKey);
    const range = getDatesForPreset(presetKey);
    setFromDate(range.from);
    setToDate(range.to);
    fetchDashboardData(range.from, range.to, selectedShopId);
  };

  const handleCustomApply = () => {
    setActivePreset('custom');
    fetchDashboardData(fromDate, toDate, selectedShopId);
  };

  const handleShopChange = (newShopId) => {
    setSelectedShopId(newShopId);
    fetchDashboardData(fromDate, toDate, newShopId);
  };

  // Selected shop display label
  const selectedShopLabel = useMemo(() => {
    if (selectedShopId === 'ALL') return 'All Shops (Combined)';
    const found = shops.find(s => String(s.shopId) === String(selectedShopId));
    return found ? `${found.shopName}${found.location ? ` - ${found.location}` : ''}` : `Shop #${selectedShopId}`;
  }, [selectedShopId, shops]);

  // Calculations for KPI percentages
  const totalOrders = useMemo(() => {
    if (!data) return 0;
    return (data.paidOrders || 0) + (data.activeOrders || 0) + (data.cancelledOrders || 0);
  }, [data]);

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
      {/* Page Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <TrendingUp size={22} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Executive Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time restaurant revenue, order distributions, and category performance.
          </p>
        </div>

        {/* Refresh & Shop Scope Pill */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 flex items-center gap-1.5">
            <Store size={14} />
            <span>Scope: <strong>{selectedShopLabel}</strong></span>
          </span>

          <button
            onClick={() => fetchDashboardData(fromDate, toDate, selectedShopId)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
          >
            <RotateCw size={14} className={loading ? 'animate-spin text-orange-600' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Control Center: Branch Selector + Date Ranges */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 border-orange-200/80 dark:border-orange-900/40 shadow-sm space-y-4">
        {/* ROW 1: SHOP / BRANCH FILTER (DEFAULT: ALL SHOPS) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 bg-orange-50/40 dark:bg-orange-950/20 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 p-4 sm:p-5 rounded-t-2xl">
          <div className="flex items-center gap-2 shrink-0">
            <span className="p-2 bg-orange-500 text-white rounded-xl shadow-xs">
              <Store size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                  Select Restaurant Branch:
                </span>
                <span className="text-[11px] font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                  {selectedShopLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedShopId === 'ALL'
                  ? 'Showing consolidated statistics across all restaurant branches.'
                  : `Filtering all revenue, orders, and category charts specifically for ${selectedShopLabel}.`}
              </p>
            </div>
          </div>

          {/* Shop Quick Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {/* DEFAULT OPTION: ALL SHOPS */}
            <button
              onClick={() => handleShopChange('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedShopId === 'ALL'
                  ? 'bg-slate-900 dark:bg-orange-600 text-white shadow-md scale-102'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs'
              }`}
            >
              <span>🏪 All Shops (Default)</span>
            </button>

            {/* Individual Branch Buttons */}
            {shops.map((shop) => {
              const isSelected = String(selectedShopId) === String(shop.shopId);
              const isClosed = shop.isActive === false;

              return (
                <button
                  key={shop.shopId}
                  onClick={() => handleShopChange(shop.shopId)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 scale-102'
                      : isClosed
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-700 shadow-2xs'
                  }`}
                >
                  <span>{shop.shopName}</span>
                  {isClosed && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold uppercase">
                      Closed
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 2: Date Presets & Custom Range */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Preset Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'today', label: 'Today' },
              { id: 'last7Days', label: 'Last 7 Days' },
              { id: 'thisMonth', label: 'This Month' },
              { id: 'last30Days', label: 'Last 30 Days' },
              { id: 'thisYear', label: 'This Year' },
              { id: 'allTime', label: 'All Time' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activePreset === preset.id
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Range Input */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
              <Calendar size={14} className="text-slate-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent focus:outline-hidden text-slate-700 dark:text-slate-200 font-medium"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent focus:outline-hidden text-slate-700 dark:text-slate-200 font-medium"
              />
            </div>
            <button
              onClick={handleCustomApply}
              className="px-3 py-2 bg-slate-800 dark:bg-orange-600 hover:bg-slate-900 dark:hover:bg-orange-700 text-white text-xs font-semibold rounded-xl transition"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchDashboardData()}
            className="underline font-semibold ml-3"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <DashboardCard
          title="Total Revenue"
          value={
            loading
              ? 'Loading...'
              : `₹${Number(data?.totalRevenue || 0).toLocaleString('en-IN')}`
          }
          subtext={`Verified Settled Revenue (${selectedShopLabel})`}
          icon={<IndianRupee size={20} />}
          gradient="from-emerald-500 to-teal-600"
          badge={{ text: 'PAID ONLY', color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-transparent dark:border-emerald-800/60' }}
        />

        <DashboardCard
          title="Paid Orders"
          value={loading ? '...' : (data?.paidOrders || 0).toLocaleString('en-IN')}
          subtext="Successfully completed"
          icon={<CheckCircle2 size={20} />}
          gradient="from-blue-500 to-indigo-600"
          badge={{ text: `${paidPercent}% Rate`, color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800/60' }}
        />

        <DashboardCard
          title="Active Orders"
          value={loading ? '...' : (data?.activeOrders || 0).toLocaleString('en-IN')}
          subtext="In kitchen or dining area"
          icon={<Clock size={20} />}
          gradient="from-amber-500 to-orange-600"
          badge={{
            text: data?.activeOrders > 0 ? 'Live Now' : 'Idle',
            color: data?.activeOrders > 0 ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-transparent dark:border-amber-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-700',
          }}
        />

        <DashboardCard
          title="Cancelled Orders"
          value={loading ? '...' : (data?.cancelledOrders || 0).toLocaleString('en-IN')}
          subtext="Voided or cancelled"
          icon={<XCircle size={20} />}
          gradient="from-rose-500 to-red-600"
          badge={{
            text: `${cancelledPercent}% Rate`,
            color: data?.cancelledOrders > 0 ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-transparent dark:border-rose-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-700',
          }}
        />
      </div>

      {/* Charts Grid: Pie Chart (Left) & Bar Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PIE / DONUT CHART CARD (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-lg">
                  <PieIcon size={18} />
                </span>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                  Distribution Breakdown
                </h2>
              </div>

              {/* Toggle Pie Mode */}
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
                ? `Visual breakdown of orders for ${selectedShopLabel}.`
                : `Share of sold quantities across top categories for ${selectedShopLabel}.`}
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

        {/* BAR CHART CARD (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-lg">
                  <BarChart3 size={18} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-white">
                    Top Menu Categories
                  </h2>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-800">
                Quantity Sold
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Highest volume menu categories for {selectedShopLabel} ({fromDate} to {toDate}).
            </p>
          </div>

          <div className="mt-4">
            <BarChart
              data={barChartData}
              valueSuffix=" pcs"
              height={260}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Categories Breakdown Table & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories Ranking Table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                <Layers size={18} />
              </span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Category Ranking &amp; Share ({selectedShopLabel})
              </h3>
            </div>
            <NavLink
              to="/admin/analytics/top-items"
              className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
            >
              Detailed Analytics →
            </NavLink>
          </div>

          {topGroups.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">
              No category sales recorded for {selectedShopLabel} in this date range.
            </p>
          ) : (
            <div className="space-y-3">
              {topGroups.slice(0, 5).map((group, idx) => {
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
                          className="bg-orange-500 h-full rounded-full transition-all duration-500"
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

        {/* Quick Management Shortcuts (5 cols) */}
        <div className="lg:col-span-5 bg-linear-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-orange-400">
              Quick Shortcuts
            </span>
            <h3 className="text-lg font-bold mt-1 text-white">
              Restaurant Operations
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Fast-track your daily administrative tasks, branch management, and order imports.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <NavLink
              to="/admin/orders"
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition flex flex-col gap-2 group"
            >
              <span className="p-2 bg-orange-500/20 text-orange-400 rounded-lg w-fit group-hover:scale-110 transition">
                <ShoppingCart size={16} />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                View Orders
              </span>
            </NavLink>

            <NavLink
              to="/admin/shops"
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition flex flex-col gap-2 group"
            >
              <span className="p-2 bg-orange-500/20 text-orange-400 rounded-lg w-fit group-hover:scale-110 transition">
                <Store size={16} />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Manage Branches
              </span>
            </NavLink>

            <NavLink
              to="/admin/import/excel"
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition flex flex-col gap-2 group"
            >
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg w-fit group-hover:scale-110 transition">
                <FileUp size={16} />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Excel Import
              </span>
            </NavLink>

            <NavLink
              to="/admin/export/excel"
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition flex flex-col gap-2 group"
            >
              <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg w-fit group-hover:scale-110 transition">
                <FileDown size={16} />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Export Reports
              </span>
            </NavLink>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Siddhu's Maharashtrian Thali</span>
            <span className="text-orange-400 font-semibold">Admin Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
