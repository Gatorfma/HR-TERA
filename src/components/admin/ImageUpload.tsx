import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  accept?: string;
  maxSizeMB?: number;
  previewSize?: "sm" | "md" | "lg";
  showUrlInput?: boolean;
  error?: string;
}

const previewSizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

const ImageUpload = ({
  value,
  onChange,
  label = "Görsel",
  className,
  accept = "image/png,image/jpeg,image/jpg,image/webp",
  maxSizeMB = 2,
  previewSize = "md",
  showUrlInput = true,
  error,
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlMode, setShowUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`Dosya boyutu ${maxSizeMB}MB'dan küçük olmalıdır.`);
        return;
      }

      // Check file type
      const validTypes = accept.split(",").map((t) => t.trim());
      if (!validTypes.includes(file.type)) {
        alert("Geçersiz dosya türü. Lütfen PNG, JPG veya WEBP yükleyin.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onChange(result);
      };
      reader.readAsDataURL(file);
    },
    [accept, maxSizeMB, onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
      setShowUrlMode(false);
    }
  }, [urlInput, onChange]);

  const handleRemove = useCallback(() => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange]);

  const sizeClass = previewSizeClasses[previewSize];

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        // Preview mode
        <div className="flex items-start gap-4">
          <div className="relative group">
            <div
              className={cn(
                sizeClass,
                "rounded-lg border overflow-hidden bg-muted"
              )}
            >
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "";
                  e.currentTarget.alt = "Yüklenemedi";
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>Görsel yüklendi</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
            >
              Değiştir
            </Button>
          </div>
        </div>
      ) : showUrlMode ? (
        // URL input mode
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.png"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlSubmit())}
            />
            <Button type="button" onClick={handleUrlSubmit} size="sm">
              Ekle
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowUrlMode(false)}
            className="text-muted-foreground"
          >
            ← Dosya yüklemeye dön
          </Button>
        </div>
      ) : (
        // Upload mode
        <div className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
              error && "border-red-500"
            )}
          >
            <div className={cn(
              "p-3 rounded-full transition-colors",
              isDragging ? "bg-primary/10" : "bg-muted"
            )}>
              <Upload className={cn(
                "h-6 w-6",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {isDragging ? "Bırakın" : "Sürükle & bırak"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                veya dosya seçmek için tıklayın
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP • Maks. {maxSizeMB}MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          {showUrlInput && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowUrlMode(true)}
              className="w-full text-muted-foreground"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              URL ile ekle
            </Button>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default ImageUpload;
