"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const Sidebar = () => {
  const pathname = usePathname()

  // Dashboard child items
  const dashboardItems = [
    {
      name: "Line Chart",
      href: "/line-chart",
      icon: <img src="/line-chart.svg" alt="Line Chart" width={20} height={20} />,
    },
    {
      name: "Bar Chart",
      href: "/bar-chart",
      icon: <img src="/bar-chart.svg" alt="Bar Chart" width={20} height={20} />,
    },
    {
      name: "Scatter Plot",
      href: "/scatter-plot",
      icon: <img src="/scatter-plot.svg" alt="Scatter Plot" width={20} height={20} />,
    },
  ]

  // Standalone menu
  const menuItems = [
    { name: "Documentation", href: "/documentation", icon: <img src="/documentation.svg" alt="Documentation" width={20} height={20} /> },
  ]

  
  const isDashboardActive = dashboardItems.some((item) => pathname === item.href)

  return (
    <div className="min-h-screen w-64 bg-[#1C4E80] text-white font-bold p-5">
      <h2 className="text-xl font-bold mb-6">Climate Insights</h2>
      <ul className="space-y-2">
        {/* Dashboard */}
        <li>
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition 
              ${pathname === "/dashboard" || isDashboardActive ? "bg-blue-500" : "hover:bg-gray-700"}`}
          >
            Dashboard
          </Link>

          {/* Dashboard items */}
          <ul className="pl-4 mt-1 space-y-1">
            {dashboardItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition 
                    ${pathname === item.href ? "bg-blue-500" : "hover:bg-gray-700"}`}
                >
                  {item.icon} {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>

        {menuItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition 
                ${pathname === item.href ? "bg-blue-500" : "hover:bg-gray-700"}`}
            >
              {item.icon} {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar

