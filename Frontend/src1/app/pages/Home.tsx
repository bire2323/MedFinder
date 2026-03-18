import { Link } from "react-router";
import { Building2, Shield, MapPin, MessageSquare } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            AI-Based Smart Hospital & Pharmacy Finder
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Connect patients with healthcare providers through intelligent location-based services and AI-powered assistance
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="size-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="size-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Hospital Agent Dashboard</CardTitle>
              <CardDescription>
                Manage hospital information, departments, services, and communicate with patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/hospital-agent">
                <Button className="w-full">Access Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="size-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <Shield className="size-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Oversee platform operations, manage users, approve registrations, and monitor analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin">
                <Button variant="outline" className="w-full">Access Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg">
            <MapPin className="size-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <h3 className="mb-2">Location-Based Search</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Find hospitals and pharmacies near you with interactive maps
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg">
            <MessageSquare className="size-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
            <h3 className="mb-2">AI Chatbot Assistance</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get instant answers and guidance from our AI assistant
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg">
            <Building2 className="size-8 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
            <h3 className="mb-2">Real-Time Updates</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Access live information about services and availability
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
