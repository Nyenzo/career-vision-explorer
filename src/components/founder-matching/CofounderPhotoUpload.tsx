// src/components/founder-matching/CofounderPhotoUpload.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  X,
  Upload,
  GripVertical,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";
import {
  cofounderMatchingService,
  PhotoUploadStatus,
} from "@/services/founder-matching.service";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MIN_PHOTOS = 3;
const MAX_PHOTOS = 10;

interface Props {
  onPhotosChange?: (canMatch: boolean) => void;
}

export const CofounderPhotoUpload: React.FC<Props> = ({ onPhotosChange }) => {
  const [photoStatus, setPhotoStatus] = useState<PhotoUploadStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPhotoStatus = useCallback(async () => {
    try {
      setLoading(true);
      const status = await cofounderMatchingService.getPhotoStatus();
      setPhotoStatus(status);
      onPhotosChange?.(status.can_match);
    } catch (error) {
      console.error("Failed to load photo status:", error);
      toast.error("Failed to load photo status");
    } finally {
      setLoading(false);
    }
  }, [onPhotosChange]);

  useEffect(() => {
    loadPhotoStatus();
  }, [loadPhotoStatus]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload PNG, JPG, JPEG, or WEBP.";
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleUpload = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    if (photoStatus && photoStatus.photo_count >= MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    try {
      setUploading(true);
      const result = await cofounderMatchingService.uploadPhoto(file);
      toast.success(result.message);
      await loadPhotoStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload photo";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Reset input
    event.target.value = "";
  };

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragActive(false);

      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [photoStatus]
  );

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDelete = async (photoUrl: string) => {
    try {
      const result = await cofounderMatchingService.deletePhoto(photoUrl);
      toast.success(result.message);
      await loadPhotoStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete photo";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const photoCount = photoStatus?.photo_count || 0;
  const photosNeeded = photoStatus?.photos_needed || MIN_PHOTOS;
  const canMatch = photoStatus?.can_match || false;
  const progressPercent = Math.min((photoCount / MIN_PHOTOS) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Profile Photos
        </CardTitle>
        <CardDescription>
          Upload at least {MIN_PHOTOS} photos to participate in co-founder matching
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {photoCount} / {MIN_PHOTOS} required photos
            </span>
            {canMatch ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready to match
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                {photosNeeded} more needed
              </Badge>
            )}
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Photo grid */}
        {photoStatus?.photos && photoStatus.photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {photoStatus.photos.map((url, index) => (
              <div
                key={url}
                className="relative aspect-square rounded-lg overflow-hidden group border"
              >
                <img
                  src={url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <Badge className="absolute top-1 left-1 text-xs bg-primary/90">
                    Main
                  </Badge>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(url)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-4 w-4 text-white" />
                </div>
              </div>
            ))}

            {/* Upload placeholder slots */}
            {photoCount < MAX_PHOTOS && (
              <div
                className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30 hover:border-primary/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Add</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state / Upload area */}
        {(!photoStatus?.photos || photoStatus.photos.length === 0) && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/30 hover:border-primary/50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Upload your photos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, JPEG, or WEBP • Max {MAX_FILE_SIZE_MB}MB
            </p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".png,.jpg,.jpeg,.webp"
          className="hidden"
        />

        {/* Upload button for when photos exist */}
        {photoStatus?.photos && photoStatus.photos.length > 0 && photoCount < MAX_PHOTOS && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Add more photos ({photoCount}/{MAX_PHOTOS})
              </>
            )}
          </Button>
        )}

        {/* Info text */}
        <p className="text-xs text-muted-foreground text-center">
          Your first photo will be your main profile photo. You can drag to reorder.
        </p>
      </CardContent>
    </Card>
  );
};

export default CofounderPhotoUpload;
