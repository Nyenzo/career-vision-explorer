// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Separator } from '@/components/ui/separator';
// import {
//   Calendar,
//   MessageSquare,
//   Star,
//   MapPin,
//   Globe,
//   Clock,
//   Check,
//   Briefcase,
//   GraduationCap,
//   Award,
//   Code,
//   Linkedin,
//   Github,
//   Mail,
//   Phone,
//   DollarSign,
//   Users,
//   TrendingUp,
//   CheckCircle2
// } from 'lucide-react';
// import { freelancerService } from '@/services/freelancer.service';
// import { Freelancer } from '@/types/freelancer';
// import { toast } from 'sonner';
// import Layout from '@/components/layout/Layout';
// import { useFreelancerEnhancement } from '@/hooks/useFreelancerEnhancement';

// export default function FreelancerProfile() {
//   const { freelancerId } = useParams<{ freelancerId: string }>();
//   const navigate = useNavigate();
//   const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<'portfolio' | 'pricing' | 'reviews'>('portfolio');

//   useEffect(() => {
//     if (freelancerId) {
//       loadFreelancer();
//     } else {
//       // Handle cases where the ID is missing from the URL
//       toast.error('No freelancer ID was provided.');
//       navigate('/freelancers');
//     }
//   }, [freelancerId, navigate]);

//   const loadFreelancer = async () => {
//     // Guard against function calls with no ID
//     if (!freelancerId) return;
//     try {
//       setLoading(true);
//       // Try to get enriched data first
//       try {
//         const enrichedData = await freelancerService.getFreelancerEnriched(freelancerId);
//         setFreelancer(enrichedData);
//       } catch (enrichedError) {
//         // Fall back to regular endpoint if enriched fails
//         console.log('Enriched endpoint failed, falling back to regular endpoint');
//         const data = await freelancerService.getFreelancer(freelancerId);
//         setFreelancer(data);
//       }
//     } catch (error) {
//       console.error('Error loading freelancer:', error);
//       toast.error('Failed to load freelancer profile.');
//       navigate('/freelancers');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Defensive helper function to prevent crashes on undefined names
//   const getInitials = (name: string | undefined) => {
//     if (!name) return '';
//     return name
//       .split(' ')
//       .map(n => n[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   // Defensive helper function for dates
//   const formatDate = (dateString: string | undefined) => {
//     if (!dateString) return 'N/A';
//     try {
//         return new Date(dateString).toLocaleDateString('en-US', {
//             month: 'long',
//             year: 'numeric'
//         });
//     } catch (error) {
//         return 'Invalid Date';
//     }
//   };

//   if (loading) {
//     return (
//       <Layout>
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//           <div className="container mx-auto px-4 py-8">
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//               <div className="lg:col-span-2 space-y-6">
//                 <Skeleton className="h-[250px] w-full" />
//                 <Skeleton className="h-[150px] w-full" />
//                 <Skeleton className="h-[300px] w-full" />
//               </div>
//               <div className="space-y-6">
//                 <Skeleton className="h-[500px] w-full" />
//                 <Skeleton className="h-[200px] w-full" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </Layout>
//     );
//   }

//   // Provide a clear message if the freelancer could not be found
//   if (!freelancer) {
//     return (
//         <Layout>
//             <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center">
//                 <h1 className="text-2xl font-bold mb-4">Freelancer Not Found</h1>
//                 <p className="text-gray-600 dark:text-gray-400 mb-8">The profile you are looking for does not exist.</p>
//                 <Button onClick={() => navigate('/freelancers')}>Return to Freelancers</Button>
//             </div>
//         </Layout>
//     );
//   }

//   const pricingPackages = {
//     basic: freelancer.pricing?.basic_package,
//     standard: freelancer.pricing?.standard_package,
//     premium: freelancer.pricing?.premium_package
//   };

//   const currentPackage = pricingPackages[selectedPackage];
//   const [activeTab, setActiveTab] = useState<'portfolio' | 'pricing' | 'reviews'>('portfolio');

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//         <div className="container mx-auto px-4 py-8">
//           {/* Profile Header - Full Width */}
//           <div className="mb-8">
//               {/* Profile Header */}
//               <Card>
//                 <CardContent className="p-6">
//                   <div className="flex flex-col sm:flex-row items-start gap-6">
//                     <Avatar className="h-24 w-24">
//                       <AvatarImage src={freelancer.profile_image_url} alt={freelancer.name} />
//                       <AvatarFallback className="text-2xl">
//                         {getInitials(freelancer.name)}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div className="flex-1">
//                       <div className="flex flex-col sm:flex-row items-start justify-between">
//                         <div>
//                           <h1 className="text-2xl font-bold">{freelancer.name}</h1>
//                           <p className="text-lg text-gray-600 dark:text-gray-400">
//                             {freelancer.title}
//                           </p>
//                           <div className="flex items-center flex-wrap gap-4 mt-2 text-sm text-gray-500">
//                             {freelancer.location && (
//                               <div className="flex items-center gap-1">
//                                 <MapPin className="w-4 h-4" />
//                                 <span>{freelancer.location}</span>
//                               </div>
//                             )}
//                             <div className="flex items-center gap-1">
//                               <Calendar className="w-4 h-4" />
//                               <span>Joined {formatDate(freelancer.member_since)}</span>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="text-left sm:text-right mt-4 sm:mt-0">
//                           <div className="flex items-center gap-1 mb-1">
//                             <Star className="w-5 h-5 text-yellow-500 fill-current" />
//                             {/* Use optional chaining to prevent crash if rating is missing */}
//                             <span className="text-lg font-semibold">{freelancer.rating?.toFixed(1) ?? 'N/A'}</span>
//                           </div>
//                           <p className="text-sm text-gray-500">
//                             ({freelancer.total_reviews ?? 0} reviews)
//                           </p>
//                         </div>
//                       </div>
//                       <p className="mt-4 text-gray-700 dark:text-gray-300">
//                         {freelancer.bio}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex flex-col sm:flex-row gap-3 mt-6">
//                     <Button size="lg" className="flex-1">
//                       <Calendar className="w-4 h-4 mr-2" />
//                       Schedule Interview
//                     </Button>
//                     <Button size="lg" variant="outline" className="flex-1">
//                       <MessageSquare className="w-4 h-4 mr-2" />
//                       Contact
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Skills */}
//               {freelancer.skills && freelancer.skills.length > 0 && (
//                 <Card>
//                   <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
//                   <CardContent>
//                     <div className="flex flex-wrap gap-2">
//                       {freelancer.skills.map((skill, index) => (
//                         <Badge key={index} variant="secondary">{skill}</Badge>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               )}

