import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FeatureProvider } from "@/hooks/use-features";
import AuthProvider from "@/hooks/use-auth";
import { UserProfileProvider } from "@/hooks/use-user-profile";
import { ReactNode } from "react";

// Optimize query client for faster loading
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <UserProfileProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light" storageKey="visiondrill-ui-theme">
            <TooltipProvider>
              <FeatureProvider>
                  {children}
                  <Toaster />
                  <Sonner />
              </FeatureProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </UserProfileProvider>
    </AuthProvider>
  );
};
