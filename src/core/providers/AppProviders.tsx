
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FeatureProvider } from "@/hooks/use-features";
import { AuthProvider } from "@/hooks/use-auth";
import { UserProfileProvider } from "@/hooks/use-user-profile";
import { CareerPathsProvider } from "@/hooks/use-career-paths";

// Optimize query client for faster loading
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    },
  },
});

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProfileProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
              <TooltipProvider>
                <FeatureProvider>
                  <CareerPathsProvider>
                    {children}
                    <Toaster />
                    <Sonner />
                  </CareerPathsProvider>
                </FeatureProvider>
              </TooltipProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </UserProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
