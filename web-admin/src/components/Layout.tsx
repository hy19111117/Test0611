'use client'
import React, { useState } from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
  title: string
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-bg-page">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-border px-6 py-4">
          <div className="max-w-page mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-heading text-heading-lg font-bold text-text">{title}</h1>
              <p className="text-small-muted mt-0.5">家庭积分管理系统</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center cursor-pointer hover:bg-primary-100 transition-colors">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 animate-fadeIn">
          <div className="max-w-page mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
