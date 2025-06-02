import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Edit, ArrowLeft, Baby, Users, Calendar, MapPin, Phone, User } from "lucide-react";
import type { BirthRegistration, DeathRegistration } from "@shared/schema";

interface RecentRegistrationsProps {
  onBack: () => void;
}

export default function RecentRegistrations({ onBack }: RecentRegistrationsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBirthRecord, setSelectedBirthRecord] = useState<BirthRegistration | null>(null);
  const [selectedDeathRecord, setSelectedDeathRecord] = useState<DeathRegistration | null>(null);

  const { data: birthRegistrations, error: birthError } = useQuery<BirthRegistration[]>({
    queryKey: ['/api/birth-registrations'],
    retry: false,
  });

  const { data: deathRegistrations, error: deathError } = useQuery<DeathRegistration[]>({
    queryKey: ['/api/death-registrations'],
    retry: false,
  });

  if (birthError && isUnauthorizedError(birthError as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  const handleEdit = (type: 'birth' | 'death', id: number) => {
    toast({
      title: "Edit Function",
      description: `Edit functionality for ${type} registration ${id} would be implemented here.`,
    });
  };

  const BirthPreviewDialog = ({ registration }: { registration: BirthRegistration }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Baby className="h-5 w-5 text-ghana-green" />
          <span>Birth Registration Details</span>
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Application Information</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Application ID:</strong> {registration.applicationId}</p>
              <p><strong>Status:</strong> {getStatusBadge(registration.status)}</p>
              {registration.certificateId && (
                <p><strong>Certificate ID:</strong> {registration.certificateId}</p>
              )}
              <p><strong>Submitted:</strong> {formatDate(registration.createdAt!)}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Child Information</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Name:</strong> {registration.childFirstName} {registration.childLastName}</p>
              <p><strong>Sex:</strong> {registration.childSex}</p>
              <p><strong>Birth Date:</strong> {formatDate(registration.birthDate)}</p>
              <p><strong>Birth Place:</strong> {registration.birthPlace}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Father Information</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Name:</strong> {registration.fatherName}</p>
              <p><strong>National ID:</strong> {registration.fatherNationalId}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Mother Information</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Name:</strong> {registration.motherName}</p>
              <p><strong>National ID:</strong> {registration.motherNationalId}</p>
            </div>
          </div>
        </div>

        {registration.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="font-semibold text-red-800 mb-1">Rejection Reason</h4>
            <p className="text-red-700 text-sm">{registration.rejectionReason}</p>
          </div>
        )}
      </div>
    </DialogContent>
  );

  const DeathPreviewDialog = ({ registration }: { registration: DeathRegistration }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-600" />
          <span>Death Registration Details</span>
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Application Information</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Application ID:</strong> {registration.applicationId}</p>
              <p><strong>Status:</strong> {getStatusBadge(registration.status)}</p>
              {registration.certificateId && (
                <p><strong>Certificate ID:</strong> {registration.certificateId}</p>
              )}
              <p><strong>Submitted:</strong> {formatDate(registration.createdAt!)}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Deceased Information</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Name:</strong> {registration.deceasedName}</p>
              <p><strong>Death Date:</strong> {formatDate(registration.deathDate)}</p>
              <p><strong>Death Place:</strong> {registration.deathPlace}</p>
              <p><strong>Cause of Death:</strong> {registration.causeOfDeath}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Next of Kin Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p><strong>Name:</strong> {registration.kinName}</p>
              <p><strong>Relationship:</strong> {registration.kinRelationship}</p>
            </div>
            <div className="space-y-1">
              <p><strong>Phone:</strong> {registration.kinPhone}</p>
              {registration.kinNationalId && (
                <p><strong>National ID:</strong> {registration.kinNationalId}</p>
              )}
            </div>
          </div>
        </div>

        {registration.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="font-semibold text-red-800 mb-1">Rejection Reason</h4>
            <p className="text-red-700 text-sm">{registration.rejectionReason}</p>
          </div>
        )}
      </div>
    </DialogContent>
  );

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Recent Registrations</CardTitle>
            <p className="text-gray-600 mt-1">View and manage recent birth and death registrations</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-8">
          {/* Birth Registrations */}
          {birthRegistrations && birthRegistrations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Baby className="mr-2 h-5 w-5 text-ghana-green" />
                Recent Birth Registrations
              </h3>
              
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
                    {birthRegistrations.slice(0, 10).map((registration: BirthRegistration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">{registration.applicationId}</TableCell>
                        <TableCell>{registration.childFirstName} {registration.childLastName}</TableCell>
                        <TableCell>{formatDate(registration.birthDate)}</TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell>{formatDate(registration.createdAt!)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedBirthRecord(registration)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              {selectedBirthRecord && <BirthPreviewDialog registration={selectedBirthRecord} />}
                            </Dialog>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit('birth', registration.id)}
                            >
                              <Edit className="h-3 w-3" />
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="mr-2 h-5 w-5 text-gray-600" />
                Recent Death Registrations
              </h3>
              
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
                    {deathRegistrations.slice(0, 10).map((registration: DeathRegistration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">{registration.applicationId}</TableCell>
                        <TableCell>{registration.deceasedName}</TableCell>
                        <TableCell>{formatDate(registration.deathDate)}</TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell>{formatDate(registration.createdAt!)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedDeathRecord(registration)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              {selectedDeathRecord && <DeathPreviewDialog registration={selectedDeathRecord} />}
                            </Dialog>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit('death', registration.id)}
                            >
                              <Edit className="h-3 w-3" />
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
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Registrations</h3>
              <p className="text-gray-600 mb-4">No registration data found for your account.</p>
              <Button onClick={onBack} variant="outline">
                Return to Dashboard
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}