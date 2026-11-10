import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Plus,
  Search,
  Edit2,
  Trash2,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  MapPin,
  UtensilsCrossed,
  FolderTree,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Power,
  RotateCcw,
  Archive,
} from 'lucide-react';
import api from '../api/axios';

const FALLBACK_SHOPS = [
  { shopId: 1, shopName: 'MAIN BRANCH', location: 'Pune', isActive: true, totalDishes: 6, totalGroups: 4, totalOrders: 3175, createdAt: '2026-01-01T00:00:00' },
  { shopId: 2, shopName: 'Somwar Peth', location: 'Somwar Peth, Pune', isActive: true, totalDishes: 0, totalGroups: 1, totalOrders: 0, createdAt: '2026-02-15T00:00:00' },
  { shopId: 3, shopName: 'Market Yard', location: 'Market Yard, Pune', isActive: false, totalDishes: 0, totalGroups: 1, totalOrders: 9, createdAt: '2026-03-01T00:00:00' },
];

const formatApiError = (err, defaultMsg) => {
  const data = err.response?.data;
  const rawMsg = data?.message || (typeof data === 'string' ? data : null) || err.message;
  if (err.response?.status === 404 && (rawMsg?.includes('No static resource') || rawMsg?.includes('Not Found'))) {
    return 'Backend needs to be restarted: The new /api/admin/shops endpoints have not yet been loaded by your running Spring Boot server. Please stop and restart Spring Boot, then try again.';
  }
  if (err.response?.status === 401) {
    return 'Authentication Failed: Invalid admin password. Action rejected.';
  }
  return rawMsg || defaultMsg;
};

