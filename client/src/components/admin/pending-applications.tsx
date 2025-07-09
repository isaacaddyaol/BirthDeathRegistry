import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Baby, Cross, Check, X, Eye } from "lucide-react";

interface Application {
  id: number;
  applicationId: string;
  type: 'birth' | 'death';
  status: string;
  createdAt: string;
  childName?: string;
  deceasedName?: string;
}

interface PendingApplicationsProps {
  applications: Application[];
}

export default function PendingApplications({ applications }: PendingApplicationsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, type, status, reviewNotes }: {
      id: number;
      type: 'birth' | 'death';
      status: string;
      reviewNotes?: string;
    }) => {
      const endpoint = type === 'birth' 
        ? `/api/birth-registrations/${id}/status`
        : `/api/death-registrations/${id}/status`;
      
      const response = await apiRequest("PATCH", endpoint, { status, reviewNotes });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Application status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pending-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
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
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (app: Application) => {
    updateStatus.mutate({
      id: app.id,
      type: app.type,
      status: 'approved',
      reviewNotes: 'Application approved after verification',
    });
  };

  const handleReject = (app: Application) => {
    updateStatus.mutate({
      id: app.id,
      type: app.type,
      status: 'rejected',
      reviewNotes: 'Application rejected due to incomplete documentation',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>Pending Applications</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Filter</Button>
            <Button variant="outline" size="sm">Export</Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gov-gray">No pending applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div 
                key={`${app.type}-${app.id}`}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    app.type === 'birth' 
                      ? 'bg-gov-blue bg-opacity-10' 
                      : 'bg-gov-gray bg-opacity-10'
                  }`}>
                    {app.type === 'birth' ? (
                      <Baby className="text-gov-blue" size={20} />
                    ) : (
                      <Cross className="text-gov-gray" size={20} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {app.childName || app.deceasedName}
                    </h4>
                    <p className="text-sm text-gov-gray">
                      {app.type === 'birth' ? 'Birth' : 'Death'} Registration • {app.applicationId}
                    </p>
                    <p className="text-xs text-gov-gray">
                      Submitted {formatDate(app.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(app.status)}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleApprove(app)}
                      disabled={updateStatus.isPending}
                      className="text-gov-green hover:text-green-700 hover:bg-green-50"
                      title="Approve"
                    >
                      <Check size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReject(app)}
                      disabled={updateStatus.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Reject"
                    >
                      <X size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gov-blue hover:text-blue-700 hover:bg-blue-50"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
