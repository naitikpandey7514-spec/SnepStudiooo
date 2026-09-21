// SnepStudio Secure File Download Utility
// Compliant with browser security standards (no fake silent desktop folder writing)

export interface DownloadResult {
  success: boolean;
  filename: string;
  method: 'filesystem_api' | 'browser_download';
  message: string;
}

/**
 * Downloads a file safely.
 * If running on a modern desktop browser supporting the File System Access API (showSaveFilePicker),
 * the user can pick a specific destination folder.
 * Otherwise, falls back to standard secure browser downloads.
 */
export async function downloadFile(
  fileUrlOrBlob: string | Blob,
  filename: string,
  options?: {
    suggestedFolder?: string;
    description?: string;
  }
): Promise<DownloadResult> {
  try {
    let blob: Blob;

    if (typeof fileUrlOrBlob === 'string') {
      // If it's a remote URL or object URL, fetch blob
      try {
        const res = await fetch(fileUrlOrBlob);
        blob = await res.blob();
      } catch {
        // Fallback for CORS-restricted or standard links
        const a = document.createElement('a');
        a.href = fileUrlOrBlob;
        a.download = filename;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return {
          success: true,
          filename,
          method: 'browser_download',
          message: `File "${filename}" sent to your browser's download manager.`
        };
      }
    } else {
      blob = fileUrlOrBlob;
    }

    // Try modern File System Access API if supported in desktop browser environment
    if ('showSaveFilePicker' in window) {
      try {
        const ext = filename.includes('.') ? filename.split('.').pop() : '';
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: ext ? [{
            description: options?.description || 'Photography Deliverable',
            accept: { [`application/${ext}`]: [`.${ext}`] }
          }] : undefined
        });

        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();

        return {
          success: true,
          filename,
          method: 'filesystem_api',
          message: `Saved "${filename}" directly to your selected folder.`
        };
      } catch (err: any) {
        // If user cancelled the picker, do nothing
        if (err.name === 'AbortError') {
          return {
            success: false,
            filename,
            method: 'filesystem_api',
            message: 'Save cancelled by user.'
          };
        }
        // If permission denied or failed, continue to fallback below
      }
    }

    // Standard secure browser download fallback
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    return {
      success: true,
      filename,
      method: 'browser_download',
      message: `Downloaded "${filename}" via your browser's secure download folder.`
    };
  } catch (error: any) {
    return {
      success: false,
      filename,
      method: 'browser_download',
      message: error?.message || 'Download encountered an unexpected issue.'
    };
  }
}
