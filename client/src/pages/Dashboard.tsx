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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Baby, Users, Search, Settings, Clock, CheckCircle, IdCard, History, Activity, TrendingUp, AlertCircle, Calendar, MapPin } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import type { DashboardStats } from "@shared/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

type ViewType = 'dashboard' | 'birth' | 'death' | 'verification' | 'admin' | 'recent';

// Chart colors
const CHART_COLORS = {
  birth: "#10B981",
  death: "#6B7280",
  approved: "#10B981",
  pending: "#F59E0B",
  rejected: "#EF4444",
};

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const { data: stats, error: statsError, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['api/stats'],
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
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderStats = () => {
    if (statsError) {
      return (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load statistics. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      );
    }

    if (statsLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!stats) return null;

    // Transform data for the pie chart
    const pieData = [
      { name: 'Approved', value: stats.registrationsByStatus.approved },
      { name: 'Pending', value: stats.registrationsByStatus.pending },
      { name: 'Rejected', value: stats.registrationsByStatus.rejected },
    ];

    // Transform data for the line chart
    const lineData = stats.registrationTrends.labels.map((label, index) => ({
      name: label,
      births: stats.registrationTrends.births[index],
      deaths: stats.registrationTrends.deaths[index],
    }));

    return (
      <div className="space-y-8">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white hover:bg-gray-50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pendingBirth + stats.pendingDeath}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Birth: {stats.pendingBirth} • Death: {stats.pendingDeath}
                  </p>
                </div>
                <Clock className="text-ghana-gold text-3xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:bg-gray-50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approvedThisMonth}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-ghana-green" />
                    <p className="text-xs text-ghana-green">+{stats.monthlyGrowth}% from last month</p>
                  </div>
                </div>
                <CheckCircle className="text-ghana-green text-3xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:bg-gray-50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRegistrations}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Births: {stats.recentActivity.births} • Deaths: {stats.recentActivity.deaths}
                  </p>
                </div>
                <Activity className="text-ghana-blue text-3xl" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Trends Chart */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Registration Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="births" 
                    stroke={CHART_COLORS.birth} 
                    name="Births"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="deaths" 
                    stroke={CHART_COLORS.death} 
                    name="Deaths"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Registrations Table */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Registrations</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setCurrentView('recent')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentRegistrations.slice(0, 5).map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {registration.type === 'birth' ? (
                            <Baby className="h-4 w-4 text-ghana-green" />
                          ) : (
                            <Users className="h-4 w-4 text-gray-600" />
                          )}
                          {registration.type === 'birth' ? 'Birth' : 'Death'}
                        </div>
                      </TableCell>
                      <TableCell>{registration.name}</TableCell>
                      <TableCell>{format(new Date(registration.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {registration.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${registration.status === 'approved' ? 'bg-green-100 text-green-800' :
                            registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {registration.status}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution with Pie Chart */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Registration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === 'Approved' ? CHART_COLORS.approved :
                            entry.name === 'Pending' ? CHART_COLORS.pending :
                            CHART_COLORS.rejected
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: 
                          entry.name === 'Approved' ? CHART_COLORS.approved :
                          entry.name === 'Pending' ? CHART_COLORS.pending :
                          CHART_COLORS.rejected
                      }}
                    />
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Regional Data */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Regional Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.regionalData.map((region) => (
                  <div key={region.region} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{region.region}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-ghana-green">Births: {region.births}</span>
                        <span className="text-gray-600">Deaths: {region.deaths}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Progress 
                        value={(region.births / (region.births + region.deaths)) * 100} 
                        className="h-2"
                      />
                      <Progress 
                        value={(region.deaths / (region.births + region.deaths)) * 100} 
                        className="h-2 bg-gray-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processing Times */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Processing Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Average Processing Time</p>
                  <p className="text-sm font-medium text-gray-900">{stats.processingTimes.averageApprovalTime} hours</p>
                </div>
                <Progress value={Math.min((stats.processingTimes.averageApprovalTime / 72) * 100, 100)} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Target: 72 hours</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Fastest Approval</p>
                  <p className="text-sm font-medium text-ghana-green">{stats.processingTimes.fastestApproval} hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Status and Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline Stats */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Registration Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="today" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="week">This Week</TabsTrigger>
                  <TabsTrigger value="month">This Month</TabsTrigger>
                </TabsList>
                <TabsContent value="today" className="mt-4 space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Baby className="h-5 w-5 text-ghana-green" />
                      </div>
                      <div>
                        <p className="font-medium">Birth Registrations</p>
                        <p className="text-sm text-gray-500">Today</p>
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">{stats.timelineStats.today.births}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">Death Registrations</p>
                        <p className="text-sm text-gray-500">Today</p>
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">{stats.timelineStats.today.deaths}</p>
                  </div>
                </TabsContent>
                <TabsContent value="week" className="mt-4 space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Baby className="h-5 w-5 text-ghana-green" />
                      </div>
                      <div>
                        <p className="font-medium">Birth Registrations</p>
                        <p className="text-sm text-gray-500">This Week</p>
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">{stats.timelineStats.thisWeek.births}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">Death Registrations</p>
                        <p className="text-sm text-gray-500">This Week</p>
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">{stats.timelineStats.thisWeek.deaths}</p>
                  </div>
                </TabsContent>
                <TabsContent value="month" className="mt-4 space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Baby className="h-5 w-5 text-ghana-green" />
                      </div>
                      <div>
                        <p className="font-medium">Birth Registrations</p>
                        <p className="text-sm text-gray-500">This Month</p>
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">{stats.timelineStats.thisMonth.births}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">Death Registrations</p>
                        <p className="text-sm text-gray-500">This Month</p>
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">{stats.timelineStats.thisMonth.deaths}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

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
            {/* Welcome Section with enhanced styling */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back, {user.firstName}!</h1>
              <p className="text-gray-600">
                Manage birth and death registrations for Ghana. Your role as {user.role.replace('_', ' ')} 
                gives you access to essential registration services.
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

            {/* Stats Section */}
            {['registrar', 'admin'].includes(user.role) && renderStats()}
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
