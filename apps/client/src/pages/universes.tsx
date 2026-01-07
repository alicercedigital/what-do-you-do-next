import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { Universe } from "@wdydn/shared";
import { getUniverses, deleteUniverse } from "@/shared/lib/storage";
import { STARTER_UNIVERSES } from "@/shared/data/starter-universes";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { UniverseCard } from "@/universe/universe-card";

export default function UniversesPage() {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUniverses();
  }, []);

  const loadUniverses = () => {
    const stored = getUniverses();
    const all = [...STARTER_UNIVERSES];

    // Add stored universes that aren't duplicates of starters
    for (const u of stored) {
      if (!all.find((s) => s.id === u.id)) {
        all.push(u);
      }
    }

    setUniverses(all);
  };

  const handleDeleteUniverse = (universeId: string) => {
    deleteUniverse(universeId);
    loadUniverses();
  };

  const filteredUniverses = universes.filter(
    (universe) =>
      universe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      universe.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Globe className="h-8 w-8 text-primary" />
                Universe Manager
              </h1>
              <p className="text-muted-foreground mt-1">
                Create and manage your game universes
              </p>
            </div>
          </div>
          <Link to="/universes/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Universe
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search universes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniverses.map((universe, index) => (
            <UniverseCard
              key={universe.id}
              universe={universe}
              index={index}
              onDelete={() => handleDeleteUniverse(universe.id)}
            />
          ))}
        </div>

        {filteredUniverses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Globe className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No universes found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Try adjusting your search query"
                : "Create your first universe to get started"}
            </p>
            {!searchQuery && (
              <Link to="/universes/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Universe
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
