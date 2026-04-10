
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Help = () => {
  const faqs = [
    {
      question: "How does the job matching algorithm work?",
      answer: "Our AI algorithm analyzes your skills, experience, preferences, and career goals to find jobs that closely match your profile. The higher the match percentage, the better the job aligns with your qualifications."
    },
    {
      question: "How can I improve my job match scores?",
      answer: "Complete your profile, take skills assessments, update your experience regularly, and keep your preferences current. The more information you provide, the better our matching becomes."
    },
    {
      question: "Is my profile information secure?",
      answer: "Yes, we take data security seriously. Your information is encrypted and only shared with employers when you explicitly apply for their positions."
    },
    {
      question: "How do I contact employers directly?",
      answer: "You can contact employers through our platform by applying to their job postings. Some employers may have their contact information visible on their company profiles."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions and get support
            </p>
          </div>
          
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help articles..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4">Still need help?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is here to help.
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

export default Help;
