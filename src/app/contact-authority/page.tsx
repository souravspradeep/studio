import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactAuthorityPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Contact the Student Welfare Office</CardTitle>
          <CardDescription>
            This is the central point for all lost and found items on campus. Please bring any found items here, or come here to reclaim a lost item.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <MapPin className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Location</h3>
              <p className="text-muted-foreground">Academic Block-1 3rd Floor.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Mail className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-muted-foreground">student.services@vitap.ac.in</p>
            </div>
          </div>
           <div>
              <h3 className="font-semibold mb-2">Hours of Operation</h3>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                  <li>Monday - Friday: 9:00 AM - 5:00 PM</li>
                  <li>Saturday - Sunday: Closed</li>
              </ul>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
