'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: '首页', icon: '◈' },
  { href: '/analyze', label: '检测', icon: '◎' },
  { href: '/lab', label: '实验室', icon: '◇' },
  { href: '/agent', label: 'Agent', icon: '✦' },
  { href: '/dashboard', label: '数据', icon: '▣' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(
    navItems.findIndex((item) => item.href === pathname) || 0
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-3 mb-3 glass-card !rounded-2xl px-2 py-1">
        <div className="flex items-center justify-around">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActiveIndex(index)}
                className="relative flex flex-col items-center py-2 px-3 min-w-[56px]"
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-xl bg-accent/10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                <span
                  className={`text-xl mb-0.5 transition-colors duration-200 ${
                    isActive ? 'text-accent' : 'text-muted'
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? 'text-accent' : 'text-muted'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
