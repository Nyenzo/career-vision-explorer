
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Building, Briefcase, Clock, Trash2, ExternalLink } from "lucide-react";
import { useWishlist, WishlistJob } from "@/hooks/use-wishlist";
import { Link } from "react-router-dom";

interface WishlistDialogProps {
  children: React.ReactNode;
}

export const WishlistDialog = ({ children }: WishlistDialogProps) => {
  const { wishlistJobs, removeFromWishlist, clearWishlist } = useWishlist();
  const [open, setOpen] = useState(false);

  if (wishlistJobs.length === 0) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              My Wishlist (0)
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500">Start saving jobs you're interested in!</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500 fill-current" />
              My Wishlist ({wishlistJobs.length})
            </DialogTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearWishlist}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {wishlistJobs.map((job) => (
            <WishlistJobCard 
key={job.job_id} 
              job={job} 
              onRemove={() => removeFromWishlist(job.job_id)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface WishlistJobCardProps {
  job: WishlistJob;
  onRemove: () => void;
}

const WishlistJobCard = ({ job, onRemove }: WishlistJobCardProps) => {
  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {job.title}
              <Badge className={`text-xs ${
                job.matchScore >= 90 ? 'bg-green-500' : 
                job.matchScore >= 80 ? 'bg-blue-500' : 
                job.matchScore >= 70 ? 'bg-yellow-500' : 
                'bg-orange-500'
              } text-white`}>
                {job.matchScore}% Match
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600">{job.company}</p>
          </div>
          <div className="flex gap-2">
<Link to={`/jobs/${job.job_id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                View
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRemove}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-3 w-3" />
            {job.location}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Briefcase className="h-3 w-3" />
            {job.type}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Building className="h-3 w-3" />
            {job.salary}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="h-3 w-3" />
            {job.posted}
          </div>
        </div>
        
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{job.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {job.skills.slice(0, 4).map(skill => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{job.skills.length - 4} more
            </Badge>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          Saved on {new Date(job.dateSaved).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};
