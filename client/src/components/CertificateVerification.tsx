import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, ArrowLeft, CheckCircle, AlertCircle, QrCode, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CertificateVerificationProps {
  onBack: () => void;
}

const verificationSchema = z.object({
  certificateId: z.string().min(1, "Certificate ID is required"),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

interface VerificationResult {
  valid: boolean;
  type?: string;
  certificateId?: string;
  fullName?: string;
  issueDate?: string;
  registrationOffice?: string;
  message?: string;
}

export default function CertificateVerification({ onBack }: CertificateVerificationProps) {
  const { toast } = useToast();
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      certificateId: "",
    },
  });

  const onSubmit = async (data: VerificationFormData) => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const response = await fetch(`/api/verify/${data.certificateId}`);
      const result = await response.json();
      setVerificationResult(result);

      if (result.valid) {
        toast({
          title: "Certificate Verified",
          description: `Valid ${result.type} certificate found.`,
        });
      } else {
        toast({
          title: "Verification Failed",
          description: result.message || "Certificate not found or invalid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Error",
        description: "Failed to verify certificate. Please try again.",
        variant: "destructive",
      });
      setVerificationResult({
        valid: false,
        message: "Network error occurred during verification",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQRScan = () => {
    toast({
      title: "QR Scanner",
      description: "QR code scanning functionality would be implemented here using camera access.",
    });
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
            <Search className="text-ghana-blue h-8 w-8" />
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Certificate Verification</CardTitle>
              <p className="text-gray-600 mt-1">Verify the authenticity of birth and death certificates</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-8">
          {/* Verification Form */}
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="certificateId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificate ID Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter certificate ID (e.g., BC-2024-001234 or DC-2024-001234)" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      type="submit" 
                      disabled={isVerifying}
                      className="bg-ghana-blue hover:bg-blue-700 text-white"
                    >
                      {isVerifying ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Verifying...
                        </div>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Verify
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>

          {/* Verification Results */}
          {verificationResult && (
            <div className="space-y-4">
              {verificationResult.valid ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-green-800">Certificate Verified</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            <strong>Certificate Type:</strong>{" "}
                            <span className="capitalize">{verificationResult.type} Certificate</span>
                          </p>
                          <p className="text-gray-700">
                            <strong>Full Name:</strong> {verificationResult.fullName}
                          </p>
                          <p className="text-gray-700">
                            <strong>Date Issued:</strong>{" "}
                            {verificationResult.issueDate ? 
                              new Date(verificationResult.issueDate).toLocaleDateString() : 
                              "N/A"
                            }
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            <strong>Registration Office:</strong> {verificationResult.registrationOffice}
                          </p>
                          <p className="text-gray-700">
                            <strong>Certificate ID:</strong> {verificationResult.certificateId}
                          </p>
                          <p className="text-gray-700">
                            <strong>Status:</strong>{" "}
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Valid
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-red-800">Verification Failed</h3>
                      <p className="text-gray-700">
                        {verificationResult.message || "Certificate not found or not approved"}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* QR Code Scanner Option */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <QrCode className="mx-auto text-4xl text-gray-400 mb-4 h-16 w-16" />
            <p className="text-lg font-medium text-gray-900 mb-2">QR Code Scanner</p>
            <p className="text-gray-600 mb-4">Scan QR code from certificate for instant verification</p>
            <Button 
              onClick={handleQRScan}
              className="bg-ghana-gold hover:bg-yellow-600 text-white"
            >
              <Camera className="mr-2 h-4 w-4" />
              Open Scanner
            </Button>
          </div>

          {/* Help Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Verification Help</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Birth certificates start with "BC-" followed by year and number</li>
              <li>• Death certificates start with "DC-" followed by year and number</li>
              <li>• Only approved certificates can be verified</li>
              <li>• QR codes provide instant verification without typing</li>
              <li>• Contact support if you believe there's an error</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
