import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IdCard, Shield, Users, Clock } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-ghana-blue shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <IdCard className="text-white text-2xl mr-3" />
              <span className="text-white text-xl font-semibold">Ghana Birth & Death Registry</span>
            </div>
            <div className="flex items-center">
              <Button 
                onClick={handleLogin}
                className="bg-ghana-gold hover:bg-yellow-600 text-white"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-ghana-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ghana Birth & Death Registry
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Official digital platform for vital events registration and verification in Ghana. 
              Secure, efficient, and accessible birth and death certificate services.
            </p>
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-ghana-gold hover:bg-yellow-600 text-white text-lg px-8 py-3"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Registration Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Streamlined processes for birth and death registrations with digital verification and secure document management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-l-4 border-ghana-green">
              <CardHeader>
                <div className="mx-auto bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <IdCard className="text-ghana-green w-6 h-6" />
                </div>
                <CardTitle className="text-lg">Birth Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Submit digital birth registration forms with automated validation and approval workflow.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-l-4 border-gray-600">
              <CardHeader>
                <div className="mx-auto bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-gray-600 w-6 h-6" />
                </div>
                <CardTitle className="text-lg">Death Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Register death certificates with medical documentation and next of kin verification.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-l-4 border-ghana-blue">
              <CardHeader>
                <div className="mx-auto bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="text-ghana-blue w-6 h-6" />
                </div>
                <CardTitle className="text-lg">IdCard Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Instantly verify certificate authenticity using unique ID numbers or QR codes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-l-4 border-ghana-gold">
              <CardHeader>
                <div className="mx-auto bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="text-ghana-gold w-6 h-6" />
                </div>
                <CardTitle className="text-lg">Real-time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track application status and receive notifications throughout the approval process.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of Ghanaians using our secure digital registry system.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-ghana-blue hover:bg-blue-700 text-white text-lg px-8 py-3"
          >
            Access Registry System
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Ghana Birth & Death Registry</h3>
              <p className="text-gray-300 text-sm">
                Official digital platform for vital events registration and verification in Ghana.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><button onClick={handleLogin} className="hover:text-white">Register Birth</button></li>
                <li><button onClick={handleLogin} className="hover:text-white">Register Death</button></li>
                <li><button onClick={handleLogin} className="hover:text-white">Verify IdCard</button></li>
                <li><button onClick={handleLogin} className="hover:text-white">User Guide</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Phone: +233 30 123 4567</li>
                <li>Email: support@birthdeathregistry.gov.gh</li>
                <li>Office Hours: 8:00 AM - 5:00 PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>&copy; 2024 Republic of Ghana. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
