'use client';
import React, { useEffect, useState } from 'react';
import Pill from './Pill';


function useImageWorker() {
const [busy, setBusy] = useState(false);
const [blobUrl, setBlobUrl] = useState<string|null>(null);
const [meta, setMeta] = useState<{ sizeKB?: number; w?: number; h?: number }>({});
const process = async (file: File, opts: { format: 'image/jpeg'|'image/webp'|'image/png'; quality: number; maxW?: number; maxH?: number; }) => {
setBusy(true);
try {
const img = new Image();
const srcUrl = URL.createObjectURL(new Blob([await file.arrayBuffer()]));
await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = srcUrl; });
const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d')!;
let { width, height } = img; const { maxW, maxH } = opts;
if (maxW || maxH) { const sW = maxW ? maxW/width : 1; const sH = maxH ? maxH/height : 1; const s = Math.min(sW||1,sH||1,1); width=Math.round(width*s); height=Math.round(height*s); }
canvas.width = width; canvas.height = height; ctx.drawImage(img, 0, 0, width, height);
const blob: Blob|null = await new Promise(res => canvas.toBlob(res, opts.format, opts.quality));
if (!blob) throw new Error('encode failed');
const outUrl = URL.createObjectURL(blob);
setBlobUrl(old => { if (old) URL.revokeObjectURL(old); return outUrl; });
setMeta({ sizeKB: Math.round(blob.size/1024), w: width, h: height }); URL.revokeObjectURL(srcUrl);
} finally { setBusy(false); }
};
const clear = () => { setBlobUrl(old => { if (old) URL.revokeObjectURL(old); return null; }); setMeta({}); };
return { busy, blobUrl, meta, process, clear };
}


export default function ImageTool() {
const { busy, blobUrl, meta, process, clear } = useImageWorker();
const [file, setFile] = useState<File|null>(null);
const [format, setFormat] = useState<'image/jpeg'|'image/webp'|'image/png'>('image/webp');
const [quality, setQuality] = useState(0.8);
const [maxW, setMaxW] = useState<number|undefined>();
const [maxH, setMaxH] = useState<number|undefined>();
return (
<section className="card p-4 my-6">
<h2 className="text-xl font-bold mb-2">Image Convert & Compress</h2>
<input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
<div className="flex flex-wrap items-center gap-3 text-sm mt-3">
<label className="flex items-center gap-2">Format<select className="card px-2 py-1" value={format} onChange={e=>setFormat(e.target.value as any)}><option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option></select></label>
<label className="flex items-center gap-2">Quality<input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={e=>setQuality(Number(e.target.value))} /><span>{Math.round(quality*100)}%</span></label>
<label className="flex items-center gap-2">Max W<input type="number" className="card px-2 py-1 w-24" placeholder="auto" value={maxW??''} onChange={e=>setMaxW(e.target.value?Number(e.target.value):undefined)} /></label>
<label className="flex items-center gap-2">Max H<input type="number" className="card px-2 py-1 w-24" placeholder="auto" value={maxH??''} onChange={e=>setMaxH(e.target.value?Number(e.target.value):undefined)} /></label>
<Pill>Local • Private</Pill>
</div>
<div className="flex gap-2 mt-3">
<button disabled={!file||busy} className="btn-primary" onClick={()=>file&&process(file,{format,quality,maxW,maxH})}>{busy?'Processing…':'Convert / Compress'}</button>
<button className="btn" onClick={clear}>Reset</button>
</div>
{blobUrl && (
<div className="mt-3 card p-3">
<div className="text-sm opacity-80 mb-2">Output ({meta.w}×{meta.h}, ~{meta.sizeKB} KB)</div>
<img src={blobUrl} alt="output" className="max-h-72 rounded-lg border border-white/10" />
<div className="mt-2"><a download="fixkit-output" href={blobUrl} className="underline">Download result</a></div>
</div>
)}
</section>
);
}