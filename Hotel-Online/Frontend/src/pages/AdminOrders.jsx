import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  FileUp,
  Download,
  Eye,
  Calendar,
  Search,
  ArrowUpDown,
  RotateCw,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import api from '../api/axios';

export default function AdminOrders() {
  const navigate = useNavigate();

  // 1. Status Category: 'ACTIVE' (DEFAULT as requested), 'ALL', 'PAID', 'CANCELLED'
  const [selectedCategory, setSelectedCategory] = useState('ACTIVE');

  // Orders data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    ACTIVE: 0,
    PAID: 0,
    CANCELLED: 0,
    ALL: 0,
  });

  // Date filtering
  const [datePreset, setDatePreset] = useState('ALL'); // 'ALL', 'TODAY', 'YESTERDAY', 'THIS_WEEK', 'THIS_MONTH', 'CUSTOM'
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Sorting: 'DESC' (newest first) or 'ASC' (oldest first)
  const [sortOrder, setSortOrder] = useState('DESC');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination (Server-Side with fallback)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Fetch Category Counts from dashboard API (runs once)
  const fetchCounts = async () => {
    try {
      const res = await api.get(
        '/api/admin/dashboard?fromDate=2025-01-01&toDate=2026-12-31'
      );
      if (res.data) {
        const paid = Number(res.data.paidOrders) || 0;
        const active = Number(res.data.activeOrders) || 0;
        const cancelled = Number(res.data.cancelledOrders) || 0;
        setCounts({
          ACTIVE: active,
          PAID: paid,
          CANCELLED: cancelled,
          ALL: paid + active + cancelled,
        });
      }
    } catch (err) {
      console.warn('Failed to fetch order counts:', err);
    }
  };

  // Fetch orders from server with paging & date filters
  const fetchOrders = useCallback(
    async (
      category = selectedCategory,
      page = currentPage,
      size = pageSize,
      sortDir = sortOrder,
      from = fromDate,
      to = toDate
    ) => {
      setLoading(true);
      try {
        const params = {
          page: page - 1, // Spring Boot is 0-indexed
          size: size,
          sortDirection: sortDir,
        };

        if (category && category !== 'ALL') {
          params.status = category;
        }

        if (from && to) {
          params.fromDate = from;
          params.toDate = to;
        }

        const res = await api.get('/api/admin/orders', { params });

        // Handle server-side Page response (AdminOrderPageDTO)
        if (res.data && Array.isArray(res.data.content)) {
          setOrders(res.data.content);
          setTotalElements(res.data.totalElements || 0);
          setTotalPages(Math.max(res.data.totalPages, 1));
          setCurrentPage(res.data.currentPage + 1);
        } else if (Array.isArray(res.data)) {
          // Fallback if backend returned plain array
          setOrders(res.data);
          setTotalElements(res.data.length);
          setTotalPages(Math.max(Math.ceil(res.data.length / size), 1));
        } else {
          setOrders([]);
          setTotalElements(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setOrders([]);
        setTotalElements(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory, currentPage, pageSize, sortOrder, fromDate, toDate]
  );

  // Initial load: Fetch counts and default to ACTIVE orders
  useEffect(() => {
    fetchCounts();
    fetchOrders('ACTIVE', 1, pageSize, sortOrder, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle category tab change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchOrders(category, 1, pageSize, sortOrder, fromDate, toDate);
  };

  // Handle Page Size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    fetchOrders(selectedCategory, 1, newSize, sortOrder, fromDate, toDate);
  };

  // Handle Sort Order change
  const handleSortToggle = () => {
    const newSort = sortOrder === 'DESC' ? 'ASC' : 'DESC';
    setSortOrder(newSort);
    fetchOrders(selectedCategory, currentPage, pageSize, newSort, fromDate, toDate);
  };

  // Handle Page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchOrders(selectedCategory, newPage, pageSize, sortOrder, fromDate, toDate);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Jump to specific page
  const handleJumpPage = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      handlePageChange(p);
      setJumpPageInput('');
    }
  };

  // Date Presets Handler
  const handleDatePresetChange = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let newFrom = '';
    let newTo = '';

    switch (preset) {
      case 'TODAY':
        newFrom = todayStr;
        newTo = todayStr;
        break;
      case 'YESTERDAY': {
        const y = new Date();
        y.setDate(today.getDate() - 1);
        const yStr = y.toISOString().split('T')[0];
        newFrom = yStr;
        newTo = yStr;
        break;
      }
      case 'THIS_WEEK': {
        const past = new Date();
        past.setDate(today.getDate() - 6);
        newFrom = past.toISOString().split('T')[0];
        newTo = todayStr;
        break;
      }
      case 'THIS_MONTH': {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        newFrom = firstDay.toISOString().split('T')[0];
        newTo = todayStr;
        break;
      }
      case 'ALL':
      default:
        newFrom = '';
        newTo = '';
        break;
    }

    setFromDate(newFrom);
    setToDate(newTo);
    setCurrentPage(1);
    fetchOrders(selectedCategory, 1, pageSize, sortOrder, newFrom, newTo);
  };

  const handleApplyCustomDates = () => {
    if (fromDate && toDate) {
      setDatePreset('CUSTOM');
      setCurrentPage(1);
      fetchOrders(selectedCategory, 1, pageSize, sortOrder, fromDate, toDate);
    }
  };

  // Client-side search within the current page of orders
  const displayedOrders = useMemo(() => {
    if (!searchTerm.trim()) {
      return orders;
    }
    const q = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const idMatch = order.orderId?.toString().includes(q);
      const shopMatch = order.shopName?.toLowerCase().includes(q);
      const payMatch = order.paymentMode?.toLowerCase().includes(q);
      const amountMatch = order.totalAmount?.toString().includes(q);
      const statusMatch = order.status?.toLowerCase().includes(q);
      return idMatch || shopMatch || payMatch || amountMatch || statusMatch;
    });
  }, [orders, searchTerm]);

  // Page batch range calculation
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalElements);

  // Total amount in the visible batch
  const batchTotalRevenue = useMemo(() => {
    return displayedOrders.reduce(
      (sum, o) => sum + (parseFloat(o.totalAmount) || 0),
      0
    );
  }, [displayedOrders]);

  // Helper for Status Badge Styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      case 'ACTIVE':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
      case 'CANCELLED':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  // Format Date and Time
  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 sm:p-2">
      {/* Top Bar with Title & Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <ShoppingCart size={22} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Orders Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Server-side paginated orders, live active floor tracking, and customer transaction logs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              fetchCounts();
              fetchOrders(selectedCategory, currentPage, pageSize, sortOrder, fromDate, toDate);
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm disabled:opacity-50"
          >
            <RotateCw size={14} className={loading ? 'animate-spin text-orange-600' : ''} />
            Refresh
          </button>

          <button
            onClick={() => navigate('/admin/import/excel')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-orange-500 text-orange-600 dark:text-orange-400 font-semibold hover:bg-orange-50 dark:hover:bg-orange-950/40 transition shadow-xs text-xs"
          >
            <FileUp size={15} />
            Import Excel
          </button>

          <button
            onClick={() => navigate('/admin/export/excel')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold transition shadow-xs text-xs"
          >
            <Download size={15} />
            Export Reports
          </button>
        </div>
      </div>

      {/* 4 Category Tabs (ACTIVE is default) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-none">
        {[
          {
            id: 'ACTIVE',
            label: 'Active Orders',
            icon: <Clock size={16} />,
            activeBg: 'bg-blue-600 text-white shadow-sm',
            count: counts.ACTIVE,
            badgeBg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300',
          },
          {
            id: 'ALL',
            label: 'All Orders',
            icon: <Layers size={16} />,
            activeBg: 'bg-slate-800 dark:bg-orange-600 text-white shadow-sm',
            count: counts.ALL,
            badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
          },
          {
            id: 'PAID',
            label: 'Paid Orders',
            icon: <CheckCircle2 size={16} />,
            activeBg: 'bg-emerald-600 text-white shadow-sm',
            count: counts.PAID,
            badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
          },
          {
            id: 'CANCELLED',
            label: 'Cancelled Orders',
            icon: <XCircle size={16} />,
            activeBg: 'bg-rose-600 text-white shadow-sm',
            count: counts.CANCELLED,
            badgeBg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300',
          },
        ].map((tab) => {
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleCategoryChange(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? tab.activeBg
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isSelected ? 'bg-white/20 text-white' : tab.badgeBg
                }`}
              >
                {tab.count.toLocaleString('en-IN')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Date & Search Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Top Filter Row: Search & Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Filter by Order ID, Shop, Amount, Payment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          {/* Sort & Batch Size Controls */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {/* Sort Toggle */}
            <button
              onClick={handleSortToggle}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
              title="Toggle date sort direction"
            >
              <ArrowUpDown size={14} className="text-orange-500" />
              <span>{sortOrder === 'DESC' ? 'Newest First' : 'Oldest First'}</span>
            </button>

            {/* Batch / Page Size */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
              <span className="font-medium text-slate-400">Batch:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="bg-transparent font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value={10} className="dark:bg-slate-800 dark:text-white">10 / page</option>
                <option value={25} className="dark:bg-slate-800 dark:text-white">25 / page</option>
                <option value={50} className="dark:bg-slate-800 dark:text-white">50 / page</option>
                <option value={100} className="dark:bg-slate-800 dark:text-white">100 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Filter Row: Date Presets & Custom Date Pickers */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Date Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Date:
            </span>
            {[
              { id: 'ALL', label: 'All Dates' },
              { id: 'TODAY', label: 'Today' },
              { id: 'YESTERDAY', label: 'Yesterday' },
              { id: 'THIS_WEEK', label: 'This Week' },
              { id: 'THIS_MONTH', label: 'This Month' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleDatePresetChange(p.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  datePreset === p.id
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs">
              <Calendar size={13} className="text-slate-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none"
              />
            </div>

            <button
              onClick={handleApplyCustomDates}
              className="px-2.5 py-1 bg-slate-800 dark:bg-orange-600 hover:bg-slate-900 dark:hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Filter
            </button>

            {(fromDate || toDate) && (
              <button
                onClick={() => handleDatePresetChange('ALL')}
                className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 font-semibold px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing{' '}
          <strong className="text-slate-800 dark:text-white font-bold">
            {totalElements > 0 ? startIndex + 1 : 0}–{endIndex}
          </strong>{' '}
          of{' '}
          <strong className="text-slate-800 dark:text-white font-bold">
            {totalElements.toLocaleString('en-IN')}
          </strong>{' '}
          total orders in{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300 lowercase">
            {selectedCategory === 'ALL' ? 'all' : selectedCategory}
          </span>{' '}
          category
        </div>

        <div className="flex items-center gap-3">
          <span>
            Batch Value:{' '}
            <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
              ₹{batchTotalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </strong>
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span>
            Page <strong className="text-slate-800 dark:text-white">{currentPage}</strong> of{' '}
            <strong className="text-slate-800 dark:text-white">{totalPages}</strong>
          </span>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            <p className="text-xs font-medium">Loading orders from server...</p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <ShoppingCart size={28} />
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white">
              {selectedCategory === 'ACTIVE'
                ? 'No active orders in progress'
                : 'No matching orders found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {selectedCategory === 'ACTIVE'
                ? 'All customer orders are currently settled and completed. Choose "All Orders" to inspect past transactions.'
                : 'Try adjusting your search query, status tab, or date filters to view more records.'}
            </p>

            {selectedCategory === 'ACTIVE' && counts.ALL > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => handleCategoryChange('ALL')}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                >
                  View All Orders ({counts.ALL.toLocaleString('en-IN')})
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* MOBILE VIEW (< md): Touch-Friendly Order Cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {displayedOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        #{order.orderId}
                      </span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {order.shopName || 'Branch'}
                      </span>
                    </div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="text-slate-500 dark:text-slate-400">
                      <span>{formatDateTime(order.orderTime)}</span>
                      <span className="mx-1.5">•</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                        {order.paymentMode || 'CASH'}
                      </span>
                    </div>
                    <div className="font-extrabold text-base text-slate-900 dark:text-white">
                      ₹{Number(order.totalAmount || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                      className="w-full py-2 text-xs font-bold rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* TABLET & DESKTOP VIEW (>= md): Full Data Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Shop / Branch</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Order Date &amp; Time</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedOrders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition group"
                    >
                      {/* Order ID */}
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        <span className="text-slate-400 font-normal">#</span>
                        {order.orderId}
                      </td>

                      {/* Shop */}
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        {order.shopName || '—'}
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Payment Mode */}
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs">
                          {order.paymentMode || 'N/A'}
                        </span>
                      </td>

                      {/* Date Time */}
                      <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">
                        {formatDateTime(order.orderTime)}
                      </td>

                      {/* Action: View Details */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 transition cursor-pointer"
                        >
                          <Eye size={13} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Footer */}
        {totalElements > 0 && (
          <div className="p-4 bg-slate-50/70 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            {/* Left: Summary */}
            <div className="text-slate-500 dark:text-slate-400">
              Showing <strong className="text-slate-800 dark:text-white">{startIndex + 1}</strong> to{' '}
              <strong className="text-slate-800 dark:text-white">{endIndex}</strong> of{' '}
              <strong className="text-slate-800 dark:text-white">{totalElements.toLocaleString('en-IN')}</strong>{' '}
              orders
            </div>

            {/* Middle: Page Controls */}
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft size={15} />
              </button>

              {/* Previous */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition font-medium cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              {/* Page Number Chips */}
              <div className="flex items-center gap-1 px-1">
                {(() => {
                  const pages = [];
                  const maxButtons = 5;
                  let start = Math.max(1, currentPage - 2);
                  let end = Math.min(totalPages, start + maxButtons - 1);

                  if (end - start + 1 < maxButtons) {
                    start = Math.max(1, end - maxButtons + 1);
                  }

                  if (start > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition cursor-pointer"
                      >
                        1
                      </button>
                    );
                    if (start > 2) {
                      pages.push(
                        <span key="dots-start" className="text-slate-400 px-0.5">
                          …
                        </span>
                      );
                    }
                  }

                  for (let p = start; p <= end; p++) {
                    const isActive = p === currentPage;
                    pages.push(
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-7 h-7 rounded-lg font-bold transition cursor-pointer ${
                          isActive
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }

                  if (end < totalPages) {
                    if (end < totalPages - 1) {
                      pages.push(
                        <span key="dots-end" className="text-slate-400 px-0.5">
                          …
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition cursor-pointer"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}
              </div>

              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition font-medium cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight size={15} />
              </button>
            </div>

            {/* Right: Quick Jump */}
            <form onSubmit={handleJumpPage} className="flex items-center gap-1.5">
              <span className="text-slate-400">Go to:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                placeholder={currentPage.toString()}
                className="w-12 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-slate-800 dark:bg-orange-600 hover:bg-slate-900 dark:hover:bg-orange-700 text-white font-medium rounded-lg transition cursor-pointer"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
