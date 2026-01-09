import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ChevronRight, Sparkles, TrendingUp, Clock, Trophy } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea, ScrollBar } from "@/shared/components/ui/scroll-area";
import { UniverseCard } from "./components/universe-card";
import { UniverseGrid } from "./components/universe-grid";
import { useMarketplaceStore } from "@/store/marketplace-store";

function SectionHeader({
  title,
  icon: Icon,
  href,
}: {
  title: string;
  icon: React.ElementType;
  href?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h2>
      {href && (
        <Link to={href}>
          <Button variant="ghost" size="sm" className="gap-1">
            View all
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-4 pb-4">{children}</div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export function MarketplacePage() {
  const navigate = useNavigate();
  const {
    featured,
    trending,
    newReleases,
    topRated,
    isLoadingFeatured,
    isLoadingTrending,
    isLoadingNew,
    isLoadingTop,
    loadFeatured,
    loadTrending,
    loadNew,
    loadTop,
    search,
  } = useMarketplaceStore();

  useEffect(() => {
    loadFeatured();
    loadTrending();
    loadNew();
    loadTop();
  }, [loadFeatured, loadTrending, loadNew, loadTop]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    if (query.trim()) {
      search({ q: query.trim() });
      navigate(`/marketplace/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Discover Universes</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Explore interactive fiction created by our community
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  type="search"
                  placeholder="Search universes..."
                  className="h-12 pl-10 pr-4 text-base"
                />
              </div>
            </form>

            {/* Quick filters */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/marketplace/search?genre=fantasy")}>
                Fantasy
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/marketplace/search?genre=sci-fi")}>
                Sci-Fi
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/marketplace/search?genre=horror")}>
                Horror
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/marketplace/search?genre=mystery")}>
                Mystery
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/marketplace/search?genre=adventure")}>
                Adventure
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured Section */}
        <section className="mb-12">
          <SectionHeader title="Featured" icon={Sparkles} href="/marketplace/search?sort=popular" />
          {isLoadingFeatured ? (
            <UniverseGrid universes={[]} isLoading />
          ) : featured.length > 0 ? (
            <HorizontalScroll>
              {featured.map((universe) => (
                <div key={universe.id} className="w-[280px] shrink-0">
                  <UniverseCard universe={universe} />
                </div>
              ))}
            </HorizontalScroll>
          ) : (
            <p className="text-center text-muted-foreground">No featured universes yet</p>
          )}
        </section>

        {/* Trending Section */}
        <section className="mb-12">
          <SectionHeader title="Trending This Week" icon={TrendingUp} href="/marketplace/search?sort=plays" />
          {isLoadingTrending ? (
            <UniverseGrid universes={[]} isLoading />
          ) : trending.length > 0 ? (
            <UniverseGrid universes={trending.slice(0, 8)} />
          ) : (
            <p className="text-center text-muted-foreground">No trending universes yet</p>
          )}
        </section>

        {/* New Releases Section */}
        <section className="mb-12">
          <SectionHeader title="New Releases" icon={Clock} href="/marketplace/search?sort=newest" />
          {isLoadingNew ? (
            <UniverseGrid universes={[]} isLoading />
          ) : newReleases.length > 0 ? (
            <UniverseGrid universes={newReleases.slice(0, 8)} />
          ) : (
            <p className="text-center text-muted-foreground">No new releases yet</p>
          )}
        </section>

        {/* Top Rated Section */}
        <section className="mb-12">
          <SectionHeader title="Top Rated" icon={Trophy} href="/marketplace/search?sort=likes" />
          {isLoadingTop ? (
            <UniverseGrid universes={[]} isLoading />
          ) : topRated.length > 0 ? (
            <HorizontalScroll>
              {topRated.map((universe) => (
                <div key={universe.id} className="w-[280px] shrink-0">
                  <UniverseCard universe={universe} />
                </div>
              ))}
            </HorizontalScroll>
          ) : (
            <p className="text-center text-muted-foreground">No top rated universes yet</p>
          )}
        </section>

        {/* CTA for Creators */}
        <section className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold">Create Your Own Universe</h2>
          <p className="mt-2 text-muted-foreground">
            Build interactive stories and share them with the world
          </p>
          <Button className="mt-4" onClick={() => navigate("/universes")}>
            Start Creating
          </Button>
        </section>
      </div>
    </div>
  );
}
