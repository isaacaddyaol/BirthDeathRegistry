import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, ArrowLeft, Check, X, Eye, Baby, Users, Clock, CheckCircle, XCircle, Download } from "lucide-react";
import type { BirthRegistration, DeathRegistration } from "@shared/schema";

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: birthRegistrations, error: birthError } = useQuery({
    queryKey: ['/api/birth-registrations'],
    retry: false,
  });

  const { data: deathRegistrations, error: deathError } = useQuery({
    queryKey: ['/api/death-registrations'],
    retry: false,
  });

  const { data: stats, error: statsError } = useQuery({
    queryKey: ['/api/stats'],
    retry: false,
  });

  useEffect(() => {
    const errors = [birthError, deathError, statsError].filter(Boolean);
    errors.forEach(error => {
      if (isUnauthorizedError(error as Error)) {
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
    });
  }, [birthError, deathError, statsError, toast]);

  const updateBirthStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }) => {
      await apiRequest("PUT", `/api/birth-registrations/${id}/status`, { status, rejectionReason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/birth-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Status Updated",
        description: "Birth registration status has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Update Failed",
        description: "Failed to update registration status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateDeathStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }) => {
      await apiRequest("PUT", `/api/death-registrations/${id}/status`, { status, rejectionReason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/death-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Status Updated",
        description: "Death registration status has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Update Failed",
        description: "Failed to update registration status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (type: 'birth' | 'death', id: number) => {
    if (type === 'birth') {
      updateBirthStatusMutation.mutate({ id, status: 'approved' });
    } else {
      updateDeathStatusMutation.mutate({ id, status: 'approved' });
    }
  };

  const handleReject = (type: 'birth' | 'death', id: number) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason) {
      if (type === 'birth') {
        updateBirthStatusMutation.mutate({ id, status: 'rejected', rejectionReason: reason });
      } else {
        updateDeathStatusMutation.mutate({ id, status: 'rejected', rejectionReason: reason });
      }
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <Settings className="text-ghana-gold h-8 w-8" />
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Administration Panel</CardTitle>
              <p className="text-gray-600 mt-1">Manage applications, users, and system settings</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-8">
          {/* Admin Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Pending Reviews</h4>
                      <p className="text-2xl font-bold text-blue-900">
                        {stats.pendingBirth + stats.pendingDeath}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="text-sm font-medium text-green-800">Approved This Month</h4>
                      <p className="text-2xl font-bold text-green-900">{stats.approvedThisMonth}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Birth Pending</h4>
                      <p className="text-2xl font-bold text-red-900">{stats.pendingBirth}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Death Pending</h4>
                      <p className="text-2xl font-bold text-yellow-900">{stats.pendingDeath}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Birth Registrations */}
          {birthRegistrations && birthRegistrations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Baby className="mr-2 h-5 w-5 text-ghana-green" />
                  Pending Birth Registrations
                </h3>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Child Name</TableHead>
                      <TableHead>Birth Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {birthRegistrations.map((registration: BirthRegistration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">{registration.applicationId}</TableCell>
                        <TableCell>{registration.childFirstName} {registration.childLastName}</TableCell>
                        <TableCell>{formatDate(registration.birthDate)}</TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell>{formatDate(registration.createdAt!)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {registration.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove('birth', registration.id)}
                                  disabled={updateBirthStatusMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject('birth', registration.id)}
                                  disabled={updateBirthStatusMutation.isPending}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Death Registrations */}
          {deathRegistrations && deathRegistrations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-gray-600" />
                  Pending Death Registrations
                </h3>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Deceased Name</TableHead>
                      <TableHead>Death Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deathRegistrations.map((registration: DeathRegistration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">{registration.applicationId}</TableCell>
                        <TableCell>{registration.deceasedName}</TableCell>
                        <TableCell>{formatDate(registration.deathDate)}</TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell>{formatDate(registration.createdAt!)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {registration.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove('death', registration.id)}
                                  disabled={updateDeathStatusMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject('death', registration.id)}
                                  disabled={updateDeathStatusMutation.isPending}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!birthRegistrations || birthRegistrations.length === 0) && 
           (!deathRegistrations || deathRegistrations.length === 0) && (
            <Alert>
              <AlertDescription>
                No pending applications found. All registrations have been processed.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
