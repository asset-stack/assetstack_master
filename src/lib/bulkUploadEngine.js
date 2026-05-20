// Memory-safe, concurrent, resumable bulk upload engine for 5000+ photos.
//
// Key design:
// - Process files in chunks; only hold previews for the first N (visible) files.
// - Run uploads concurrently with a fixed worker pool (default 6) — not all at once.
// - Each file has its own status: pending | uploading | uploaded | failed | analyzing | done.
// - Failed files can be retried without re-uploading the whole batch.
// - Yields control to the event loop frequently so the UI stays responsive.

export const FILE_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  UPLOADED: 'uploaded',
  FAILED: 'failed',
  ANALYZING: 'analyzing',
  ANALYZED: 'analyzed',
  ANALYSIS_FAILED: 'analysis_failed',
};

// Run an async task pool with a max concurrency.
// items: array. worker: async (item, index) => any. concurrency: number.
// onProgress: (completedCount, lastResult) => void.
export async function runPool(items, worker, { concurrency = 6, onProgress, signal } = {}) {
  const results = new Array(items.length);
  let nextIndex = 0;
  let completed = 0;

  const runWorker = async () => {
    while (true) {
      if (signal?.aborted) return;
      const i = nextIndex++;
      if (i >= items.length) return;
      try {
        results[i] = await worker(items[i], i);
      } catch (err) {
        results[i] = { __error: err.message || String(err) };
      }
      completed++;
      onProgress?.(completed, results[i], i);
      // Yield to keep UI responsive
      if (completed % 10 === 0) await new Promise((r) => setTimeout(r, 0));
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, runWorker);
  await Promise.all(workers);
  return results;
}

// Read EXIF for a small file. Returns { lat, lng, date } or {}.
// Designed to be cheap — uses an existing helper but is wrapped here so we can
// bypass EXIF for very large batches if needed.
export async function safeReadExif(file, readExifFn) {
  try {
    return await readExifFn(file);
  } catch {
    return {};
  }
}