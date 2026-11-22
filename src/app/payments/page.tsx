'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CreditCard, ReceiptText } from 'lucide-react';
import { apiError, appointmentsApi, Appointment, money } from '@/lib/mediconnect';

export default function PaymentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsApi.mine()
      .then((appointments) => setItems(appointments.filter((item) => item.paymentRequired || item.paymentStatus)))
      .catch((error) => toast.error(apiError(error)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#4e8848]">Billing</p>
      <h1 className="mt-3 text-4xl font-bold text-[#153d30]">Appointment payments</h1>
      <p className="mt-3 text-sm text-slate-500">Payment status for appointments linked to your account.</p>
      {loading ? <p className="py-16 text-center text-slate-500">Loading payment information…</p> :
        items.length ? <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          {items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 last:border-0">
            <div className="flex items-center gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#eaf3eb] text-[#28764e]"><CreditCard size={19}/></div>
              <div><p className="font-bold text-[#153d30]">{item.serviceNameSnapshot}</p><p className="mt-1 text-xs text-slate-500">{new Date(item.startsAt).toLocaleString()}</p></div>
            </div>
            <div className="text-right"><p className="font-bold text-[#28764e]">{money(item.priceSnapshot,item.currencySnapshot)}</p><p className="mt-1 text-[11px] font-bold text-slate-500">{item.paymentStatus || (item.status === 'CONFIRMED' ? 'PAID' : 'UNPAID')}</p></div>
          </div>)}
        </div> : <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <ReceiptText className="mx-auto text-slate-300" size={35}/><h2 className="mt-4 font-bold text-slate-700">No appointment payments yet</h2>
          <p className="mt-2 text-sm text-slate-500">Payment details will appear here when you book a service that requires online payment.</p>
          <Link href="/appointments" className="mt-5 inline-block text-sm font-bold text-[#28764e]">View appointments</Link>
        </div>}
    </div>
  );
}
