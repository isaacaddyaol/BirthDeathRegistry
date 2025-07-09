import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface VerificationResult {
  valid: boolean;
  type?: string;
  applicationId?: string;
  issuedDate?: string;
  issuingOffice?: string;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificationResult: VerificationResult;
}

export default function CertificateModal({ 
  isOpen, 
  onClose, 
  verificationResult 
}: CertificateModalProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Certificate Verification</DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              verificationResult.valid 
                ? 'bg-gov-green bg-opacity-10' 
                : 'bg-red-100'
            }`}>
              {verificationResult.valid ? (
                <CheckCircle className="text-gov-green" size={32} />
              ) : (
                <XCircle className="text-red-600" size={32} />
              )}
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {verificationResult.valid ? 'Certificate Verified' : 'Certificate Not Found'}
            </h4>
            <p className="text-gov-gray">
              {verificationResult.valid 
                ? 'This certificate is authentic and valid'
                : 'The certificate number could not be verified'
              }
            </p>
          </div>
          
          {verificationResult.valid && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gov-gray">Certificate Type:</span>
                <span className="font-medium">{verificationResult.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gov-gray">Certificate Number:</span>
                <span className="font-medium">{verificationResult.applicationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gov-gray">Issued Date:</span>
                <span className="font-medium">{formatDate(verificationResult.issuedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gov-gray">Issuing Office:</span>
                <span className="font-medium">{verificationResult.issuingOffice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gov-gray">Status:</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Valid
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onClose} className="bg-gov-blue hover:bg-blue-700 text-white">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
