
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, LogOut } from "lucide-react";

export const ImpersonationBar = () => {
  const { isImpersonating, user, originalUser, stopImpersonation } = useAuth();

  if (!isImpersonating || !originalUser || !user) return null;

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <User className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-800">
          You are impersonating <strong>{user.name}</strong> ({user.email})
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={stopImpersonation}
          className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Stop Impersonation
        </Button>
      </AlertDescription>
    </Alert>
  );
};
