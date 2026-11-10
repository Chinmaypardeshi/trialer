import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import {
  LogOut,
  UserCircle2,
  Menu,
  LayoutDashboard,
  ShoppingCart,
  Store,
  IndianRupee,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";

function AdminLayout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200 overflow-hidden">
      {/* Sidebar: Pinned on Desktop, Slide-In Drawer on Mobile */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex justify-between items-center shrink-0 transition-colors duration-200 z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="lg:hidden p-2 -ml-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <Menu size={20} />
            </button>

            <span className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 tracking-tight">
              <span>🍽</span>
              <span className="hidden xs:inline">Hotel Online</span>
            </span>
            <span className="text-gray-300 dark:text-slate-600 hidden sm:inline">/</span>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60 uppercase tracking-wider">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle (Dark / Light) */}
            <ThemeToggle showLabel={false} />

            {/* Admin User Badge */}
            <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 border-l border-r border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300">
              <UserCircle2 size={22} className="text-slate-700 dark:text-slate-300" />
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-gray-800 dark:text-slate-100 leading-none">Admin</p>
                <p className="text-[10px] text-gray-400 dark:text-slate-400 mt-0.5">Manager</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-800/40 transition cursor-pointer"
              title="Logout from session"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Current Page View */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 pb-20 lg:pb-8 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 transition-colors duration-200">
          <Outlet />
        </main>

        {/* Mobile Bottom Quick Navigation Bar (< lg screens) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex justify-around items-center shadow-lg">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? "text-orange-600 dark:text-orange-400 scale-105"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`
            }
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? "text-orange-600 dark:text-orange-400 scale-105"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`
            }
          >
            <ShoppingCart size={18} />
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/admin/shops"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? "text-orange-600 dark:text-orange-400 scale-105"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`
            }
          >
            <Store size={18} />
            <span>Branches</span>
          </NavLink>

          <NavLink
            to="/admin/revenue"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? "text-orange-600 dark:text-orange-400 scale-105"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`
            }
          >
            <IndianRupee size={18} />
            <span>Revenue</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <Menu size={18} />
            <span>More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default AdminLayout;
