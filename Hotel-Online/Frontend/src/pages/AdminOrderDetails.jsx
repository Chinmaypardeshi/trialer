import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Store,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Package,
} from 'lucide-react';
import api from '../api/axios';

function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState(null);

  // Fetch Order Details
  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/api/admin/orders/${orderId}`);
      setOrder(res.data);
      if (res.data?.status) {
        setNewStatus(res.data.status);
      }
    } catch (err) {
      console.error('Failed to fetch order details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // Update Status
  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    setUpdateMsg(null);
    try {
      await api.patch(`/api/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      setUpdateMsg({ type: 'success', text: 'Order status updated successfully' });
      fetchOrderDetails();
    } catch (err) {
      console.error('Failed to update order status', err);
      setUpdateMsg({ type: 'error', text: 'Failed to update order status' });
    } finally {
      setUpdating(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        <p className="text-xs font-medium">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Order Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The requested order #{orderId} does not exist or may have been removed.
        </p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-semibold hover:bg-orange-700 transition"
        >
          <ArrowLeft size={14} /> Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Back to Orders"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Order #{order.orderId}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Placed on {new Date(order.orderTime).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Total Amount
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{Number(order.totalAmount || 0).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Store size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">Outlet / Shop</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{order.shopName || '—'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">Payment Mode</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{order.paymentMode || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Package size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">Total Items</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              {order.items?.length || 0} items
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">Order Time</p>
            <p className="text-xs font-bold text-slate-800 dark:text-white">
              {new Date(order.orderTime).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Status Management Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          Update Order Status
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="ACTIVE" className="dark:bg-slate-800 dark:text-white">ACTIVE (In Progress)</option>
            <option value="PAID" className="dark:bg-slate-800 dark:text-white">PAID (Settled)</option>
            <option value="CANCELLED" className="dark:bg-slate-800 dark:text-white">CANCELLED</option>
          </select>

          <button
            onClick={handleStatusUpdate}
            disabled={updating || newStatus === order.status}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            {updating ? 'Updating...' : 'Update Status'}
          </button>

          {updateMsg && (
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
                updateMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
              }`}
            >
              {updateMsg.text}
            </span>
          )}
        </div>
      </div>

      {/* Order Items Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-orange-600 dark:text-orange-400" />
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Order Items ({order.items?.length || 0})
            </h2>
          </div>
        </div>

        {(!order.items || order.items.length === 0) ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">
            No items recorded for this order.
          </div>
        ) : (
          <div>
            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {order.items.map((item, index) => (
                <div key={index} className="p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-xs text-slate-800 dark:text-white">{item.itemName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Qty: {item.quantity} × ₹{Number(item.price || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                      ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4">Item Name</th>
                    <th className="p-4 text-center">Quantity</th>
                    <th className="p-4 text-right">Unit Price</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.items.map((item, index) => {
                    const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                    return (
                      <tr
                        key={index}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="p-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
                          {index + 1}
                        </td>
                        <td className="p-4 font-bold text-slate-800 dark:text-white text-xs">
                          {item.itemName}
                        </td>
                        <td className="p-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {item.quantity}
                        </td>
                        <td className="p-4 text-right text-xs text-slate-600 dark:text-slate-300">
                          ₹{Number(item.price || 0).toFixed(2)}
                        </td>
                        <td className="p-4 text-right text-xs font-extrabold text-slate-900 dark:text-white">
                          ₹{lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Items: {order.items.length}</span>
              <div className="text-right">
                <span className="text-slate-500 dark:text-slate-400 mr-2">Grand Total:</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  ₹{Number(order.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrderDetails;
