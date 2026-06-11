import React from 'react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { label: '仪表盘', href: '/', icon: '📊' },
  { label: '家庭成员', href: '/members', icon: '👨👩👧👦' },
  { label: '任务管理', href: '/tasks', icon: '✅' },
  { label: '积分申请', href: '/requests', icon: '📝' },
  { label: '积分明细', href: '/records', icon: '📈' },
  { label: '积分商城', href: '/products', icon: '🛒' },
  { label: '兑换申请', href: '/exchanges', icon: '🎁' }
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50 ${
        isOpen ? 'w-64' : 'w-0 lg:w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className={isOpen ? 'opacity-100' : 'lg:opacity-100 opacity-0'}>
              家庭积分管理
            </span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={isOpen ? 'opacity-100' : 'lg:opacity-100 opacity-0'}>
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span>{isOpen ? '◀' : '▶'}</span>
            <span className={isOpen ? 'opacity-100' : 'lg:opacity-100 opacity-0'}>
              {isOpen ? '收起菜单' : '展开菜单'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
