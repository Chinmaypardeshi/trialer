import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  FolderTree,
  UtensilsCrossed,
  ArrowLeft,
  Calendar,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  Layers,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Store,
} from 'lucide-react';
import api from '../api/axios';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';

const FALLBACK_SHOPS = [
  { shopId: 1, shopName: 'MAIN BRANCH', location: 'Pune' },
  { shopId: 2, shopName: 'Somwar Peth', location: 'Somwar Peth, Pune' },
  { shopId: 3, shopName: 'Market Yard', location: 'Market Yard, Pune' },
];

export default function AdminAnalytics() {
  // Level 1: Category Groups | Level 2: Items inside selected group
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Shop branch filter
  const [shops, setShops] = useState(FALLBACK_SHOPS);
  const [selectedShopId, setSelectedShopId] = useState('ALL');

  // Data states
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState(null);

  // Date filters: By default 'ALL' (All Time)
  const [datePreset, setDatePreset] = useState('ALL');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [appliedDates, setAppliedDates] = useState({ from: null, to: null });

  // Fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await api.get('/api/admin/menus/shops');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setShops(res.data);
        }
      } catch {
        // Fallback shops retained
      }
    };
    fetchShops();
  }, []);

  // Chart view preference: 'both', 'bar', 'pie'
  const [chartView, setChartView] = useState('both');
  // Bar chart layout orientation: 'vertical' or 'horizontal'
  const [barOrientation, setBarOrientation] = useState('vertical');

  // Compute preset dates
  const handlePresetChange = (presetKey) => {
    setDatePreset(presetKey);

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (presetKey === 'ALL') {
      setAppliedDates({ from: null, to: null });
      setCustomFrom('');
      setCustomTo('');
      return;
    }

    if (presetKey === 'TODAY') {
      const todayStr = fmt(now);
      setAppliedDates({ from: todayStr, to: todayStr });
      setCustomFrom(todayStr);
      setCustomTo(todayStr);
    } else if (presetKey === '7D') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      setAppliedDates({ from: fmt(past), to: fmt(now) });
      setCustomFrom(fmt(past));
      setCustomTo(fmt(now));
    } else if (presetKey === '30D') {
      const past = new Date(now);
      past.setDate(past.getDate() - 30);
      setAppliedDates({ from: fmt(past), to: fmt(now) });
      setCustomFrom(fmt(past));
      setCustomTo(fmt(now));
    } else if (presetKey === 'THIS_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setAppliedDates({ from: fmt(start), to: fmt(now) });
      setCustomFrom(fmt(start));
      setCustomTo(fmt(now));
    } else if (presetKey === 'THIS_YEAR') {
      const start = new Date(now.getFullYear(), 0, 1);
      setAppliedDates({ from: fmt(start), to: fmt(now) });
      setCustomFrom(fmt(start));
      setCustomTo(fmt(now));
    }
  };

  const handleApplyCustomDates = (e) => {
    e.preventDefault();
    if (!customFrom || !customTo) {
      alert('Please select both From and To dates.');
      return;
    }
    setDatePreset('CUSTOM');
    setAppliedDates({ from: customFrom, to: customTo });
  };

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/admin/analytics/top-groups';
      const params = [];
      if (selectedShopId && selectedShopId !== 'ALL') {
        params.push(`shopId=${selectedShopId}`);
      }
      if (appliedDates.from && appliedDates.to) {
        params.push(`fromDate=${appliedDates.from}&toDate=${appliedDates.to}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      const res = await api.get(url);
      setGroups(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load top groups:', err);
      setError('Unable to load menu categories. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, [appliedDates, selectedShopId]);

  // Fetch items for selected group
  const fetchGroupItems = useCallback(async (groupId) => {
    if (!groupId) return;
    setLoadingItems(true);
    try {
      let url = `/api/admin/analytics/top-items/${groupId}/items`;
      if (appliedDates.from && appliedDates.to) {
        url += `?fromDate=${appliedDates.from}&toDate=${appliedDates.to}`;
      }
      const res = await api.get(url);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(`Failed to load items for group ${groupId}:`, err);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, [appliedDates]);

  // Load groups on date change
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Reload group items when dates change while inside a group
  useEffect(() => {
    if (selectedGroup?.groupId) {
      fetchGroupItems(selectedGroup.groupId);
    }
  }, [selectedGroup, fetchGroupItems]);

  const scrollToTop = () => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Selection handlers
  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    fetchGroupItems(group.groupId);
    scrollToTop();
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setItems([]);
    scrollToTop();
  };

  // Aggregations
  const totalCategoryVolume = useMemo(() => {
    return groups.reduce((acc, g) => acc + (Number(g.totalQuantity) || 0), 0);
  }, [groups]);

  const topCategory = useMemo(() => {
    if (!groups || groups.length === 0) return null;
    return [...groups].sort((a, b) => (Number(b.totalQuantity) || 0) - (Number(a.totalQuantity) || 0))[0];
  }, [groups]);

  const totalGroupItemVolume = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.totalQuantity) || 0), 0);
  }, [items]);

  const topItemInGroup = useMemo(() => {
    if (!items || items.length === 0) return null;
    return [...items].sort((a, b) => (Number(b.totalQuantity) || 0) - (Number(a.totalQuantity) || 0))[0];
  }, [items]);

  // Chart data formatting
  const groupsChartData = useMemo(() => {
    // Count occurrences of each group name to detect duplicate group names across branches
    const nameCounts = {};
    groups.forEach((g) => {
      const name = g.groupName || `Group #${g.groupId}`;
      nameCounts[name] = (nameCounts[name] || 0) + 1;
    });

    return groups.map((g) => {
      const baseName = g.groupName || `Group #${g.groupId}`;
      let label = baseName;
      if (selectedShopId === 'ALL') {
        if (g.shopName) {
          label = `${baseName} (${g.shopName})`;
        } else if (nameCounts[baseName] > 1) {
          label = `${baseName} (Branch #${g.shopId || g.groupId})`;
        }
      }
      return {
        id: g.groupId,
        label,
        value: Number(g.totalQuantity) || 0,
        groupObj: g,
      };
    });
  }, [groups, selectedShopId]);

  const itemsChartData = useMemo(() => {
    return items.map((item) => ({
      id: item.itemId,
      label: item.itemName || `Item #${item.itemId}`,
      value: Number(item.totalQuantity) || 0,
      itemObj: item,
    }));
  }, [items]);

  // Handlers for chart click drill-down
  const handleChartBarClick = (chartItem) => {
    if (!selectedGroup) {
      const match = groups.find((g) => g.groupId === chartItem.id);
      if (match) handleSelectGroup(match);
    }
  };

  const handleChartSliceClick = (slice) => {
    if (!selectedGroup) {
      const match = groups.find((g) => g.groupId === slice.id);
      if (match) handleSelectGroup(match);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <BarChart3 size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {selectedGroup ? (
                  <span className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleBackToGroups}
                      className="text-slate-500 hover:text-orange-600 transition flex items-center gap-1 font-semibold"
                    >
                      Categories <ChevronRight size={18} />
                    </button>
                    <span className="text-orange-600">{selectedGroup.groupName}</span>
                  </span>
                ) : (
                  'Menu & Category Analytics'
                )}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {selectedGroup
                  ? `Detailed breakdown of items sold inside "${selectedGroup.groupName}"`
                  : 'Track category demand, discover top-selling groups, and drill down into items'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls / Back Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedGroup && (
            <button
              onClick={handleBackToGroups}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <ArrowLeft size={16} /> Back to All Categories
            </button>
          )}

          <button
            onClick={() => {
              if (selectedGroup) fetchGroupItems(selectedGroup.groupId);
              fetchGroups();
            }}
            className="p-2.5 text-slate-600 hover:text-orange-600 bg-white hover:bg-orange-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 shadow-xs"
            title="Refresh Data"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Branch / Shop Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Store size={16} className="text-orange-500" />
            <span>Select Restaurant Branch:</span>
            {selectedShopId === 'ALL' ? (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold">
                All Branches Combined
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md text-[11px] font-bold">
                {shops.find((s) => Number(s.shopId) === Number(selectedShopId))?.shopName || `Shop #${selectedShopId}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => {
                setSelectedShopId('ALL');
                if (selectedGroup) handleBackToGroups();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedShopId === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>🏢 All Branches</span>
            </button>
            {shops.map((shop) => (
              <button
                key={shop.shopId}
                onClick={() => {
                  setSelectedShopId(shop.shopId);
                  if (selectedGroup) handleBackToGroups();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                  Number(selectedShopId) === Number(shop.shopId)
                    ? 'bg-orange-500 text-white shadow-xs font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{shop.shopName}</span>
                <span className="text-[10px] opacity-75 font-normal">(#{shop.shopId})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Calendar size={16} className="text-orange-500" />
            <span>Time Range Filter:</span>
            {appliedDates.from && appliedDates.to ? (
              <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[11px] font-bold">
                {appliedDates.from} to {appliedDates.to}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold flex items-center gap-1">
                <Sparkles size={12} /> All Time (Complete History)
              </span>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Time' },
              { id: 'TODAY', label: 'Today' },
              { id: '7D', label: 'Last 7 Days' },
              { id: '30D', label: 'Last 30 Days' },
              { id: 'THIS_MONTH', label: 'This Month' },
              { id: 'THIS_YEAR', label: 'This Year' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  datePreset === preset.id
                    ? 'bg-orange-500 text-white shadow-xs font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Range Picker */}
        <form
          onSubmit={handleApplyCustomDates}
          className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 sm:gap-3 text-xs"
        >
          <span className="text-slate-500 font-medium">Custom Range:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">From</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-slate-800"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">To</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-slate-800"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold shadow-xs transition"
          >
            Apply Range
          </button>

          {(appliedDates.from || appliedDates.to) && (
            <button
              type="button"
              onClick={() => handlePresetChange('ALL')}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition flex items-center gap-1 ml-auto"
            >
              <RotateCcw size={13} /> Reset to All Time
            </button>
          )}
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={20} className="shrink-0" />
          <div className="flex-1 font-medium">{error}</div>
          <button
            onClick={fetchGroups}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {selectedGroup ? (
          // KPI cards for Level 2 (Selected Group)
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Selected Category</span>
                <FolderTree size={18} className="text-orange-500" />
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900 truncate">
                {selectedGroup.groupName}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Category ID #{selectedGroup.groupId}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Total Items Sold</span>
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {totalGroupItemVolume.toLocaleString('en-IN')}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {totalCategoryVolume > 0
                  ? `${((totalGroupItemVolume / totalCategoryVolume) * 100).toFixed(1)}% of restaurant volume`
                  : 'Units ordered'}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Top Selling Item</span>
                <Sparkles size={18} className="text-amber-500" />
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900 truncate">
                {topItemInGroup ? topItemInGroup.itemName : 'N/A'}
              </div>
              <div className="mt-1 text-[11px] text-amber-600 font-semibold">
                {topItemInGroup
                  ? `${Number(topItemInGroup.totalQuantity).toLocaleString('en-IN')} units sold`
                  : 'No orders recorded'}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Distinct Items Tracked</span>
                <UtensilsCrossed size={18} className="text-indigo-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {items.length}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Active menu items with sales
              </div>
            </div>
          </>
        ) : (
          // KPI cards for Level 1 (All Groups)
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Total Items Ordered</span>
                <TrendingUp size={18} className="text-orange-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {totalCategoryVolume.toLocaleString('en-IN')}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Across all menu categories
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>#1 Most Popular Category</span>
                <Sparkles size={18} className="text-amber-500" />
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900 truncate">
                {topCategory ? topCategory.groupName : 'N/A'}
              </div>
              <div className="mt-1 text-[11px] text-amber-600 font-semibold">
                {topCategory
                  ? `${Number(topCategory.totalQuantity).toLocaleString('en-IN')} items (${
                      totalCategoryVolume > 0
                        ? ((Number(topCategory.totalQuantity) / totalCategoryVolume) * 100).toFixed(1)
                        : 0
                    }%)`
                  : 'No sales recorded'}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Active Menu Groups</span>
                <Layers size={18} className="text-emerald-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {groups.length}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Categories generating orders
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Drilldown Status</span>
                <HelpCircle size={18} className="text-indigo-500" />
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-800">
                Click any Category
              </div>
              <div className="mt-1 text-[11px] text-indigo-600 font-medium">
                To inspect its item sales
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Charts Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {selectedGroup ? (
                <>
                  <UtensilsCrossed size={18} className="text-orange-500 shrink-0" />
                  <span>Menu Items Sold in &ldquo;{selectedGroup.groupName}&rdquo;</span>
                  <button
                    onClick={handleBackToGroups}
                    className="ml-2 px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition"
                  >
                    <ArrowLeft size={13} /> All Categories
                  </button>
                </>
              ) : (
                <>
                  <FolderTree size={18} className="text-orange-500" />
                  Category Usage & Popularity
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedGroup
                ? 'Compares quantities sold for each menu item in this category'
                : 'Interactive chart of menu categories. Click on any bar or pie slice to drill down into its menu items.'}
            </p>
          </div>

          {/* Chart View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setChartView('both')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                chartView === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dual View
            </button>
            <button
              onClick={() => setChartView('bar')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                chartView === 'bar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bar Only
            </button>
            <button
              onClick={() => setChartView('pie')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                chartView === 'pie' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Donut Only
            </button>
          </div>
        </div>

        {/* Chart Content Area */}
        {loading || (selectedGroup && loadingItems) ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-600">
              {selectedGroup ? 'Loading item analytics...' : 'Loading category analytics...'}
            </p>
          </div>
        ) : (selectedGroup ? items.length === 0 : groups.length === 0) ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl">
              📊
            </div>
            <p className="text-sm font-semibold text-slate-700">No sales data found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {appliedDates.from && appliedDates.to
                ? 'No paid orders were recorded in this custom date range. Try switching to "All Time".'
                : 'There are currently no paid orders in the system.'}
            </p>
            {(appliedDates.from || appliedDates.to) && (
              <button
                onClick={() => handlePresetChange('ALL')}
                className="mt-4 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Switch to All Time
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <div
              className={`grid gap-8 items-start ${
                chartView === 'both' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
              }`}
            >
              {/* Bar Chart Column */}
              {(chartView === 'both' || chartView === 'bar') && (
                <div className={chartView === 'both' ? 'lg:col-span-7' : 'w-full'}>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {selectedGroup ? 'Volume Sold by Item' : 'Volume Sold by Category'}
                      </span>
                      {!selectedGroup && (
                        <span className="text-[11px] text-orange-600 font-semibold hidden sm:inline">
                          (Click bar to inspect)
                        </span>
                      )}
                    </div>

                    {/* Orientation Toggle */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                      <button
                        onClick={() => setBarOrientation('vertical')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition ${
                          barOrientation === 'vertical'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Vertical Column View"
                      >
                        Columns
                      </button>
                      <button
                        onClick={() => setBarOrientation('horizontal')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition ${
                          barOrientation === 'horizontal'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Horizontal Row View"
                      >
                        Rows
                      </button>
                    </div>
                  </div>
                  <BarChart
                    data={selectedGroup ? itemsChartData : groupsChartData}
                    height={280}
                    valueSuffix=" units"
                    orientation={barOrientation}
                    onBarClick={selectedGroup ? null : handleChartBarClick}
                  />
                </div>
              )}

              {/* Pie / Donut Chart Column */}
              {(chartView === 'both' || chartView === 'pie') && (
                <div
                  className={`bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 ${
                    chartView === 'both' ? 'lg:col-span-5' : 'w-full max-w-md mx-auto'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {selectedGroup ? 'Category Share %' : 'Overall Volume Share %'}
                    </span>
                    {!selectedGroup && (
                      <span className="text-[10px] text-slate-400">Click slice to open</span>
                    )}
                  </div>
                  <PieChart
                    data={selectedGroup ? itemsChartData : groupsChartData}
                    centerLabel={selectedGroup ? 'Group Total' : 'Total Orders'}
                    centerValue={
                      selectedGroup
                        ? `${totalGroupItemVolume.toLocaleString('en-IN')}`
                        : `${totalCategoryVolume.toLocaleString('en-IN')}`
                    }
                    onSliceClick={selectedGroup ? null : handleChartSliceClick}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Drill-down / Detailed Table View */}
      {selectedGroup ? (
        // LEVEL 2: Items inside selected group
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-orange-50/50 to-white dark:from-slate-850 dark:to-slate-900">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-orange-600 dark:text-orange-400" />
                Items Inside &ldquo;{selectedGroup.groupName}&rdquo; Ranked by Popularity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Showing all menu items sold under this category, ordered from highest to lowest volume
              </p>
            </div>
            <button
              onClick={handleBackToGroups}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto shadow-xs"
            >
              <ArrowLeft size={14} /> Back to Categories
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
              No items recorded for this category in the selected time range.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-16">Rank</th>
                    <th className="py-3 px-4">Menu Item Name</th>
                    <th className="py-3 px-4 text-right">Units Sold</th>
                    <th className="py-3 px-4 text-right">Share of Category</th>
                    <th className="py-3 px-4 w-44">Popularity Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                  {items.map((item, idx) => {
                    const qty = Number(item.totalQuantity) || 0;
                    const pct =
                      totalGroupItemVolume > 0
                        ? ((qty / totalGroupItemVolume) * 100).toFixed(1)
                        : 0;
                    const isTop1 = idx === 0;

                    return (
                      <tr
                        key={item.itemId || idx}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                          isTop1 ? 'bg-orange-50/20 dark:bg-orange-950/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold">
                          {isTop1 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white inline-flex items-center justify-center text-xs shadow-xs">
                              1
                            </span>
                          ) : idx === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 inline-flex items-center justify-center text-xs">
                              2
                            </span>
                          ) : idx === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-700/60 text-white inline-flex items-center justify-center text-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-xs pl-2">#{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{item.itemName}</span>
                            {isTop1 && (
                              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-full">
                                Best Seller 🏆
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                            Item ID #{item.itemId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                          {qty.toLocaleString('en-IN')}{' '}
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">orders</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                          {pct}%
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${
                                isTop1 ? 'bg-orange-500' : 'bg-slate-500'
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // LEVEL 1: All Menu Groups (Interactive Cards & Table)
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderTree size={18} className="text-orange-600 dark:text-orange-400" />
                Menu Categories Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Click any category row or card to inspect the individual menu items and see what sells most
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              {groups.length} Categories Total
            </span>
          </div>

          {groups.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
              No menu categories found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {groups.map((group, idx) => {
                const qty = Number(group.totalQuantity) || 0;
                const pct =
                  totalCategoryVolume > 0
                    ? ((qty / totalCategoryVolume) * 100).toFixed(1)
                    : 0;
                const isTop1 = idx === 0;

                return (
                  <div
                    key={group.groupId || idx}
                    onClick={() => handleSelectGroup(group)}
                    className="p-4 sm:p-5 hover:bg-orange-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    {/* Left: Rank & Group info */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-500 group-hover:text-white transition flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                            {group.groupName}
                          </h4>
                          {isTop1 && (
                            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-[10px] font-bold rounded-full">
                              Top Category
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Group ID #{group.groupId} • Click to drill down into items
                        </p>
                      </div>
                    </div>

                    {/* Right: Quantity, progress bar & Action arrow */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                      <div className="flex-1 max-w-xs hidden md:block">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          <span>Volume Share</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {qty.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          units ordered ({pct}%)
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-600 group-hover:text-white text-slate-400 flex items-center justify-center transition shrink-0">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
