'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importRoast, ApiError } from '@/lib/api';

export default function ImportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => importRoast(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['roasts'] });
      router.push(`/roasts/${result.roastId}`);
    },
  });

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      mutation.mutate(file);
    },
    [mutation],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="mb-6">Import Roast</h2>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`card border-2 border-dashed transition ${
          dragOver ? 'border-roast-500 bg-roast-50' : 'border-bean-200'
        }`}
      >
        <div className="text-center py-8">
          <div className="text-5xl mb-3">📥</div>
          <p className="text-bean-700 mb-4">
            Drag and drop an <code className="font-mono">.json</code> file exported from Artisan.
          </p>
          <label className="btn-primary cursor-pointer">
            <input
              type="file"
              accept=".json,.csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            or browse to upload
          </label>
        </div>
      </div>

      {fileName && (
        <div className="mt-4 text-sm text-bean-600">
          File: <code className="font-mono">{fileName}</code>
        </div>
      )}

      {mutation.isPending && (
        <div className="mt-6 card bg-bean-100">
          <p className="text-bean-700">Parsing &amp; storing…</p>
        </div>
      )}

      {mutation.error && (
        <div className="mt-6 card border-roast-500 bg-roast-50">
          <p className="text-roast-700 font-medium mb-1">Import failed</p>
          <p className="text-sm text-bean-700">
            {mutation.error instanceof ApiError ? mutation.error.message : String(mutation.error)}
          </p>
        </div>
      )}

      <div className="mt-8 card bg-bean-100">
        <h3 className="text-base font-semibold mb-2">How to export from Artisan</h3>
        <ol className="text-sm text-bean-700 space-y-1 list-decimal pl-5">
          <li>Open your roast in Artisan.</li>
          <li>
            Go to <strong>File → Export → Artisan JSON (.json)</strong>.
          </li>
          <li>Drop the file here, or click the button above to browse for it.</li>
        </ol>
        <p className="text-xs text-bean-500 mt-3">
          v0.1 supports <code className="font-mono">.json</code> exports. CSV import is on the v0.2 roadmap.
        </p>
      </div>
    </div>
  );
}
