'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

/** A template re-mounts on every navigation, which gives each route an enter transition. */
export default function DashboardTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="page-transition"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