//               {/* Portfolio */}
//               {freelancer.portfolio_items && freelancer.portfolio_items.length > 0 && (
//                 <Card>
//                   <CardHeader><CardTitle>Portfolio</CardTitle></CardHeader>
//                   <CardContent>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {freelancer.portfolio_items.map((item) => (
//                         <div key={item.id} className="group cursor-pointer">
//                           <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
//                             <img
//                               src={item.image_url}
//                               alt={item.title}
//                               className="w-full h-full object-cover group-hover:scale-105 transition-transform"
//                             />
//                           </div>
//                           <h3 className="mt-2 font-medium">{item.title}</h3>
//                           <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
//                           <div className="flex flex-wrap gap-1 mt-2">
//                             {item.tags?.map((tag, index) => (
//                               <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
//                             ))}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               )}
//             </div>

//             {/* Sidebar - Right Side */}
//             <div className="space-y-6">
//               {/* Pricing - Only render if pricing data exists */}
//               {freelancer.pricing && (
//                 <Card>
//                   <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
//                   <CardContent>
//                     <Tabs value={selectedPackage} onValueChange={(v) => setSelectedPackage(v as 'basic' | 'standard' | 'premium')}>
//                       <TabsList className="grid w-full grid-cols-3">
//                         {freelancer.pricing.basic_package && <TabsTrigger value="basic">Basic</TabsTrigger>}
//                         {freelancer.pricing.standard_package && <TabsTrigger value="standard">Standard</TabsTrigger>}
//                         {freelancer.pricing.premium_package && <TabsTrigger value="premium">Premium</TabsTrigger>}
//                       </TabsList>

//                       {currentPackage && (
//                         <div className="mt-6">
//                           <h3 className="text-lg font-semibold">{currentPackage.name}</h3>
//                           <div className="mt-4">
//                             <span className="text-3xl font-bold">${currentPackage.price}</span>
//                           </div>
//                           <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{currentPackage.description}</p>

//                           <div className="mt-4 space-y-2">
//                             <div className="flex items-center gap-2 text-sm">
//                               <Clock className="w-4 h-4 text-gray-400" />
//                               <span>{currentPackage.delivery_days} days delivery</span>
//                             </div>
//                             <div className="flex items-center gap-2 text-sm">
//                               <span className="text-gray-400">↻</span>
//                               <span>{currentPackage.revisions} revisions</span>
//                             </div>
//                           </div>

//                           <div className="mt-4 space-y-2">
//                             {currentPackage.features?.map((feature, index) => (
//                               <div key={index} className="flex items-start gap-2 text-sm">
//                                 <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
//                                 <span>{feature}</span>
//                               </div>
//                             ))}
//                           </div>

//                           <Button className="w-full mt-6" size="lg">Continue (${currentPackage.price})</Button>
//                         </div>
//                       )}
//                     </Tabs>
//                   </CardContent>
//                 </Card>
//               )}

//               {/* Additional Info */}
//               <Card>
//                 <CardContent className="p-6 space-y-4">
//                   {freelancer.languages && freelancer.languages.length > 0 && (
//                     <div>
//                       <h4 className="font-medium mb-2">Languages</h4>
//                       <div className="flex flex-wrap gap-2">
//                         {freelancer.languages.map((language, index) => (
//                           <Badge key={index} variant="outline">{language}</Badge>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {freelancer.portfolio_url && (
//                     <div>
//                       <h4 className="font-medium mb-2">Portfolio</h4>
//                       <a href={freelancer.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
//                         <Globe className="w-4 h-4" />
//                         <span>View External Portfolio</span>
//                       </a>
//                     </div>
//                   )}

//                   {freelancer.experience_years !== undefined && (
//                     <div>
//                       <h4 className="font-medium mb-2">Experience</h4>
//                       <p className="text-gray-600 dark:text-gray-400">
//                         {freelancer.experience_years} {freelancer.experience_years === 1 ? 'year' : 'years'}
//                       </p>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }
