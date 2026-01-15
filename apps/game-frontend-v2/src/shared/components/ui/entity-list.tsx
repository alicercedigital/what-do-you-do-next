import { useState, useMemo } from "react";
import { Plus, Search, Trash2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "./button";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { cn } from "@/shared/lib/utils";

interface EntityListProps<T extends { id: string }> {
  items: T[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
  searchPlaceholder?: string;
  getSearchValue?: (item: T) => string;
  emptyMessage?: string;
  createLabel?: string;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: (item: T) => string;
  onGenerateWithAI?: () => void;
}

export function EntityList<T extends { id: string; name?: string }>({
  items,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  renderItem,
  searchPlaceholder = "Search...",
  getSearchValue = (item) => item.name || item.id,
  emptyMessage = "No items yet",
  createLabel = "Add New",
  deleteConfirmTitle = "Delete Item",
  deleteConfirmDescription = (item) =>
    `Are you sure you want to delete "${item.name || item.id}"? This action cannot be undone.`,
  onGenerateWithAI,
}: EntityListProps<T>) {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const query = search.toLowerCase();
    return items.filter((item) =>
      getSearchValue(item).toLowerCase().includes(query)
    );
  }, [items, search, getSearchValue]);

  const handleDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex h-full flex-col border-r bg-card/50">
      {/* Header */}
      <div className="flex items-center gap-2 border-b p-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {onGenerateWithAI && (
          <Button
            size="icon"
            variant="outline"
            onClick={onGenerateWithAI}
            title="Generate with AI"
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
          </Button>
        )}
        <Button size="icon" onClick={onCreate}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <AnimatePresence mode="popLayout">
            {filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                {search ? "No matches found" : emptyMessage}
              </motion.div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = selectedId === item.id;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <div
                      className={cn(
                        "group relative mb-1 cursor-pointer rounded-md transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <button
                        onClick={() => onSelect(item.id)}
                        className="w-full p-2 text-left"
                      >
                        {renderItem(item, isSelected)}
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(item);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onCreate}
        >
          <Plus className="mr-2 h-4 w-4" />
          {createLabel}
        </Button>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && deleteConfirmDescription(deleteTarget)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
