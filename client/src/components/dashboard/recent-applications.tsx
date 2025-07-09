import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Baby, Cross, Download, Eye } from "lucide-react";

interface Application {
  id: number;
  applicationId: string;
  status: string;
  createdAt: string;
  childName?: string;
  deceasedName?: string;
  certificateNumber?: string;
}

export default function RecentApplications() {
  const { user } = useAuth();

  const { data: birthRegistrations = [] } = useQuery({
    queryKey: ["/api/birth-registrations"],
    retry: false,
  });

  const { data: deathRegistrations = [] } = useQuery({
    queryKey: ["/api/death-registrations"],
    retry: false,
  });

  // Combine and sort applications by creation date
  const allApplications = [
    ...birthRegistrations.map((app: any) => ({ 
      ...app, 
      type: 'birth' as const,
      name: app.childName 
    })),
    ...deathRegistrations.map((app: any) => ({ 
      ...app, 
      type: 'death' as const,
      name: app.deceasedName 
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .slice(0, 10); // Show only the 10 most recent

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const canManageApplications = user?.role === 'admin' || user?.role === 'registrar';

  if (allApplications.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="outline" size="sm" className="text-gov-blue hover:text-blue-700">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gov-gray">No applications found</p>
            <p className="text-sm text-gov-gray mt-2">
              Applications will appear here once you submit birth or death registrations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Applications</CardTitle>
          <Button variant="outline" size="sm" className="text-gov-blue hover:text-blue-700">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gov-gray uppercase tracking-wider">
                  Application ID
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gov-gray uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gov-gray uppercase tracking-wider">
                  Name
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gov-gray uppercase tracking-wider">
                  Date
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gov-gray uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gov-gray uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {allApplications.map((app) => (
                <TableRow key={`${app.type}-${app.id}`} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {app.applicationId}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {app.type === 'birth' ? (
                        <Baby className="text-gov-blue mr-2" size={16} />
                      ) : (
                        <Cross className="text-gray-600 mr-2" size={16} />
                      )}
                      <span className="text-sm text-gray-900 capitalize">{app.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.name}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gov-gray">
                    {formatDate(app.createdAt)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(app.status)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {app.status === 'approved' && app.certificateNumber ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gov-blue hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Download size={14} className="mr-1" />
                        Download
                      </Button>
                    ) : canManageApplications ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gov-blue hover:text-blue-700 hover:bg-blue-50"
                      >
                        Review
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gov-gray hover:text-gray-700 hover:bg-gray-50"
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
