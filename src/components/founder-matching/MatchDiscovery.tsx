// src/components/founder-matching/MatchDiscovery.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Eye,
  Heart,
  X,
  Star,
  MapPin,
  Briefcase,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import {
  MatchProfile,
  cofounderMatchingService,
} from "@/services/founder-matching.service";
import { MatchDetailModal } from "./MatchDetailModal";
import { toast } from "sonner";

interface MatchDiscoveryProps {
  initialFilters?: {
    min_score?: number;
    industries?: string[];
    location_preferences?: string[];
  };
}

// Named export - this is what FounderDashboard.tsx is looking for
export function MatchDiscovery({ initialFilters }: MatchDiscoveryProps) {
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchProfile | null>(null);
  const [filters, setFilters] = useState({
    min_score: initialFilters?.min_score || 0.7,
    industries: initialFilters?.industries || ([] as string[]),
    location_preferences:
      initialFilters?.location_preferences || ([] as string[]),
  });
  const [industryInput, setIndustryInput] = useState("");
  const [locationInput, setLocationInput] = useState("");

  useEffect(() => {
    loadMatches();
  }, [filters]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await cofounderMatchingService.discoverMatches({
        limit: 20,
        min_score: filters.min_score,
        filters: {
          industries:
            filters.industries.length > 0 ? filters.industries : undefined,
          location_preferences:
            filters.location_preferences.length > 0
              ? filters.location_preferences
              : undefined,
        },
      });
      setMatches(response.matches);
    } catch (error) {
      toast.error("Failed to load matches");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchAction = async (
    matchId: string,
    action: "interested" | "declined" | "skipped"
  ) => {
    try {
      const response = await cofounderMatchingService.handleMatchAction(
        matchId,
        { action }
      );

      // Update local state
      setMatches((prev) =>
        prev.map((match) =>
          match.match_id === matchId
            ? {
                ...match,
                status: response.status as any,
                mutual_interest_at: response.mutual_interest
                  ? new Date().toISOString()
                  : undefined,
              }
            : match
        )
      );

      if (response.mutual_interest) {
        toast.success("Mutual interest! 🎉", {
          description: response.message,
        });
      } else if (action === "interested") {
        toast.success("Interest expressed!", {
          description: "You'll be notified if they're interested too.",
        });
      }
    } catch (error) {
      toast.error("Failed to process action");
      console.error(error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "bg-green-500";
    if (score >= 0.8) return "bg-green-400";
    if (score >= 0.7) return "bg-yellow-500";
    if (score >= 0.6) return "bg-orange-400";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.9) return "Excellent";
    if (score >= 0.8) return "Great";
    if (score >= 0.7) return "Good";
    if (score >= 0.6) return "Fair";
    return "Poor";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Filters skeleton */}
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-24"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Matches skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                  <div className="h-3 bg-muted rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Find Your Perfect Co-Founder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Minimum Match Score
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    value={[filters.min_score * 100]}
                    onValueChange={([value]) =>
                      setFilters({ ...filters, min_score: value / 100 })
                    }
                    min={60}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <div className="text-right min-w-[80px]">
                    <div className="text-lg font-bold text-primary">
                      {Math.round(filters.min_score * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getScoreLabel(filters.min_score)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Industries</label>
                <div className="flex gap-2">
                  <Input
                    value={industryInput}
                    onChange={(e) => setIndustryInput(e.target.value)}
                    placeholder="Add industry..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && industryInput.trim()) {
                        e.preventDefault();
                        if (
                          !filters.industries.includes(industryInput.trim())
                        ) {
                          setFilters({
                            ...filters,
                            industries: [
                              ...filters.industries,
                              industryInput.trim(),
                            ],
                          });
                          setIndustryInput("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (
                        industryInput.trim() &&
                        !filters.industries.includes(industryInput.trim())
                      ) {
                        setFilters({
                          ...filters,
                          industries: [
                            ...filters.industries,
                            industryInput.trim(),
                          ],
                        });
                        setIndustryInput("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.industries.map((industry) => (
                    <Badge key={industry} variant="secondary" className="gap-1">
                      {industry}
                      <button
                        type="button"
                        onClick={() =>
                          setFilters({
                            ...filters,
                            industries: filters.industries.filter(
                              (i) => i !== industry
                            ),
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Location Preferences
                </label>
                <div className="flex gap-2">
                  <Input
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Add location..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && locationInput.trim()) {
                        e.preventDefault();
                        if (
                          !filters.location_preferences.includes(
                            locationInput.trim()
                          )
                        ) {
                          setFilters({
                            ...filters,
                            location_preferences: [
                              ...filters.location_preferences,
                              locationInput.trim(),
                            ],
                          });
                          setLocationInput("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (
                        locationInput.trim() &&
                        !filters.location_preferences.includes(
                          locationInput.trim()
                        )
                      ) {
                        setFilters({
                          ...filters,
                          location_preferences: [
                            ...filters.location_preferences,
                            locationInput.trim(),
                          ],
                        });
                        setLocationInput("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.location_preferences.map((location) => (
                    <Badge key={location} variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {location}
                      <button
                        type="button"
                        onClick={() =>
                          setFilters({
                            ...filters,
                            location_preferences:
                              filters.location_preferences.filter(
                                (l) => l !== location
                              ),
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Quick Actions</div>
                  <div className="text-xs text-muted-foreground">
                    Manage your matches
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={loadMatches}>
                  <Search className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFilters({
                      min_score: 0.7,
                      industries: [],
                      location_preferences: [],
                    })
                  }
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const mutualMatches = matches.filter(
                      (m) => m.status === "mutual_interest"
                    );
                    if (mutualMatches.length > 0) {
                      toast.info(
                        `You have ${mutualMatches.length} mutual matches`
                      );
                    } else {
                      toast.info("No mutual matches yet");
                    }
                  }}
                >
                  Check Mutual
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Potential Co-Founders</h3>
          <p className="text-sm text-muted-foreground">
            {matches.length} {matches.length === 1 ? "match" : "matches"} found
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Excellent (90%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Good (70-89%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Fair (&lt;70%)</span>
          </div>
        </div>
      </div>

      {/* Match Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <Card
            key={match.match_id}
            className={`hover:shadow-lg transition-all duration-300 ${
              match.status === "mutual_interest"
                ? "border-green-200 bg-green-50"
                : match.status === "interested"
                ? "border-blue-200"
                : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">
                      {match.matched_profile.current_role}
                    </CardTitle>
                    {match.status === "mutual_interest" && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mutual
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {match.matched_profile.years_experience}+ years
                    </div>
                    {match.matched_profile.location_preference && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.matched_profile.location_preference}
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <div
                      className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-white font-bold ${getScoreColor(
                        match.overall_score
                      )}`}
                    >
                      <span className="text-lg">
                        {Math.round(match.overall_score * 100)}%
                      </span>
                      <span className="text-[10px] opacity-90">
                        {getScoreLabel(match.overall_score)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {match.matched_profile.bio}
                </p>
                <div className="flex flex-wrap gap-1">
                  {match.matched_profile.technical_skills
                    .slice(0, 4)
                    .map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  {match.matched_profile.technical_skills.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{match.matched_profile.technical_skills.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-xs text-muted-foreground">Skills</div>
                    <div className="font-bold text-blue-600">
                      {Math.round(
                        match.score_breakdown.skill_compatibility * 100
                      )}
                      %
                    </div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      Experience
                    </div>
                    <div className="font-bold text-green-600">
                      {Math.round(match.score_breakdown.experience_match * 100)}
                      %
                    </div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      Role Fit
                    </div>
                    <div className="font-bold text-purple-600">
                      {Math.round(match.score_breakdown.role_alignment * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedMatch(match)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>

                {match.status === "interested" ||
                match.status === "mutual_interest" ? (
                  <Button
                    variant={
                      match.status === "mutual_interest" ? "default" : "outline"
                    }
                    size="sm"
                    className={`flex-1 ${
                      match.status === "mutual_interest"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                    disabled
                  >
                    <Heart
                      className={`h-4 w-4 mr-2 ${
                        match.status === "mutual_interest"
                          ? "fill-white"
                          : "fill-blue-500"
                      }`}
                    />
                    {match.status === "mutual_interest"
                      ? "Connected"
                      : "Interested"}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      handleMatchAction(match.match_id, "interested")
                    }
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Interest
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMatchAction(match.match_id, "declined")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {matches.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or check back later for new potential
              co-founders
            </p>
            <Button
              onClick={() =>
                setFilters({
                  min_score: 0.6,
                  industries: [],
                  location_preferences: [],
                })
              }
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          open={!!selectedMatch}
          onOpenChange={() => setSelectedMatch(null)}
          onAction={handleMatchAction}
        />
      )}
    </div>
  );
}
