'use client';
import React from 'react';
export type Toast = { id: number; kind: 'info'|'success'|'error'; text: string };
export default function Toasts({ items }: { items: Toast[] }) {
return (
<div className="space-y-1 mt-2">
{items.slice(-3).map(t => (
<div key={t.id} className={`text-sm ${t.kind==='error'?'text-rose-400':t.kind==='success'?'text-green-400':'text-sky-300'}`}>• {t.text}</div>
))}
</div>
);
}