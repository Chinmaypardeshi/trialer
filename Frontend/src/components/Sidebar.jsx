import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  IndianRupee,
  BarChart3,
  UtensilsCrossed,
  FolderTree,
  Download,
} from "lucide-react";

function Sidebar() {

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
      title: "Revenue",
      icon: <IndianRupee size={20} />,
      path: "/admin/revenue/daily",
    },
    {
      title: "Analytics",
      icon: <BarChart3 size={20} />,
      path: "/admin/analytics/top-items",
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
      title: "Export",
      icon: <Download size={20} />,
      path: "/admin/export/pdf",
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col">

      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">
          🍽 Hotel Online
        </h1>

        <p className="text-sm text-gray-400">
          Admin Portal
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">

        {menu.map((item) => (
          <NavLink
            key={item.title}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "hover:bg-slate-800 text-gray-300"
              }`
            }
          >
            {item.icon}

            <span>{item.title}</span>

          </NavLink>
        ))}

      </nav>

    </aside>
  );
}

export default Sidebar;