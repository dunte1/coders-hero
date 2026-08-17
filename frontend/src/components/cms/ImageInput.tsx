import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface ImageInputProps {
  value?: string | null;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  aspect?: string;
  hint?: string;
}

export function ImageInput({
  value,
  onChange,
  label,
  className,
  aspect = 'aspect-video',
  hint,
}: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setReading(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result || ''));
      setReading(false);
    };
    reader.onerror = () => setReading(false);
    reader.readAsDataURL(file);
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
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <img src={value} alt="" className={cn('w-full object-cover', aspect)} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute right-2 top-2 bg-white"
            onClick={() => onChange('')}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-brand-500 hover:text-brand-600',
            aspect
          )}
        >
          {reading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <ImagePlus className="mb-1 h-6 w-6" />
              <span className="text-sm">Click to upload image</span>
            </>
          )}
        </button>
      )}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
