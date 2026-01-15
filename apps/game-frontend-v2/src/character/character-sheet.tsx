import { motion } from "framer-motion";
import { Package, Shield, Sparkles, Swords } from "lucide-react";
import type { v2 } from "@wdydn/shared";
type Character = v2.Character;
type Stat = v2.Stat;
type Item = v2.Item;
import { useGameStore } from "@/store";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface CharacterSheetProps {
  character: Character;
  className?: string;
}

/**
 * Full character sheet with stats, equipment, and inventory
 */
export function CharacterSheet({ character, className }: CharacterSheetProps) {
  const universe = useGameStore((state) => state.universe);
  const stats = universe?.stats ?? [];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Portrait and basic info */}
      <CharacterHeader character={character} />

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="equipment" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Equipment</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Inventory</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-4">
          <StatsPanel character={character} stats={stats} />
        </TabsContent>

        <TabsContent value="equipment" className="mt-4">
          <EquipmentPanel character={character} />
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <InventoryPanel character={character} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CharacterHeader({ character }: { character: Character }) {
  const emotion = "neutral";
  const imageUrl = character.images?.[emotion] ?? character.images?.neutral;

  return (
    <div className="flex items-start gap-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-20 h-24 flex-shrink-0"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={character.name}
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
            <span className="text-3xl font-bold text-muted-foreground">
              {character.name.charAt(0)}
            </span>
          </div>
        )}
      </motion.div>

      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold">{character.name}</h2>
        {character.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {character.description}
          </p>
        )}
      </div>
    </div>
  );
}

interface StatsPanelProps {
  character: Character;
  stats: Stat[];
}

function StatsPanel({ character, stats }: StatsPanelProps) {
  // Group stats by type
  const categorizedStats = new Map<string, Stat[]>();

  for (const stat of stats) {
    if (stat.display?.style === "hidden") continue;

    const category = stat.type ?? "other";
    if (!categorizedStats.has(category)) {
      categorizedStats.set(category, []);
    }
    categorizedStats.get(category)!.push(stat);
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4 pr-4">
        {Array.from(categorizedStats.entries()).map(([category, categoryStats]) => (
          <Card key={category}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">{category}</CardTitle>
            </CardHeader>
            <CardContent className="py-3 pt-0">
              <div className="space-y-3">
                {categoryStats.map((stat) => (
                  <StatDisplay
                    key={stat.id}
                    stat={stat}
                    value={character.stats[stat.id]}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

interface StatDisplayProps {
  stat: Stat;
  value: number | boolean | string | undefined;
}

function StatDisplay({ stat, value }: StatDisplayProps) {
  const displayStyle = stat.display?.style ?? "number";

  if (displayStyle === "hidden") return null;

  const numValue = typeof value === "number" ? value : 0;
  const minValue = stat.range?.min ?? 0;
  const maxValue = stat.range?.max ?? 100;
  const percentage = ((numValue - minValue) / (maxValue - minValue)) * 100;

  if (displayStyle === "bar") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">{stat.name}</span>
          <span className="font-medium tabular-nums">
            {numValue}
            {stat.range && (
              <span className="text-muted-foreground">/{maxValue}</span>
            )}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
      </motion.div>
    );
  }

  if (displayStyle === "badge" || typeof value === "boolean") {
    return (
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">{stat.name}</span>
        <Badge variant={value ? "default" : "outline"}>
          {value ? "Yes" : "No"}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{stat.name}</span>
      <span className="font-medium tabular-nums">{String(value ?? 0)}</span>
    </div>
  );
}

function EquipmentPanel({ character }: { character: Character }) {
  const universe = useGameStore((state) => state.universe);
  const equipment = character.equipment ?? {};

  const slots: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: "weapon", label: "Weapon", icon: <Swords className="h-4 w-4" /> },
    { id: "armor", label: "Armor", icon: <Shield className="h-4 w-4" /> },
    { id: "accessory", label: "Accessory", icon: <Sparkles className="h-4 w-4" /> },
    { id: "head", label: "Head", icon: null },
    { id: "hands", label: "Hands", icon: null },
    { id: "feet", label: "Feet", icon: null },
  ];

  const getItem = (itemId: string | null | undefined) =>
    itemId ? universe?.items.find((i) => i.id === itemId) : undefined;

  return (
    <ScrollArea className="h-[300px]">
      <div className="grid gap-2 pr-4">
        {slots.map((slot) => {
          const itemId = equipment[slot.id];
          const item = getItem(itemId);

          return (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                item ? "bg-card" : "bg-muted/50"
              )}
            >
              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                {slot.icon ?? <span className="text-xs uppercase">{slot.label[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{slot.label}</p>
                {item ? (
                  <p className="font-medium truncate">{item.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Empty</p>
                )}
              </div>
              {item?.whileEquipped && item.whileEquipped.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.whileEquipped.map((bonus, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {bonus.amount > 0 ? "+" : ""}
                      {bonus.amount} {bonus.statId}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function InventoryPanel({ character }: { character: Character }) {
  const universe = useGameStore((state) => state.universe);
  const inventory = character.inventory ?? [];

  if (inventory.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No items in inventory</p>
        </div>
      </div>
    );
  }

  const getItem = (itemId: string) =>
    universe?.items.find((i) => i.id === itemId);

  return (
    <ScrollArea className="h-[300px]">
      <div className="grid gap-2 pr-4">
        {inventory.map((entry, index) => {
          const item = getItem(entry.itemId);
          if (!item) return null;

          return (
            <InventoryItem
              key={`${entry.itemId}-${index}`}
              item={item}
              quantity={entry.quantity ?? 1}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
}

interface InventoryItemProps {
  item: Item;
  quantity: number;
}

function InventoryItem({ item, quantity }: InventoryItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
    >
      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
        {item.icon ? (
          <img
            src={item.icon}
            alt={item.name}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <Package className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{item.name}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">
            {item.description}
          </p>
        )}
      </div>
      {quantity > 1 && (
        <Badge variant="secondary">x{quantity}</Badge>
      )}
    </motion.div>
  );
}
