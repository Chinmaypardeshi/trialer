import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import AdminOrders from './pages/AdminOrders'
import AdminOrderDetails from './pages/AdminOrderDetails'
import AdminDailyRevenue from './pages/AdminDailyRevenue'
import AdminWeeklyRevenue from './pages/AdminWeeklyRevenue'
import AdminMonthlyRevenue from './pages/AdminMonthlyRevenue'
import AdminYearlyRevenue from './pages/AdminYearlyRevenue'
import AdminCustomRevenue from './pages/AdminCustomRevenue'
import AdminExportExcel from './pages/AdminExportExcel'
import AdminExportPdf from './pages/AdminExportPdf'
import AdminTopGroups from './pages/AdminTopGroups'
import AdminTopItems from './pages/AdminTopItems'
import AdminMenusByShop from './pages/AdminMenusByShop'
import AdminAddMenu from './pages/AdminAddMenu'
import AdminUpdateMenu from './pages/AdminUpdateMenu'
import AdminToggleMenu from './pages/AdminToggleMenu'

function App() {
  return(
  <Routes>

    {/* Default route */}
    <Route path ="/" element={<Navigate to = "/login" />} />

    {/* Public route */}
    <Route path ="/login" element={<Login />} />

    {/* Protected Admin route */}
    <Route
      path ="/admin"
      element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      {/* Child Routes */}
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="orders" element={<AdminOrders />} />
    <Route path="orders/:orderId" element={<AdminOrderDetails />} />
    <Route path="revenue/daily" element={<AdminDailyRevenue />} />
    <Route path="revenue/weekly" element={<AdminWeeklyRevenue />} />
    <Route path="revenue/monthly" element={<AdminMonthlyRevenue />} />
    <Route path="revenue/yearly" element={<AdminYearlyRevenue />} />
    <Route path="revenue/custom" element={<AdminCustomRevenue />} />
    <Route path="export/excel" element={<AdminExportExcel />} />
    <Route path="export/pdf" element={<AdminExportPdf />} />
    <Route path="analytics/top-groups" element={<AdminTopGroups />} />
    <Route path="analytics/top-items" element={<AdminTopItems />} />
    <Route path="menus" element={<AdminMenusByShop />} />
    <Route path="menus/add" element={<AdminAddMenu />} />
    <Route path="menus/update" element={<AdminUpdateMenu />} />
    <Route path="menus/toggle" element={<AdminToggleMenu />} />
    
    
    </Route>




  </Routes>
  )
}

export default App
