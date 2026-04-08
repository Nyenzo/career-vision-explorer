
import Layout from "@/components/layout/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          id: "1",
          question: "How do I create an account?",
          answer: "Click the 'Sign Up' button in the top right corner, choose your account type (Job Seeker or Employer), and fill in your details. You'll receive a confirmation email to activate your account."
        },
        {
          id: "2",
          question: "What's the difference between job seeker and employer accounts?",
          answer: "Job seeker accounts are for individuals looking for employment opportunities, while employer accounts are for companies posting job openings and managing applications."
        }
      ]
    },
    {
      category: "Job Matching",
      questions: [
        {
          id: "3",
          question: "How does the job matching algorithm work?",
          answer: "Our AI analyzes your skills, experience, location preferences, and career goals to calculate compatibility scores with available positions. The algorithm considers factors like skill overlap, experience level, and cultural fit."
        },
        {
          id: "4",
          question: "Why am I seeing low match scores?",
          answer: "Low match scores typically indicate skill gaps or misaligned preferences. Complete your profile, take skills assessments, and update your preferences to improve matching accuracy."
        }
      ]
    },
    {
      category: "Profile & Skills",
      questions: [
        {
          id: "5",
          question: "How do I add skills to my profile?",
          answer: "Go to your profile page, click on the 'Skills' section, and use the 'Add Skill' button. You can also take our skills assessments to automatically add verified skills to your profile."
        },
        {
          id: "6",
          question: "What are skills assessments?",
          answer: "Skills assessments are interactive tests that evaluate your proficiency in various technical and soft skills. Completing them adds verified skills to your profile and improves job matching."
        }
      ]
    },
    {
      category: "Applications & Interviews",
      questions: [
        {
          id: "7",
          question: "How do I apply for jobs?",
          answer: "Browse jobs on the Jobs page, click on positions that interest you, and click 'Apply Now'. You can attach your resume and write a cover letter during the application process."
        },
        {
          id: "8",
          question: "Can I track my application status?",
          answer: "Yes, you can track all your applications in your dashboard. You'll receive notifications when employers review your application or request interviews."
        }
      ]
    },
    {
      category: "Account & Privacy",
      questions: [
        {
          id: "9",
          question: "Is my information secure?",
          answer: "Yes, we use industry-standard encryption to protect your data. Your profile is only visible to employers when you apply for their positions, and you control what information is shared."
        },
        {
          id: "10",
          question: "How do I delete my account?",
          answer: "Go to Account Settings > Privacy Settings and click 'Delete Account'. Note that this action is permanent and cannot be undone."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground">
              Find quick answers to common questions about using Visiondrill
            </p>
          </div>
          
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-8">
            {filteredFaqs.map((category) => (
              <div key={category.category}>
                <h2 className="text-2xl font-semibold mb-4">{category.category}</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No FAQs found matching your search.</p>
            </div>
          )}

          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is ready to help.
            </p>
            <a href="/contact" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
