'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function ActiveSidebar(props: any) {
  const pathname = usePathname();
  const activePage = pathname?.split('/').pop() || '';
  return <AdminSidebar {...props} activePage={activePage} />;
}
