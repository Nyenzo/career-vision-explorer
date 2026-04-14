import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { toast } from "@/components/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { UserRegister } from "@/types/auth";

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

const signupSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Confirm password must be at least 8 characters.",
  }),
  role: z.enum(["jobseeker", "employer"], {
    required_error: "Please select your role.",
  }),
  phoneNumber: z.string().optional(),
  profileImage: z.string().optional(),
  dateOfBirth: z.string().min(1, {
    message: "Date of birth is required.",
  }),
  // Employer fields
  companyName: z.string().optional(),
  companyWebsite: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    });
  }

  if (data.role === 'jobseeker') {
    if (!data.phoneNumber || data.phoneNumber.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone number is required for job seekers.',
        path: ['phoneNumber'],
      });
    }
  }

  if (data.dateOfBirth && data.role === 'jobseeker') {
    const dob = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear() -
      (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
    if (age < 18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'You must be at least 18 years old to register.',
        path: ['dateOfBirth'],
      });
    }
  }
  if (data.role === 'employer') {
    if (!data.companyName || data.companyName.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Company name is required for employers.',
        path: ['companyName'],
      });
    }
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
      companyName: "",
      companyWebsite: "",
      industry: "",
    },
  });

  const selectedRole = form.watch("role");

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);

    try {
      const finalProfileImage = values.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(values.name)}&background=004ac6&color=fff`;

      const accountType = values.role === 'jobseeker' ? 'job_seeker' : 'employer';

      const registrationData: UserRegister = {
        full_name: values.name,   // API expects full_name
        email: values.email,
        password: values.password,
        account_type: accountType
      };

      if (values.role === 'employer') {
        registrationData.company_name = values.companyName || undefined;
        registrationData.company_website = values.companyWebsite || undefined;
        registrationData.industry = values.industry || undefined;
      }

      if (values.dateOfBirth) {
        registrationData.date_of_birth = values.dateOfBirth;
      }

      await register(registrationData);

      setNewUserData({ ...values, profileImage: finalProfileImage });

      toast.success("Welcome to Visiondrill!", {
        description: "Let's set up your profile to find the perfect opportunities.",
      });
      setShowOnboarding(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create account. Please try again.";
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
      const accountType = selectedRole === "employer" ? "employer" : "job_seeker";
      toast.info("LinkedIn Authentication", {
        description: "Redirecting to LinkedIn for authentication...",
      });
      await signInWithLinkedIn(accountType);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to initiate LinkedIn authentication. Please try again.";
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
      const accountType = selectedRole === "employer" ? "employer" : "job_seeker";
      toast.info("Google Authentication", {
        description: "Redirecting to Google for authentication...",
      });
      await signInWithGoogle(accountType);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to initiate Google authentication. Please try again.";
      toast.error("Google Authentication Failed", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (newUserData?.role === 'employer') {
      navigate('/employer/dashboard');
    } else {
      navigate('/jobseeker/dashboard');
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-80px)] bg-surface text-on-surface antialiased flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side: Visionary Content */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-headline font-bold text-on-surface leading-[1.1] tracking-tight">
                Build your <span className="text-primary">future</span> foundation.
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                Join an elite network of visionary architects, founders, and seekers. Your next great partnership begins with a single step.
              </p>
            </div>
            {/* Featured Card (Architectural Element) */}
            <div className="bg-surface-container-low p-8 rounded-lg space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-on-surface">Curated Matchmaking</p>
                  <p className="text-sm text-on-surface-variant">AI-driven architectural pairing</p>
                </div>
              </div>
              <div className="h-48 w-full rounded-md overflow-hidden relative group">
                <img alt="modern minimalist glass office interior" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9NO69Kp9Av06R2ZZH6RohuBReWl2B5YmA5vZT7Ws2F6vl571CaHoKPA6nQC57HqiCFfgCQXDGSh4XFhcBRFLcKutEJevTgwJdiqE_ji_W2ryVa9rAgauv7-bekh2mj_0IyqQgp8qlLsauTQ8Rradg3jus9O5MEPC9iEweCX6zypwMHkUgK03L8Ou34KMAZqzrgoohTttwrj7dHZ7l3kQBV4zdHH4olfws811dsanfIfQ7S7MJNNi_tgq8TMjc0-772uqsbpoT9e0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Right Side: Multi-field Form Card */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-8 md:p-12 rounded-lg shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Role Selection (The Switcher) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Primary Role</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`role-option relative flex items-center p-4 rounded-md cursor-pointer transition-all group border ${selectedRole === 'jobseeker' ? 'bg-secondary-fixed border-primary shadow-[0_0_0_1px_#004ac6]' : 'bg-surface-container-low hover:bg-surface-container-high border-transparent'}`}>
                    <input
                      {...form.register("role")}
                      className="w-4 h-4 text-primary focus:ring-primary/20 border-outline-variant bg-transparent"
                      type="radio"
                      value="jobseeker"
                      disabled={isLoading}
                    />
                    <span className="ml-4 font-medium text-on-surface">I am Looking for a Job</span>
                    <span className="ml-auto material-symbols-outlined text-outline-variant group-hover:text-primary">person_search</span>
                  </label>
                  <label className={`role-option relative flex items-center p-4 rounded-md cursor-pointer transition-all group border ${selectedRole === 'employer' ? 'bg-secondary-fixed border-primary shadow-[0_0_0_1px_#004ac6]' : 'bg-surface-container-low hover:bg-surface-container-high border-transparent'}`}>
                    <input
                      {...form.register("role")}
                      className="w-4 h-4 text-primary focus:ring-primary/20 border-outline-variant bg-transparent"
                      type="radio"
                      value="employer"
                      disabled={isLoading}
                    />
                    <span className="ml-4 font-medium text-on-surface">I am Hiring</span>
                    <span className="ml-auto material-symbols-outlined text-outline-variant group-hover:text-primary">person_add</span>
                  </label>
                </div>
              </div>

              {/* Dynamic Fields Container */}
              <div>
                {/* State 1: Job Seeker Fields */}
                {selectedRole === 'jobseeker' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Full Name</label>
                        <input {...form.register('name')} className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant" placeholder="Alex Sterling" type="text" disabled={isLoading} />
                        {form.formState.errors.name && <p className="text-sm text-error ml-1">{form.formState.errors.name.message as string}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Email Address</label>
                        <input {...form.register('email')} className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant" placeholder="alex@visiondrill.com" type="email" disabled={isLoading} />
                        {form.formState.errors.email && <p className="text-sm text-error ml-1">{form.formState.errors.email.message as string}</p>}
                      </div>
                      <div className="space-y-2 col-span-2 grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Phone Number</label>
                          <input {...form.register('phoneNumber')} className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant" placeholder="+1 (555) 000-0000" type="tel" disabled={isLoading} />
                          {form.formState.errors.phoneNumber && <p className="text-sm text-error ml-1">{form.formState.errors.phoneNumber.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Date of Birth</label>
                          <input
                            {...form.register('dateOfBirth')}
                            type="date"
                            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                            className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
                            disabled={isLoading}
                          />
                          {form.formState.errors.dateOfBirth && <p className="text-sm text-error ml-1">{form.formState.errors.dateOfBirth.message as string}</p>}
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Password</label>
                        <input {...form.register('password')} className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant" placeholder="••••••••" type="password" disabled={isLoading} />
                        {form.formState.errors.password && <p className="text-sm text-error ml-1">{form.formState.errors.password.message as string}</p>}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Confirm Password</label>
                        <input {...form.register('confirmPassword')} className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant" placeholder="••••••••" type="password" disabled={isLoading} />
                        {form.formState.errors.confirmPassword && <p className="text-sm text-error ml-1">{form.formState.errors.confirmPassword.message as string}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* State 2: Employer Fields */}
                {selectedRole === 'employer' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Full Name</label>
                        <input {...form.register('name')} className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant" placeholder="Alex Sterling" type="text" disabled={isLoading} />
                        {form.formState.errors.name && <p className="text-sm text-error ml-1">{form.formState.errors.name.message as string}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Email Address</label>
                        <input {...form.register('email')} className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant" placeholder="admin@sterling.com" type="email" disabled={isLoading} />
                        {form.formState.errors.email && <p className="text-sm text-error ml-1">{form.formState.errors.email.message as string}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Company Name</label>
                        <input {...form.register('companyName')} className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant" placeholder="Sterling Architecture" type="text" disabled={isLoading} />
                        {form.formState.errors.companyName && <p className="text-sm text-error ml-1">{form.formState.errors.companyName.message as string}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Company Website</label>
                        <input {...form.register('companyWebsite')} className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant" placeholder="https://sterling.com" type="url" disabled={isLoading} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Industry</label>
                        <select {...form.register('industry')} className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none" disabled={isLoading}>
                          <option value="">Select Industry</option>
                          {INDUSTRY_OPTIONS.map((industry) => (
                            <option key={industry} value={industry}>{industry}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Founding Date</label>
                        <input
                          {...form.register('dateOfBirth')}
                          type="date"
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
                          disabled={isLoading}
                        />
                        {form.formState.errors.dateOfBirth && <p className="text-sm text-error ml-1">{form.formState.errors.dateOfBirth.message as string}</p>}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Password</label>
                        <input {...form.register('password')} className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant" placeholder="••••••••" type="password" disabled={isLoading} />
                        {form.formState.errors.password && <p className="text-sm text-error ml-1">{form.formState.errors.password.message as string}</p>}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Confirm Password</label>
                        <input {...form.register('confirmPassword')} className="w-full bg-surface-container-low border-none rounded-md px-5 py-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant" placeholder="••••••••" type="password" disabled={isLoading} />
                        {form.formState.errors.confirmPassword && <p className="text-sm text-error ml-1">{form.formState.errors.confirmPassword.message as string}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start gap-3 px-1">
                <input required className="mt-1 rounded text-primary focus:ring-primary/20 border-outline-variant" type="checkbox" disabled={isLoading} />
                <span className="text-sm text-on-surface-variant leading-relaxed">
                  I agree to the <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
                </span>
              </div>

              {/* Action Button */}
              <button disabled={isLoading} className="w-full gradient-btn text-on-primary py-5 rounded-full font-headline font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50" type="submit">
                {isLoading ? 'Creating Account...' : 'Create Account'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-outline-variant opacity-20"></div>
                <span className="text-xs font-bold text-outline-variant tracking-widest uppercase">Or join with</span>
                <div className="flex-1 h-px bg-outline-variant opacity-20"></div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={handleGoogleSignup} disabled={isLoading} className="flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors font-semibold text-sm disabled:opacity-50">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.3 14.5 2.4 12 2.4 6.8 2.4 2.7 6.6 2.7 12s4.1 9.6 9.3 9.6c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1-.1-1.4H12z" />
                    <path fill="#34A853" d="M3.9 7.5l3.2 2.4c.9-1.8 2.7-3.1 4.9-3.1 1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.3 14.5 2.4 12 2.4c-3.6 0-6.8 2.1-8.1 5.1z" />
                    <path fill="#4A90E2" d="M12 21.6c2.4 0 4.5-.8 6-2.3l-2.8-2.3c-.8.6-1.8 1-3.2 1-2.9 0-5.3-1.9-6.2-4.6l-3.2 2.5c1.4 3.1 4.6 5.7 9.4 5.7z" />
                    <path fill="#FBBC05" d="M5.8 13.4c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7L2.6 7.5C2 8.9 1.7 10.4 1.7 12s.3 3.1.9 4.5l3.2-2.5z" />
                  </svg>
                  Sign up with Google
                </button>
                <button type="button" onClick={handleLinkedInSignup} disabled={isLoading} className="flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors font-semibold text-sm disabled:opacity-50">
                  <svg className="w-4 h-4 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                  LinkedIn
                </button>
              </div>
            </form>
          </div>
        </div>


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
