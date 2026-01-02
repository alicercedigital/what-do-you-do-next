"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Globe, Users, MapPin, Pencil, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { universePersistence } from "@/lib/utils/universe-persistence"
import type { GameUniverse } from "@/lib/schemas/game-entity-schema"

export default function UniversesPage() {
  const [universes, setUniverses] = useState<GameUniverse[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadUniverses()
  }, [])

  const loadUniverses = () => {
    setUniverses(universePersistence.getAllUniverses())
  }

  const handleDeleteUniverse = (universeId: string) => {
    universePersistence.deleteUniverse(universeId)
    loadUniverses()
  }

  const filteredUniverses = universes.filter(
    (universe) =>
      universe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      universe.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Globe className="h-8 w-8 text-primary" />
                Universe Manager
              </h1>
              <p className="text-muted-foreground mt-1">Create and manage your game universes</p>
            </div>
          </div>
          <Link href="/universes/new">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Globe className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No universes found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try adjusting your search query" : "Create your first universe to get started"}
            </p>
            {!searchQuery && (
              <Link href="/universes/new">
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
  )
}

function UniverseCard({
  universe,
  index,
  onDelete,
}: {
  universe: GameUniverse
  index: number
  onDelete: () => void
}) {
  const isCustom = universePersistence.isCustomUniverse(universe.id)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className="group h-full flex flex-col bg-card/50 hover:bg-card/80 transition-colors">
        {universe.thumbnailUrl && (
          <div className="relative h-36 overflow-hidden rounded-t-lg">
            <img
              src={universe.thumbnailUrl || "/placeholder.svg"}
              alt={universe.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{universe.name}</CardTitle>
                {!isCustom && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Default</span>
                )}
              </div>
              <CardDescription className="line-clamp-2 text-sm">{universe.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{universe.characters.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{universe.locations.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{universe.charactersAttributes.length} attributes</span>
            </div>
          </div>

          <div className="flex gap-2 mt-auto">
            <Link href={`/universes/${universe.id}`} className="flex-1">
              <Button variant="secondary" className="w-full gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            {isCustom && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Universe?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{universe.name}" and all its characters and locations. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
