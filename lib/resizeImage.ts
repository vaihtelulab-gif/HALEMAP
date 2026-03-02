export type ResizeToCoverOptions = {
  maxWidth: number;
  maxHeight: number;
  mimeType?: string;
  quality?: number;
};

type ImageSource = {
  width: number;
  height: number;
  close?: () => void;
};

async function decodeImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // Prefer ImageBitmap for performance when available.
  if (typeof createImageBitmap !== "undefined") {
    try {
      // `imageOrientation` is not in TS lib for all targets; keep it safe.
      return await createImageBitmap(file, { imageOrientation: "from-image" } as never);
    } catch {
      // Fall through to <img> decode.
    }
    return await createImageBitmap(file);
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function getDims(src: ImageBitmap | HTMLImageElement): ImageSource {
  if ("width" in src && "height" in src) return src as ImageSource;
  return { width: (src as HTMLImageElement).naturalWidth, height: (src as HTMLImageElement).naturalHeight };
}

export async function resizeImageToCover(file: File, opts: ResizeToCoverOptions): Promise<Blob> {
  const src = await decodeImage(file);
  const { width: srcW, height: srcH } = getDims(src);

  const targetAspect = opts.maxWidth / opts.maxHeight;
  const srcAspect = srcW / srcH;

  let sx = 0;
  let sy = 0;
  let sw = srcW;
  let sh = srcH;

  if (srcAspect > targetAspect) {
    // Too wide: crop left/right.
    sh = srcH;
    sw = Math.round(srcH * targetAspect);
    sx = Math.round((srcW - sw) / 2);
    sy = 0;
  } else if (srcAspect < targetAspect) {
    // Too tall: crop top/bottom.
    sw = srcW;
    sh = Math.round(srcW / targetAspect);
    sx = 0;
    sy = Math.round((srcH - sh) / 2);
  }

  const scale = Math.min(1, opts.maxWidth / sw, opts.maxHeight / sh);
  const outW = Math.max(1, Math.round(sw * scale));
  const outH = Math.max(1, Math.round(sh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available");

  ctx.drawImage(src as never, sx, sy, sw, sh, 0, 0, outW, outH);

  const mimeType = opts.mimeType ?? "image/webp";
  const quality = opts.quality ?? 0.85;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to encode image"))),
      mimeType,
      quality,
    );
  });

  if ("close" in src && typeof (src as ImageBitmap).close === "function") {
    (src as ImageBitmap).close();
  }

  return blob;
}

