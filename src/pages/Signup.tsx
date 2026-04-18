import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { toast } from "@/components/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useAuth } from "@/hooks/use-auth";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { UserRegister } from "@/types/auth";
import { PhoneInput } from "@/components/shared/PhoneInput";

const INDUSTRY_OPTIONS = [
  "Architecture",
  "Engineering",
  "Construction",
  "Real Estate",
  "Technology",
  "Design",
  "Manufacturing",
  "Healthcare",
  "Education",
  "Finance",
  "Retail",
  "Hospitality",
  "Energy",
  "Transportation",
  "Media",
  "Consulting",
  "Government",
  "Nonprofit",
  "Other",
] as const;

const signupSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[a-z]/, {
        message: "Must contain at least one lowercase letter.",
      })
      .regex(/[A-Z]/, {
        message: "Must contain at least one uppercase letter.",
      })
      .regex(/[0-9]/, { message: "Must contain at least one number." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
    role: z.enum(["jobseeker", "employer"], {
      required_error: "Please select your role.",
    }),
    phoneNumber: z
      .string()
      .optional()
      .refine((v) => !v || isValidPhoneNumber(v), {
        message:
          "Enter a valid phone number with country code (e.g. +254712345678)",
      }),
    profileImage: z.string().optional(),
    dateOfBirth: z.string().optional(),
    // Employer fields
    roleTitle: z.string().optional(),
    companyName: z.string().optional(),
    companyWebsite: z.string().url().optional().or(z.literal("")),
    industry: z.string().optional(),
    foundingDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }

    if (data.role === "jobseeker") {
      if (!data.phoneNumber || data.phoneNumber.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phone number is required for job seekers.",
          path: ["phoneNumber"],
        });
      }
      if (!data.dateOfBirth || data.dateOfBirth.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date of birth is required.",
          path: ["dateOfBirth"],
        });
      } else {
        const dob = new Date(data.dateOfBirth);
        const today = new Date();
        const age =
          today.getFullYear() -
          dob.getFullYear() -
          (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
            ? 1
            : 0);
        if (age < 18) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "You must be at least 18 years old to register.",
            path: ["dateOfBirth"],
          });
        }
      }
    }

    if (
      data.role === "employer" &&
      (!data.companyName || data.companyName.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company name is required for employers.",
        path: ["companyName"],
      });
    }
  });

type SignupFormValues = z.infer<typeof signupSchema>;
type NewUserData = SignupFormValues & { profileImage: string };

