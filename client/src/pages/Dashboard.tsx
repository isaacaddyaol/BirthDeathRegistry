import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import BirthRegistrationForm from "@/components/BirthRegistrationForm";
import DeathRegistrationForm from "@/components/DeathRegistrationForm";
import CertificateVerification from "@/components/CertificateVerification";
import AdminPanel from "@/components/AdminPanel";
import RecentRegistrations from "@/components/RecentRegistrations";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Baby, Users, Search, Settings, Clock, CheckCircle, IdCard, History } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

type ViewType = 'dashboard' | 'birth' | 'death' | 'verification' | 'admin' | 'recent';

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const { data: stats, error: statsError } = useQuery({
    queryKey: ['/api/stats'],
    enabled: !!user && ['registrar', 'admin'].includes(user.role),
    retry: false,
  });

  useEffect(() => {
    if (statsError && isUnauthorizedError(statsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [statsError, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ghana-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'birth':
        return <BirthRegistrationForm onBack={() => setCurrentView('dashboard')} />;
      case 'death':
        return <DeathRegistrationForm onBack={() => setCurrentView('dashboard')} />;
      case 'verification':
        return <CertificateVerification onBack={() => setCurrentView('dashboard')} />;
      case 'admin':
        if (!['admin', 'registrar'].includes(user.role)) {
          return (
            <div className="text-center py-16">
              <p className="text-gray-600">Access denied. Insufficient permissions.</p>
              <Button onClick={() => setCurrentView('dashboard')} className="mt-4">
                Back to Dashboard
              </Button>
            </div>
          );
        }
        return <AdminPanel onBack={() => setCurrentView('dashboard')} />;
      case 'recent':
        return <RecentRegistrations onBack={() => setCurrentView('dashboard')} />;
      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">
                Welcome, {user.firstName} {user.lastName}. Manage birth and death registrations for Ghana.
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Button
                onClick={() => setCurrentView('birth')}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 p-6 h-auto flex-col space-y-2 shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-ghana-green"
                variant="outline"
              >
                <Baby className="text-ghana-green text-3xl" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Register Birth</h3>
                  <p className="text-gray-600 text-sm">Submit new birth registration</p>
                </div>
              </Button>

              <Button
                onClick={() => setCurrentView('death')}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 p-6 h-auto flex-col space-y-2 shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-gray-600"
                variant="outline"
              >
                <Users className="text-gray-600 text-3xl" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Register Death</h3>
                  <p className="text-gray-600 text-sm">Submit death registration</p>
                </div>
              </Button>

              <Button
                onClick={() => setCurrentView('verification')}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 p-6 h-auto flex-col space-y-2 shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-ghana-blue"
                variant="outline"
              >
                <Search className="text-ghana-blue text-3xl" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Verify IdCard</h3>
                  <p className="text-gray-600 text-sm">Lookup and verify documents</p>
                </div>
              </Button>

              <Button
                onClick={() => setCurrentView('recent')}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 p-6 h-auto flex-col space-y-2 shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-purple-500"
                variant="outline"
              >
                <History className="text-purple-500 text-3xl" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Recent Data</h3>
                  <p className="text-gray-600 text-sm">View recent registrations</p>
                </div>
              </Button>

              {['admin', 'registrar'].includes(user.role) && (
                <Button
                  onClick={() => setCurrentView('admin')}
                  className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 p-6 h-auto flex-col space-y-2 shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-ghana-gold"
                  variant="outline"
                >
                  <Settings className="text-ghana-gold text-3xl" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Admin Panel</h3>
                    <p className="text-gray-600 text-sm">Manage applications</p>
                  </div>
                </Button>
              )}
            </div>

            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.pendingBirth + stats.pendingDeath}
                        </p>
                      </div>
                      <Clock className="text-ghana-gold text-3xl" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Approved This Month</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.approvedThisMonth}</p>
                      </div>
                      <CheckCircle className="text-ghana-green text-3xl" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalRegistrations}</p>
                      </div>
                      <IdCard className="text-ghana-blue text-3xl" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderCurrentView()}
      </div>
    </div>
  );
}
