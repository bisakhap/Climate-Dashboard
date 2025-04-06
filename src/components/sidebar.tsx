"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useState, useEffect } from "react"

const Sidebar = () => {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Handle window resize to reset sidebar state on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Dashboard child items
  const dashboardItems = [
    {
      name: "Line Chart",
      href: "/line-chart",
      icon: <Image
      src="/line-chart.svg"
      alt="Line Chart"
      width={20}  
      height={20} 
    />
    },
    {
      name: "Bar Chart",
      href: "/bar-chart",
      icon: <Image
      src="/bar-chart.svg"
      alt="Bar Chart"
      width={20}  
      height={20} 
    />,
    },
    {
      name: "Scatter Plot",
      href: "/scatter-plot",
      icon: <Image
      src="/scatter-plot.svg"
      alt="Scatter Plot"
      width={20}  
      height={20} 
    />,
    },
  ]

  // Standalone menu
  const menuItems = [
    { name: "Project Stacks", href: "/documentation", icon: <Image
      src="/documentation.svg"
      alt="Documentation"
      width={20}  
      height={20} 
    />
  },
  ]

  const isDashboardActive = dashboardItems.some((item) => pathname === item.href)

  return (
    <>
      <button 
        className="md:hidden fixed top-4 left-4 z-50 bg-[#1C4E80] p-2 rounded-md text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {sidebarOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>
      
      <div className={`
        min-h-screen fixed top-0 left-0 z-40 
        w-64 bg-[#1C4E80] text-white font-bold p-5
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:relative
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <h2 className="text-xl font-bold mb-6">Climate Insights</h2>
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition 
                ${pathname === "/dashboard" || isDashboardActive ? "bg-blue-500" : "hover:bg-gray-700"}`}
            >
              Dashboard
            </Link>

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
      
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar