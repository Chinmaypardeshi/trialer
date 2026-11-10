import { useState, useRef } from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  X, 
  Download, 
  HelpCircle, 
  ArrowRight,
  Database,
  FileCheck2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import api from '../api/axios';

function AdminImportExcel() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [serverError, setServerError] = useState('');
  const [importSuccess, setImportSuccess] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  const fileInputRef = useRef(null);

  const REQUIRED_COLUMNS = [
    { name: 'System User', desc: 'Registered cashier/admin username' },
    { name: 'Shop', desc: 'Exact shop/branch name' },
    { name: 'Order Ref', desc: 'Unique order identifier' },
    { name: 'Order Date', desc: 'Date/Time (YYYY-MM-DD HH:mm)' },
    { name: 'Status', desc: 'ACTIVE, PAID, or CANCELLED' },
    { name: 'Payment', desc: 'CASH or ONLINE' },
    { name: 'Menu Group', desc: 'Existing menu category/group' },
    { name: 'Menu Item', desc: 'Existing menu item name' },
    { name: 'Qty', desc: 'Positive integer quantity' },
    { name: 'Price', desc: 'Unit price (0 or greater)' },
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    setFile(selectedFile);
    setValidationResult(null);
    setServerError('');
    setImportSuccess(null);
  };

  const clearFile = () => {
    setFile(null);
    setValidationResult(null);
    setServerError('');
    setImportSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Step 1: Validate file without inserting into DB
  const handleValidate = async () => {
    if (!file) return;

    setIsValidating(true);
    setServerError('');
    setValidationResult(null);
    setImportSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/admin/excel-orders/validate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setValidationResult(response.data);
    } catch (err) {
      console.error('Validation error:', err);
      const msg = err.response?.data?.message || err.message || 'Validation request failed.';
      setServerError(msg);
    } finally {
      setIsValidating(false);
    }
  };

  // Step 2: Validate + Import file into DB
  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setServerError('');
    setImportSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/admin/excel-orders/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.valid) {
        setImportSuccess({
          message: 'All orders have been successfully imported into the database!',
          totalRows: response.data.totalRows,
          validRows: response.data.validRows,
        });
        setValidationResult(response.data);
      } else {
        setValidationResult(response.data);
      }
    } catch (err) {
      console.error('Import error:', err);
      if (err.response?.status === 409) {
        setServerError('Duplicate File: This Excel file has already been imported into the system.');
      } else {
        const msg = err.response?.data?.message || err.message || 'Import request failed.';
        setServerError(msg);
      }
    } finally {
      setIsImporting(false);
    }
  };

  // Generate and download a sample CSV template in browser
  const downloadSampleTemplate = () => {
    const headers = REQUIRED_COLUMNS.map((col) => col.name).join(',');
    const sampleRow1 = 'SAMARTH,MAIN BRANCH,ORD-SAMPLE-001,2026-11-01 13:00:00,PAID,CASH,Thali,Maharashtrian Thali,2,150.00';
    const sampleRow2 = ',,,,,,Thali,Special Maharashtrian Thali,1,250.00';
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, sampleRow1, sampleRow2].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sample_order_import_template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FileSpreadsheet className="text-orange-500" size={32} />
            Excel Order Import
          </h1>
          <p className="text-gray-500 mt-1">
            Validate and bulk-import offline customer orders from spreadsheets into your database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition shadow-sm text-sm font-medium"
          >
            <HelpCircle size={16} />
            {showGuide ? 'Hide Format Guide' : 'Format Guide'}
          </button>

          <button
            onClick={downloadSampleTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition shadow-sm text-sm font-medium"
          >
            <Download size={16} />
            Download Sample CSV
          </button>
        </div>
      </div>

      {/* Format Guide Drawer */}
      {showGuide && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 transition-all shadow-sm">
          <h3 className="font-semibold text-orange-950 flex items-center gap-2 text-lg mb-2">
            <HelpCircle size={20} className="text-orange-600" />
            Excel Column Order & Rules
          </h3>
          <p className="text-sm text-orange-800 mb-4">
            Your file must have exactly 10 columns in this specific order on the very first row. Order-level fields on subsequent rows of the same order can be left blank to inherit from row 1.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {REQUIRED_COLUMNS.map((col, idx) => (
              <div key={col.name} className="bg-white p-3 rounded-lg border border-orange-200 shadow-xs">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block">
                  Col {idx + 1}
                </span>
                <p className="font-semibold text-gray-800 text-sm">{col.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{col.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 md:p-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            file
              ? 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/60'
              : isDragging
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
              : 'border-gray-300 dark:border-slate-700 hover:border-orange-400 bg-gray-50/50 dark:bg-slate-900/40 cursor-pointer'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!file ? (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-inner">
                <UploadCloud size={32} />
              </div>
              <div>
                <p className="text-base font-medium text-gray-700 dark:text-slate-200">
                  Drag and drop your Excel file here, or{' '}
                  <span className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">browse files</span>
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Supports Microsoft Excel (.xlsx, .xls) and CSV files</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <FileSpreadsheet size={28} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 dark:text-white text-base">{file.name}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB • Ready for validation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="px-3 py-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition flex items-center gap-1"
                >
                  <X size={16} />
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        {file && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
            <div className="text-sm text-gray-500 dark:text-slate-400">
              💡 Tip: Click <strong>Validate</strong> first to inspect errors without saving anything to the database.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleValidate}
                disabled={isValidating || isImporting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-orange-500 text-orange-600 dark:text-orange-400 font-medium hover:bg-orange-50 dark:hover:bg-orange-950/40 transition shadow-xs disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    Validating...
                  </>
                ) : (
                  <>
                    <FileCheck2 size={18} />
                    Validate Only
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleImport}
                disabled={isValidating || isImporting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition shadow-sm disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    Importing to DB...
                  </>
                ) : (
                  <>
                    <Database size={18} />
                    Import to Database
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 p-5 rounded-r-xl shadow-xs flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={22} />
          <div>
            <h4 className="font-semibold text-red-800 dark:text-red-300 text-base">Import Validation Error</h4>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{serverError}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {importSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-500 p-5 rounded-r-xl shadow-xs flex items-start gap-3">
          <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={22} />
          <div>
            <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 text-base">Import Successful!</h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">{importSuccess.message}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
              Imported {importSuccess.validRows} out of {importSuccess.totalRows} row(s). Check your Orders tab to view them!
            </p>
          </div>
        </div>
      )}

      {/* Validation Result Inspection Card */}
      {validationResult && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          {/* Status Header Bar */}
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Validation Summary</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                Detailed breakdown of spreadsheet data integrity and business rules.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {validationResult.valid ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={16} /> All Rows Valid
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
                  <AlertTriangle size={16} /> Errors Found ({validationResult.errors?.length || 0})
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-slate-800 bg-gray-50/50 dark:bg-slate-850">
            <div className="p-5 text-center">
              <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Total Rows Read</span>
              <p className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">{validationResult.totalRows}</p>
            </div>
            <div className="p-5 text-center">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Valid Rows</span>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{validationResult.validRows}</p>
            </div>
            <div className="p-5 text-center">
              <span className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider">Error Count</span>
              <p className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1">{validationResult.errors?.length || 0}</p>
            </div>
          </div>

          {/* Error Details Table (if any errors exist) */}
          {validationResult.errors && validationResult.errors.length > 0 ? (
            <div className="p-6">
              <h4 className="text-sm font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider mb-4">
                Identified Issues ({validationResult.errors.length})
              </h4>

              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-semibold border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3.5">Excel Row</th>
                      <th className="p-3.5">Order Ref</th>
                      <th className="p-3.5">Column</th>
                      <th className="p-3.5">Current Value</th>
                      <th className="p-3.5">Error Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {validationResult.errors.map((err, i) => (
                      <tr key={i} className="hover:bg-red-50/30 dark:hover:bg-red-950/20 transition">
                        <td className="p-3.5 font-bold text-gray-900 dark:text-white">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs font-mono">
                            Row {err.rowNumber}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-gray-700 dark:text-slate-300">
                          {err.orderRef || <span className="text-gray-400 dark:text-slate-500 italic">None</span>}
                        </td>
                        <td className="p-3.5 font-semibold text-gray-800 dark:text-slate-200">
                          <span className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs">
                            {err.column}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-600 dark:text-slate-300 font-mono text-xs">
                          {err.value !== null && err.value !== undefined ? (
                            String(err.value)
                          ) : (
                            <span className="text-red-400 italic font-sans">(blank / null)</span>
                          )}
                        </td>
                        <td className="p-3.5 text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5">
                          <AlertCircle size={15} className="shrink-0 text-red-500 dark:text-red-400" />
                          {err.error}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-lg font-bold text-gray-800 dark:text-white">All Order Data is 100% Valid!</h4>
              <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                No syntax or business logic errors detected. You can safely proceed to import this file into the database.
              </p>
              {!importSuccess && (
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={isImporting}
                  className="inline-flex items-center gap-2 mt-2 px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition shadow-sm"
                >
                  <Database size={18} />
                  Proceed to Import
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminImportExcel;
