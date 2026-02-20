
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Linkedin, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import ProfileImageUpload from "@/components/auth/ProfileImageUpload";
import PhoneNumberInput from "@/components/auth/PhoneNumberInput";
import LinkedInImportDialog from "@/components/auth/LinkedInImportDialog";

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
    message: "Password must be at least 8 characters.",
  }),
  role: z.enum(["jobseeker", "employer", "freelancer"], {
    required_error: "Please select your role.",
  }),
  countryCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  profileImage: z.string().optional(),
  videoUrl: z.string().optional(),
  // Freelancer fields
  professionalTitle: z.string().optional(),
  hourlyRate: z.string().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  // Employer fields
  companyName: z.string().optional(),
  companyWebsite: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
}).superRefine((data, ctx) => {
  // Password confirmation validation
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    });
  }
  // Job seeker validation
  if (data.role === 'jobseeker') {
    if (!data.phoneNumber || data.phoneNumber.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone number is required for job seekers.',
        path: ['phoneNumber'],
      });
    }
  }
  // Employer validation
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

const Signup = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [linkedInImportOpen, setLinkedInImportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const [linkedInDataImported, setLinkedInDataImported] = useState(false);
  const [newUserData, setNewUserData] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const location = useLocation()
  
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "jobseeker",
      countryCode: "+254",
      phoneNumber: "",
      profileImage: "",
      // Freelancer fields
      professionalTitle: "",
      hourlyRate: "",
      portfolioUrl: "",
      // Employer fields
      companyName: "",
      companyWebsite: "",
      industry: "",
    },
  });

  const selectedRole = form.watch("role");
  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  const handleImageChange = (imageUrl: string) => {
    setProfileImage(imageUrl);
    form.setValue('profileImage', imageUrl);
  };
  
  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    console.log('🚀 Form submitted with values:', values);
    setIsLoading(true);
    
    try {
      // Use default profile image if none provided
      const finalProfileImage = values.profileImage || 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=' + values.name.charAt(0);

      console.log('📝 Registering user with data:', {
        name: values.name,
        email: values.email,
        role: values.role,
        finalProfileImage
      });

      // Map frontend role to backend role
      const accountType = values.role === 'jobseeker' ? 'job_seeker' : values.role === 'employer' ? 'employer' : 'freelancer';

      // Prepare registration data based on user role
      const registrationData: any = {
        name: values.name,
        email: values.email,
        password: values.password,
        account_type: accountType
      };

      // Add role-specific data
      if (values.role === 'employer') {
        // Store employer-specific data in preferences
        registrationData.preferences = {
          companyName: values.companyName,
          companyWebsite: values.companyWebsite,
          industry: values.industry
        };
      } else if (values.role === 'freelancer') {
        // Add freelancer-specific fields
        registrationData.bio = values.professionalTitle;
        registrationData.preferences = {
          hourlyRate: values.hourlyRate,
          portfolioUrl: values.portfolioUrl
        };
      } else if (values.role === 'jobseeker') {
        // Add job seeker phone number to preferences
        registrationData.preferences = {
          countryCode: values.countryCode,
          phoneNumber: values.phoneNumber
        };
      }

      // Register the new user using the real backend
      await register(registrationData);

      console.log('✅ User registered successfully');

      // Store new user data for onboarding
      setNewUserData({...values, profileImage: finalProfileImage});
      
      // Show success message
      toast.success("Account Created Successfully!", {
        description: "Welcome to Visiondrill! Let's set up your profile.",
      });
      
      console.log('✅ Registration includes auto-login');
      toast.success("Welcome to Visiondrill!", {
        description: "Let's set up your profile to find the perfect opportunities.",
      });
      setShowOnboarding(true);
    } catch (error: any) {
      console.error('💥 Signup error:', error);
      toast.error("Registration Failed", {
        description: error.message || "Failed to create account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitError = (errors: any) => {
    // Show specific validation errors to user
    Object.keys(errors).forEach(field => {
      const error = errors[field];
      if (error?.message) {
        toast.error("Form Validation Error", {
          description: `${field}: ${error.message}`,
        });
      }
    });
  };

  const handleLinkedInSignup = () => {
    setLinkedInImportOpen(true);
  };

  const handleLinkedInConnect = async () => {
    setIsLoading(true);
    
    try {
      // Generate unique email to avoid conflicts
      const timestamp = Date.now();
      const linkedInData = {
        name: 'John Doe',
        email: `john.doe${timestamp}@example.com`,
        password: 'linkedinpass123',
        profileImage: 'https://via.placeholder.com/150',
        role: selectedRole
      };
      
      // Pre-fill form with LinkedIn data
      form.setValue('name', linkedInData.name);
      form.setValue('email', linkedInData.email);
      form.setValue('password', linkedInData.password);
      form.setValue('profileImage', linkedInData.profileImage);
      setProfileImage(linkedInData.profileImage);
      
      // Pre-fill role-specific fields based on LinkedIn data
      if (selectedRole === 'freelancer') {
        // Simulate extracting professional info from LinkedIn
        form.setValue('professionalTitle', 'Senior Software Developer'); // Would be extracted from LinkedIn
        form.setValue('hourlyRate', '$75'); // Could be suggested based on title
        form.setValue('portfolioUrl', 'https://linkedin.com/in/johndoe'); // LinkedIn profile as portfolio
      } else if (selectedRole === 'employer') {
        // Simulate extracting company info from LinkedIn
        form.setValue('companyName', 'Tech Solutions Inc'); // Would be extracted from LinkedIn
        form.setValue('companyWebsite', 'https://techsolutions.com');
        form.setValue('industry', 'Technology');
      }
      
      setLinkedInImportOpen(false);
      setLinkedInDataImported(true);
      
      // Show appropriate message based on role
      let description = "LinkedIn data imported successfully!";
      if (selectedRole === "jobseeker") {
        description += " Please add your phone number to complete registration.";
      } else if (selectedRole === "freelancer") {
        description += " Review your professional details and complete registration.";
      } else if (selectedRole === "employer") {
        description += " Please verify your company information.";
      }
      
      toast.success("LinkedIn Data Imported", { description });
      
    } catch (error) {
      console.error('LinkedIn signup error:', error);
      toast.error("LinkedIn Import Failed", {
        description: "Failed to import LinkedIn data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    
    // Redirect based on user role
    if (newUserData?.role === 'employer') {
      navigate('/employer/dashboard');
    } else if (newUserData?.role === 'freelancer') {
      navigate('/freelancer/dashboard');
    } else {
      navigate('/jobseeker/dashboard');
    }
    
    toast.success("Welcome to Visiondrill!", {
      description: "Your profile has been set up successfully.",
    });
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              {linkedInDataImported 
                ? selectedRole === "jobseeker"
                  ? "Add your phone number to complete registration"
                  : "Complete your profile to finish registration"
                : "Join Visiondrill to explore career opportunities tailored to your skills and goals."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onSubmitError)} className="space-y-4">
                <ProfileImageUpload
                  profileImage={profileImage}
                  onImageChange={handleImageChange}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          {...field}
                          className="transition-all focus:ring-2 focus:ring-career-blue"
                          disabled={linkedInDataImported}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="john@example.com" 
                          {...field}
                          className="transition-all focus:ring-2 focus:ring-career-blue"
                          disabled={linkedInDataImported}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I am a</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={linkedInDataImported}>
                        <FormControl>
                          <SelectTrigger className="transition-all focus:ring-2 focus:ring-career-blue">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="jobseeker">Job Seeker</SelectItem>
                          <SelectItem value="employer">Employer</SelectItem>
                          <SelectItem value="freelancer">Freelancer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedRole === "jobseeker" && (
                  <PhoneNumberInput
                    control={form.control}
                    countryCodeName="countryCode"
                    phoneNumberName="phoneNumber"
                  />
                )}

                {selectedRole === "freelancer" && (
                  <>
                    <FormField
                      control={form.control}
                      name="professionalTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Title (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Full Stack Developer" 
                              {...field}
                              className="transition-all focus:ring-2 focus:ring-career-blue"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., $50" 
                              {...field}
                              className="transition-all focus:ring-2 focus:ring-career-blue"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="portfolioUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfolio URL (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://yourportfolio.com" 
                              {...field}
                              className="transition-all focus:ring-2 focus:ring-career-blue"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {selectedRole === "employer" && (
                  <>
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your Company Name" 
                              {...field}
                              className="transition-all focus:ring-2 focus:ring-career-blue"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="companyWebsite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Website (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://yourcompany.com" 
                              {...field}
                              className="transition-all focus:ring-2 focus:ring-career-blue"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Technology, Healthcare" 
                              {...field}
                              className="transition-all focus:ring-2 focus:ring-career-blue"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field}
                            className="transition-all focus:ring-2 focus:ring-career-blue pr-10"
                            disabled={linkedInDataImported}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            disabled={linkedInDataImported}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field}
                            className="transition-all focus:ring-2 focus:ring-career-blue pr-10"
                            disabled={linkedInDataImported}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            disabled={linkedInDataImported}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-career-blue hover:bg-career-blue/90 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                
                {!linkedInDataImported && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Or sign up with</p>
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        onClick={handleLinkedInSignup}
                        className="w-full flex items-center justify-center gap-2 transition-colors hover:bg-gray-50"
                        disabled={isLoading}
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link to="/login" className="text-career-blue hover:underline transition-colors">
                      Log in
                    </Link>
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
       
        {showOnboarding && newUserData && (
          <OnboardingWizard 
            onComplete={handleOnboardingComplete} 
            userRole={newUserData.role}
            signupData={newUserData}
          />
        )}
        
        <LinkedInImportDialog
          open={linkedInImportOpen}
          onOpenChange={setLinkedInImportOpen}
          onConnect={handleLinkedInConnect}
          isLoading={isLoading}
          selectedRole={selectedRole}
        />
      </div>
    </Layout>
  );
};

export default Signup;
