'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function PageContainer({ children, className = '', noPadding = false }: PageContainerProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`min-h-dvh pb-24 ${noPadding ? '' : 'px-4 pt-4'} ${className}`}
    >
      {children}
    </motion.main>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Section({ children, className = '', delay = 0 }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-2xl">{icon}</span>}
        <h1 className="text-2xl font-bold gradient-text">{title}</h1>
      </div>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
    </div>
  );
}
