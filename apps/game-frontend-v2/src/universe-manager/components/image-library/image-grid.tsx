import * as React from "react";
import { Trash2, Tag, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { LibraryImage } from "../../store/image-library-store";

interface ImageGridProps {
  images: LibraryImage[];
  selectedId: string | null;
  onImageClick: (image: LibraryImage) => void;
  onDelete: (id: string) => void;
}

export function ImageGrid({
  images,
  selectedId,
  onImageClick,
  onDelete,
}: ImageGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          isSelected={image.id === selectedId}
          onClick={() => onImageClick(image)}
          onDelete={() => onDelete(image.id)}
        />
      ))}
    </div>
  );
}

interface ImageCardProps {
  image: LibraryImage;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function ImageCard({ image, isSelected, onClick, onDelete }: ImageCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const typeColors: Record<LibraryImage["type"], string> = {
    character: "bg-blue-500/20 text-blue-400",
    location: "bg-green-500/20 text-green-400",
    item: "bg-amber-500/20 text-amber-400",
    general: "bg-slate-500/20 text-slate-400",
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border overflow-hidden cursor-pointer transition-all",
        isSelected && "ring-2 ring-primary border-primary",
        !isSelected && "hover:border-primary/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-square bg-muted">
        <img
          src={image.thumbnailUrl || image.url}
          alt={image.filename}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-4 w-4 text-primary-foreground" />
        </div>
      )}

      {/* Type badge */}
      <Badge
        variant="secondary"
        className={cn(
          "absolute top-2 right-2 text-[10px] px-1.5 py-0",
          typeColors[image.type]
        )}
      >
        {image.type}
      </Badge>

      {/* Hover overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-2">
          <p className="text-xs text-white truncate">{image.filename}</p>
          {image.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Tag className="h-3 w-3 text-white/70" />
              <span className="text-[10px] text-white/70 truncate">
                {image.tags.slice(0, 3).join(", ")}
                {image.tags.length > 3 && ` +${image.tags.length - 3}`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Delete button */}
      <Button
        variant="destructive"
        size="icon"
        className={cn(
          "absolute bottom-2 right-2 h-7 w-7 opacity-0 transition-opacity",
          isHovered && "opacity-100"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
