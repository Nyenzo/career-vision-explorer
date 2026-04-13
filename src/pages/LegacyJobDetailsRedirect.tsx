import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const LegacyJobDetailsRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const { isEmployer } = useAuth();

  if (!id) {
    return <Navigate to="/" replace />;
  }

  const target = isEmployer() ? `/employer/jobs/${id}` : `/jobseeker/jobs/${id}`;
  return <Navigate to={target} replace />;
};

export default LegacyJobDetailsRedirect;