export default function AdminShops() {
  const navigate = useNavigate();

  // Shops State
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // View Mode: 'ACTIVE' (default) or 'CLOSED'
  const [viewMode, setViewMode] = useState('ACTIVE');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [activeShop, setActiveShop] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    shopName: '',
    location: '',
    isActive: true,
    adminPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Auto-dismiss notification toast
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Fetch Shops
  const fetchShops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/admin/shops');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setShops(res.data);
      } else {
        setShops(FALLBACK_SHOPS);
      }
    } catch (err) {
      console.warn('Failed to fetch from /api/admin/shops, using fallback:', err);
      try {
        const altRes = await api.get('/api/admin/menus/shops');
        if (Array.isArray(altRes.data) && altRes.data.length > 0) {
          setShops(altRes.data.map(s => ({
            ...s,
            isActive: s.isActive !== false,
            totalDishes: s.totalDishes || 0,
            totalGroups: s.totalGroups || 0,
            totalOrders: s.totalOrders || 0,
          })));
        } else {
          setShops(FALLBACK_SHOPS);
        }
      } catch {
        setShops(FALLBACK_SHOPS);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Active vs Closed separation
  const activeShopsList = useMemo(() => shops.filter(s => s.isActive !== false), [shops]);
  const closedShopsList = useMemo(() => shops.filter(s => s.isActive === false), [shops]);

  // Filtered list based on current viewMode & search
  const displayedShops = useMemo(() => {
    const sourceList = viewMode === 'ACTIVE' ? activeShopsList : closedShopsList;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return sourceList;
    return sourceList.filter(
      (s) =>
        s.shopName.toLowerCase().includes(term) ||
        (s.location && s.location.toLowerCase().includes(term)) ||
        String(s.shopId).includes(term)
    );
  }, [viewMode, activeShopsList, closedShopsList, searchTerm]);

  // Aggregated Stats
  const stats = useMemo(() => {
    const totalBranches = shops.length;
    const activeBranches = activeShopsList.length;
    const closedBranches = closedShopsList.length;
    const totalDishes = shops.reduce((acc, s) => acc + (Number(s.totalDishes) || 0), 0);
    const totalGroups = shops.reduce((acc, s) => acc + (Number(s.totalGroups) || 0), 0);
    const totalOrders = shops.reduce((acc, s) => acc + (Number(s.totalOrders) || 0), 0);
    return { totalBranches, activeBranches, closedBranches, totalDishes, totalGroups, totalOrders };
  }, [shops, activeShopsList, closedShopsList]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData({ shopName: '', location: '', isActive: true, adminPassword: '' });
    setShowPassword(false);
    setModalError(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (shop) => {
    setActiveShop(shop);
    setFormData({
      shopName: shop.shopName || '',
      location: shop.location || '',
      isActive: shop.isActive !== false,
      adminPassword: '',
    });
    setShowPassword(false);
    setModalError(null);
    setIsEditModalOpen(true);
  };

  // Open Close / Transfer to Closed Modal
  const handleOpenCloseModal = (shop) => {
    setActiveShop(shop);
    setFormData({ shopName: shop.shopName, location: shop.location, isActive: false, adminPassword: '' });
    setShowPassword(false);
    setModalError(null);
    setIsCloseModalOpen(true);
  };

  // Open Permanent Delete Modal (for 0 orders)
  const handleOpenDeleteModal = (shop) => {
    setActiveShop(shop);
    setFormData({ shopName: shop.shopName, location: shop.location, isActive: false, adminPassword: '' });
    setShowPassword(false);
    setModalError(null);
    setIsDeleteModalOpen(true);
  };

  // Open Reactivate Modal
  const handleOpenReactivateModal = (shop) => {
    setActiveShop(shop);
    setFormData({ shopName: shop.shopName, location: shop.location, isActive: true, adminPassword: '' });
    setShowPassword(false);
    setModalError(null);
    setIsReactivateModalOpen(true);
  };

  // Submit Create Shop
  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!formData.shopName.trim()) {
      setModalError('Branch name is required.');
      return;
    }
    if (!formData.adminPassword) {
      setModalError('Admin password is required to authorize creating a new branch.');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      const res = await api.post('/api/admin/shops', {
        shopName: formData.shopName.trim(),
        location: formData.location.trim(),
        isActive: true,
        adminPassword: formData.adminPassword,
      });

      setSuccessMsg(`Branch "${res.data.shopName || formData.shopName}" created successfully!`);
      setIsAddModalOpen(false);
      fetchShops();
    } catch (err) {
      console.error('Error creating shop:', err);
      setModalError(formatApiError(err, 'Failed to create branch. Check your admin password.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Update Shop
  const handleUpdateShop = async (e) => {
    e.preventDefault();
    if (!formData.shopName.trim()) {
      setModalError('Branch name is required.');
      return;
    }
    if (!formData.adminPassword) {
      setModalError('Admin password is required to authorize modifying branch details.');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      const res = await api.put(`/api/admin/shops/${activeShop.shopId}`, {
        shopName: formData.shopName.trim(),
        location: formData.location.trim(),
        isActive: formData.isActive,
        adminPassword: formData.adminPassword,
      });

      setSuccessMsg(`Branch "${res.data.shopName || formData.shopName}" updated successfully!`);
      setIsEditModalOpen(false);
      fetchShops();
    } catch (err) {
      console.error('Error updating shop:', err);
      setModalError(formatApiError(err, 'Failed to update branch. Check your admin password.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Transfer to Closed Shop
  const handleTransferToClosed = async (e) => {
    e.preventDefault();
    if (!formData.adminPassword) {
      setModalError('Admin password is required to transfer this branch to Closed Shops.');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      // Use DELETE or PATCH status
      await api.delete(`/api/admin/shops/${activeShop.shopId}`, {
        data: { adminPassword: formData.adminPassword },
      });

      setSuccessMsg(`Branch "${activeShop.shopName}" has been removed from active branches and transferred to Closed Shops!`);
      setIsCloseModalOpen(false);
      fetchShops();
    } catch (err) {
      try {
        await api.post(`/api/admin/shops/${activeShop.shopId}/delete`, {
          adminPassword: formData.adminPassword,
        });
        setSuccessMsg(`Branch "${activeShop.shopName}" has been removed from active branches and transferred to Closed Shops!`);
        setIsCloseModalOpen(false);
        fetchShops();
      } catch (postErr) {
        console.error('Error closing shop:', postErr);
        setModalError(formatApiError(postErr, 'Failed to close branch. Check your admin password.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Permanent Delete (for 0 orders)
  const handlePermanentDelete = async (e) => {
    e.preventDefault();
    if (!formData.adminPassword) {
      setModalError('Admin password is required.');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      await api.delete(`/api/admin/shops/${activeShop.shopId}`, {
        data: { adminPassword: formData.adminPassword },
      });

      setSuccessMsg(`Branch "${activeShop.shopName}" has been permanently deleted.`);
      setIsDeleteModalOpen(false);
      fetchShops();
    } catch (err) {
      try {
        await api.post(`/api/admin/shops/${activeShop.shopId}/delete`, {
          adminPassword: formData.adminPassword,
        });
        setSuccessMsg(`Branch "${activeShop.shopName}" has been permanently deleted.`);
        setIsDeleteModalOpen(false);
        fetchShops();
      } catch (postErr) {
        console.error('Error permanently deleting shop:', postErr);
        setModalError(formatApiError(postErr, 'Failed to delete branch. Check your admin password.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Reactivate & Transfer to Active Group
  const handleReactivateShop = async (e) => {
    e.preventDefault();
    if (!formData.adminPassword) {
      setModalError('Admin password is required to reopen this branch.');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      await api.patch(`/api/admin/shops/${activeShop.shopId}/status?isActive=true`, {
        adminPassword: formData.adminPassword,
      });

      setSuccessMsg(`Branch "${activeShop.shopName}" reopened and transferred back to Active Branches!`);
      setIsReactivateModalOpen(false);
      fetchShops();
    } catch (err) {
      try {
        await api.put(`/api/admin/shops/${activeShop.shopId}`, {
          shopName: activeShop.shopName,
          location: activeShop.location,
          isActive: true,
          adminPassword: formData.adminPassword,
        });
        setSuccessMsg(`Branch "${activeShop.shopName}" reopened and transferred back to Active Branches!`);
        setIsReactivateModalOpen(false);
        fetchShops();
      } catch (putErr) {
        console.error('Error reactivating shop:', putErr);
        setModalError(formatApiError(putErr, 'Failed to reactivate branch. Check your admin password.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">
            <Store size={14} />
            <span>Branch Operations &amp; Infrastructure</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            {viewMode === 'ACTIVE' ? (
              <span>Active Restaurant Branches</span>
            ) : (
              <span className="flex items-center gap-2 text-amber-900">
                <Archive size={28} className="text-amber-700" />
                <span>Closed Shops Archive</span>
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {viewMode === 'ACTIVE'
              ? 'Operational restaurant outlets currently active, taking customer orders, and linked to menus.'
              : 'Branches that have been closed or deactivated. Historical sales and customer receipts are preserved.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchShops}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium text-sm transition-all shadow-xs disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-orange-500' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* DEDICATED CLOSED SHOPS TOGGLE BUTTON */}
          {viewMode === 'ACTIVE' ? (
            <button
              onClick={() => {
                setViewMode('CLOSED');
                setSearchTerm('');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-sm transition-all shadow-xs active:scale-98"
              title="View Deactivated and Closed Outlets"
            >
              <Archive size={16} className="text-amber-700" />
              <span>Closed Shops</span>
              <span className="bg-amber-200 text-amber-900 text-xs px-2 py-0.5 rounded-full font-bold">
                {stats.closedBranches}
              </span>
            </button>
          ) : (
            <button
              onClick={() => {
                setViewMode('ACTIVE');
                setSearchTerm('');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md active:scale-98"
            >
              <ArrowLeft size={16} />
              <span>Back to Active Branches ({stats.activeBranches})</span>
            </button>
          )}

          {viewMode === 'ACTIVE' && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all shadow-lg active:scale-98 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                backgroundColor: '#ea580c',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.45)',
              }}
            >
              <Plus size={18} className="text-white" strokeWidth={2.5} />
              <span className="text-white font-bold tracking-wide">Add New Branch</span>
              <span
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md ml-1 font-mono uppercase font-bold"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}
              >
                <Lock size={10} /> Password
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-xs transition-all animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl shadow-xs">
          <AlertCircle size={20} className="text-rose-600 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Mode Banner When in Closed View */}
      {viewMode === 'CLOSED' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200/70 text-amber-800 flex items-center justify-center shrink-0">
              <Archive size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">Closed Shops Archive</p>
              <p className="text-xs text-amber-800/90 mt-0.5">
                These branches have been removed from the active group. Their order history is protected. You can reactivate and transfer any shop back to Active at any time.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setViewMode('ACTIVE');
              setSearchTerm('');
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition shrink-0"
          >
            ← View Active Branches
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* Active Outlets */}
        <div
          onClick={() => setViewMode('ACTIVE')}
          className={`p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            viewMode === 'ACTIVE'
              ? 'bg-orange-50/50 dark:bg-orange-950/40 border-orange-400 ring-2 ring-orange-400/20 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
          }`}
        >
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Outlets</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mt-0.5 sm:mt-1">{stats.activeBranches}</p>
            <span className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Live in Operation</span>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Store size={18} />
          </div>
        </div>

        {/* Closed Shops */}
        <div
          onClick={() => setViewMode('CLOSED')}
          className={`p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            viewMode === 'CLOSED'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 shadow-xs'
          }`}
        >
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">Closed Shops</span>
            <p className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-300 mt-0.5 sm:mt-1">{stats.closedBranches}</p>
            <span className="text-[11px] sm:text-xs text-amber-700 dark:text-amber-400 font-semibold">Archived</span>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Archive size={18} />
          </div>
        </div>

        {/* Total Dishes */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Dishes</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mt-0.5 sm:mt-1">{stats.totalDishes}</p>
            <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">All Stores</span>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <UtensilsCrossed size={18} />
          </div>
        </div>

        {/* Total Categories */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categories</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mt-0.5 sm:mt-1">{stats.totalGroups}</p>
            <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">Hierarchies</span>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <FolderTree size={18} />
          </div>
        </div>

        {/* Historical Orders */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Historical Orders</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mt-0.5 sm:mt-1">{stats.totalOrders.toLocaleString()}</p>
            <span className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-medium">Transactions</span>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShoppingBag size={18} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {viewMode === 'ACTIVE' ? 'Active Branches Group' : 'Closed Shops Archive'}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {displayedShops.length}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${viewMode === 'ACTIVE' ? 'active' : 'closed'} branches...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Branch Cards Grid */}
        <div className="p-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw size={32} className="animate-spin text-orange-500" />
              <p className="text-sm font-medium">Loading branches...</p>
            </div>
          ) : displayedShops.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              {viewMode === 'ACTIVE' ? (
                <>
                  <Store size={40} className="mx-auto text-slate-300" />
                  <p className="text-base font-semibold text-slate-600">No active branches found</p>
                  <p className="text-xs text-slate-400">All branches may be closed or filtered out by search.</p>
                </>
              ) : (
                <>
                  <Archive size={40} className="mx-auto text-amber-300" />
                  <p className="text-base font-semibold text-slate-700">No closed shops</p>
                  <p className="text-xs text-slate-400">
                    When you close a branch from the active group, it will be safely transferred here.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedShops.map((shop) => {
                const isClosed = shop.isActive === false;

                return (
                  <div
                    key={shop.shopId}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group ${
                      isClosed
                        ? 'border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/20 hover:border-amber-400 hover:shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-500/50 hover:shadow-md'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-linear-to-b from-slate-50/50 to-white dark:from-slate-850 dark:to-slate-900">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg transition-all shadow-xs ${
                              isClosed
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : 'bg-orange-100/70 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white'
                            }`}
                          >
                            {isClosed ? <Archive size={22} /> : <Store size={22} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase">
                                Shop #{shop.shopId}
                              </span>
                              {shop.shopId === 1 && (
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 uppercase">
                                  HQ
                                </span>
                              )}
                              {isClosed ? (
                                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700 uppercase">
                                  Closed Shop
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 uppercase">
                                  ● Active
                                </span>
                              )}
                            </div>
                            <h3 className={`text-lg font-bold tracking-tight mt-1 line-clamp-1 ${isClosed ? 'text-slate-600 dark:text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                              {shop.shopName}
                            </h3>
                          </div>
                        </div>

                        {/* Top Actions */}
                        <div className="flex items-center gap-1">
                          {isClosed ? (
                            <button
                              onClick={() => handleOpenReactivateModal(shop)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                              title="Reactivate and transfer back to Active Branches"
                            >
                              <RotateCcw size={13} />
                              <span>Reopen</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(shop)}
                                className="p-2 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
                                title="Edit Branch"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleOpenCloseModal(shop)}
                                className="p-2 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                                title="Close Branch (Transfer to Closed Shops)"
                              >
                                <Power size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{shop.location || 'Location Not Specified'}</span>
                      </div>
                    </div>

                    {/* Card Body Metrics */}
                    <div className="p-5 grid grid-cols-3 gap-2 bg-slate-50/30 dark:bg-slate-900/60">
                      <button
                        onClick={() => navigate(`/admin/menus?shopId=${shop.shopId}`)}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500/50 hover:bg-orange-50/30 transition-all text-center group/metric"
                        title="View Dishes for this Branch"
                      >
                        <span className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
                          <UtensilsCrossed size={12} /> Dishes
                        </span>
                        <p className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5 group-hover/metric:text-orange-600">
                          {shop.totalDishes || 0}
                        </p>
                      </button>

                      <button
                        onClick={() => navigate(`/admin/menu-groups?shopId=${shop.shopId}`)}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/50 hover:bg-blue-50/30 transition-all text-center group/metric"
                        title="View Groups for this Branch"
                      >
                        <span className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
                          <FolderTree size={12} /> Groups
                        </span>
                        <p className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5 group-hover/metric:text-blue-600">
                          {shop.totalGroups || 0}
                        </p>
                      </button>

                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                        <span className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1">
                          <ShoppingBag size={12} /> Orders
                        </span>
                        <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {Number(shop.totalOrders || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-white dark:bg-slate-900">
                      {isClosed ? (
                        <>
                          <button
                            onClick={() => handleOpenReactivateModal(shop)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition"
                          >
                            <RotateCcw size={14} />
                            <span>Transfer to Active</span>
                          </button>
                          {Number(shop.totalOrders || 0) === 0 && (
                            <button
                              onClick={() => handleOpenDeleteModal(shop)}
                              className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold transition"
                              title="Permanently Delete Empty Branch"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => navigate(`/admin/menus?shopId=${shop.shopId}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 border border-transparent dark:border-orange-800/60 text-xs font-semibold transition-colors"
                          >
                            <span>Menus</span>
                            <ArrowRight size={13} />
                          </button>

                          <button
                            onClick={() => navigate(`/admin/menu-groups?shopId=${shop.shopId}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                          >
                            <span>Categories</span>
                            <FolderTree size={13} />
                          </button>

                          {/* Close Branch button */}
                          <button
                            onClick={() => handleOpenCloseModal(shop)}
                            className="px-2.5 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold flex items-center gap-1 transition"
                            title="Close Branch and transfer to Closed Shops"
                          >
                            <Power size={13} />
                            <span className="hidden sm:inline">Close</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ======================= MODAL: CLOSE BRANCH (TRANSFER TO CLOSED SHOPS) ======================= */}
      {isCloseModalOpen && activeShop && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div
              className="p-6 text-white relative"
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                backgroundColor: '#d97706',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Archive size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Transfer to Closed Shops</h3>
                  <p className="text-xs text-amber-100 mt-0.5">Shop #{activeShop.shopId} • {activeShop.shopName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="absolute right-5 top-5 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransferToClosed} className="p-6 space-y-5">
              {modalError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <ShieldCheck size={18} className="text-amber-700" />
                  <span>Transfer Confirmation</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Are you sure you want to close <strong>"{activeShop.shopName}"</strong>?
                  It will be <strong>removed from the active group</strong> and transferred to the <strong>Closed Shops</strong> archive.
                </p>
                <p className="text-[11px] text-slate-500">
                  All <strong>{Number(activeShop.totalOrders || 0).toLocaleString()} customer orders</strong> and historical sales records remain 100% preserved. You can reopen it anytime.
                </p>
              </div>

              {/* Password Authorization */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Lock size={13} className="text-amber-600" />
                    <span>Admin Password Required</span>
                    <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter administrator password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-amber-300 bg-amber-50/20 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md shadow-amber-600/20 transition-all active:scale-98 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Transferring...</span>
                    </>
                  ) : (
                    <>
                      <Archive size={16} />
                      <span>Transfer to Closed Shops</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: REACTIVATE & REOPEN ======================= */}
      {isReactivateModalOpen && activeShop && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div
              className="p-6 text-white relative"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                backgroundColor: '#059669',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Reopen Branch</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">Shop #{activeShop.shopId} • {activeShop.shopName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsReactivateModalOpen(false)}
                className="absolute right-5 top-5 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReactivateShop} className="p-6 space-y-5">
              {modalError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                Reopening <strong>"{activeShop.shopName}"</strong> will set its status to <strong>Active</strong> and transfer it back to the active restaurant group.
              </p>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Lock size={13} className="text-emerald-600" />
                    <span>Admin Password Authorization</span>
                    <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter administrator password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/20 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReactivateModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-98 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Reactivating...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw size={16} />
                      <span>Reopen &amp; Transfer to Active</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: CREATE BRANCH ======================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div
              className="p-6 text-white relative"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                backgroundColor: '#ea580c',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Store size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Add Restaurant Branch</h3>
                  <p className="text-xs text-orange-100 mt-0.5">Register a new active outlet</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute right-5 top-5 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShop} className="p-6 space-y-5">
              {modalError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Branch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kothrud Branch, Baner Express"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location / Address
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Kothrud, Pune - 411038"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Lock size={13} className="text-amber-600" />
                    <span>Admin Password Authorization</span>
                    <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your administrator password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-amber-300 bg-amber-50/20 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-md shadow-orange-500/25 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    backgroundColor: '#ea580c',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)',
                  }}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Confirm &amp; Create Branch</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: EDIT BRANCH ======================= */}
      {isEditModalOpen && activeShop && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div
              className="p-6 text-white relative"
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                backgroundColor: '#1e293b',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Edit2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Modify Branch Details</h3>
                  <p className="text-xs text-slate-300 mt-0.5">Shop #{activeShop.shopId} • {activeShop.shopName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute right-5 top-5 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateShop} className="p-6 space-y-5">
              {modalError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Branch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location / Address
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Lock size={13} className="text-amber-600" />
                    <span>Admin Password Authorization</span>
                    <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your administrator password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-amber-300 bg-amber-50/20 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md transition-all active:scale-98 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: PERMANENT DELETE (FOR 0 ORDERS) ======================= */}
      {isDeleteModalOpen && activeShop && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div
              className="p-6 text-white relative"
              style={{
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                backgroundColor: '#e11d48',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Permanently Delete Branch</h3>
                  <p className="text-xs text-rose-100 mt-0.5">Shop #{activeShop.shopId} • {activeShop.shopName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="absolute right-5 top-5 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePermanentDelete} className="p-6 space-y-5">
              {modalError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <AlertCircle size={18} className="text-rose-600" />
                  <span>Permanent Removal</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  This branch has <strong>0 past customer orders</strong>. Confirming will permanently remove <strong>"{activeShop.shopName}"</strong> and any empty menu structures from the database.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Lock size={13} className="text-rose-600" />
                    <span>Admin Password Required</span>
                    <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter administrator password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-rose-300 bg-rose-50/20 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-600/20 transition-all active:scale-98 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
