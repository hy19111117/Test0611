'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navItems = [
  { label: '仪表盘', href: '/', icon: '📊' },
  { label: '成员管理', href: '/members', icon: '👨‍👩‍👧' },
  { label: '任务管理', href: '/tasks', icon: '✅' },
  { label: '积分记录', href: '/records', icon: '📝' },
  { label: '积分申请', href: '/requests', icon: '📈' },
  { label: '积分商城', href: '/products', icon: '🛒' },
  { label: '兑换记录', href: '/exchanges', icon: '🎁' },
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
            <span className="text-2xl">🏠</span>
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
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border-light">
          <button 
            onClick={onToggle}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-hover text-text-secondary transition-colors text-sm"
          >
            <span className="text-sm">◀</span>
            <span>收起菜单</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar