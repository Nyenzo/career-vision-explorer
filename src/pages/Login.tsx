import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import Layout from "@/components/layout/Layout";
import { AuthPageSkeleton } from "@/components/ui/skeleton-loaders";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

const Login = () => {
  const { login, signInWithLinkedIn, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);

    try {
      await login({
        email: values.email,
        password: values.password
      });

      toast.success("Welcome back!", {
        description: "You've been successfully logged in.",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error("Login Failed", {
        description: error.message || "Invalid email or password. Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInLogin = async () => {
    try {
      setIsLoading(true);
      toast.info("LinkedIn Authentication", {
        description: "Redirecting to LinkedIn for authentication...",
      });

      await signInWithLinkedIn();
    } catch (error: any) {
      console.error('LinkedIn login error:', error);
      toast.error("LinkedIn Authentication Failed", {
        description: error.message || "Failed to initiate LinkedIn authentication. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      toast.info("Google Authentication", {
        description: "Redirecting to Google for authentication...",
      });

      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error("Google Authentication Failed", {
        description: error.message || "Failed to initiate Google authentication. Please try again.",
      });
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <AuthPageSkeleton />;
  }

  return (
    <Layout>
      <div className="flex-grow flex items-center justify-center architectural-bg px-6 py-24 relative overflow-hidden min-h-[calc(100vh-80px)]">
        {/* Subtle Architectural Element: Background Card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-surface-container-low rounded-full blur-3xl opacity-40 pointer-events-none"></div>

        {/* Login Card */}
        <div className="relative w-full max-w-md bg-surface-container-lowest rounded-lg p-10 shadow-[0_20px_40px_rgba(25,28,30,0.06)] backdrop-blur-sm bg-opacity-95">
          <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="space-y-2">
              <h1 className="font-headline text-[1.75rem] font-semibold tracking-tight text-on-surface">Welcome Back</h1>
              <p className="text-on-surface-variant font-body">Sign in to continue your visionary journey.</p>
            </div>

            {/* Form Section */}
            <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="email">Email Address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">mail</span>
                    <input
                      {...form.register("email")}
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline-variant transition-all duration-200"
                      id="email"
                      placeholder="name@visiondrill.com"
                      type="email"
                      disabled={isLoading}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-error ml-1">{form.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant" htmlFor="password">Password</label>
                    <Link className="font-label text-xs font-semibold text-primary hover:opacity-80 transition-opacity" to="/forgot-password">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">lock</span>
                    <input
                      {...form.register("password")}
                      className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline-variant transition-all duration-200"
                      id="password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-error ml-1">{form.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <button
                className="gradient-btn w-full py-4 px-8 text-on-primary font-body font-semibold rounded-full hover:scale-[1.02] transition-transform duration-200 shadow-lg shadow-primary-container/20 mt-2 disabled:opacity-50"
                type="submit"
                disabled={isLoading}
              >
                Sign In
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-grow h-[1px] bg-outline-variant opacity-30"></div>
              <span className="font-label text-xs font-semibold text-outline-variant uppercase tracking-widest">or</span>
              <div className="flex-grow h-[1px] bg-outline-variant opacity-30"></div>
            </div>

            {/* Social Login */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-surface-container-low rounded-full hover:bg-surface-container-high transition-colors group disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.3 14.5 2.4 12 2.4 6.8 2.4 2.7 6.6 2.7 12s4.1 9.6 9.3 9.6c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1-.1-1.4H12z" />
                  <path fill="#34A853" d="M3.9 7.5l3.2 2.4c.9-1.8 2.7-3.1 4.9-3.1 1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.3 14.5 2.4 12 2.4c-3.6 0-6.8 2.1-8.1 5.1z" />
                  <path fill="#4A90E2" d="M12 21.6c2.4 0 4.5-.8 6-2.3l-2.8-2.3c-.8.6-1.8 1-3.2 1-2.9 0-5.3-1.9-6.2-4.6l-3.2 2.5c1.4 3.1 4.6 5.7 9.4 5.7z" />
                  <path fill="#FBBC05" d="M5.8 13.4c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7L2.6 7.5C2 8.9 1.7 10.4 1.7 12s.3 3.1.9 4.5l3.2-2.5z" />
                </svg>
                <span className="font-body font-medium text-on-surface-variant">Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleLinkedInLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-surface-container-low rounded-full hover:bg-surface-container-high transition-colors group disabled:opacity-50"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path>
                </svg>
                <span className="font-body font-medium text-on-surface-variant">Continue with LinkedIn</span>
              </button>
            </div>

            {/* Footer Link */}
            <div className="text-center pt-4">
              <p className="text-on-surface-variant font-body">
                Don't have an account?
                <Link className="text-primary font-semibold hover:underline decoration-2 underline-offset-4 ml-1" to="/signup">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Floating Element */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-lg bg-surface-container-low rotate-12 -z-10 opacity-60"></div>
      </div>
    </Layout>
  );
};

export default Login;
