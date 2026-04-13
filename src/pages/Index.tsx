import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/use-auth";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="pt-10 md:pt-16 pb-24">
        {/* Hero Section */}
        <section className="px-8 max-w-7xl mx-auto mb-24 lg:mb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-[3.5rem] leading-tight font-bold font-headline text-on-surface tracking-tight">
                Find Your <br />
                <span className="text-primary bg-clip-text">Dream Job</span>
              </h1>
              <p className="text-lg text-outline max-w-md leading-relaxed">
                The architectural approach to talent discovery. We don't just match resumes; we match visions.
              </p>
              <div className="bg-surface-container-lowest p-2 rounded-full shadow-lg flex items-center gap-4 max-w-xl group focus-within:ring-2 ring-primary/20 transition-all">
                <div className="flex-1 flex items-center px-6 gap-3">
                  <span className="material-symbols-outlined text-outline">search</span>
                  <input 
                    className="w-full bg-transparent border-none focus:ring-0 outline-none text-on-surface placeholder:text-outline/60 py-3" 
                    placeholder="Search by role or company..." 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  className="bg-gradient-to-r from-primary to-primary-container text-white px-10 py-4 rounded-full font-semibold hover:scale-[1.02] transition-all flex items-center gap-2"
                  onClick={() => navigate(`/jobseeker/jobs?q=${encodeURIComponent(searchQuery)}`)}
                >
                  Explore
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-xl overflow-hidden aspect-[4/5] shadow-2xl">
                <img alt="Modern Office" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfjDyG_kp-Z3Mdtzbd_J-dQoZKoz7oy_KPMHN9pYGVrGffWH43MkJZkIfrlhGAwRviYvry9HfQgwOVEMSg5ZCv_wH55a0OV5zqidfa4UoF42tMkRwVC8XTqN_9QPK8hZk7yzgwp5C6mLdfotHH5gwNloeNWGHdp0fMiP_dlxQHB0_EnXELTF5MqqOwAYemGRUtoW03JDe_dkZZG1KdxFyBAjlVWWjZHvQ95Wbgu38JU5RUj43AZly4Mhj0NZVxhUA5uGdOSrdnaLg" />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-surface-container-lowest p-6 rounded-lg shadow-xl max-w-xs animate-float">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-tertiary-container/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-outline tracking-widest uppercase">TOP MATCH</div>
                    <div className="font-bold font-headline text-on-surface">Senior Architect</div>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-tertiary-container rounded-md px-4 py-2">
                  <span className="text-on-tertiary text-sm font-semibold">98% Match Score</span>
                  <span className="material-symbols-outlined text-on-tertiary text-sm">trending_up</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 1 (Job Seekers) */}
        <section className="bg-surface-container-low py-24 rounded-3xl mx-4 lg:mx-8 mb-24">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <div className="text-primary font-bold text-sm tracking-widest uppercase mb-2">FOR TALENT</div>
                <h2 className="text-3xl font-bold font-headline">Featured Jobs</h2>
              </div>
              <button onClick={() => navigate('/jobseeker/jobs')} className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                View All <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Job Card 1 */}
              <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-surface-container-low rounded-md flex items-center justify-center overflow-hidden">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZTWic3FAmmGM0gbXO5MZgCNNrGCzxmTpVJIUNbHFQdRUOwNluJcfrO8gOXuk0MONeM3vg-ompyVx2a_Drr5UkrXotnD_qzRBQDjrExnmzZ8vFVWH27_yBxsosKqYpctZSc3ig6gSCNCyOS1l2aYhCkQuaOSE_19EdtSsvrTXlONjE41z7M17MdAdx6PZg-PeeV4yBqXD72Rby0bIuWwf8cen0Tz3RG9A1wZjdo5Pdhlm5WCPYxfc1sR44Z1EoOzXhVIPxz96hcHU" alt="Logo" />
                  </div>
                  <span className="bg-tertiary-container text-on-tertiary px-3 py-1 rounded-md text-xs font-bold">96% MATCH</span>
                </div>
                <h3 className="text-xl font-bold font-headline mb-2 text-on-surface">Product Designer</h3>
                <p className="text-outline text-sm mb-6">Linear Dynamics • San Francisco, CA</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="bg-surface-container-low text-xs px-3 py-1 rounded-sm font-medium text-on-surface-variant">Figma</span>
                  <span className="bg-surface-container-low text-xs px-3 py-1 rounded-sm font-medium text-on-surface-variant">Design Systems</span>
                  <span className="bg-surface-container-low text-xs px-3 py-1 rounded-sm font-medium text-on-surface-variant">Remote</span>
                </div>
                <button className="w-full py-3 bg-surface-container-low text-primary font-bold rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                  Apply Now
                </button>
              </div>
              
              {/* Job Card 2 */}
              <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-surface-container-low rounded-md flex items-center justify-center overflow-hidden">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD90tHjK0Tb53B2CWJYG3UA_4AFsPRnksRJZAY9pgKQduzFrkom7X6tNGWl8skfUezfZZOjM8OrcWvko6CBRrLpnRjhNbAPwRxPB_Yn_kwaEtRGr2Hka690UQrHvNNhuxeAyPv6rKGUrM3KwYH4Wdwb1eqjmSziVZ3o7kVdaZ4PD8tR2oBvRUDyYnJRb0fnHUflZv085-Y7JpvCU7Zy0qX3-gIeBgkMM-Rc85lojlDXpeqDtpYBuwyfna9uhfiLaIur501kG-Pp94U" alt="Logo" />
                  </div>
                  <span className="bg-tertiary-container text-on-tertiary px-3 py-1 rounded-md text-xs font-bold">92% MATCH</span>
                </div>
                <h3 className="text-xl font-bold font-headline mb-2 text-on-surface">Frontend Lead</h3>
                <p className="text-outline text-sm mb-6">Vercel Inc • New York, NY</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="bg-surface-container-low text-xs px-3 py-1 rounded-sm font-medium text-on-surface-variant">React</span>
                  <span className="bg-surface-container-low text-xs px-3 py-1 rounded-sm font-medium text-on-surface-variant">Tailwind</span>
                  <span className="bg-surface-container-low text-xs px-3 py-1 rounded-sm font-medium text-on-surface-variant">Full-time</span>
                </div>
                <button className="w-full py-3 bg-surface-container-low text-primary font-bold rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                  Apply Now
                </button>
              </div>

              {/* Job Card 3 */}
              <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm hover:shadow-md transition-all group hidden lg:block">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-surface-container-low rounded-md flex items-center justify-center overflow-hidden">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5u8tFNwxA8oeIDhcsoUt9xEf5jdZ2NZPSdtGTOq9dMEcVJYq0j326Lv29IP1FQeEgaxtHi4LCPK9NHVIulx4r5KImDM3YKHtUR7UD-7FUN8aSPjb1ANdPi1hIT6nTOWLguXvot7lvx8rVF2hSewf94PS_J-SRQaHxU12AeK1fQCKJ9wyyvOBjHc1khcKGWjKp7TJD79kvY_-C6MYoaUg5y6nKSoiV4E1n58Tx5fj890z-keYnj1WtlvG9Fo0xnJNqOFI4BzpB_-4" alt="Logo" />
                  </div>
                  <span className="bg-tertiary-container text-on-tertiary px-3 py-1 rounded-md text-xs font-bold">89% MATCH</span>
                </div>
                <h3 className="text-xl font-bold font-headline mb-2 text-on-surface">Backend Engineer</h3>
                <p className="text-outline text-sm mb-6">Stripe • Seattle, WA</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="bg-surface-container-low text-xs px-3 py-1 rounded-sm font-medium text-on-surface-variant">Go</span>
                  <span className="bg-surface-container-low text-xs px-3 py-1 rounded-sm font-medium text-on-surface-variant">Rust</span>
                  <span className="bg-surface-container-low text-xs px-3 py-1 rounded-sm font-medium text-on-surface-variant">Hybrid</span>
                </div>
                <button className="w-full py-3 bg-surface-container-low text-primary font-bold rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 2 (Employers) */}
        <section className="mb-24 px-8 max-w-7xl mx-auto">
          <div className="bg-primary rounded-3xl overflow-hidden relative p-12 lg:p-20 text-white shadow-2xl">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            </div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl font-bold font-headline mb-6 leading-tight">Hiring for your next big project?</h2>
              <p className="text-xl text-primary-fixed/80 mb-10 leading-relaxed">
                Access our curated pool of elite talent. We use architectural matching logic to ensure culture-add and technical excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-surface-container-lowest text-primary px-10 py-4 rounded-full font-bold hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                  Post a Job
                </button>
                <button className="border border-white/30 backdrop-blur-sm text-white px-10 py-4 rounded-full font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  Request Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 3 (Co-founders) */}
        <section className="bg-surface-container-low py-24 rounded-3xl mx-4 lg:mx-8 mb-24">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-headline mb-4">Find Your Ideal Co-Founder</h2>
              <p className="text-outline max-w-2xl mx-auto">Build the future with a partner who complements your skills and shares your architectural vision for the industry.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              {/* Co-founder Card 1 (Technical) */}
              <div className="bg-surface-container-lowest rounded-2xl p-10 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transform group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-surface-container">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxchintZliKs3Tn-UWa28-8qqH9OEyD0ALT7cIbzJnj9VLFeaME3XpvUqfRln-nwsJnFgZvfYr_U2hzxTThYNfhmUTgmVtxaLfEK9viXhTJzdlQEElu3pRSKxNIoUkKJ-Xkg-xtwdsU6B7Z1H0TeS_iCfRM4jJS2hFQZrlNKFWqqhQdjS1QtyGE7CEhOLS510SVvdiLjId9avvii0MN6PMSrM85Koj5XpUzlY7rO1K8eDXJ_P6QLh20f5BnvTHPsRSBXEqB79h7nU" alt="Portrait" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-headline">Marcus Chen</h3>
                    <div className="text-primary font-semibold">Technical Co-founder</div>
                  </div>
                </div>
                <p className="text-on-surface-variant mb-8 leading-relaxed italic">"Looking for a visionary business mind to scale a series-A ready AI infrastructure platform."</p>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>Technical Depth</span>
                    <span className="text-primary">Expert</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div className="bg-primary w-[95%] h-full"></div>
                  </div>
                </div>
                <div className="flex gap-2 mb-10">
                  <span className="bg-surface-container-low px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider">Distributed Systems</span>
                  <span className="bg-surface-container-low px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider">Machine Learning</span>
                </div>
                <button className="w-full py-4 bg-primary text-white rounded-full font-bold hover:shadow-xl transition-all">Request Collaboration</button>
              </div>
              
              {/* Co-founder Card 2 (Business) */}
              <div className="bg-surface-container-lowest rounded-2xl p-10 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-container/5 rounded-bl-full transform group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-surface-container">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMgJ239I3vINBc0jDNZjO1QoETsTh5YTyc0PyJSGi9zAG9GJUdI_0RAd8zRe5vXFukoN2gPS52vXiPRrSakS3Vvt0h-nItpOtQfEGXtlYzFNiuVlKWK2Wu3YYp2NiaWcyG5Xbx2H13k5wX5xNRMvRkhIPi8_wCbZv4HM39l-pRYLageRjOomTiliWRc3yXW6gbcuHmUeDylPLqI3_oVwTWlVazU4tlKF79WrOpB2CT0yMGFMJCOlK1Z5Dk3H2jJh5QpZO5JWcN_Z0" alt="Portrait" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-headline">Elena Rodriguez</h3>
                    <div className="text-tertiary font-semibold">Business Co-founder</div>
                  </div>
                </div>
                <p className="text-on-surface-variant mb-8 leading-relaxed italic">"Ex-Googler seeking a lead engineer to build the next generation of sustainable fintech solutions."</p>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>Go-to-Market Strategy</span>
                    <span className="text-tertiary">Expert</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div className="bg-tertiary w-[90%] h-full"></div>
                  </div>
                </div>
                <div className="flex gap-2 mb-10">
                  <span className="bg-surface-container-low px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider">Growth Hacking</span>
                  <span className="bg-surface-container-low px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider">Venture Capital</span>
                </div>
                <button className="w-full py-4 bg-tertiary text-white rounded-full font-bold hover:shadow-xl transition-all">Request Collaboration</button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-8 max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold font-headline text-center mb-20">Your Career Journey with Us</h2>
          <div className="grid md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-outline-variant border-dashed border-t"></div>
            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-surface-container-lowest shadow-lg rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 group-hover:scale-110 transition-transform border border-primary/10">
                <span className="material-symbols-outlined text-primary text-3xl">architecture</span>
              </div>
              <h3 className="text-xl font-bold font-headline mb-4">Blueprint Discovery</h3>
              <p className="text-outline leading-relaxed">Map your skills, aspirations, and professional values into our architectural matching engine.</p>
            </div>
            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-surface-container-lowest shadow-lg rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 group-hover:scale-110 transition-transform border border-primary/10">
                <span className="material-symbols-outlined text-primary text-3xl">hub</span>
              </div>
              <h3 className="text-xl font-bold font-headline mb-4">Vision Alignment</h3>
              <p className="text-outline leading-relaxed">Our AI suggests roles and partners where your unique expertise builds long-term value.</p>
            </div>
            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-surface-container-lowest shadow-lg rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 group-hover:scale-110 transition-transform border border-primary/10">
                <span className="material-symbols-outlined text-primary text-3xl">precision_manufacturing</span>
              </div>
              <h3 className="text-xl font-bold font-headline mb-4">Structural Success</h3>
              <p className="text-outline leading-relaxed">Finalize your match and begin building your legacy in a role designed for your growth.</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
