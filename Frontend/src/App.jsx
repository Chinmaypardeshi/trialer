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
import AdminDailyRevenue from './pages/AdminDailyRevenue';
import AdminWeeklyRevenue from './pages/AdminWeeklyRevenue';
import AdminMonthlyRevenue from './pages/AdminMonthlyRevenue';
import AdminYearlyRevenue from './pages/AdminYearlyRevenue';
import AdminCustomRevenue from './pages/AdminCustomRevenue';

// Export
import AdminExportExcel from './pages/AdminExportExcel';
import AdminExportPdf from './pages/AdminExportPdf';

// Analytics
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
        <Route path="revenue/daily" element={<AdminDailyRevenue />} />
        <Route path="revenue/weekly" element={<AdminWeeklyRevenue />} />
        <Route path="revenue/monthly" element={<AdminMonthlyRevenue />} />
        <Route path="revenue/yearly" element={<AdminYearlyRevenue />} />
        <Route path="revenue/custom" element={<AdminCustomRevenue />} />

        {/* Export */}
        <Route path="export/excel" element={<AdminExportExcel />} />
        <Route path="export/pdf" element={<AdminExportPdf />} />

        {/* Analytics */}
        <Route path="analytics/top-groups" element={<AdminTopGroups />} />
        <Route path="analytics/top-items" element={<AdminTopItems />} />

        {/* Menus */}
        <Route path="menus" element={<AdminMenusByShop />} />
        <Route path="menus/add" element={<AdminAddMenu />} />
        <Route path="menus/update" element={<AdminUpdateMenu />} />
        <Route path="menus/toggle" element={<AdminToggleMenu />} />

        {/* Menu Groups */}
        <Route path="menu-groups" element={<AdminMenuGroups />} />
        <Route path="menu-groups/create" element={<AdminCreateGroup />} />
        <Route path="menu-groups/rename" element={<AdminRenameGroup />} />
        <Route path="menu-groups/move" element={<AdminMoveMenuItem />} />

      </Route>

      {/* Unknown Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;