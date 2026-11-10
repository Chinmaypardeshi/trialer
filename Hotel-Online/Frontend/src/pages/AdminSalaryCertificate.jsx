import { useState } from 'react';
import api from '../api/axios';
import { convertToIndianCurrencyWords } from '../utils/indianNumberToWords';
import {
  Award,
  Download,
  Printer,
  ExternalLink,
  Plus,
  Trash2,
  Calendar,
  User,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  FileText,
  RotateCcw,
} from 'lucide-react';

export default function AdminSalaryCertificate() {
  const today = new Date().toISOString().split('T')[0];

  const defaultState = {
    employeeName: 'Mr. Ganesh Vishwanath Rampure',
    joiningDateOrYear: '2026',
    monthlyGrossSalary: '30000',
    issueDate: today,
    purpose: 'official purposes',
    designation: '',
    components: [{ name: 'Basic Salary', amount: '30000' }],
  };

  const [formData, setFormData] = useState(defaultState);
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Live salary in words
  const salaryInWords = convertToIndianCurrencyWords(formData.monthlyGrossSalary);

  // Total of components
  const componentsTotal = formData.components.reduce(
    (sum, c) => sum + (parseFloat(c.amount) || 0),
    0
  );
  const grossSalaryNum = parseFloat(formData.monthlyGrossSalary) || 0;
  const isComponentSumMatching = Math.abs(componentsTotal - grossSalaryNum) < 0.01;

  // Handle Gross Salary input
  const handleGrossSalaryChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      // If there's only 1 component (Basic Salary), keep it synced
      if (prev.components.length === 1 && prev.components[0].name === 'Basic Salary') {
        return {
          ...prev,
          monthlyGrossSalary: val,
          components: [{ name: 'Basic Salary', amount: val }],
        };
      }
      return { ...prev, monthlyGrossSalary: val };
    });
  };

  // Components manipulation
  const handleAddComponent = () => {
    setFormData((prev) => ({
      ...prev,
      components: [...prev.components, { name: '', amount: '' }],
    }));
  };

  const handleRemoveComponent = (index) => {
    setFormData((prev) => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }));
  };

  const handleComponentChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.components];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, components: updated };
    });
  };

  const handleReset = () => {
    setFormData(defaultState);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Validate request
  const validateForm = () => {
    if (!formData.employeeName.trim()) {
      setErrorMsg('Please enter employee full name.');
      return false;
    }
    if (!formData.joiningDateOrYear.trim()) {
      setErrorMsg('Please enter joining date or year.');
      return false;
    }
    if (!formData.monthlyGrossSalary || grossSalaryNum <= 0) {
      setErrorMsg('Please enter a valid gross monthly salary greater than 0.');
      return false;
    }
    if (!formData.issueDate) {
      setErrorMsg('Please select certificate issue date.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  // Format date for visual display: "01 - 07 - 2026"
  const formatDisplayDate = (isoDate) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]} - ${parts[1]} - ${parts[0]}`;
    }
    return isoDate;
  };

  // Prepare payload for backend
  const buildPayload = () => {
    const validComponents = formData.components
      .filter((c) => c.name.trim() !== '')
      .map((c) => ({
        name: c.name.trim(),
        amount: parseFloat(c.amount) || 0,
      }));

    return {
      employeeName: formData.employeeName.trim(),
      joiningDateOrYear: formData.joiningDateOrYear.trim(),
      monthlyGrossSalary: grossSalaryNum,
      issueDate: formData.issueDate,
      purpose: formData.purpose.trim() || 'official purposes',
      designation: formData.designation ? formData.designation.trim() : null,
      components: validComponents.length > 0 ? validComponents : null,
    };
  };

  // Extract real error message even when responseType is 'blob'
  const extractErrorMessage = async (err, fallback) => {
    if (err.response?.status === 404) {
      return 'Endpoint not found (HTTP 404). Please restart your Spring Boot application in your terminal or IDE so the new Salary Certificate controller is loaded.';
    }
    if (err.response?.status === 401 || err.response?.status === 403) {
      return `Access Denied (HTTP ${err.response.status}). Please verify you are logged in with an ADMIN account.`;
    }
    if (err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        if (json.message) return json.message;
        if (json.error) return `${json.status ? `[${json.status}] ` : ''}${json.error}`;
      } catch (e) {
        // not json
      }
    }
    return err.response?.data?.message || err.message || fallback;
  };

  // 1. Download PDF
  const handleDownloadPdf = async () => {
    if (!validateForm()) return;
    setDownloading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await api.post(
        '/api/admin/salary-certificate/generate',
        buildPayload(),
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const sanitizedName = formData.employeeName.replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `Salary_Certificate_${sanitizedName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMsg('Salary certificate generated and downloaded successfully!');
    } catch (err) {
      console.error('Failed to generate salary certificate:', err);
      const msg = await extractErrorMessage(err, 'Failed to generate PDF. Please try again.');
      setErrorMsg(msg);
    } finally {
      setDownloading(false);
    }
  };

  // 2. Preview / Print PDF in browser
  const handlePreviewPdf = async (autoPrint = false) => {
    if (!validateForm()) return;
    setPreviewing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await api.post(
        '/api/admin/salary-certificate/preview',
        buildPayload(),
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      if (autoPrint) {
        const printWindow = window.open(url);
        if (printWindow) {
          printWindow.onload = () => printWindow.print();
        }
      } else {
        window.open(url, '_blank');
      }

      setSuccessMsg(autoPrint ? 'Sent to browser print dialog.' : 'Opened certificate preview.');
    } catch (err) {
      console.error('Failed to preview salary certificate:', err);
      const msg = await extractErrorMessage(err, 'Failed to preview PDF. Please try again.');
      setErrorMsg(msg);
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Award size={24} />
            </span>
            <h1 className="text-2xl font-bold text-slate-800">
              Salary Certificate Generator
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
              <ShieldCheck size={12} /> ADMIN ONLY
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Instantly generate, preview, and download official verified salary certificates with restaurant branding.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <RotateCcw size={14} /> Reset Form
        </button>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-sm">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Form (Left) & Live Preview (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Form Inputs (Left: 6 cols) */}
        <div className="xl:col-span-6 space-y-6">
          {/* Section 1: Employee Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User size={18} className="text-orange-500" />
              1. Employee & Employment Details
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Employee Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.employeeName}
                onChange={(e) =>
                  setFormData({ ...formData, employeeName: e.target.value })
                }
                placeholder="e.g. Mr. Ganesh Vishwanath Rampure"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-800"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Include title prefix (Mr. / Ms. / Mrs.) as it should appear on the certificate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Joining Year / Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.joiningDateOrYear}
                  onChange={(e) =>
                    setFormData({ ...formData, joiningDateOrYear: e.target.value })
                  }
                  placeholder="e.g. 2026 or 15-01-2024"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Designation / Role (Optional)
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  placeholder="e.g. Head Chef / Manager"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Salary Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <IndianRupee size={18} className="text-orange-500" />
              2. Salary & Certificate Details
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Gross Monthly Salary (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.monthlyGrossSalary}
                  onChange={handleGrossSalaryChange}
                  placeholder="30000"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-800"
                />
              </div>

              {/* Dynamic Words Box */}
              {salaryInWords && (
                <div className="mt-2 p-2.5 bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 rounded-xl">
                  <p className="text-[11px] font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                    Amount in Words (Indian Rupees)
                  </p>
                  <p className="text-xs font-bold text-slate-700 dark:text-orange-200 mt-0.5">
                    {salaryInWords}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, issueDate: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Purpose Statement
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  placeholder="e.g. official purposes"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-800"
                />
              </div>
            </div>

            {/* Breakdown Table Form */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Salary Breakdown Components
                </span>
                <button
                  type="button"
                  onClick={handleAddComponent}
                  className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold flex items-center gap-1"
                >
                  <Plus size={14} /> Add Component
                </button>
              </div>

              <div className="space-y-2">
                {formData.components.map((comp, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={comp.name}
                      onChange={(e) =>
                        handleComponentChange(idx, 'name', e.target.value)
                      }
                      placeholder="e.g. Basic Salary"
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="relative w-36">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={comp.amount}
                        onChange={(e) =>
                          handleComponentChange(idx, 'amount', e.target.value)
                        }
                        placeholder="Amount"
                        className="w-full pl-6 pr-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white font-medium text-right focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    {formData.components.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(idx)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Mismatch indicator */}
              {!isComponentSumMatching && formData.components.length > 0 && (
                <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                  <span>Breakdown total (₹{componentsTotal.toLocaleString('en-IN')}) does not match Gross Salary (₹{grossSalaryNum.toLocaleString('en-IN')}).</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        monthlyGrossSalary: componentsTotal.toString(),
                      }))
                    }
                    className="underline font-semibold ml-2 text-amber-700 dark:text-amber-400"
                  >
                    Sync
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl shadow transition"
            >
              <Download size={18} />
              {downloading ? 'Generating PDF...' : 'Generate & Download PDF Certificate'}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePreviewPdf(true)}
                disabled={previewing}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-medium rounded-xl transition"
              >
                <Printer size={15} /> Print Certificate
              </button>
              <button
                onClick={() => handlePreviewPdf(false)}
                disabled={previewing}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl transition"
              >
                <ExternalLink size={15} /> Open Preview Tab
              </button>
            </div>
          </div>
        </div>

        {/* Live Document Preview (Right: 6 cols) */}
        <div className="xl:col-span-6 sticky top-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} className="text-orange-500" /> Live Certificate Preview (A4 Layout)
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Matches Word template
            </span>
          </div>

          {/* Certificate Paper Sheet */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-300 dark:border-slate-800 p-8 sm:p-10 text-slate-800 dark:text-slate-200 min-h-[620px] font-serif text-[13px] leading-relaxed relative selection:bg-orange-100 dark:selection:bg-orange-950">
            {/* Header: Logo + Details */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-300 dark:border-slate-800">
              <img
                src="/logo.png"
                alt="Siddhu's Maharashtrian Thali Logo"
                className="w-20 h-20 object-contain shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="text-right">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight font-sans">
                  Siddhu’s Maharashtrian Thali
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug font-sans">
                  Sr. No. 503, Rasta Peth, In front of Khurana Mobile Shopee,<br />
                  Near Apollo Theatre, Pune, Maharashtra 411011
                </p>
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-300 font-sans mt-0.5">
                  Phone: 8600155129
                </p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-wider underline underline-offset-4 font-sans">
                SALARY CERTIFICATE
              </h2>
            </div>

            {/* Date */}
            <div className="mb-4 font-sans text-xs text-slate-700 dark:text-slate-300">
              <span>Date: {formatDisplayDate(formData.issueDate)}</span>
            </div>

            {/* Subheading */}
            <div className="mb-4 font-sans font-bold text-xs text-slate-900 dark:text-white tracking-wide">
              TO WHOMSOEVER IT MAY CONCERN
            </div>

            {/* Certification Paragraph 1 */}
            <p className="mb-4 text-justify font-sans text-slate-800 dark:text-slate-300 leading-normal">
              This is to certify that{' '}
              <strong className="text-slate-950 dark:text-white font-bold">
                {formData.employeeName || '[Employee Name]'}
              </strong>
              , is employed with{' '}
              <strong className="text-slate-950 dark:text-white font-bold">
                Siddhu’s Maharashtrian Thali
              </strong>
              . The employee has been working with our organization since{' '}
              <strong className="text-slate-950 dark:text-white font-bold">
                {formData.joiningDateOrYear || '[Year/Date]'}
              </strong>
              .
            </p>

            {/* Certification Paragraph 2 */}
            <p className="mb-4 text-justify font-sans text-slate-800 dark:text-slate-300 leading-normal">
              The employee is currently drawing a Gross Monthly Salary of{' '}
              <strong className="text-slate-950 dark:text-white font-bold">
                ₹{grossSalaryNum.toLocaleString('en-IN')}
              </strong>{' '}
              ({salaryInWords || 'Thirty Thousand Rupees Only'}).
            </p>

            {/* Salary Breakdown Section */}
            <div className="my-5 font-sans">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                Salary Breakdown
              </h4>
              <table className="w-full max-w-sm border border-slate-300 dark:border-slate-700 text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                    <th className="py-1.5 px-3 text-left font-bold border-r border-slate-300 dark:border-slate-700">
                      Component
                    </th>
                    <th className="py-1.5 px-3 text-right font-bold">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.components.map((comp, idx) => (
                    <tr key={idx} className="border-b border-slate-200 dark:border-slate-800">
                      <td className="py-1.5 px-3 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                        {comp.name || 'Component'}
                      </td>
                      <td className="py-1.5 px-3 text-right text-slate-900 dark:text-white font-medium">
                        {(parseFloat(comp.amount) || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paragraph 3: Purpose */}
            <p className="my-6 text-justify font-sans text-slate-800 dark:text-slate-300 leading-normal">
              This certificate has been issued at the request of the employee for{' '}
              {formData.purpose || 'official purposes'}. It is based on the records maintained by the
              restaurant and is valid as of the date of issue.
            </p>

            {/* Signature Block */}
            <div className="mt-12 flex justify-end font-sans">
              <div className="text-right space-y-1">
                <div className="h-12 w-32 border-b border-dashed border-slate-300 dark:border-slate-700 ml-auto" />
                <p className="font-bold text-xs text-slate-900 dark:text-white mt-2">Proprietor</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Siddhu’s Maharashtrian Thali</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
