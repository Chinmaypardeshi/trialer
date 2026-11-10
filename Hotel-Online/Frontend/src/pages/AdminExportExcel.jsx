import { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import api from '../api/axios';

function AdminExportExcel() {
  // Default to the first day of current month to today
  const getInitialDates = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      from: firstDay.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    };
  };

  const initial = getInitialDates();
  const [fromDate, setFromDate] = useState(initial.from);
  const [toDate, setToDate] = useState(initial.to);
  const [activePreset, setActivePreset] = useState('thisMonth');

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Quick date presets
  const applyPreset = (presetKey) => {
    const today = new Date();
    let from = '';
    let to = today.toISOString().split('T')[0];

    switch (presetKey) {
      case 'today': {
        from = to;
        break;
      }
      case 'yesterday': {
        const y = new Date();
        y.setDate(today.getDate() - 1);
        from = y.toISOString().split('T')[0];
        to = from;
        break;
      }
      case 'last7Days': {
        const past = new Date();
        past.setDate(today.getDate() - 6);
        from = past.toISOString().split('T')[0];
        break;
      }
      case 'thisMonth': {
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        from = first.toISOString().split('T')[0];
        break;
      }
      case 'lastMonth': {
        const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const last = new Date(today.getFullYear(), today.getMonth(), 0);
        from = first.toISOString().split('T')[0];
        to = last.toISOString().split('T')[0];
        break;
      }
      case 'thisYear': {
        const first = new Date(today.getFullYear(), 0, 1);
        from = first.toISOString().split('T')[0];
        break;
      }
      default:
        break;
    }

    setFromDate(from);
    setToDate(to);
    setActivePreset(presetKey);
    setErrorMessage('');
    setStatusMessage(null);
  };

  // Export to Excel (.xlsx)
  const exportToExcel = async () => {
    if (!fromDate || !toDate) {
      setErrorMessage('Please select both starting and ending dates.');
      return;
    }

    setIsExportingExcel(true);
    setErrorMessage('');
    setStatusMessage(null);

    try {
      const response = await api.get(
        `/api/admin/orders/export/excel?from=${fromDate}&to=${toDate}`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Orders_${fromDate}_to_${toDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'excel',
        text: `Excel report for ${fromDate} to ${toDate} downloaded successfully!`,
      });
    } catch (err) {
      console.error('Failed to export orders to Excel', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to generate Excel report. Please try again.'
      );
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Export to PDF (.pdf)
  const exportToPdf = async () => {
    if (!fromDate || !toDate) {
      setErrorMessage('Please select both starting and ending dates.');
      return;
    }

    setIsExportingPdf(true);
    setErrorMessage('');
    setStatusMessage(null);

    try {
      const response = await api.get(
        `/api/admin/orders/test?fromDate=${fromDate}&toDate=${toDate}`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Paid_Orders_${fromDate}_to_${toDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'pdf',
        text: `PDF report for ${fromDate} to ${toDate} downloaded successfully!`,
      });
    } catch (err) {
      console.error('Failed to export orders to PDF', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to generate PDF report. Please try again.'
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  const presets = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'last7Days', label: 'Last 7 Days' },
    { key: 'thisMonth', label: 'This Month' },
    { key: 'lastMonth', label: 'Last Month' },
    { key: 'thisYear', label: 'This Year' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Download className="text-orange-500" size={32} />
          Export Reports
        </h1>
        <p className="text-gray-500 mt-1">
          Export paid order transactions, sales totals, and revenue metrics into formatted Excel sheets or PDF documents.
        </p>
      </div>

      {/* Date Range Picker Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Calendar className="text-orange-600 dark:text-orange-400" size={20} />
            Select Date Range
          </h2>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => applyPreset(p.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activePreset === p.key
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/70 dark:bg-slate-900/60 p-5 rounded-xl border border-gray-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setActivePreset('custom');
              }}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setActivePreset('custom');
              }}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Error and Success Banners */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 p-4 rounded-r-xl shadow-xs flex items-center gap-3">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{errorMessage}</p>
        </div>
      )}

      {statusMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-500 p-4 rounded-r-xl shadow-xs flex items-center gap-3">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{statusMessage.text}</p>
        </div>
      )}

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Excel Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet size={26} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                .XLSX Format
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Microsoft Excel Export</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Raw structured spreadsheet containing order rows, items, customer details, timestamps, and revenue. Perfect for offline analysis, auditing, or bookkeeping.
              </p>
            </div>

            <ul className="text-xs text-gray-600 dark:text-slate-300 space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                Includes all paid orders between selected dates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                Compatible with Excel, Google Sheets, LibreOffice
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={exportToExcel}
            disabled={isExportingExcel || isExportingPdf}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition shadow-sm disabled:opacity-50"
          >
            {isExportingExcel ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                Generating Excel...
              </>
            ) : (
              <>
                <Download size={18} />
                Download Excel (.xlsx)
              </>
            )}
          </button>
        </div>

        {/* PDF Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                <FileText size={26} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                .PDF Document
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">PDF Summary Report</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Print-ready official document summarizing sales, payment methods, restaurant branch performance, and itemized receipts.
              </p>
            </div>

            <ul className="text-xs text-gray-600 dark:text-slate-300 space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-red-600 dark:text-red-400 shrink-0" />
                Executive summary header and totals breakdown
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-red-600 dark:text-red-400 shrink-0" />
                Print-optimized vector layout and formatting
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={exportToPdf}
            disabled={isExportingExcel || isExportingPdf}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-semibold transition shadow-sm disabled:opacity-50"
          >
            {isExportingPdf ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                Generating PDF...
              </>
            ) : (
              <>
                <Download size={18} />
                Download PDF (.pdf)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminExportExcel;
