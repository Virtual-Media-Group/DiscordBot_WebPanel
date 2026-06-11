'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UpdateChecker from '@/components/UpdateChecker';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="sidebar-title">Personal</div>
        <Link href="/" className={`sidebar-item ${pathname === '/' ? 'active' : ''}`}>
          Applications
        </Link>
        <Link href="/admin" className={`sidebar-item ${pathname === '/admin' ? 'active' : ''}`}>
          Admin Settings
        </Link>
      </div>
      <div className="main-content">
        <div className="topbar">
          Discord Bot Developer Portal
        </div>
        <div className="content-area">
          <UpdateChecker />
          {children}
        </div>
      </div>
    </div>
  );
}
