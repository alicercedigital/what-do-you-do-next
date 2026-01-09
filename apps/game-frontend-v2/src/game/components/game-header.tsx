import { useState } from "react";
import { Menu, User, Save, Home } from "lucide-react";
import { useGameStore, usePlayerCharacter, useCurrentLocation } from "@/store";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { CharacterSheet } from "@/character";
import { HistoryBreadcrumb } from "./history-panel";

/**
 * Game header with:
 * - Universe/location name
 * - Character info button (opens sheet)
 * - Menu with save/exit
 */
export function GameHeader() {
  const universe = useGameStore((state) => state.universe);
  const saveGame = useGameStore((state) => state.saveGame);
  const exitGame = useGameStore((state) => state.exitGame);
  const player = usePlayerCharacter();
  const location = useCurrentLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Left: Location/Universe name + history breadcrumb */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold">
              {location?.name ?? universe?.name ?? "WDYDN"}
            </h1>
            <HistoryBreadcrumb className="hidden md:flex" />
          </div>
        </div>

        {/* Right: Character + Menu */}
        <div className="flex items-center gap-2">
          {/* Character button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{player?.name ?? "Character"}</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="sr-only">{player?.name ?? "Character"}</SheetTitle>
              </SheetHeader>
              <div className="mt-2">
                {player ? (
                  <CharacterSheet character={player} />
                ) : (
                  <p className="text-muted-foreground">No character loaded</p>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Menu dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => saveGame()}>
                <Save className="h-4 w-4 mr-2" />
                Save Game
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exitGame()}>
                <Home className="h-4 w-4 mr-2" />
                Exit to Menu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
