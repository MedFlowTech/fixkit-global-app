'use client';
import React, { useState } from 'react';
import Pill from './Pill';
import Toasts, { Toast } from './Toast';


const CLOUD_BASE = process.env.NEXT_PUBLIC_FIXKIT_CLOUD_BASE || 'https://fixkit-global.vercel.app';


export default function BackgroundRemove() {
const [file, setFile] = useState<File|null>(null);
const [tolerance, setTolerance] = useState(24);
const [outUrl, setOutUrl] = useState<string|null>(null);
const [busy, setBusy] = useState(false);
const [mode, setMode] = useState<'local'|'cloud'>('local');
const [toasts, setToasts] = useState<Toast[]>([]);
const toast = (t: Omit<Toast,'id'>) => setToasts(xs=>[...xs,{...t,id:Date.now()+Math.random()}]);


const runLocal = async (f: File) => {
const img = new Image();
const srcUrl = URL.createObjectURL(f); img.src = srcUrl;
await new Promise<void>((res,rej)=>{img.onload=()=>res(); img.onerror=rej;});
const c=document.createElement('canvas'); const ctx=c.getContext('2d',{willReadFrequently:true})!;
c.width=img.width; c.height=img.height; ctx.drawImage(img,0,0);
const imageData = ctx.getImageData(0,0,c.width,c.height); const d=imageData.data;
const pick=(x:number,y:number)=>{const i=(y*c.width+x)*4; return [d[i],d[i+1],d[i+2]]};
const samples=[pick(0,0),pick(c.width-1,0),pick(0,c.height-1),pick(c.width-1,c.height-1)];
const dist=(r:number,g:number,b:number,s:number[])=>Math.sqrt((r-s[0])**2+(g-s[1])**2+(b-s[2])**2);
for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];const m=Math.min(dist(r,g,b,samples[0]),dist(r,g,b,samples[1]),dist(r,g,b,samples[2]),dist(r,g,b,samples[3])); if(m<tolerance)d[i+3]=0;}
ctx.putImageData(imageData,0,0);
const blob:Blob|null=await new Promise(res=>c.toBlob(res,'image/png')); if(!blob) throw new Error('encode failed');
URL.revokeObjectURL(srcUrl); return URL.createObjectURL(blob);
};


const runCloud = async (f: File) => {
const fd = new FormData(); fd.append('file',f); fd.append('tolerance',String(tolerance));
const res = await fetch(`${CLOUD_BASE}/api/bg-remove`,{method:'POST',body:fd});
if(!res.ok) throw new Error(`Cloud error ${res.status}`);
return URL.createObjectURL(await res.blob());
};


const run = async ()=>{
if(!file) return; setBusy(true);
try{
try{ setMode('local'); const url=await runLocal(file); setOutUrl(old=>{if(old)URL.revokeObjectURL(old); return url;}); toast({kind:'success',text:'Background removed locally.'}); }
catch{ setMode('cloud'); const url=await runCloud(file); setOutUrl(old=>{if(old)URL.revokeObjectURL(old); return url;}); toast({kind:'success',text:'Background removed via FixKit Cloud.'}); }
}catch(e:any){ toast({kind:'error',text:e.message||'Background removal failed'}); }
finally{ setBusy(false); }
};


return (
<section className="card p-4 my-6">
<h2 className="text-xl font-bold mb-2">Background Removal</h2>
<input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
<div className="flex items-center gap-2 text-sm my-2">
<label className="flex items-center gap-2">Tolerance <input type="range" min={4} max={64} step={1} value={tolerance} onChange={e=>setTolerance(Number(e.target.value))} /></label>
<Pill>{mode==='local'?'Local':'Cloud'}</Pill>
</div>
<button disabled={!file||busy} className="btn-primary" onClick={run}>{busy?'Processing…':'Remove background'}</button>
{outUrl && (<div className="mt-3 card p-3"><img src={outUrl} alt="bg-removed" className="max-h-72 rounded-lg border border-white/10"/><div className="mt-2"><a download="fixkit-bg-removed.png" href={outUrl} className="underline">Download PNG</a></div></div>)}
<Toasts items={toasts} />
</section>
);
}