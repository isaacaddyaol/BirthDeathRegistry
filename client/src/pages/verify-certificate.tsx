import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import CertificateModal from "@/components/verification/certificate-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, QrCode, Shield } from "lucide-react";

export default function VerifyCertificate() {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [shouldVerify, setShouldVerify] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: verificationResult, isLoading: isVerifying, error } = useQuery({
    queryKey: ["/api/verify", certificateNumber],
    enabled: shouldVerify && certificateNumber.length > 0,
    retry: false,
  });

  useEffect(() => {
    if (verificationResult && shouldVerify) {
      setShowModal(true);
      setShouldVerify(false);
    }
  }, [verificationResult, shouldVerify]);

  const handleVerify = () => {
    if (!certificateNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a certificate number",
        variant: "destructive",
      });
      return;
    }
    setShouldVerify(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gov-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gov-blue mx-auto mb-4"></div>
          <p className="text-gov-gray">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gov-light">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gov-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-gov-green" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Verification</h1>
          <p className="text-gov-gray">
            Verify the authenticity of birth and death certificates issued by Ghana Registry
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Verify Certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="certificateNumber" className="text-sm font-medium text-gray-700">
                Certificate Number
              </Label>
              <div className="flex space-x-2 mt-2">
                <Input 
                  id="certificateNumber"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter certificate number (e.g., BC123456789)" 
                  className="flex-1 h-12"
                />
                <Button 
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="bg-gov-green hover:bg-green-700 text-white h-12 px-6"
                >
                  {isVerifying ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search size={16} />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="text-sm text-gov-gray">OR</span>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              <p className="text-sm text-gov-gray mb-4">Scan QR code from certificate</p>
              <Button variant="outline" className="text-gov-gray hover:bg-gray-50">
                <QrCode className="mr-2" size={16} />
                Scan QR Code
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">How to verify:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Enter the certificate number exactly as shown on the document</li>
                <li>• Certificate numbers start with BC (Birth) or DC (Death)</li>
                <li>• You can also scan the QR code using your device camera</li>
                <li>• Verification results show certificate details and validity status</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Verification Modal */}
        {showModal && verificationResult && (
          <CertificateModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            verificationResult={verificationResult}
          />
        )}
      </div>
    </div>
  );
}
