import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FolderTree,
  Store,
  Plus,
  Search,
  Edit2,
  Trash2,
  FolderSync,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  UtensilsCrossed,
  Sparkles,
  Layers,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import api from '../api/axios';

const FALLBACK_SHOPS = [
  { shopId: 1, shopName: 'MAIN BRANCH', location: 'Pune' },
  { shopId: 2, shopName: 'Somwar Peth', location: 'Somwar Peth, Pune' },
  { shopId: 3, shopName: 'Market Yard', location: 'Market Yard, Pune' },
];

export default function AdminMenuGroups() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialShopId = searchParams.get('shopId') ? Number(searchParams.get('shopId')) : 1;

  // Shops state
  const [shops, setShops] = useState(FALLBACK_SHOPS);
  const [selectedShopId, setSelectedShopId] = useState(initialShopId);

  // Groups and Menu data
  const [groups, setGroups] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
  const [isMoveItemModalOpen, setIsMoveItemModalOpen] = useState(false);

  // Active selections
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  // Form states
  const [groupNameInput, setGroupNameInput] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [targetGroupId, setTargetGroupId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-dismiss notifications
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Fetch shops
  const fetchShops = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/menus/shops');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setShops(res.data);
      }
    } catch {
      // Keep fallbacks
    }
  }, []);

  // Fetch groups and menus for selected shop
  const fetchGroupData = useCallback(async (shopId) => {
    if (!shopId) return;
    setLoading(true);
    setError(null);
    try {
      const [groupsRes, menusRes] = await Promise.all([
        api.get(`/api/admin/menu-groups/shop/${shopId}`),
        api.get(`/api/admin/menus/${shopId}`),
      ]);
      setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
      setMenus(Array.isArray(menusRes.data) ? menusRes.data : []);
    } catch (err) {
      console.error('Failed to load group data:', err);
      setError('Failed to load menu groups. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  useEffect(() => {
    fetchGroupData(selectedShopId);
  }, [selectedShopId, fetchGroupData]);

  const selectedShop = useMemo(() => {
    return shops.find((s) => s.shopId === Number(selectedShopId)) || {
      shopId: selectedShopId,
      shopName: `Shop #${selectedShopId}`,
      location: 'Pune',
    };
  }, [shops, selectedShopId]);

  // Combine groups with their items
  const groupsWithItems = useMemo(() => {
    return groups.map((g) => {
      const itemsInGroup = menus.filter((m) => m.groupId === g.groupId);
      return {
        ...g,
        items: itemsInGroup,
        totalItems: itemsInGroup.length,
      };
    });
  }, [groups, menus]);

  const trashGroup = useMemo(() => {
    return groupsWithItems.find((g) => g.groupName && g.groupName.toUpperCase() === 'TRASH');
  }, [groupsWithItems]);

  // Filter groups by search
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groupsWithItems;
    const term = searchTerm.toLowerCase();
    return groupsWithItems.filter(
      (g) =>
        g.groupName.toLowerCase().includes(term) ||
        String(g.groupId).includes(term) ||
        g.items.some((item) => item.itemName.toLowerCase().includes(term))
    );
  }, [groupsWithItems, searchTerm]);

  // ==========================================
  // GROUP ACTIONS
  // ==========================================
  // Open Create Modal
  const openCreateModal = () => {
    setGroupNameInput('');
    setIsCreateModalOpen(true);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupNameInput.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/api/admin/menu-groups/shop/${selectedShopId}`, {
        groupName: groupNameInput.trim(),
      });
      setSuccessMsg(`Created category "${groupNameInput.trim()}"`);
      setIsCreateModalOpen(false);
      fetchGroupData(selectedShopId);
    } catch (err) {
      console.error('Create group error:', err);
      const msg = err.response?.data?.message || err.message;
      alert(`Error creating group: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Rename Modal
  const openRenameModal = (group) => {
    setActiveGroup(group);
    setGroupNameInput(group.groupName);
    setIsRenameModalOpen(true);
  };

  const handleRenameGroup = async (e) => {
    e.preventDefault();
    if (!groupNameInput.trim() || !activeGroup) return;

    setSubmitting(true);
    try {
      await api.put(`/api/admin/menu-groups/${activeGroup.groupId}`, {
        groupName: groupNameInput.trim(),
      });
      setSuccessMsg(`Renamed category to "${groupNameInput.trim()}"`);
      setIsRenameModalOpen(false);
      fetchGroupData(selectedShopId);
    } catch (err) {
      console.error('Rename group error:', err);
      alert('Failed to rename category.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Group Modal
  const openDeleteGroupModal = (group) => {
    setActiveGroup(group);
    setIsDeleteGroupModalOpen(true);
  };

  const handleDeleteGroup = async () => {
    if (!activeGroup) return;
    setSubmitting(true);
    try {
      try {
        await api.delete(`/api/admin/menu-groups/${activeGroup.groupId}`);
      } catch (delErr) {
        if (delErr.response?.status === 405 || delErr.response?.status === 404) {
          await api.post(`/api/admin/menu-groups/${activeGroup.groupId}/delete`);
        } else {
          throw delErr;
        }
      }
      setSuccessMsg(`Category "${activeGroup.groupName}" deleted`);
      setIsDeleteGroupModalOpen(false);
      fetchGroupData(selectedShopId);
    } catch (err) {
      console.error('Delete group error:', err);
      const msg = err.response?.data?.message || err.message;
      alert(`Failed to delete group: ${msg || 'Ensure it has no dependencies or is not UNCATEGORIZED.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // ITEM ACTIONS INSIDE GROUP
  // ==========================================
  // Open Add Item to Group Modal
  const openAddItemModal = (group) => {
    setActiveGroup(group);
    setNewItemName('');
    setNewItemPrice('');
    setIsAddItemModalOpen(true);
  };

  const handleAddItemToGroup = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice || !activeGroup) {
      alert('Please enter Item Name and Price.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/api/admin/menus/${selectedShopId}`, {
        itemName: newItemName.trim(),
        price: parseFloat(newItemPrice),
        groupId: activeGroup.groupId,
        isActive: true,
      });
      setSuccessMsg(`Added "${newItemName.trim()}" to ${activeGroup.groupName}`);
      setIsAddItemModalOpen(false);
      fetchGroupData(selectedShopId);
    } catch (err) {
      console.error('Add item to group error:', err);
      const msg = err.response?.data?.message || err.message;
      alert(`Error: ${msg || 'Failed to add item'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Item Modal
  const openDeleteItemModal = (item, group) => {
    setActiveItem(item);
    setActiveGroup(group);
    setIsDeleteItemModalOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!activeItem) return;
    setSubmitting(true);
    try {
      try {
        await api.delete(`/api/admin/menus/${activeItem.menuId}`);
      } catch (delErr) {
        if (delErr.response?.status === 405 || delErr.response?.status === 404) {
          await api.post(`/api/admin/menus/${activeItem.menuId}/trash`);
        } else {
          throw delErr;
        }
      }
      setSuccessMsg(`Removed "${activeItem.itemName}" from ${activeGroup?.groupName || 'menu'}`);
      setIsDeleteItemModalOpen(false);
      fetchGroupData(selectedShopId);
    } catch (err) {
      console.error('Delete item error:', err);
      const msg = err.response?.data?.message || err.message;
      alert(`Failed to delete item: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Move Item Modal
  const openMoveItemModal = (item, group) => {
    setActiveItem(item);
    setActiveGroup(group);
    setTargetGroupId(groups.length > 0 ? groups[0].groupId : '');
    setIsMoveItemModalOpen(true);
  };

  const handleMoveItem = async (e) => {
    e.preventDefault();
    if (!targetGroupId || !activeItem) return;

    setSubmitting(true);
    try {
      await api.put(`/api/admin/menu-groups/${activeItem.menuId}/move`, {
        targetGroupId: parseInt(targetGroupId, 10),
      });
      setSuccessMsg(`Moved "${activeItem.itemName}" to another group`);
      setIsMoveItemModalOpen(false);
      fetchGroupData(selectedShopId);
    } catch (err) {
      console.error('Move item error:', err);
      alert('Failed to move item.');
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
            <span className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <FolderTree size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Menu Groups & Categories
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Organize menu categories, add dishes directly to groups, and manage category structures by shop
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {trashGroup && (
            <button
              onClick={() => {
                const el = document.getElementById(`group-card-${trashGroup.groupId}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition shadow-xs"
              title="Jump to the TRASH group"
            >
              <Trash2 size={16} />
              <span>Trash Group ({trashGroup.totalItems || 0})</span>
            </button>
          )}

          <button
            onClick={() => navigate('/admin/shops')}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition border border-slate-200"
            title="Manage Restaurant Branches"
          >
            <Store size={16} className="text-indigo-600" />
            <span className="hidden sm:inline">Manage Branches</span>
          </button>

          <button
            onClick={() => fetchGroupData(selectedShopId)}
            className="p-2.5 text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 shadow-xs"
            title="Refresh Groups"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition"
          >
            <Plus size={16} /> Create Menu Group
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={20} className="shrink-0" />
          <div className="flex-1 font-medium">{error}</div>
          <button
            onClick={() => fetchGroupData(selectedShopId)}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* 1. Branch / Shop Selection Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Store size={16} className="text-indigo-600 dark:text-indigo-400" />
            Select Restaurant Branch:
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Active: <strong className="text-slate-800 dark:text-slate-200">{selectedShop.shopName}</strong> (ID #{selectedShop.shopId})
          </span>
        </div>

        {/* Shop Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {shops.map((shop) => {
            const isSelected = Number(shop.shopId) === Number(selectedShopId);
            return (
              <div
                key={shop.shopId}
                onClick={() => setSelectedShopId(shop.shopId)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-400/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
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
                    <span className="text-indigo-600 dark:text-indigo-400 flex items-center text-xs font-bold gap-1">
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

      {/* 2. Search & Overview Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search category groups or dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <strong>{groups.length}</strong> Category Groups
          </span>
          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <strong>{menus.length}</strong> Total Dishes
          </span>
        </div>
      </div>

      {/* 3. Category Groups Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="w-9 h-9 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading categories for {selectedShop.shopName}...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-xs">
          <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl">
            📁
          </div>
          <p className="text-sm font-semibold text-slate-700">No categories found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No categories match your search. Try clearing the filter.'
              : `No menu groups have been created for ${selectedShop.shopName} yet.`}
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            + Create First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGroups.map((group) => {
            const isTrash = group.groupName.toUpperCase() === 'TRASH';
            return (
              <div
                key={group.groupId}
                id={`group-card-${group.groupId}`}
                className={`rounded-2xl border shadow-xs overflow-hidden flex flex-col transition ${
                  isTrash
                    ? 'border-red-300 dark:border-red-900/60 bg-red-50/15 dark:bg-red-950/20 ring-1 ring-red-200 dark:ring-red-900/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Card Header */}
                <div
                  className={`p-4 border-b flex items-center justify-between gap-3 ${
                    isTrash
                      ? 'bg-gradient-to-r from-red-50 to-white dark:from-red-950/40 dark:to-slate-900 border-red-200 dark:border-red-900/50'
                      : 'bg-gradient-to-r from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`p-2 rounded-xl font-bold text-xs shrink-0 ${
                        isTrash
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                          : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      #{group.groupId}
                    </span>
                    <div className="truncate">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate flex items-center gap-1.5">
                        <span>{group.groupName}</span>
                        {isTrash ? (
                          <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-200 dark:border-red-800">
                            <Trash2 size={10} /> System Trash Bin
                          </span>
                        ) : group.groupName.toUpperCase() === 'UNCATEGORIZED' ? (
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
                            Archive
                          </span>
                        ) : null}
                      </h3>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        {group.totalItems} {group.totalItems === 1 ? 'dish' : 'dishes'} {isTrash ? 'in trash' : 'in category'}
                      </p>
                    </div>
                  </div>

                  {/* Group Action Icons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!isTrash && (
                      <button
                        onClick={() => openAddItemModal(group)}
                        className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/80 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                        title="Add dish to this group"
                      >
                        <Plus size={13} /> Add Dish
                      </button>
                    )}
                    {!['TRASH', 'UNCATEGORIZED'].includes(group.groupName.toUpperCase()) && (
                      <>
                        <button
                          onClick={() => openRenameModal(group)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Rename Group"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => openDeleteGroupModal(group)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                          title="Delete Group"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

              {/* Items List inside Group */}
              <div className="flex-1 p-4 divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                {group.items.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No dishes in this category yet.
                    <button
                      onClick={() => openAddItemModal(group)}
                      className="block mx-auto mt-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      + Add a dish now
                    </button>
                  </div>
                ) : (
                  group.items.map((item) => (
                    <div
                      key={item.menuId}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/50 rounded-lg px-2 transition"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            item.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.itemName}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                          (#{item.menuId})
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{parseFloat(item.price).toFixed(2)}
                        </span>

                        <div className="flex items-center gap-1">
                          {isTrash ? (
                            <button
                              onClick={() => openMoveItemModal(item, group)}
                              className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 font-bold rounded text-[11px] flex items-center gap-1 transition"
                              title="Restore dish to another category group"
                            >
                              <RotateCcw size={12} />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <>
                              {/* Move Item */}
                              <button
                                onClick={() => openMoveItemModal(item, group)}
                                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                                title="Move to another group"
                              >
                                <FolderSync size={13} />
                              </button>
                              {/* Delete Item */}
                              <button
                                onClick={() => openDeleteItemModal(item, group)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition"
                                title="Delete this dish"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* CREATE GROUP MODAL */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FolderTree size={18} className="text-indigo-600 dark:text-indigo-400" />
                Create New Menu Group
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Branch:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedShop.shopName} (Shop #{selectedShop.shopId})
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Group Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. THALI, DESSERT, BEVERAGES"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RENAME GROUP MODAL */}
      {/* ========================================================= */}
      {isRenameModalOpen && activeGroup && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Edit2 size={18} className="text-indigo-600 dark:text-indigo-400" />
                Rename Category Group #{activeGroup.groupId}
              </h3>
              <button
                onClick={() => setIsRenameModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRenameGroup} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Name'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE GROUP MODAL */}
      {/* ========================================================= */}
      {isDeleteGroupModalOpen && activeGroup && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Delete Category Group?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">&ldquo;{activeGroup.groupName}&rdquo;</strong> from {selectedShop.shopName}?
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800 mt-2">
                ⚠️ All dishes inside this group will be safely moved to &ldquo;UNCATEGORIZED&rdquo; before deletion.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteGroupModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGroup}
                disabled={submitting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD ITEM DIRECTLY TO GROUP MODAL */}
      {/* ========================================================= */}
      {isAddItemModalOpen && activeGroup && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-indigo-600 dark:text-indigo-400" />
                Add Dish to &ldquo;{activeGroup.groupName}&rdquo;
              </h3>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItemToGroup} className="space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Branch:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedShop.shopName} (Shop #{selectedShop.shopId})
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharashtrian Thali"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="e.g. 150.00"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add to Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE ITEM FROM GROUP MODAL */}
      {/* ========================================================= */}
      {isDeleteItemModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Move Dish to Trash?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Remove <strong className="text-slate-800 dark:text-slate-200">&ldquo;{activeItem.itemName}&rdquo;</strong> from {activeGroup?.groupName || 'category'}?
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 mt-3 text-left">
                🛡️ <strong>Safety Protected:</strong> Past orders remain 100% intact. The dish will be removed from this category, deactivated, and placed in <strong>TRASH</strong>.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteItemModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteItem}
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
      {/* MOVE ITEM MODAL */}
      {/* ========================================================= */}
      {isMoveItemModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FolderSync size={18} className="text-indigo-600 dark:text-indigo-400" />
                Move Dish to Another Category
              </h3>
              <button
                onClick={() => setIsMoveItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMoveItem} className="space-y-4 text-xs sm:text-sm">
              <p className="text-slate-600 dark:text-slate-300">
                Move dish <strong className="text-slate-900 dark:text-white">&ldquo;{activeItem.itemName}&rdquo;</strong> to a different category group:
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Category Group *
                </label>
                <select
                  value={targetGroupId}
                  onChange={(e) => setTargetGroupId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  {groups.map((g) => (
                    <option key={g.groupId} value={g.groupId} className="dark:bg-slate-800">
                      {g.groupName} (Group #{g.groupId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMoveItemModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium"
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
    </div>
  );
}
