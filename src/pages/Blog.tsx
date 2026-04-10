
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "5 Essential Skills for Tech Careers in 2025",
      excerpt: "Discover the most in-demand technical skills that will shape the future of technology careers.",
      category: "Career Advice",
      date: "March 15, 2024",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "How AI is Transforming Job Search",
      excerpt: "Learn how artificial intelligence is revolutionizing the way we find and apply for jobs.",
      category: "Technology",
      date: "March 10, 2024",
      readTime: "7 min read"
    },
    {
      id: 3,
      title: "Building Your Personal Brand as a Professional",
      excerpt: "Tips and strategies for creating a strong professional presence both online and offline.",
      category: "Professional Development",
      date: "March 5, 2024",
      readTime: "6 min read"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Career Insights Blog</h1>
            <p className="text-xl text-muted-foreground">
              Expert advice, industry insights, and career tips to help you succeed
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-sm text-muted-foreground">{post.readTime}</span>
                  </div>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {post.date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
