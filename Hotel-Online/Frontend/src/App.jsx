import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';

import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

// Dashboard
import AdminDashboard from './pages/AdminDashboard';

// Orders
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetails from './pages/AdminOrderDetails';

// Revenue
import AdminRevenue from './pages/AdminRevenue';
import AdminDailyRevenue from './pages/AdminDailyRevenue';
import AdminWeeklyRevenue from './pages/AdminWeeklyRevenue';
import AdminMonthlyRevenue from './pages/AdminMonthlyRevenue';
import AdminYearlyRevenue from './pages/AdminYearlyRevenue';
import AdminCustomRevenue from './pages/AdminCustomRevenue';

// Export & Import
import AdminExportExcel from './pages/AdminExportExcel';
import AdminExportPdf from './pages/AdminExportPdf';
import AdminImportExcel from './pages/AdminImportExcel';

// Salary Certificate
import AdminSalaryCertificate from './pages/AdminSalaryCertificate';

// Analytics
import AdminAnalytics from './pages/AdminAnalytics';
import AdminTopGroups from './pages/AdminTopGroups';
import AdminTopItems from './pages/AdminTopItems';

// Menus
import AdminMenusByShop from './pages/AdminMenusByShop';
import AdminAddMenu from './pages/AdminAddMenu';
import AdminUpdateMenu from './pages/AdminUpdateMenu';
import AdminToggleMenu from './pages/AdminToggleMenu';

// Menu Groups
import AdminMenuGroups from './pages/AdminMenuGroups';
import AdminCreateGroup from './pages/AdminCreateGroup';
import AdminRenameGroup from './pages/AdminRenameGroup';
import AdminMoveMenuItem from './pages/AdminMoveMenuItem';

// Branches / Shops
import AdminShops from './pages/AdminShops';

function App() {
  return (
    <Routes>

      {/* Redirect root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Orders */}
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:orderId" element={<AdminOrderDetails />} />

        {/* Revenue */}
        <Route path="revenue" element={<AdminRevenue />} />
        <Route path="revenue/daily" element={<AdminRevenue defaultPreset="daily" />} />
        <Route path="revenue/weekly" element={<AdminRevenue defaultPreset="weekly" />} />
        <Route path="revenue/monthly" element={<AdminRevenue defaultPreset="monthly" />} />
        <Route path="revenue/yearly" element={<AdminRevenue defaultPreset="yearly" />} />
        <Route path="revenue/custom" element={<AdminRevenue defaultPreset="allTime" />} />

        {/* Export & Import */}
        <Route path="import/excel" element={<AdminImportExcel />} />
        <Route path="export" element={<Navigate to="export/excel" replace />} />
        <Route path="export/excel" element={<AdminExportExcel />} />
        <Route path="export/pdf" element={<AdminExportPdf />} />

        {/* Salary Certificate */}
        <Route path="salary-certificate" element={<AdminSalaryCertificate />} />

        {/* Analytics */}
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="analytics/top-groups" element={<AdminAnalytics />} />
        <Route path="analytics/top-items" element={<AdminAnalytics />} />

        {/* Menus */}
        <Route path="menus" element={<AdminMenusByShop />} />
        <Route path="menus/add" element={<Navigate to="/admin/menus" replace />} />
        <Route path="menus/update" element={<Navigate to="/admin/menus" replace />} />
        <Route path="menus/toggle" element={<Navigate to="/admin/menus" replace />} />

        {/* Menu Groups */}
        <Route path="menu-groups" element={<AdminMenuGroups />} />
        <Route path="menu-groups/create" element={<Navigate to="/admin/menu-groups" replace />} />
        <Route path="menu-groups/rename" element={<Navigate to="/admin/menu-groups" replace />} />
        <Route path="menu-groups/move" element={<Navigate to="/admin/menu-groups" replace />} />

        {/* Branches / Shops */}
        <Route path="shops" element={<AdminShops />} />

      </Route>

      {/* Unknown Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;