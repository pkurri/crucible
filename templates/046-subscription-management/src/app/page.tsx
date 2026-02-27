import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Subscription Management
          </h1>
          <p className="text-xl text-gray-600">
            Recurring billing and subscription platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature 1</CardTitle>
              <CardDescription>
                Core functionality for Subscription Management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Get Started</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature 2</CardTitle>
              <CardDescription>
                Advanced capabilities and integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Learn More</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature 3</CardTitle>
              <CardDescription>
                Enterprise-grade features and security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
