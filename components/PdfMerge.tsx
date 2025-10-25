'use client';
import React, { useEffect, useState } from 'react';
import Toasts, { Toast } from './Toast';
import { loadPdfLib } from '../lib/pdfLibLoader';


const CLOUD_BASE = process.env.NEXT_PUBLIC_FIXKIT_CLOUD_BASE || 'https://fixkit-global.vercel.app';


type FileItem = { id: string; file: File; name: string; size: number };


export default function PdfMerge(){
const [items, setItems] = useState<FileItem[]>([]);
const [busy, setBusy] = useState(false);
const [url, setUrl] = useState<string|null>(null);
const [engine, setEngine] = useState<'idle'|'loading'|'ready'|'cloud'>('idle');
const [toasts, setToasts] = useState<Toast[]>([]);
const toast = (t: Omit<Toast,'id'>)=>setToasts(xs=>[...xs,{...t,id:Date.now()+Math.random()}]);


useEffect(()=>{ let cancelled=false; (async()=>{ setEngine('loading'); try{ await loadPdfLib(); if(!cancelled) setEngine('ready'); } catch { if(!cancelled) setEngine('cloud'); }})(); return ()=>{cancelled=true}; },[]);


const onFiles = (list: FileList|null)=>{
if(!list) return; const arr = Array.from(list).filter(f=>f.type==='application/pdf'||f.name.endsWith('.pdf')).map((f,i)=>({id:`${Date.now()}-${i}`,file:f,name:f.name,size:f.size})); setItems(arr);
};
const move=(i:number,dir:-1|1)=>{const to=i+dir; if(to<0||to>=items.length) return; const next=items.slice(); const [m]=next.splice(i,1); next.splice(to,0,m); setItems(next);};
const onDragStart=(id:string)=>{ (document.activeElement as HTMLElement)?.blur?.(); (window as any).__dragId=id; };
const onDragOver=(e:React.DragEvent)=>e.preventDefault();
const onDrop=(id:string)=>{ const dragId=(window as any).__dragId as string; if(!dragId||dragId===id) return; const from=items.findIndex(x=>x.id===dragId); const to=items.findIndex(x=>x.id===id); if(from<0||to<0) return; const next=items.slice(); const [m]=next.splice(from,1); next.splice(to,0,m); setItems(next); (window as any).__dragId=null; };


const mergeLocal = async ()=>{ const { PDFDocument } = await loadPdfLib(); const out = await PDFDocument.create(); for(const it of items){ const bytes=new Uint8Array(await it.file.arrayBuffer()); const src=await PDFDocument.load(bytes); const pages=await out.copyPages(src,src.getPageIndices()); pages.forEach(p=>out.addPage(p)); } const merged=await out.save(); return new Blob([merged],{type:'application/pdf'}); };
const mergeCloud = async ()=>{ const fd=new FormData(); items.forEach((it,i)=>fd.append('files',it.file,`file-${i+1}.pdf`)); const res=await fetch(`${CLOUD_BASE}/api/merge-pdf`,{method:'POST',body:fd}); if(!res.ok) throw new Error(`Cloud merge failed ${res.status}`); return await res.blob(); };


const onRun=async()=>{ if(!items.length) return; setBusy(true); try{ let blob:Blob; if(engine==='ready'){ toast({kind:'info',text:'Merging locally…'}); blob=await mergeLocal(); } else { toast({kind:'info',text:'Using FixKit Global Cloud to merge…'}); blob=await mergeCloud(); } const u=URL.createObjectURL(blob); setUrl(old=>{if(old)URL.revokeObjectURL(old); return u;}); toast({kind:'success',text:'Merge complete.'}); } catch(e:any){ toast({kind:'error',text:e.message||'Merge failed'}); } finally { setBusy(false); } };


return (
<section className="card p-4 my-6">
<h2 className="text-xl font-bold mb-2">Combine PDFs (Merge)</h2>
<input type="file" accept="application/pdf" multiple onChange={e=>onFiles(e.target.files)} />
<div className="card p-2 mt-2">
{items.length===0? <div className="text-sm opacity-70">No PDFs selected yet.</div> : (
<ul className="space-y-1">
{items.map((it,idx)=> (
<li key={it.id} draggable onDragStart={()=>onDragStart(it.id)} onDragOver={onDragOver} onDrop={()=>onDrop(it.id)} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/10">
<div className="flex items-center gap-2 overflow-hidden">
<span className="cursor-grab">↕️</span>
<span className="truncate max-w-[300px]" title={it.name}>{idx+1}. {it.name}</span>
<span className="text-xs opacity-70">({Math.ceil(it.size/1024)} KB)</span>
</div>
<div className="flex items-center gap-2">
<button className="btn" onClick={()=>move(idx,-1)} disabled={idx===0}>↑</button>
<button className="btn" onClick={()=>move(idx, 1)} disabled={idx===items.length-1}>↓</button>
</div>
</li>
))}
</ul>
)}
</div>
<div className="text-xs opacity-80 mt-2">Engine: {engine==='ready'?'Local':engine==='loading'?'Loading…':'Cloud'}</div>
<button disabled={!items.length||busy} className="btn-primary mt-2" onClick={onRun}>{busy? 'Merging…' : `Merge ${items.length||''} PDF(s)`}</button>
{url && (<div className="mt-3 card p-3"><iframe src={url} title="merged" className="w-full h-72 rounded-lg border border-white/10" /><div className="mt-2"><a download="fixkit-merged.pdf" href={url} className="underline">Download merged PDF</a></div></div>)}
<Toasts items={toasts} />
</section>
);
}