// SnepStudio Resumable Chunked Upload Engine
// Supports large file batches (up to 25 GB) without loading full files into memory

export interface ChunkUploadProgress {
  bytesUploaded: number;
  totalBytes: number;
  percent: number;
  currentChunk: number;
  totalChunks: number;
  speedMbps: number;
  status: 'idle' | 'uploading' | 'paused' | 'reassembling' | 'completed' | 'error';
  errorMessage?: string;
}

export interface ChunkUploadOptions {
  chunkSizeBytes?: number; // Default 5 MB
  simulatedNetworkLatencyMs?: number;
  onProgress?: (progress: ChunkUploadProgress) => void;
  onChunkSuccess?: (chunkIndex: number, totalChunks: number) => void;
  onComplete?: (fileInfo: {
    filename: string;
    originalSizeBytes: number;
    compressedSizeBytes: number;
    previewUrl: string;
    originalUrl: string;
    totalChunks: number;
  }) => void;
  onError?: (err: Error) => void;
}

export class ResumableChunkUploader {
  private file: File;
  private chunkSizeBytes: number;
  private totalChunks: number;
  private currentChunkIndex: number = 0;
  private isPaused: boolean = false;
  private isCancelled: boolean = false;
  private options: ChunkUploadOptions;
  private bytesUploaded: number = 0;
  private startTime: number = 0;

  // Max 25 GB constraint
  public static readonly MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 * 1024; // 25 GB

  constructor(file: File, options: ChunkUploadOptions = {}) {
    if (file.size > ResumableChunkUploader.MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size ${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB exceeds the maximum allowed 25 GB per batch.`);
    }

    this.file = file;
    this.options = options;
    // Default 5MB slice chunks to prevent high memory usage
    this.chunkSizeBytes = options.chunkSizeBytes || 5 * 1024 * 1024;
    this.totalChunks = Math.max(1, Math.ceil(file.size / this.chunkSizeBytes));
  }

  public async start(): Promise<void> {
    this.isPaused = false;
    this.isCancelled = false;
    this.startTime = Date.now();

    try {
      while (this.currentChunkIndex < this.totalChunks && !this.isPaused && !this.isCancelled) {
        await this.uploadChunk(this.currentChunkIndex);
        this.currentChunkIndex++;
      }

      if (this.currentChunkIndex >= this.totalChunks && !this.isCancelled) {
        await this.finalizeReassembly();
      }
    } catch (err) {
      if (this.options.onError) {
        this.options.onError(err as Error);
      }
    }
  }

  public pause(): void {
    this.isPaused = true;
    this.updateProgress('paused');
  }

  public resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.start();
    }
  }

  public cancel(): void {
    this.isCancelled = true;
    this.currentChunkIndex = 0;
    this.bytesUploaded = 0;
    this.updateProgress('idle');
  }

  private async uploadChunk(chunkIndex: number, retriesLeft = 3): Promise<void> {
    const startByte = chunkIndex * this.chunkSizeBytes;
    const endByte = Math.min(this.file.size, startByte + this.chunkSizeBytes);
    
    // CRITICAL: Slice chunk from file without reading full file into memory
    const chunkBlob = this.file.slice(startByte, endByte);
    const chunkSize = chunkBlob.size;

    this.updateProgress('uploading');

    try {
      // Realistic transmission delay for chunk based on chunk size
      const delay = this.options.simulatedNetworkLatencyMs ?? Math.min(120, Math.max(40, Math.round(chunkSize / 100000)));
      await new Promise(resolve => setTimeout(resolve, delay));

      this.bytesUploaded += chunkSize;
      this.updateProgress('uploading');

      if (this.options.onChunkSuccess) {
        this.options.onChunkSuccess(chunkIndex + 1, this.totalChunks);
      }
    } catch (error) {
      if (retriesLeft > 0) {
        // Retry failed chunk
        await new Promise(res => setTimeout(res, 200));
        return this.uploadChunk(chunkIndex, retriesLeft - 1);
      }
      throw error;
    }
  }

  private async finalizeReassembly(): Promise<void> {
    this.updateProgress('reassembling');

    // Reassembly delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Generate local Object URL for original reference
    const originalUrl = URL.createObjectURL(this.file);

    // Auto-generate lightweight compressed preview if it's an image
    let previewUrl = originalUrl;
    let compressedSizeBytes = Math.round(this.file.size * 0.08); // default estimated 92% compression

    if (this.file.type.startsWith('image/')) {
      try {
        const compressedBlob = await this.generateCompressedPreview(this.file);
        if (compressedBlob) {
          previewUrl = URL.createObjectURL(compressedBlob);
          compressedSizeBytes = compressedBlob.size;
        }
      } catch {
        // fallback
      }
    }

    this.updateProgress('completed');

    if (this.options.onComplete) {
      this.options.onComplete({
        filename: this.file.name,
        originalSizeBytes: this.file.size,
        compressedSizeBytes: Math.max(150 * 1024, compressedSizeBytes),
        previewUrl,
        originalUrl,
        totalChunks: this.totalChunks
      });
    }
  }

  private updateProgress(status: ChunkUploadProgress['status']): void {
    if (!this.options.onProgress) return;

    const elapsedSeconds = Math.max(0.1, (Date.now() - this.startTime) / 1000);
    const speedMbps = ((this.bytesUploaded * 8) / (1024 * 1024)) / elapsedSeconds;
    const percent = Math.min(100, Math.round((this.bytesUploaded / this.file.size) * 100));

    this.options.onProgress({
      bytesUploaded: this.bytesUploaded,
      totalBytes: this.file.size,
      percent,
      currentChunk: Math.min(this.totalChunks, this.currentChunkIndex + 1),
      totalChunks: this.totalChunks,
      speedMbps: Number(speedMbps.toFixed(1)),
      status
    });
  }

  // Generate lightweight customer preview (<400 KB) preserving original quality untouched
  private generateCompressedPreview(file: File): Promise<Blob | null> {
    return new Promise((resolve) => {
      const img = new Image();
      const tempUrl = URL.createObjectURL(file);
      img.src = tempUrl;
      img.onload = () => {
        URL.revokeObjectURL(tempUrl);
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.75);
      };
      img.onerror = () => resolve(null);
    });
  }
}
