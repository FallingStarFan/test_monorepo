'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PageItems, PageRoutes } from '@/lib/pageRoutes';
import { useTheme } from '@/context/ThemeContext';

const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  
  // 只顯示在導覽列中的頁面
  const navItems = Object.values(PageItems)
    .filter(item => item.showInNav)
    .map(item => ({
      name: item.name,
      path: item.path,
      icon: item.icon
    }));

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-800 dark:text-white">測試前端</span>
          </div>
          
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.path
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center">
            <button
              id="dark-mode-toggle"
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={toggleTheme}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;