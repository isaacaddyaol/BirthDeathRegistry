import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FileUpload from "@/components/ui/file-upload";
import { X, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { insertBirthRegistrationSchema } from "@shared/schema";

const birthFormSchema = insertBirthRegistrationSchema.extend({
  submittedBy: z.string().optional(),
});

interface BirthFormProps {
  form: UseFormReturn<z.infer<typeof birthFormSchema>>;
  onSubmit: (data: z.infer<typeof birthFormSchema>) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function BirthForm({ form, onSubmit, isSubmitting, onCancel }: BirthFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{
    medicalCert?: File;
    parentIds?: File;
  }>({});

  const handleFileUpload = (type: 'medicalCert' | 'parentIds', file: File) => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }));
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Birth Registration</h2>
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </Button>
          </div>
        </CardHeader>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-gov-blue text-white' : 'bg-gray-300 text-gov-gray'
              }`}>
                {currentStep > 1 ? <CheckCircle size={16} /> : '1'}
              </div>
              <span className={`text-sm font-medium ${
                currentStep >= 1 ? 'text-gov-blue' : 'text-gov-gray'
              }`}>Child Info</span>
            </div>
            <div className={`flex-1 h-px ${currentStep > 1 ? 'bg-gov-blue' : 'bg-gray-300'}`}></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-gov-blue text-white' : 'bg-gray-300 text-gov-gray'
              }`}>
                {currentStep > 2 ? <CheckCircle size={16} /> : '2'}
              </div>
              <span className={`text-sm font-medium ${
                currentStep >= 2 ? 'text-gov-blue' : 'text-gov-gray'
              }`}>Parents</span>
            </div>
            <div className={`flex-1 h-px ${currentStep > 2 ? 'bg-gov-blue' : 'bg-gray-300'}`}></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 3 ? 'bg-gov-blue text-white' : 'bg-gray-300 text-gov-gray'
              }`}>
                3
              </div>
              <span className={`text-sm font-medium ${
                currentStep >= 3 ? 'text-gov-blue' : 'text-gov-gray'
              }`}>Documents</span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Step 1: Child Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Child Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="childName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child's Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter child's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time of Birth</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="placeOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Place of Birth *</FormLabel>
                        <FormControl>
                          <Input placeholder="Hospital/Home address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="e.g., 3.2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Parent Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>
                
                {/* Father Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Father's Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fatherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Father's Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter father's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fatherNationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Ghanaian" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fatherDateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fatherOccupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter occupation" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Mother Information */}
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Mother's Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="motherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mother's Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter mother's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="motherNationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Ghanaian" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="motherDateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="motherOccupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter occupation" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Document Upload */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                <div className="space-y-6">
                  <FileUpload
                    label="Hospital/Midwife Certificate"
                    description="Upload birth certificate from hospital or midwife"
                    onFileSelect={(file) => handleFileUpload('medicalCert', file)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />

                  <FileUpload
                    label="Parent Identification"
                    description="Upload copies of parents' national ID cards"
                    onFileSelect={(file) => handleFileUpload('parentIds', file)}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            )}

            {/* Form Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft size={16} className="mr-2" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-3">
                {currentStep < 3 ? (
                  <Button type="button" onClick={nextStep} className="bg-gov-blue hover:bg-blue-700 text-white">
                    Next
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-gov-green hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}