import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDown, Calendar, FileText, ArrowLeft, Download } from 'lucide-react';
import api from '../api/axios';

function AdminExportPdf() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);

  const exportPdf = async () => {
    if (!fromDate || !toDate) {
      alert('Please select both from and to dates');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(
        `/api/admin/orders/test?fromDate=${fromDate}&toDate=${toDate}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `paid-orders-${fromDate}-to-${toDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/export/excel')}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Back to Export Center"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Export Orders PDF
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Download a printable PDF report of paid orders within a specified date range
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">
              PDF Order Audit Report
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formatted document optimized for accounting archives and physical printouts
            </p>
          </div>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              From Date
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl">
              <Calendar size={15} className="text-slate-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-800 dark:text-white focus:outline-none w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              To Date
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl">
              <Calendar size={15} className="text-slate-400" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-800 dark:text-white focus:outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={exportPdf}
            disabled={loading || !fromDate || !toDate}
            className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Download size={15} />
            {loading ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminExportPdf;
