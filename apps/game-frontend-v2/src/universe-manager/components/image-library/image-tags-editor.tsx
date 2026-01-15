import * as React from "react";
import { Save, X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  useImageLibraryStore,
  type LibraryImage,
} from "../../store/image-library-store";

interface ImageTagsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: LibraryImage;
}

export function ImageTagsEditor({
  open,
  onOpenChange,
  image,
}: ImageTagsEditorProps) {
  const [tags, setTags] = React.useState<string[]>(image.tags);
  const [newTag, setNewTag] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { updateTags, isLoading } = useImageLibraryStore();

  // Reset tags when image changes
  React.useEffect(() => {
    setTags(image.tags);
  }, [image]);

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag("");
      inputRef.current?.focus();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Backspace" && !newTag && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSave = async () => {
    const success = await updateTags(image.id, tags);
    if (success) {
      onOpenChange(false);
    }
  };

  const hasChanges =
    tags.length !== image.tags.length ||
    !tags.every((t) => image.tags.includes(t));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Image Tags</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={image.thumbnailUrl || image.url}
              alt={image.filename}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            {image.filename}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tag..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Press Enter to add, Backspace to remove last tag
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Tags
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
