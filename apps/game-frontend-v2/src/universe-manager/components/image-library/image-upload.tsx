import * as React from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";
import {
  useImageLibraryStore,
  type LibraryImage,
} from "../../store/image-library-store";

interface ImageUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  universeId: string;
  defaultType?: LibraryImage["type"];
  onUploaded?: (image: LibraryImage) => void;
}

export function ImageUpload({
  open,
  onOpenChange,
  universeId,
  defaultType = "general",
  onUploaded,
}: ImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [imageType, setImageType] = React.useState<LibraryImage["type"]>(defaultType);
  const [tags, setTags] = React.useState("");
  const [isDragging, setIsDragging] = React.useState(false);

  const { uploadImage, isLoading, error } = useImageLibraryStore();

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setPreview(null);
      setImageType(defaultType);
      setTags("");
    }
  }, [open, defaultType]);

  // Create preview when file is selected
  React.useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("image/")) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const image = await uploadImage(universeId, selectedFile, imageType, tagList);

    if (image) {
      onUploaded?.(image);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone / Preview */}
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg transition-colors",
              isDragging && "border-primary bg-primary/5",
              !isDragging && "border-muted-foreground/25",
              !selectedFile && "cursor-pointer hover:border-primary/50"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="relative aspect-video">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">
                  Drop an image here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />

          {/* Options */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Image Type</Label>
              <Select
                value={imageType}
                onValueChange={(v) => setImageType(v as LibraryImage["type"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="character">Character</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="item">Item</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="portrait, fantasy, warrior..."
              />
            </div>
          </div>

          {error && (
            <div className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
