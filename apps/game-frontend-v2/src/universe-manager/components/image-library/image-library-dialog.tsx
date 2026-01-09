import * as React from "react";
import { Search, Upload, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  useImageLibraryStore,
  selectFilteredImages,
  type LibraryImage,
} from "../../store/image-library-store";
import { ImageGrid } from "./image-grid";
import { ImageUpload } from "./image-upload";
import { ImageTagsEditor } from "./image-tags-editor";

interface ImageLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  universeId: string;
  onSelect?: (image: LibraryImage) => void;
  filterType?: LibraryImage["type"];
  selectionMode?: boolean;
}

export function ImageLibraryDialog({
  open,
  onOpenChange,
  universeId,
  onSelect,
  filterType: initialFilterType,
  selectionMode = false,
}: ImageLibraryDialogProps) {
  const [showUpload, setShowUpload] = React.useState(false);
  const [editingImage, setEditingImage] = React.useState<LibraryImage | null>(null);

  const {
    isLoading,
    error,
    searchQuery,
    filterType,
    selectedImageId,
    fetchImages,
    setSearchQuery,
    setFilterType,
    selectImage,
    deleteImage,
  } = useImageLibraryStore();

  const filteredImages = useImageLibraryStore(selectFilteredImages);

  // Fetch images when dialog opens
  React.useEffect(() => {
    if (open && universeId) {
      fetchImages(universeId);
      if (initialFilterType) {
        setFilterType(initialFilterType);
      }
    }
  }, [open, universeId, fetchImages, initialFilterType, setFilterType]);

  const handleImageClick = (image: LibraryImage) => {
    if (selectionMode) {
      selectImage(image.id);
    } else {
      setEditingImage(image);
    }
  };

  const handleSelect = () => {
    const image = filteredImages.find((img) => img.id === selectedImageId);
    if (image && onSelect) {
      onSelect(image);
      onOpenChange(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );
    if (confirmed) {
      await deleteImage(imageId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Image Library</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select
            value={filterType}
            onValueChange={(v) => setFilterType(v as LibraryImage["type"] | "all")}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="character">Character</SelectItem>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="item">Item</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setShowUpload(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              {error}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p>No images found</p>
              <Button
                variant="link"
                onClick={() => setShowUpload(true)}
                className="mt-2"
              >
                Upload your first image
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <ImageGrid
                images={filteredImages}
                selectedId={selectionMode ? selectedImageId : null}
                onImageClick={handleImageClick}
                onDelete={handleDelete}
              />
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        {selectionMode && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSelect} disabled={!selectedImageId}>
              Select Image
            </Button>
          </div>
        )}

        {/* Upload Dialog */}
        <ImageUpload
          open={showUpload}
          onOpenChange={setShowUpload}
          universeId={universeId}
          defaultType={filterType !== "all" ? filterType : "general"}
        />

        {/* Tags Editor Dialog */}
        {editingImage && (
          <ImageTagsEditor
            open={!!editingImage}
            onOpenChange={(open) => !open && setEditingImage(null)}
            image={editingImage}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
