import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  cofounderMatchingService,
  PhotoUploadStatus,
} from "@/services/founder-matching.service";
import { toast } from "sonner";
import { UploadCloud, X, Image as ImageIcon, Loader2 } from "lucide-react";

export const CofounderPhotos = () => {
  const [status, setStatus] = useState<PhotoUploadStatus | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await cofounderMatchingService.getPhotoStatus();
      setStatus(data);
    } catch (error) {
      console.error("Failed to load photo status", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (status && status.photo_count >= status.max_photos) {
      toast.error(`Maximum ${status.max_photos} photos allowed`);
      return;
    }

    try {
      setUploading(true);
      const response = await cofounderMatchingService.uploadPhoto(file);
      setStatus({
        photo_count: response.photo_count,
        max_photos: 10,
        min_required: 0,
        can_match: response.can_match,
        photos_needed: response.photos_needed,
        can_upload_more: response.photo_count < 10,
        photos: status?.photos ? [...status.photos, response.image_url] : [response.image_url]
      });
      toast.success("Photo uploaded successfully");
      loadStatus(); // Reload for consistent state
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDelete = async (url: string) => {
    try {
      await cofounderMatchingService.deletePhoto(url);
      toast.success("Photo deleted");
      loadStatus();
    } catch (error) {
      toast.error("Failed to delete photo");
    }
  };

  if (loading) {
    return <div className="p-4 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-lg">
          <span>Cofounder Photos</span>
          <span className="text-sm font-normal text-muted-foreground">
            {status?.photo_count || 0}/{status?.max_photos || 10} photos
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {status?.photos?.map((url, index) => (
              <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-slate-100">
                <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDelete(url)}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {(!status || status.photo_count < (status.max_photos || 10)) && (
              <label className="border-2 border-dashed border-slate-200 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                {uploading ? (
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500 font-medium">Add Photo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
             <ImageIcon className="h-5 w-5 text-blue-600 mt-0.5" />
             <div className="text-sm text-blue-800">
               <p className="font-medium mb-1">Photo Tips</p>
               <ul className="list-disc pl-4 space-y-1 text-blue-700/90">
                 <li>Upload photos that show your personality and professional side.</li>
                 <li>Include photos of you working, speaking, or in your element.</li>
                 <li>High quality images increase your match rate.</li>
               </ul>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
