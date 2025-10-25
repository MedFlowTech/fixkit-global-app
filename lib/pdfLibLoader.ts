export async function loadPdfLib(): Promise<any> {
if (typeof window === 'undefined') throw new Error('PDF tools require browser runtime');
const g = window as any;
if (g.pdfLib?.PDFDocument) return g.pdfLib;
const srcs = [
'https://esm.sh/pdf-lib@1.17.1?bundle',
'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js'
];
for (const src of srcs) {
try {
await new Promise<void>((resolve, reject) => {
const s = document.createElement('script');
s.src = src; s.async = true; s.onload = () => resolve(); s.onerror = reject; document.head.appendChild(s);
});
if (g.pdfLib?.PDFDocument) return g.pdfLib;
} catch {}
}
throw new Error('Failed to load pdf-lib from all sources');
}