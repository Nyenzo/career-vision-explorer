import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Star, DollarSign, Filter } from "lucide-react";
import { freelancerService } from "@/services/freelancer.service";
import { FreelancerListItem, FreelancerFilter } from "@/types/freelancer";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";

export default function Freelancers() {
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState<FreelancerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FreelancerFilter>({
    available_only: true,
  });
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    loadFreelancers();
  }, [filters, currentPage]);

  const loadFreelancers = async () => {
    try {
      setLoading(true);
      const response = await freelancerService.listFreelancers(
        filters,
        pageSize,
        currentPage * pageSize
      );
      setFreelancers(response.freelancers);
      setTotal(response.total);
    } catch (error) {
      console.error("Error loading freelancers:", error);
      toast.error("Failed to load freelancers");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchQuery });
    setCurrentPage(0);
  };

  const handleFreelancerClick = (freelancerId: string) => {
    navigate(`/freelancers/${freelancerId}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 border-b">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Find Freelancers
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover talented professionals for your projects
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-6 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by title, skills, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            {/* Quick Filters */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge
                variant={filters.available_only ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  setFilters({
                    ...filters,
                    available_only: !filters.available_only,
                  })
                }
              >
                Available Now
              </Badge>
              {/* Add more filter badges as needed */}
            </div>
          </div>
        </div>

        {/* Freelancers Grid */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-12 w-12 rounded-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-4" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : freelancers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No freelancers found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freelancers.map((freelancer) => (
                <Card
                  key={freelancer.freelancer_id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() =>
                    handleFreelancerClick(freelancer.freelancer_id)
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={freelancer.profile_image_url} />
                        <AvatarFallback>
                          {getInitials(freelancer.name)}
                        </AvatarFallback>
                      </Avatar>
                      {freelancer.available_for_hire && (
                        <Badge variant="success" className="text-xs">
                          Available
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-1">
                      {freelancer.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {freelancer.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                      {freelancer.bio}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {freelancer.skills.slice(0, 3).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {freelancer.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{freelancer.skills.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        {freelancer.hourly_rate && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <DollarSign className="w-4 h-4" />
                            <span>${freelancer.hourly_rate}/hr</span>
                          </div>
                        )}
                        {freelancer.location && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>{freelancer.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">
                          {freelancer.rating.toFixed(1)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          ({freelancer.total_reviews})
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > pageSize && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage + 1} of {Math.ceil(total / pageSize)}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={(currentPage + 1) * pageSize >= total}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
