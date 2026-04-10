
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ContentFormData } from "@/hooks/useContentForm";

interface ContentFormProps {
  form: UseFormReturn<ContentFormData>;
  onSubmit: (data: ContentFormData) => void;
  onCancel: () => void;
  submitLabel: string;
}

const ContentForm = ({ form, onSubmit, onCancel, submitLabel }: ContentFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter content title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="url-friendly-slug" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="page">Page Content</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="blog">Blog Post</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="header">Header Text</SelectItem>
                    <SelectItem value="footer">Footer Text</SelectItem>
                    <SelectItem value="navigation">Navigation Menu</SelectItem>
                    <SelectItem value="hero">Hero Section</SelectItem>
                    <SelectItem value="cta">Call to Action</SelectItem>
                    <SelectItem value="feature">Feature Section</SelectItem>
                    <SelectItem value="testimonial-section">Testimonial Section</SelectItem>
                    <SelectItem value="notification">Notification Message</SelectItem>
                    <SelectItem value="email">Email Template</SelectItem>
                    <SelectItem value="button">Button Text</SelectItem>
                    <SelectItem value="form">Form Labels/Text</SelectItem>
                    <SelectItem value="error">Error Message</SelectItem>
                    <SelectItem value="popup">Popup/Modal Text</SelectItem>
                    <SelectItem value="tooltip">Tooltip Text</SelectItem>
                    <SelectItem value="placeholder">Input Placeholder</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location/Context (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., homepage-hero, login-page, global-header, contact-form" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description/Purpose</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of where this content is used and its purpose" 
                  rows={2}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Text</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter the actual text content that will be displayed on the website" 
                  rows={6}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  );
};

export default ContentForm;
