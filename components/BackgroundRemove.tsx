"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function BackgroundRemove() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"local" | "cloud">("cloud");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setResultUrl(null);
  };

  async function run() {
    if (!file) return alert("Please select an image first.");
    setBusy(true);
    setResultUrl(null);

    try {
      if (mode === "local") {
        // Local mode placeholder
        setTimeout(() => {
          alert("Local background removal not yet integrated.");
          setBusy(false);
        }, 1000);
        return;
      }

      const CLOUD_BASE = process.env.NEXT_PUBLIC_FIXKIT_CLOUD_BASE;
      if (!CLOUD_BASE) throw new Error("Cloud API not configured.");

      const res = await fetch(`${CLOUD_BASE}/api/bg-remove`, {
        method: "POST",
        body: file,
      });
      if (!res.ok) throw new Error(`Cloud request failed (${res.status})`);

      const data = await res.json();
      if (data.ok && data.url) {
        setResultUrl(data.url);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-center">Remove Background</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full border p-2 rounded-md"
      />

      <div className="flex gap-2">
        <Button disabled={!file || busy} onClick={run}>
          {busy ? "Processing…" : "Remove Background"}
        </Button>
        <select
          className="border p-2 rounded-md"
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
        >
          <option value="cloud">Cloud (HD)</option>
          <option value="local">Local (fast)</option>
        </select>
      </div>

      {file && (
        <div className="mt-6 grid md:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col items-center">
            <p className="font-medium mb-2">Original</p>
            <img
              src={URL.createObjectURL(file)}
              alt="original"
              className="max-h-96 rounded-lg shadow"
            />
          </div>

          {resultUrl && (
            <div className="flex flex-col items-center">
              <p className="font-medium mb-2">Result (Background Removed)</p>
              <img
                src={resultUrl}
                alt="result"
                className="max-h-96 rounded-lg shadow border border-gray-200"
              />
              <a
                href={resultUrl}
                download="fixkit-removed.png"
                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Download Result
              </a>
            </div>
          )}
        </div>
      )}

      {!file && <p className="text-gray-500 mt-4">Select an image to start.</p>}
    </div>
  );
}
