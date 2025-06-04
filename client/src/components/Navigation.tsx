import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IdCard, LogOut } from "lucide-react";

interface NavigationProps {
  user: User;
}

export default function Navigation({ user }: NavigationProps) {
  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include" // Include cookies in the request
      });
      
      // Clear any client-side auth state (if any exists in localStorage)
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Redirect to landing page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect to landing page even if logout API fails
      window.location.href = "/";
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'health_worker':
        return 'Health Worker';
      case 'registrar':
        return 'Registrar';
      case 'admin':
        return 'Administrator';
      default:
        return 'Public User';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'registrar':
        return 'default';
      case 'health_worker':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <nav className="bg-ghana-blue shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <IdCard className="text-white text-2xl mr-3" />
              <span className="text-white text-xl font-semibold">Ghana Birth & Death Registry</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImageUrl || undefined} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="bg-ghana-gold text-white">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-white text-sm">
                <div className="font-medium">{user.firstName} {user.lastName}</div>
                <div className="text-blue-200 text-xs">{user.email}</div>
              </div>
            </div>
            <Badge 
              variant={getRoleBadgeVariant(user.role)} 
              className="bg-ghana-gold text-white border-ghana-gold"
            >
              {getRoleDisplay(user.role)}
            </Badge>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-white hover:text-gray-200 hover:bg-blue-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
