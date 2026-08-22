import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Upload, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface ImageCropperProps {
  value?: string | null;
  onChange: (dataUrl: string) => void;
  label?: string;
  aspect?: number;
  circular?: boolean;
  className?: string;
  hint?: string;
}

function getCroppedImg(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    image.src = imageSrc;
  });
}

export function ImageCropper({
  value,
  onChange,
  label,
  aspect = 1,
  circular = false,
  className,
  hint,
}: ImageCropperProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [reading, setReading] = useState(false);

  const onCropComplete = useCallback((_croppedArea: unknown, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setSrc(String(reader.result));
      setReading(false);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.onerror = () => setReading(false);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApply = async () => {
    if (!src || !croppedAreaPixels) return;
    const cropped = await getCroppedImg(src, croppedAreaPixels);
    onChange(cropped);
    setSrc(null);
  };

  const handleCancel = () => {
    setSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Cropper modal inline */}
      {src && (
        <div className="mb-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-medium text-slate-600">Crop your image</p>
          <div className="relative h-64 w-full overflow-hidden rounded-lg bg-slate-900">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape={circular ? 'round' : 'rect'}
              classes={{
                containerClassName: 'rounded-lg',
              }}
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="text-xs text-slate-500">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer accent-brand-600"
            />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
            <Button size="sm" onClick={handleApply}>
              <Check className="mr-1 h-3.5 w-3.5" /> Apply
            </Button>
          </div>
        </div>
      )}

      {/* Preview / Upload trigger */}
      {value && !src ? (
        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <img
            src={value}
            alt=""
            className={cn(
              'object-contain',
              circular ? 'aspect-square max-w-[140px] rounded-full' : 'h-28 w-full bg-white'
            )}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute right-2 top-2 bg-white"
            onClick={handleRemove}
          >
            <X className="mr-1 h-3.5 w-3.5" /> Remove
          </Button>
        </div>
      ) : !src ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-brand-500 hover:text-brand-600',
            circular ? 'aspect-square max-w-[140px]' : 'h-24'
          )}
        >
          {reading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Upload className="mb-1 h-6 w-6" />
              <span className="text-sm">Upload image</span>
            </>
          )}
        </button>
      ) : null}

      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
