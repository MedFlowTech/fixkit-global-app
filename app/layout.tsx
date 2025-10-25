import type { Metadata } from 'next';
import './globals.css';


export const metadata: Metadata = { title: 'FixKit Global', description: 'Convert • Compress • Clean • Combine — Local-first with FixKit Global Cloud.' };


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en">
<body>
<header className="max-w-5xl mx-auto px-4 py-5 flex items-center gap-3">
<div className="text-2xl font-extrabold">🛠️ FixKit Global</div>
<div className="ml-auto flex items-center gap-2">
<span className="pill">No sign-up required</span>
<span className="pill">Privacy-by-default</span>
</div>
</header>
<main className="max-w-5xl mx-auto px-4">{children}</main>
<footer className="max-w-5xl mx-auto px-4 py-10 text-sm opacity-80">
<div>© {new Date().getFullYear()} FixKit — Local-first tools with FixKit Global Cloud fallback.</div>
</footer>
</body>
</html>
);
}