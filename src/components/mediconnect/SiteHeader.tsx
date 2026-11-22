'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, CalendarDays, LayoutDashboard, LogOut, Menu, Stethoscope, UserRound, X } from 'lucide-react';
import { clearSession } from '@/lib/mediconnect';

export default function SiteHeader(){
 const [role,setRole]=useState<string|null>(null); const [open,setOpen]=useState(false); const pathname=usePathname(); const router=useRouter();
 useEffect(()=>{const sync=()=>setRole(localStorage.getItem('mediconnect_role'));sync();window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[pathname]);
 const logout=()=>{clearSession();setRole(null);setOpen(false);router.push('/');};
 const links=[['Find doctors','/doctors'],['My appointments','/appointments'],['Notifications','/notifications'],['Payments','/payments'],['My profile','/profile']];
 return <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
  <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-8 px-5 lg:px-8">
   <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight text-[#123f32]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f2eb] text-[#26734e]"><Activity size={23}/></span><span>MediConnect<span className="text-[#4e8848]">.</span><small className="ml-2 hidden text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400 sm:inline">Healthcare, connected</small></span></Link>
   <nav className="ml-auto hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">{links.map(([label,href])=><Link key={href} href={href} className="transition hover:text-[#28764e]">{label}</Link>)}</nav>
   <div className="ml-auto hidden items-center gap-3 md:flex">
    {role?<><Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-[#28764e] hover:text-[#28764e]"><LayoutDashboard size={16}/> Dashboard</Link><button onClick={logout} className="rounded-full p-2.5 text-slate-500 hover:bg-slate-100" aria-label="Sign out"><LogOut size={18}/></button></>:<><Link href="/login" className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-[#28764e]">Log in</Link><Link href="/register" className="rounded-full bg-[#123f32] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1b5944]">Create account</Link></>}
   </div>
   <button onClick={()=>setOpen(!open)} className="ml-auto rounded-lg p-2 text-slate-700 md:hidden" aria-label="Toggle menu">{open?<X/>:<Menu/>}</button>
  </div>
  {open&&<div className="border-t border-slate-100 bg-white px-5 py-5 md:hidden"><div className="flex flex-col gap-4">{links.map(([label,href])=><Link onClick={()=>setOpen(false)} key={href} href={href} className="text-sm font-semibold text-slate-700">{label}</Link>)}{role?<><Link onClick={()=>setOpen(false)} href="/dashboard" className="text-sm font-semibold text-slate-700">Dashboard</Link><button onClick={logout} className="text-left text-sm font-semibold text-rose-600">Sign out</button></>:<><Link onClick={()=>setOpen(false)} href="/login" className="text-sm font-semibold text-slate-700">Log in</Link><Link onClick={()=>setOpen(false)} href="/register" className="text-sm font-semibold text-[#28764e]">Create account</Link></>}</div></div>}
 </header>
}
