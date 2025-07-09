import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IdCard, Bell, ChevronDown, Menu, X, FileText, Shield, User, Settings, LogOut } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const getNavLinkClass = (path: string) => {
    return isActive(path)
      ? "text-gov-blue font-semibold border-b-2 border-gov-blue pb-1 px-3 py-2 rounded-t-lg bg-blue-50"
      : "text-gray-700 hover:text-gov-blue hover:bg-gray-50 transition-all duration-200 px-3 py-2 rounded-lg font-medium";
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-gov-blue to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                <IdCard className="text-white" size={24} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-gov-blue transition-colors">
                  Ghana Registry
                </h1>
                <p className="text-sm text-gray-600 font-medium">Birth & Death Registration</p>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            <Link href="/">
              <span className={getNavLinkClass("/")}>
                <User className="inline w-4 h-4 mr-2" />
                Dashboard
              </span>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-700 hover:text-gov-blue hover:bg-gray-50 transition-all duration-200 px-3 py-2 rounded-lg font-medium flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>Register</span>
                  <ChevronDown size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/register/birth" className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Birth Certificate</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/register/death" className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Death Certificate</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link href="/verify">
              <span className={getNavLinkClass("/verify")}>
                <Shield className="inline w-4 h-4 mr-2" />
                Verify
              </span>
            </Link>
            
            {(user?.role === 'admin' || user?.role === 'registrar') && (
              <Link href="/admin">
                <span className={getNavLinkClass("/admin")}>
                  <Settings className="inline w-4 h-4 mr-2" />
                  Admin
                </span>
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 h-10 w-10 text-gray-600 hover:text-gov-blue hover:bg-blue-50 rounded-full transition-all duration-200"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </Button>
            </div>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                  <Avatar className="w-10 h-10 ring-2 ring-gray-200 hover:ring-gov-blue transition-all duration-200">
                    <AvatarImage src={user?.profileImageUrl || ""} alt="User avatar" />
                    <AvatarFallback className="bg-gov-blue text-white font-semibold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="hidden md:block text-gray-400" size={16} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b">
                  <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <DropdownMenuItem className="py-2">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => window.location.href = "/api/logout"}
                  className="text-red-600 py-2 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu size={24} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem asChild>
                    <Link href="/" className="flex items-center space-x-2 py-3">
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/register/birth" className="flex items-center space-x-2 py-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Birth Registration</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register/death" className="flex items-center space-x-2 py-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Death Registration</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/verify" className="flex items-center space-x-2 py-3">
                      <Shield className="w-4 h-4" />
                      <span>Verify Certificate</span>
                    </Link>
                  </DropdownMenuItem>
                  {(user?.role === 'admin' || user?.role === 'registrar') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center space-x-2 py-3">
                          <Settings className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
