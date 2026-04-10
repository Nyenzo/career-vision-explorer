
import React from "react";
import { useContent } from "@/hooks/use-content";

interface DynamicContentProps {
  location: string;
  fallback?: string;
  className?: string;
}

export const DynamicContent: React.FC<DynamicContentProps> = ({ 
  location, 
  fallback = "Content not found",
  className = ""
}) => {
  const { getContentByLocation } = useContent();
  
  const content = getContentByLocation(location);
  const publishedContent = content.find(c => c.status === "published");
  
  if (!publishedContent) {
    return <div className={className}>{fallback}</div>;
  }
  
  return (
    <div className={className}>
      <div dangerouslySetInnerHTML={{ __html: publishedContent.content }} />
    </div>
  );
};

export default DynamicContent;
