// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useEffect, useState } from "react";
// import {
//   Brain,
//   LayoutDashboard,
//   Users,
//   FileText,
//   Cpu,
//   ClipboardCheck,
//   Settings,
//   LogOut,
//   Shield,
// } from "lucide-react";
// import clsx from "clsx";
// import { authApi } from "@/lib/api";

// const navItems = [
//   { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
//   { href: "/dashboard/patients", label: "Patients", icon: Users },
//   { href: "/dashboard/documents", label: "Documents", icon: FileText },
//   { href: "/dashboard/ai-engine", label: "AI Engine", icon: Cpu },
//   { href: "/dashboard/review", label: "Review & Approve", icon: ClipboardCheck },
//   { href: "/dashboard/audit", label: "Audit Log", icon: Shield },
//   { href: "/dashboard/settings", label: "Settings", icon: Settings },
// ];

// type User = {
//   id?: string;
//   name?: string;
//   email?: string;
//   role?: string;
// };

// export function Sidebar() {
//   const pathname = usePathname();
//   const [user, setUser] = useState<User>({
//     name: "Admin User",
//     role: "admin",
//   });

//   useEffect(() => {
//     async function loadUser() {
//       try {
//         const data = await authApi.me();
//         setUser(data);
//       } catch (error) {
//         console.error("Failed to load user:", error);
//       }
//     }

//     loadUser();
//   }, []);

//   function logout() {
//     localStorage.removeItem("tbi_access_token");
//     window.location.href = "/login";
//   }

//   const initials =
//     user.name
//       ?.split(" ")
//       .map((part) => part[0])
//       .join("")
//       .slice(0, 2)
//       .toUpperCase() || "AU";

//   return (
//     <aside className="w-64 bg-[#1e3a5f] text-white flex flex-col h-screen sticky top-0">
//       <div className="px-6 py-6 border-b border-white/10">
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
//             <Brain size={18} className="text-white" />
//           </div>

//           <div>
//             <p className="font-bold text-sm leading-tight">TBI Clinic</p>
//             <p className="text-xs text-white/60">AI Clinical Platform</p>
//           </div>
//         </div>
//       </div>

//       <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
//         {navItems.map(({ href, label, icon: Icon }) => {
//           const active =
//             pathname === href ||
//             (href !== "/dashboard" && pathname.startsWith(href));

//           return (
//             <Link
//               key={href}
//               href={href}
//               className={clsx(
//                 "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
//                 active
//                   ? "bg-white/20 text-white font-medium"
//                   : "text-white/70 hover:bg-white/10 hover:text-white"
//               )}
//             >
//               <Icon size={16} />
//               {label}
//             </Link>
//           );
//         })}
//       </nav>

//       <div className="px-4 py-4 border-t border-white/10">
//         <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
//           <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
//             {initials}
//           </div>

//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-medium truncate">
//               {user.name || "Admin User"}
//             </p>

//             <p className="text-xs text-white/60 capitalize">
//               {user.role || "admin"}
//             </p>
//           </div>

//           <button
//             onClick={logout}
//             title="Logout"
//             className="text-white/60 hover:text-white transition-colors"
//           >
//             <LogOut size={15} />
//           </button>
//         </div>
//       </div>
//     </aside>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Brain,
  LayoutDashboard,
  Users,
  FileText,
  Cpu,
  ClipboardCheck,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
} from "lucide-react";
import clsx from "clsx";
import { authApi } from "@/lib/api";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/patients", label: "Patients", icon: Users },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/ai-engine", label: "AI Engine", icon: Cpu },
  { href: "/dashboard/review", label: "Review & Approve", icon: ClipboardCheck },
  { href: "/dashboard/audit", label: "Audit Log", icon: Shield },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User>({
    name: "Admin User",
    role: "admin",
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await authApi.me();
        setUser(data);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    }

    loadUser();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function logout() {
    localStorage.removeItem("tbi_access_token");
    window.location.href = "/login";
  }

  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AU";

  const sidebarContent = (
    <>
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>

          <div>
            <p className="font-bold text-sm leading-tight">TBI Clinic</p>
            <p className="text-xs text-white/60">AI Clinical Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-white/20 text-white font-medium"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.name || "Admin User"}
            </p>

            <p className="text-xs text-white/60 capitalize">
              {user.role || "admin"}
            </p>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="text-white/60 hover:text-white transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a5f] text-white">
            <Brain size={17} />
          </div>
          <p className="font-bold text-slate-900">TBI Clinic</p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg border p-2 text-slate-700"
        >
          <Menu size={20} />
        </button>
      </div>

      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col bg-[#1e3a5f] text-white lg:flex">
        {sidebarContent}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />

          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-[#1e3a5f] text-white shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white"
            >
              <X size={18} />
            </button>

            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}