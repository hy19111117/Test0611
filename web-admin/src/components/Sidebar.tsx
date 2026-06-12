'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  FileText, 
  TrendingUp, 
  ShoppingCart, 
  Gift,
  ChevronLeft
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navItems = [
  { label: '仪表盘', href: '/', Icon: LayoutDashboard },
  { label: '成员管理', href: '/members', Icon: Users },
  { label: '任务管理', href: '/tasks', Icon: CheckSquare },
  { label: '积分记录', href: '/records', Icon: FileText },
  { label: '积分申请', href: '/requests', Icon: TrendingUp },
  { label: '积分商城', href: '/products', Icon: ShoppingCart },
  { label: '兑换记录', href: '/exchanges', Icon: Gift },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname()

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-sidebar lg:hidden transition-opacity duration-normal ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onToggle}
      />

      <aside
        className={`fixed left-0 top-0 h-full w-60 bg-white border-r border-border-light z-sidebar flex flex-col transition-transform duration-normal lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center px-5 py-5 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-card bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-bold text-text-primary text-base">家庭积分管理</h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item cursor-pointer ${isActive ? 'active' : ''}`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <item.Icon className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border-light">
          <button 
            onClick={onToggle}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-hover text-text-secondary transition-colors text-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>收起菜单</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar