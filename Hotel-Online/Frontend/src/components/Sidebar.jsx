import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  IndianRupee,
  BarChart3,
  UtensilsCrossed,
  FolderTree,
  FileDown,
  FileUp,
  Award,
  Store,
  X,
} from "lucide-react";

function Sidebar({ isOpen = false, onClose = () => {} }) {
  const menu = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/admin/dashboard",
    },
    {
      title: "Orders",
      icon: <ShoppingCart size={20} />,
      path: "/admin/orders",
    },
    {
      title: "Excel Import",
      icon: <FileUp size={20} />,
      path: "/admin/import/excel",
    },
    {
      title: "Export Reports",
      icon: <FileDown size={20} />,
      path: "/admin/export/excel",
    },
    {
      title: "Salary Certificate",
      icon: <Award size={20} />,
      path: "/admin/salary-certificate",
    },
    {
      title: "Revenue",
      icon: <IndianRupee size={20} />,
      path: "/admin/revenue",
    },
    {
      title: "Analytics",
      icon: <BarChart3 size={20} />,
      path: "/admin/analytics",
    },
    {
      title: "Menus",
      icon: <UtensilsCrossed size={20} />,
      path: "/admin/menus",
    },
    {
      title: "Menu Groups",
      icon: <FolderTree size={20} />,
      path: "/admin/menu-groups",
    },
    {
      title: "Branches / Shops",
      icon: <Store size={20} />,
      path: "/admin/shops",
    },
  ];

  const sidebarContent = (
    <>
      <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-white">
            <span className="text-2xl">🍽</span> Hotel Online
          </h1>
          <p className="text-xs text-orange-400 font-semibold tracking-wider uppercase mt-1">
            Admin Portal
          </p>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Navigation Drawer"
          className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
        {menu.map((item) => (
          <NavLink
            key={item.title}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-orange-500 text-white shadow-sm font-semibold"
                  : "hover:bg-slate-800 text-slate-300 hover:text-white"
              }`
            }
          >
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3.5 border-t border-slate-800 text-xs text-slate-500 text-center">
        <span>v1.0.0 • Maharashtrian Thali</span>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Permanent Sidebar (Pinned) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white h-screen flex-col shrink-0 border-r border-slate-800">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Off-Canvas Drawer (Slide-In) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside className="relative z-50 w-72 max-w-[85vw] bg-slate-900 text-white h-screen flex flex-col shadow-2xl animate-in slide-in-from-left duration-250 border-r border-slate-800">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

export default Sidebar;
