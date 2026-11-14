import React, { useState, useRef, useEffect } from 'react';

export default function ImageCropperModal({ isOpen, imageSrc, onClose, onSave }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState('circle'); // 'circle' | 'square'
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        resetTransform();
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  const resetTransform = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setAspectRatio('circle');
  };

  useEffect(() => {
    drawCanvas();
  }, [scale, rotation, position, aspectRatio]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    const size = 320;
    canvas.width = size;
    canvas.height = size;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Save context
    ctx.save();

    // Center and apply transforms
    ctx.translate(size / 2 + position.x, size / 2 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Draw image centered
    const imgRatio = img.width / img.height;
    let drawW = size;
    let drawH = size;
    if (imgRatio > 1) {
      drawW = size * imgRatio;
    } else {
      drawH = size / imgRatio;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();

    // Draw circular / square crop overlay guide
    ctx.save();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)';
    ctx.lineWidth = 3;

    if (aspectRatio === 'circle') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
      ctx.stroke();

      // Darken outside circle
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.rect(0, 0, size, size);
      ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2, true);
      ctx.fill();
    } else {
      ctx.strokeRect(4, 4, size - 8, size - 8);
    }
    ctx.restore();
  };

  // Dragging / Panning handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSaveCrop = () => {
    if (!imageRef.current) return;
    const finalCanvas = document.createElement('canvas');
    const finalSize = 256;
    finalCanvas.width = finalSize;
    finalCanvas.height = finalSize;
    const fCtx = finalCanvas.getContext('2d');
    const img = imageRef.current;

    fCtx.save();
    if (aspectRatio === 'circle') {
      fCtx.beginPath();
      fCtx.arc(finalSize / 2, finalSize / 2, finalSize / 2, 0, Math.PI * 2);
      fCtx.clip();
    }

    const scaleFactor = finalSize / 320;
    fCtx.translate(finalSize / 2 + position.x * scaleFactor, finalSize / 2 + position.y * scaleFactor);
    fCtx.rotate((rotation * Math.PI) / 180);
    fCtx.scale(scale, scale);

    const imgRatio = img.width / img.height;
    let drawW = finalSize;
    let drawH = finalSize;
    if (imgRatio > 1) {
      drawW = finalSize * imgRatio;
    } else {
      drawH = finalSize / imgRatio;
    }

    fCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    fCtx.restore();

    const dataUrl = finalCanvas.toDataURL('image/jpeg', 0.9);
    onSave(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--nlm-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-sm">
              <i className="fa-solid fa-crop-simple"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--nlm-text-primary)]">
                Editor Foto Profil
              </h3>
              <p className="text-[11px] text-[var(--nlm-text-tertiary)]">
                Atur posisi, skala, dan rotasi sebelum disimpan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)] flex items-center justify-center transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Canvas Area with drag-and-drop support */}
        <div className="p-6 bg-slate-950 flex flex-col items-center justify-center relative select-none overflow-hidden">
          <div 
            className="relative cursor-move rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/60"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            title="Klik dan geser foto untuk mengatur posisi"
          >
            <canvas ref={canvasRef} className="block w-72 h-72 sm:w-80 sm:h-80" />
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center space-x-1.5">
            <i className="fa-solid fa-arrows-up-down-left-right text-[10px]"></i>
            <span>Geser gambar dengan kursor untuk mengatur posisi</span>
          </div>
        </div>

        {/* Controls */}
        <div className="p-5 space-y-4 bg-[var(--nlm-surface)] overflow-y-auto max-h-[35vh]">
          {/* Zoom Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--nlm-text-secondary)]">
              <span className="flex items-center space-x-1.5">
                <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                <span>Skala / Zoom: {scale.toFixed(2)}x</span>
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                  className="w-6 h-6 rounded-md bg-[var(--nlm-surface-variant)] hover:bg-[var(--nlm-surface-hover)] flex items-center justify-center text-xs"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setScale((s) => Math.min(3, s + 0.1))}
                  className="w-6 h-6 rounded-md bg-[var(--nlm-surface-variant)] hover:bg-[var(--nlm-surface-hover)] flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Rotation Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--nlm-text-secondary)]">
              <span className="flex items-center space-x-1.5">
                <i className="fa-solid fa-rotate text-xs"></i>
                <span>Kemiringan / Rotasi: {rotation}°</span>
              </span>
              <button
                type="button"
                onClick={handleRotateClockwise}
                className="px-2 py-0.5 rounded-md bg-[var(--nlm-surface-variant)] hover:bg-[var(--nlm-surface-hover)] text-[10px] font-bold text-blue-500 flex items-center space-x-1"
                title="Putar 90 Derajat"
              >
                <i className="fa-solid fa-arrow-rotate-right"></i>
                <span>Putar 90°</span>
              </button>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Aspect Ratio & Reset Options */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[var(--nlm-text-tertiary)] text-[11px]">Bentuk:</span>
              <button
                type="button"
                onClick={() => setAspectRatio('circle')}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition cursor-pointer ${
                  aspectRatio === 'circle'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-[var(--nlm-surface-variant)] text-[var(--nlm-text-secondary)] hover:bg-[var(--nlm-surface-hover)]'
                }`}
              >
                Lingkaran
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('square')}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition cursor-pointer ${
                  aspectRatio === 'square'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-[var(--nlm-surface-variant)] text-[var(--nlm-text-secondary)] hover:bg-[var(--nlm-surface-hover)]'
                }`}
              >
                Persegi (1:1)
              </button>
            </div>

            <button
              type="button"
              onClick={resetTransform}
              className="text-xs text-[var(--nlm-text-tertiary)] hover:text-amber-500 flex items-center space-x-1 cursor-pointer"
            >
              <i className="fa-solid fa-arrows-rotate text-[10px]"></i>
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] flex items-center justify-end space-x-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--nlm-border)] hover:bg-[var(--nlm-surface-hover)] text-xs font-semibold text-[var(--nlm-text-secondary)] transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveCrop}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center space-x-1.5"
          >
            <i className="fa-solid fa-check"></i>
            <span>Terapkan &amp; Simpan Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
}
