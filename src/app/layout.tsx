import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import Providers from './providers';
import { Toaster } from 'react-hot-toast';
import SiteHeader from '@/components/mediconnect/SiteHeader';
import SiteFooter from '@/components/mediconnect/SiteFooter';
export const metadata:Metadata={title:'MediConnect | Healthcare, connected',description:'Find doctors, compare healthcare services and manage appointments securely with MediConnect.'};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="en"><body className="min-h-screen bg-[#f7faf8] font-sans text-slate-800"><Providers><SiteHeader/><main className="min-h-[70vh]">{children}</main><SiteFooter/></Providers><Toaster position="top-right"/></body></html>}
