import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard — 7snjami',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
