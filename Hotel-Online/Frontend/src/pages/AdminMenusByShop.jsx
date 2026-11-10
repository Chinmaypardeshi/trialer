import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  UtensilsCrossed,
  Store,
  Plus,
  Search,
  Edit2,
  Trash2,
  FolderSync,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FolderTree,
  RotateCcw,
  Tag,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import api from '../api/axios';

const FALLBACK_SHOPS = [
  { shopId: 1, shopName: 'MAIN BRANCH', location: 'Pune' },
  { shopId: 2, shopName: 'Somwar Peth', location: 'Somwar Peth, Pune' },
  { shopId: 3, shopName: 'Market Yard', location: 'Market Yard, Pune' },
];

export default function AdminMenusByShop() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialShopId = searchParams.get('shopId') ? Number(searchParams.get('shopId')) : 1;

  // Shops state
  const [shops, setShops] = useState(FALLBACK_SHOPS);
  const [selectedShopId, setSelectedShopId] = useState(initialShopId);
  const [loadingShops, setLoadingShops] = useState(false);

  // Menus & Groups state
  const [menus, setMenus] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  // Form states for Add / Edit / Restore
  const [formData, setFormData] = useState({
    itemName: '',
    price: '',
    groupId: '',
    isActive: true,
  });
  const [targetGroupId, setTargetGroupId] = useState('');
  const [restoreTargetGroupId, setRestoreTargetGroupId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-dismiss notification
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Fetch shops list
  const fetchShops = useCallback(async () => {
    setLoadingShops(true);
    try {
      const res = await api.get('/api/admin/menus/shops');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setShops(res.data);
      }
    } catch {
      // Keep fallback shops if endpoint is unavailable
    } finally {
      setLoadingShops(false);
    }
  }, []);

  // Fetch menus and groups for selected shop
  const fetchShopData = useCallback(async (shopId) => {
    if (!shopId) return;
    setLoading(true);
    setError(null);
    try {
      const [menusRes, groupsRes] = await Promise.all([
        api.get(`/api/admin/menus/${shopId}`),
        api.get(`/api/admin/menu-groups/shop/${shopId}`),
      ]);
      setMenus(Array.isArray(menusRes.data) ? menusRes.data : []);
      setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
    } catch (err) {
      console.error('Failed to load menu data:', err);
      setError('Failed to load menu items for this branch. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  useEffect(() => {
    fetchShopData(selectedShopId);
  }, [selectedShopId, fetchShopData]);

  const selectedShop = useMemo(() => {
    return shops.find((s) => s.shopId === Number(selectedShopId)) || {
      shopId: selectedShopId,
      shopName: `Shop #${selectedShopId}`,
      location: 'Pune',
    };
  }, [shops, selectedShopId]);

  // Trash group and Active categories resolution
  const trashGroup = useMemo(() => {
    return groups.find((g) => g.groupName && g.groupName.toUpperCase() === 'TRASH');
  }, [groups]);

  const activeGroupsList = useMemo(() => {
    return groups.filter(
      (g) => g.groupName && !['TRASH', 'UNCATEGORIZED'].includes(g.groupName.toUpperCase())
    );
  }, [groups]);

  const isTrashItem = useCallback(
    (item) => {
      return Boolean(
        (item.groupName && item.groupName.toUpperCase() === 'TRASH') ||
        (trashGroup && item.groupId === trashGroup.groupId)
      );
    },
    [trashGroup]
  );

  const trashCount = useMemo(() => {
    return menus.filter(isTrashItem).length;
  }, [menus, isTrashItem]);

  // Filtered menu items
  const filteredMenus = useMemo(() => {
    return menus.filter((item) => {
      const inTrash = isTrashItem(item);

      // In Trash View Mode: ONLY show items currently in TRASH
      if (isTrashView) {
        if (!inTrash) return false;
        const matchesSearch =
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(item.menuId).includes(searchTerm);
        return matchesSearch;
      }

      // Normal Active Menu Mode:
      // Exclude trash items from the normal list unless the TRASH category is specifically clicked
      if (inTrash) {
        const isTrashCatSelected =
          (selectedCategory === 'TRASH') ||
          (trashGroup && String(selectedCategory) === String(trashGroup.groupId));
        if (!isTrashCatSelected) {
          return false;
        }
      }

      // Search
      const matchesSearch =
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.menuId).includes(searchTerm) ||
        (item.groupName && item.groupName.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category
      const matchesCategory =
        selectedCategory === 'ALL' ||
        String(item.groupId) === String(selectedCategory) ||
        item.groupName === selectedCategory;

      // Status
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [menus, searchTerm, selectedCategory, statusFilter, isTrashView, isTrashItem, trashGroup]);

  // Metrics
  const totalCount = menus.length;
  const activeCount = menus.filter((m) => m.isActive && !isTrashItem(m)).length;
  const inactiveCount = menus.filter((m) => !m.isActive && !isTrashItem(m)).length;
  const categoriesCount = activeGroupsList.length;

  // Toggle Active/Inactive status
  const handleToggleStatus = async (item) => {
    const nextStatus = !item.isActive;
    try {
      await api.patch(`/api/admin/menus/${item.menuId}/status?isActive=${nextStatus}`);
      setMenus((prev) =>
        prev.map((m) => (m.menuId === item.menuId ? { ...m, isActive: nextStatus } : m))
      );
      setSuccessMsg(`Status for "${item.itemName}" updated to ${nextStatus ? 'Active' : 'Inactive'}`);
    } catch (err) {
      console.error('Toggle status error:', err);
      alert('Failed to update item status. Please try again.');
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      itemName: '',
      price: '',
      groupId: groups.length > 0 ? groups[0].groupId : '',
      isActive: true,
    });
    setIsAddModalOpen(true);
  };

  // Submit Add Item
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.price || !formData.groupId) {
      alert('Please fill in Item Name, Price, and select a Category Group.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        itemName: formData.itemName.trim(),
        price: parseFloat(formData.price),
        groupId: parseInt(formData.groupId, 10),
        isActive: formData.isActive,
      };
      await api.post(`/api/admin/menus/${selectedShopId}`, payload);
      setSuccessMsg(`Added new menu item: "${payload.itemName}"`);
      setIsAddModalOpen(false);
      fetchShopData(selectedShopId);
    } catch (err) {
      console.error('Failed to add menu:', err);
      const backendMsg = err.response?.data?.message || err.message;
      alert(`Error: ${backendMsg || 'Failed to add item'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setActiveItem(item);
    setFormData({
      itemName: item.itemName,
      price: item.price,
      groupId: item.groupId,
      isActive: item.isActive,
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit Item
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.price || !formData.groupId) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        itemName: formData.itemName.trim(),
        price: parseFloat(formData.price),
        groupId: parseInt(formData.groupId, 10),
        isActive: formData.isActive,
      };
      await api.put(`/api/admin/menus/${activeItem.menuId}`, payload);
      setSuccessMsg(`Updated details for "${payload.itemName}"`);
      setIsEditModalOpen(false);
      fetchShopData(selectedShopId);
    } catch (err) {
      console.error('Failed to update menu:', err);
      alert('Failed to update menu item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Move Modal
  const openMoveModal = (item) => {
    setActiveItem(item);
    setTargetGroupId(groups.length > 0 ? groups[0].groupId : '');
    setIsMoveModalOpen(true);
  };

  // Submit Move Item
  const handleMoveSubmit = async (e) => {
    e.preventDefault();
    if (!targetGroupId) {
      alert('Please select a target group.');
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/api/admin/menu-groups/${activeItem.menuId}/move`, {
        targetGroupId: parseInt(targetGroupId, 10),
      });
      setSuccessMsg(`Moved "${activeItem.itemName}" to new category`);
      setIsMoveModalOpen(false);
      fetchShopData(selectedShopId);
    } catch (err) {
      console.error('Failed to move menu item:', err);
      alert('Failed to move item to another category.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (item) => {
    setActiveItem(item);
    setIsDeleteModalOpen(true);
  };

  // Submit Delete Item (Move to TRASH & deactivate)
  const handleDeleteSubmit = async () => {
    if (!activeItem) return;
    setSubmitting(true);
    try {
      try {
        await api.delete(`/api/admin/menus/${activeItem.menuId}`);
      } catch (delErr) {
        // Fallback to POST /trash if DELETE method is not allowed / supported
        if (delErr.response?.status === 405 || delErr.response?.status === 404) {
          await api.post(`/api/admin/menus/${activeItem.menuId}/trash`);
        } else {
          throw delErr;
        }
      }
      setSuccessMsg(`"${activeItem.itemName}" has been moved to TRASH and deactivated`);
      setIsDeleteModalOpen(false);
      fetchShopData(selectedShopId);
    } catch (err) {
      console.error('Failed to move menu item to trash:', err);
      const msg = err.response?.data?.message || err.message;
      alert(`Failed to remove menu item: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Restore Modal
  const openRestoreModal = (item) => {
    setActiveItem(item);
    setRestoreTargetGroupId(activeGroupsList.length > 0 ? String(activeGroupsList[0].groupId) : '');
    setIsRestoreModalOpen(true);
  };

  // Submit Restore
  const handleRestoreSubmit = async (e) => {
    e.preventDefault();
    if (!activeItem || !restoreTargetGroupId) {
      alert('Please select an active category group to restore this dish into.');
      return;
    }
    setSubmitting(true);
    try {
      // 1. Move dish from TRASH group to the target active category group
      await api.put(`/api/admin/menu-groups/${activeItem.menuId}/move`, {
        targetGroupId: parseInt(restoreTargetGroupId, 10),
      });
      // 2. Reactivate the dish
      await api.patch(`/api/admin/menus/${activeItem.menuId}/status?isActive=true`);

      setSuccessMsg(`"${activeItem.itemName}" has been successfully restored to the active menu!`);
      setIsRestoreModalOpen(false);
      fetchShopData(selectedShopId);
    } catch (err) {
      console.error('Failed to restore item:', err);
      const msg = err.response?.data?.message || err.message;
      alert(`Failed to restore dish: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <UtensilsCrossed size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Menu Items Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Browse, create, update, move, and toggle menu items for each restaurant shop
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Dedicated Trash Bin Button */}
          <button
            onClick={() => {
              setIsTrashView((prev) => !prev);
              setSelectedCategory('ALL');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-xs ${
              isTrashView
                ? 'bg-red-600 text-white hover:bg-red-700 ring-2 ring-red-400 ring-offset-2'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
            title={isTrashView ? 'Exit Trash Bin and return to active dishes' : 'Open Trash Bin to view safely deactivated dishes'}
          >
            <Trash2 size={16} />
            <span>{isTrashView ? 'Exit Trash Bin' : 'Trash Bin'}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                isTrashView ? 'bg-red-800 text-white' : 'bg-red-200 text-red-900'
              }`}
            >
              {trashCount}
            </span>
          </button>

          <button
            onClick={() => navigate('/admin/shops')}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition border border-slate-200"
            title="Manage Restaurant Branches"
          >
            <Store size={16} className="text-orange-600" />
            <span className="hidden sm:inline">Manage Branches</span>
          </button>

          <button
            onClick={() => fetchShopData(selectedShopId)}
            className="p-2.5 text-slate-600 hover:text-orange-600 bg-white hover:bg-orange-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 shadow-xs"
            title="Refresh Menu Items"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition"
          >
            <Plus size={16} /> Add Menu Item
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={20} className="shrink-0" />
          <div className="flex-1 font-medium">{error}</div>
          <button
            onClick={() => fetchShopData(selectedShopId)}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* 1. Branch / Shop Selector Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Store size={16} className="text-orange-500" />
            Select Restaurant Branch:
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Active: <strong className="text-slate-800 dark:text-slate-200">{selectedShop.shopName}</strong> (ID #{selectedShop.shopId})
          </span>
        </div>

        {/* Shop Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {shops.map((shop) => {
            const isSelected = Number(shop.shopId) === Number(selectedShopId);
            return (
              <div
                key={shop.shopId}
                onClick={() => setSelectedShopId(shop.shopId)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-orange-50/70 dark:bg-orange-950/40 border-orange-500 ring-2 ring-orange-400/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Shop ID #{shop.shopId}
                  </span>
                  {shop.isActive === false ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      Closed
                    </span>
                  ) : isSelected ? (
                    <span className="text-orange-600 dark:text-orange-400 flex items-center text-xs font-bold gap-1">
                      <Sparkles size={13} /> Active
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white truncate">
                  {shop.shopName}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  📍 {shop.location || 'Pune'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Menu Items</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Dishes in this branch</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Active in Service</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{activeCount}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Available to order</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">Inactive / Paused</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">{inactiveCount}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Hidden from orders</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Menu Groups</div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">{categoriesCount}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Active categories</div>
        </div>

        {/* 5th KPI Card: Trash Bin */}
        <div
          onClick={() => {
            setIsTrashView((prev) => !prev);
            setSelectedCategory('ALL');
          }}
          className={`rounded-xl border p-4 shadow-xs cursor-pointer transition ${
            isTrashView
              ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900/60 ring-2 ring-red-400 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-800/60 hover:bg-red-50/20'
          }`}
          title="Click to toggle Trash Bin"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-600 dark:text-red-400 font-bold">Trash Bin</span>
            <Trash2 size={16} className="text-red-500 dark:text-red-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-400 mt-1">{trashCount}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
            {isTrashView ? 'Viewing Trash' : 'Click to inspect trash'}
          </div>
        </div>
      </div>

      {/* 3. Search and Category Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder={isTrashView ? "Search archived dishes in trash..." : "Search dishes by name or ID..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-medium hidden md:inline">Status:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'INACTIVE', label: 'Inactive' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  statusFilter === st.id
                    ? 'bg-slate-900 dark:bg-orange-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0 mr-1 flex items-center gap-1">
            <Tag size={13} /> Category:
          </span>
          <button
            onClick={() => {
              setIsTrashView(false);
              setSelectedCategory('ALL');
            }}
            className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition ${
              selectedCategory === 'ALL' && !isTrashView
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            All Items ({activeCount + inactiveCount})
          </button>
          {activeGroupsList.map((g) => {
            const countInGroup = menus.filter((m) => m.groupId === g.groupId && !isTrashItem(m)).length;
            const isSel = String(selectedCategory) === String(g.groupId) && !isTrashView;
            return (
              <button
                key={g.groupId}
                onClick={() => {
                  setIsTrashView(false);
                  setSelectedCategory(g.groupId);
                }}
                className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition ${
                  isSel
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {g.groupName} ({countInGroup})
              </button>
            );
          })}

          {/* TRASH Category Pill */}
          {trashCount > 0 && (
            <button
              onClick={() => {
                setIsTrashView(true);
                setSelectedCategory('ALL');
              }}
              className={`px-3 py-1 rounded-lg font-bold shrink-0 transition flex items-center gap-1 ${
                isTrashView
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60'
              }`}
            >
              <Trash2 size={12} />
              <span>Trash Bin ({trashCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Trash View Active Banner */}
      {isTrashView && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-900 shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Trash2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm">
                  Viewing Trash Bin for {selectedShop.shopName}
                </h4>
                <span className="px-2 py-0.5 bg-red-200 text-red-900 rounded-full text-xs font-extrabold">
                  {trashCount} {trashCount === 1 ? 'dish' : 'dishes'}
                </span>
              </div>
              <p className="text-xs text-red-700/80 mt-0.5">
                Past orders, bills, and sales reports remain 100% intact. You can restore any dish back to the active menu anytime.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTrashView(false)}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-red-300 text-slate-800 rounded-xl text-xs font-bold transition shrink-0 shadow-2xs"
          >
            ← Exit Trash View
          </button>
        </div>
      )}

      {/* 4. Menu Items Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              Dishes in {selectedShop.shopName}
            </h3>
            <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full">
              {filteredMenus.length} items
            </span>
          </div>
          <button
            onClick={openAddModal}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1"
          >
            <Plus size={14} /> Add Dish
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-9 h-9 border-4 border-orange-200 dark:border-orange-900/40 border-t-orange-600 rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Loading menu items for {selectedShop.shopName}...</p>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl">
              🍽
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No dishes found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'ALL' || statusFilter !== 'ALL'
                ? 'No items match your active filters. Try clearing your search.'
                : `No menu items have been added to ${selectedShop.shopName} yet.`}
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              + Add First Dish
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">ID</th>
                  <th className="py-3 px-4">Dish Name</th>
                  <th className="py-3 px-4">Category Group</th>
                  <th className="py-3 px-4 text-right">Price (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredMenus.map((item) => (
                  <tr key={item.menuId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-bold text-slate-400 dark:text-slate-500 text-xs">
                      #{item.menuId}
                    </td>

                    {/* Dish Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            item.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        />
                        <span>{item.itemName}</span>
                      </div>
                    </td>

                    {/* Category Group */}
                    <td className="py-3.5 px-4">
                      {isTrashItem(item) ? (
                        <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-transparent dark:border-red-900/60 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                          <Trash2 size={12} className="text-red-600 dark:text-red-400" />
                          TRASH
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-transparent dark:border-orange-900/60 rounded-lg text-xs font-semibold inline-flex items-center gap-1">
                          <FolderTree size={12} className="text-orange-600 dark:text-orange-400" />
                          {item.groupName || `Group #${item.groupId}`}
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                      ₹{parseFloat(item.price).toFixed(2)}
                    </td>

                    {/* Status Toggle / Trash Indicator */}
                    <td className="py-3.5 px-4 text-center">
                      {isTrashItem(item) ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-transparent dark:border-red-900/60 flex items-center gap-1 mx-auto w-fit">
                          <Trash2 size={12} className="text-red-600 dark:text-red-400" /> In Trash
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 mx-auto ${
                            item.isActive
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border border-transparent dark:border-emerald-800/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700'
                          }`}
                          title="Click to toggle status"
                        >
                          {item.isActive ? (
                            <>
                              <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle size={12} className="text-slate-400 dark:text-slate-500" /> Inactive
                            </>
                          )}
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isTrashItem(item) ? (
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => openRestoreModal(item)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                            title="Restore dish back to active menu"
                          >
                            <RotateCcw size={13} />
                            <span>Restore Dish</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            title="Edit Dish Name or Price"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Move Category Button */}
                          <button
                            onClick={() => openMoveModal(item)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Move to another category group"
                          >
                            <FolderSync size={15} />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Move Dish to Trash"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* ADD MENU ITEM MODAL */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-orange-500" />
                Add New Menu Item
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Branch:</span>
                <span className="font-bold text-slate-800">
                  {selectedShop.shopName} (Shop #{selectedShop.shopId})
                </span>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharashtrian Thali, Chapati"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="e.g. 150.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Category Group */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Group *
                </label>
                {groups.length === 0 ? (
                  <p className="text-xs text-red-500">
                    No categories exist for this shop yet. Please create a group first.
                  </p>
                ) : (
                  <select
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-slate-800"
                  >
                    {groups.map((g) => (
                      <option key={g.groupId} value={g.groupId}>
                        {g.groupName} (Group #{g.groupId})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="addItemActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500"
                />
                <label htmlFor="addItemActive" className="text-xs font-medium text-slate-700">
                  Enable item immediately for customer ordering (Active)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT MENU ITEM MODAL */}
      {/* ========================================================= */}
      {isEditModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit2 size={18} className="text-orange-500" />
                Edit Dish #{activeItem.menuId}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Group
                </label>
                <select
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-slate-800"
                >
                  {groups.map((g) => (
                    <option key={g.groupId} value={g.groupId}>
                      {g.groupName} (Group #{g.groupId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editItemActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500"
                />
                <label htmlFor="editItemActive" className="text-xs font-medium text-slate-700">
                  Item is Active in menu
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MOVE ITEM MODAL */}
      {/* ========================================================= */}
      {isMoveModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FolderSync size={18} className="text-indigo-600" />
                Move to Category
              </h3>
              <button
                onClick={() => setIsMoveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMoveSubmit} className="space-y-4 text-xs sm:text-sm">
              <p className="text-slate-600">
                Move dish <strong className="text-slate-900">&ldquo;{activeItem.itemName}&rdquo;</strong> from current category{' '}
                <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-md font-semibold">
                  {activeItem.groupName}
                </span>{' '}
                to a new category:
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Category Group *
                </label>
                <select
                  value={targetGroupId}
                  onChange={(e) => setTargetGroupId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-800"
                >
                  {groups.map((g) => (
                    <option key={g.groupId} value={g.groupId}>
                      {g.groupName} (Group #{g.groupId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMoveModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {submitting ? 'Moving...' : 'Move Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {isDeleteModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-base">Move Dish to Trash?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong className="text-slate-800">&ldquo;{activeItem.itemName}&rdquo;</strong> from {selectedShop.shopName}?
              </p>
              <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-3 text-left">
                🛡️ <strong>Safety Protected:</strong> Past orders and sales history remain 100% intact. The dish will be removed from its category, deactivated, and placed in the <strong>TRASH</strong> group.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={submitting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {submitting ? 'Moving to Trash...' : 'Yes, Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RESTORE DISH MODAL */}
      {/* ========================================================= */}
      {isRestoreModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <RotateCcw size={18} className="text-emerald-600" />
                Restore Dish to Active Menu
              </h3>
              <button
                onClick={() => setIsRestoreModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRestoreSubmit} className="space-y-4 text-xs sm:text-sm">
              <p className="text-slate-600">
                Restore dish <strong className="text-slate-900">&ldquo;{activeItem.itemName}&rdquo;</strong> back to active service in <strong className="text-slate-800">{selectedShop.shopName}</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Restore into Category Group *
                </label>
                <select
                  value={restoreTargetGroupId}
                  onChange={(e) => setRestoreTargetGroupId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-800"
                >
                  {activeGroupsList.map((g) => (
                    <option key={g.groupId} value={g.groupId}>
                      {g.groupName} (Group #{g.groupId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                ✓ The dish status will automatically be set back to <strong>Active</strong> and made available for customer orders.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRestoreModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {submitting ? 'Restoring...' : 'Yes, Restore Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