const Signup = () => {
  const navigate = useNavigate();
  const { register, signInWithLinkedIn, signInWithGoogle } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newUserData, setNewUserData] = useState<NewUserData | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "jobseeker",
      phoneNumber: "",
      profileImage: "",
      dateOfBirth: "",
      roleTitle: "",
      companyName: "",
      companyWebsite: "",
      industry: "",
      foundingDate: "",
    },
  });

  const selectedRole = form.watch("role");
  const watchedPassword = form.watch("password");
  const watchedConfirmPassword = form.watch("confirmPassword");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRoleSelect = (role: "jobseeker" | "employer") => {
    form.setValue("role", role);
    setStep(2);
  };

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);

    try {
      const finalProfileImage =
        values.profileImage ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(values.name)}&background=004ac6&color=fff`;

      const accountType =
        values.role === "jobseeker" ? "job_seeker" : "employer";

      const registrationData: UserRegister = {
        full_name: values.name,
        email: values.email,
        password: values.password,
        account_type: accountType,
        phone_number: values.phoneNumber || undefined,
      };

      if (values.role === "employer") {
        registrationData.company_name = values.companyName || undefined;
        registrationData.company_website = values.companyWebsite || undefined;
        registrationData.industry = values.industry || undefined;
        registrationData.founding_date = values.foundingDate || undefined;
        registrationData.role_title = values.roleTitle || undefined;
      }

      if (values.role === "jobseeker" && values.dateOfBirth) {
        registrationData.date_of_birth = values.dateOfBirth;
      }

      await register(registrationData);

      setNewUserData({ ...values, profileImage: finalProfileImage });

      toast.success("Welcome to Visiondrill!", {
        description:
          "Let's set up your profile to find the perfect opportunities.",
      });
      setShowOnboarding(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again.";
      toast.error("Registration Failed", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInSignup = async () => {
    setIsLoading(true);

    try {
      const accountType =
        selectedRole === "employer" ? "employer" : "job_seeker";
      toast.info("LinkedIn Authentication", {
        description: "Redirecting to LinkedIn for authentication...",
      });
      await signInWithLinkedIn(accountType);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to initiate LinkedIn authentication. Please try again.";
      toast.error("LinkedIn Authentication Failed", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);

    try {
      const accountType =
        selectedRole === "employer" ? "employer" : "job_seeker";
      toast.info("Google Authentication", {
        description: "Redirecting to Google for authentication...",
      });
      await signInWithGoogle(accountType);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to initiate Google authentication. Please try again.";
      toast.error("Google Authentication Failed", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (newUserData?.role === "employer") {
      navigate("/employer/dashboard");
    } else {
      navigate("/jobseeker/dashboard");
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-80px)] bg-surface text-on-surface antialiased flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* ── STEP 1: Role selection ── */}
        {step === 1 && (
          <div className="max-w-3xl w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="text-center space-y-3">
              <h1 className="text-5xl font-headline font-bold text-on-surface leading-tight tracking-tight">
                Welcome to <span className="text-primary">Visiondrill</span>
              </h1>
              <p className="text-lg text-on-surface-variant">
                Tell us how you plan to use the platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Looking for a Job */}
              <button
                type="button"
                onClick={() => handleRoleSelect("jobseeker")}
                className="group flex flex-col items-center gap-6 p-10 rounded-2xl bg-surface-container-lowest border border-transparent hover:border-primary hover:shadow-[0_0_0_1px_#004ac6] transition-all text-left"
              >
                <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">
                    person_search
                  </span>
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-xl font-headline font-bold text-on-surface">
                    I am Looking for a Job
                  </p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Discover curated roles, apply to top employers, and grow
                    your career.
                  </p>
                </div>
                <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  arrow_forward
                </span>
              </button>

              {/* Hiring */}
              <button
                type="button"
                onClick={() => handleRoleSelect("employer")}
                className="group flex flex-col items-center gap-6 p-10 rounded-2xl bg-surface-container-lowest border border-transparent hover:border-primary hover:shadow-[0_0_0_1px_#004ac6] transition-all text-left"
              >
                <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">
                    person_add
                  </span>
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-xl font-headline font-bold text-on-surface">
                    I am Hiring
                  </p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Post opportunities, find elite talent, and build your dream
                    team.
                  </p>
                </div>
                <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  arrow_forward
                </span>
              </button>
            </div>

            <p className="text-center text-sm text-on-surface-variant">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* ── STEP 2: Registration form ── */}
        {step === 2 && (
          <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-400">
            {/* Left panel */}
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-headline font-bold text-on-surface leading-[1.1] tracking-tight">
                  {selectedRole === "employer" ? (
                    <>
                      Build your <span className="text-primary">team.</span>
                    </>
                  ) : (
                    <>
                      Build your <span className="text-primary">future</span>{" "}
                      foundation.
                    </>
                  )}
                </h1>
                <p className="text-lg text-on-surface-variant leading-relaxed">
                  {selectedRole === "employer"
                    ? "Create your employer account and connect with top-tier talent across architecture, engineering, and more."
                    : "Join an elite network of visionary architects, founders, and seekers. Your next great partnership begins with a single step."}
                </p>
              </div>
              <div className="bg-surface-container-low p-8 rounded-lg space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary">
                    <span className="material-symbols-outlined">
                      auto_awesome
                    </span>
                  </div>
                  <div>
                    <p className="font-headline font-bold text-on-surface">
                      Curated Matchmaking
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      AI-driven architectural pairing
                    </p>
                  </div>
                </div>
                <div className="h-48 w-full rounded-md overflow-hidden relative group">
                  <img
                    alt="modern minimalist glass office interior"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9NO69Kp9Av06R2ZZH6RohuBReWl2B5YmA5vZT7Ws2F6vl571CaHoKPA6nQC57HqiCFfgCQXDGSh4XFhcBRFLcKutEJevTgwJdiqE_ji_W2ryVa9rAgauv7-bekh2mj_0IyqQgp8qlLsauTQ8Rradg3jus9O5MEPC9iEweCX6zypwMHkUgK03L8Ou34KMAZqzrgoohTttwrj7dHZ7l3kQBV4zdHH4olfws811dsanfIfQ7S7MJNNi_tgq8TMjc0-772uqsbpoT9e0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
              </div>
            </div>

            {/* Right panel: Form */}
            <div className="lg:col-span-7 bg-surface-container-lowest p-8 md:p-12 rounded-lg shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
              {/* Back button */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Change role
              </button>

              {/* Role badge */}
              <div className="flex items-center gap-2 mb-8">
                <span className="material-symbols-outlined text-primary text-base">
                  {selectedRole === "employer" ? "person_add" : "person_search"}
                </span>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  {selectedRole === "employer"
                    ? "Employer Account"
                    : "Job Seeker Account"}
                </span>
              </div>

              <form
                className="space-y-8"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                {/* ── Job Seeker Fields ── */}
                {selectedRole === "jobseeker" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Full Name
                        </label>
                        <input
                          {...form.register("name")}
                          className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                          placeholder="Alex Sterling"
                          type="text"
                          disabled={isLoading}
                        />
                        {form.formState.errors.name && (
                          <p className="text-sm text-error ml-1">
                            {form.formState.errors.name.message as string}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Email Address
                        </label>
                        <input
                          {...form.register("email")}
                          className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                          placeholder="alex@visiondrill.com"
                          type="email"
                          disabled={isLoading}
                        />
                        {form.formState.errors.email && (
                          <p className="text-sm text-error ml-1">
                            {form.formState.errors.email.message as string}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Phone Number
                        </label>
                        <Controller
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <PhoneInput
                              value={field.value ?? ""}
                              onChange={field.onChange}
                              disabled={isLoading}
                              showValidation
                            />
                          )}
                        />
                        {form.formState.errors.phoneNumber && (
                          <p className="text-sm text-error ml-1">
                            {
                              form.formState.errors.phoneNumber
                                .message as string
                            }
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Date of Birth
                        </label>
                        <input
                          {...form.register("dateOfBirth")}
                          type="date"
                          max={
                            new Date(
                              new Date().setFullYear(
                                new Date().getFullYear() - 18,
                              ),
                            )
                              .toISOString()
                              .split("T")[0]
                          }
                          className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
                          disabled={isLoading}
                        />
                        {form.formState.errors.dateOfBirth && (
                          <p className="text-sm text-error ml-1">
                            {
                              form.formState.errors.dateOfBirth
                                .message as string
                            }
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            {...form.register("password")}
                            className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 pr-12 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-on-surface-variant ml-1">
                          Must contain uppercase, lowercase letters and a number
                        </p>
                        {form.formState.errors.password && (
                          <p className="text-sm text-error ml-1">
                            {form.formState.errors.password.message as string}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            {...form.register("confirmPassword")}
                            className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 pr-12 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                            placeholder="••••••••"
                            type={showConfirmPassword ? "text" : "password"}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {watchedConfirmPassword &&
                          watchedPassword !== watchedConfirmPassword && (
                            <p className="text-sm text-error ml-1">
                              Passwords do not match
                            </p>
                          )}
                        {form.formState.errors.confirmPassword && (
                          <p className="text-sm text-error ml-1">
                            {
                              form.formState.errors.confirmPassword
                                .message as string
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Employer Fields ── */}
                {selectedRole === "employer" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Full Name
                        </label>
                        <input
                          {...form.register("name")}
                          className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                          placeholder="Alex Sterling"
                          type="text"
                          disabled={isLoading}
                        />
                        {form.formState.errors.name && (
                          <p className="text-sm text-error ml-1">
                            {form.formState.errors.name.message as string}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Your Role
                        </label>
                        <input
                          {...form.register("roleTitle")}
                          className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                          placeholder="e.g. CEO, HR Manager, Founder"
                          type="text"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Email Address
                        </label>
                        <input
                          {...form.register("email")}
                          className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                          placeholder="admin@sterling.com"
                          type="email"
                          disabled={isLoading}
                        />
                        {form.formState.errors.email && (
                          <p className="text-sm text-error ml-1">
                            {form.formState.errors.email.message as string}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 border-t border-outline-variant/10 pt-6 md:col-span-2"></div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Company Name
                        </label>
                        <input
                          {...form.register("companyName")}
                          className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                          placeholder="Sterling Architecture"
                          type="text"
                          disabled={isLoading}
                        />
                        {form.formState.errors.companyName && (
                          <p className="text-sm text-error ml-1">
                            {
                              form.formState.errors.companyName
                                .message as string
                            }
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Company Website
                        </label>
                        <input
                          {...form.register("companyWebsite")}
                          className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                          placeholder="https://sterling.com"
                          type="url"
                          disabled={isLoading}
                        />
                        {form.formState.errors.companyWebsite && (
                          <p className="text-sm text-error ml-1">
                            {
                              form.formState.errors.companyWebsite
                                .message as string
                            }
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Industry
                        </label>
                        <select
                          {...form.register("industry")}
                          className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none"
                          disabled={isLoading}
                        >
                          <option value="">Select Industry</option>
                          {INDUSTRY_OPTIONS.map((industry) => (
                            <option key={industry} value={industry}>
                              {industry}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Founding Date
                        </label>
                        <input
                          {...form.register("foundingDate")}
                          type="date"
                          max={new Date().toISOString().split("T")[0]}
                          className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            {...form.register("password")}
                            className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 pr-12 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-on-surface-variant ml-1">
                          Must contain uppercase, lowercase letters and a number
                        </p>
                        {form.formState.errors.password && (
                          <p className="text-sm text-error ml-1">
                            {form.formState.errors.password.message as string}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            {...form.register("confirmPassword")}
                            className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 pr-12 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                            placeholder="••••••••"
                            type={showConfirmPassword ? "text" : "password"}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {watchedConfirmPassword &&
                          watchedPassword !== watchedConfirmPassword && (
                            <p className="text-sm text-error ml-1">
                              Passwords do not match
                            </p>
                          )}
                        {form.formState.errors.confirmPassword && (
                          <p className="text-sm text-error ml-1">
                            {
                              form.formState.errors.confirmPassword
                                .message as string
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms */}
                <div className="flex items-start gap-3 px-1">
                  <input
                    required
                    className="mt-1 rounded text-primary focus:ring-primary/20 border-outline-variant"
                    type="checkbox"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-on-surface-variant leading-relaxed">
                    I agree to the{" "}
                    <Link className="text-primary hover:underline" to="/terms">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      className="text-primary hover:underline"
                      to="/privacy"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </div>

                {/* Submit */}
                <button
                  disabled={isLoading}
                  className="w-full gradient-btn text-on-primary py-5 rounded-full font-headline font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  type="submit"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-outline-variant opacity-20"></div>
                  <span className="text-xs font-bold text-outline-variant tracking-widest uppercase">
                    Or join with
                  </span>
                  <div className="flex-1 h-px bg-outline-variant opacity-20"></div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors font-semibold text-sm disabled:opacity-50"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="#EA4335"
                        d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.3 14.5 2.4 12 2.4 6.8 2.4 2.7 6.6 2.7 12s4.1 9.6 9.3 9.6c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1-.1-1.4H12z"
                      />
                      <path
                        fill="#34A853"
                        d="M3.9 7.5l3.2 2.4c.9-1.8 2.7-3.1 4.9-3.1 1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.3 14.5 2.4 12 2.4c-3.6 0-6.8 2.1-8.1 5.1z"
                      />
                      <path
                        fill="#4A90E2"
                        d="M12 21.6c2.4 0 4.5-.8 6-2.3l-2.8-2.3c-.8.6-1.8 1-3.2 1-2.9 0-5.3-1.9-6.2-4.6l-3.2 2.5c1.4 3.1 4.6 5.7 9.4 5.7z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.8 13.4c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7L2.6 7.5C2 8.9 1.7 10.4 1.7 12s.3 3.1.9 4.5l3.2-2.5z"
                      />
                    </svg>
                    Sign up with Google
                  </button>
                  <button
                    type="button"
                    onClick={handleLinkedInSignup}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors font-semibold text-sm disabled:opacity-50"
                  >
                    <svg
                      className="w-4 h-4 text-[#0077B5]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                    </svg>
                    LinkedIn
                  </button>
                </div>

                <p className="text-center text-sm text-on-surface-variant pt-2">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        )}

        {showOnboarding && newUserData && (
          <OnboardingWizard
            onComplete={handleOnboardingComplete}
            userRole={newUserData.role}
            signupData={newUserData}
          />
        )}
      </div>
    </Layout>
  );
};

export default Signup;
