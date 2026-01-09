import { useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Coins,
  Heart,
  ShoppingCart,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { useEconomyStore, useEarnings } from "@/store/economy-store";

export function EarningsPage() {
  const {
    loadEarnings,
    loadReceivedTips,
    receivedTips,
    totalTipsAmount,
    isLoadingEarnings,
    isLoadingTips,
  } = useEconomyStore();
  const earnings = useEarnings();

  useEffect(() => {
    loadEarnings();
    loadReceivedTips();
  }, [loadEarnings, loadReceivedTips]);

  const isLoading = isLoadingEarnings || isLoadingTips;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/studio">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Studio
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">
            Track your tips and sales revenue
          </p>
        </div>

        {isLoading && !earnings ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-2xl font-bold mt-1">
                        {earnings?.totalEarnings || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">credits</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Coins className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tips Received</p>
                      <p className="text-2xl font-bold mt-1">
                        {earnings?.tipsReceived || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">credits</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sales Revenue</p>
                      <p className="text-2xl font-bold mt-1">
                        {earnings?.salesRevenue || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">credits</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold mt-1">
                        {earnings?.thisMonth || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">credits</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Recent Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                {receivedTips.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tips received yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Keep creating great content to receive tips from your fans!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedTips.map((tip) => (
                      <div
                        key={tip.id}
                        className="flex items-start gap-4 p-4 rounded-lg border"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={tip.sender?.avatar_url || undefined} />
                          <AvatarFallback>
                            {tip.sender?.username?.[0].toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/marketplace/creator/${tip.sender?.username}`}
                              className="font-medium hover:underline"
                            >
                              {tip.sender?.display_name || tip.sender?.username}
                            </Link>
                            <span className="text-muted-foreground">sent you a tip</span>
                          </div>
                          {tip.universe && (
                            <p className="text-sm text-muted-foreground">
                              For:{" "}
                              <Link
                                to={`/marketplace/universe/${tip.universe.id}`}
                                className="hover:underline"
                              >
                                {tip.universe.name}
                              </Link>
                            </p>
                          )}
                          {tip.message && (
                            <p className="text-sm mt-2 bg-muted/50 p-2 rounded">
                              "{tip.message}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1 text-lg font-bold text-green-500">
                            <Coins className="h-5 w-5" />
                            +{tip.amount}
                          </div>
                          <p className="text-xs text-muted-foreground">credits</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
