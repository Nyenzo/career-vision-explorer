
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-muted-foreground">
              Get in touch with our team. We're here to help you succeed.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
              <Card>
                <CardContent className="p-6">
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="How can we help?" />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6">Get in touch</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <Mail className="h-5 w-5 text-primary mr-3" />
                    <CardTitle className="text-lg">Email</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">support@visiondrill.com</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      We typically respond within 24 hours
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <Phone className="h-5 w-5 text-primary mr-3" />
                    <CardTitle className="text-lg">Phone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">+254 700 000 000</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monday - Friday, 9AM - 6PM EAT
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <MapPin className="h-5 w-5 text-primary mr-3" />
                    <CardTitle className="text-lg">Office</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Nairobi, Kenya<br />
                      Business District
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <Clock className="h-5 w-5 text-primary mr-3" />
                    <CardTitle className="text-lg">Business Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-muted-foreground">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 2:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
