
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/ui/file-upload";
import { X, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { insertDeathRegistrationSchema } from "@shared/schema";

const deathFormSchema = insertDeathRegistrationSchema.extend({
  submittedBy: z.string().optional(),
});

interface DeathFormProps {
  form: UseFormReturn<z.infer<typeof deathFormSchema>>;
  onSubmit: (data: z.infer<typeof deathFormSchema>) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function DeathForm({ form, onSubmit, isSubmitting, onCancel }: DeathFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{
    deathCert?: File;
    nextOfKinId?: File;
  }>({});

  const handleFileUpload = (type: 'deathCert' | 'nextOfKinId', file: File) => {
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
            <h2 className="text-xl font-semibold text-gray-900">Death Registration</h2>
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
              }`}>Deceased Info</span>
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
              }`}>Next of Kin</span>
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
            {/* Step 1: Deceased Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Deceased Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="deceasedName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name of Deceased *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name of deceased" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfDeath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Death *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeOfDeath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time of Death</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="placeOfDeath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Place of Death *</FormLabel>
                        <FormControl>
                          <Input placeholder="Hospital name or location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="causeOfDeath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cause of Death *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the cause of death as stated by medical professional"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Next of Kin Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Next of Kin Information</h3>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Next of Kin Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nextOfKinName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter next of kin's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nextOfKinRelationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship to Deceased *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Spouse, Child, Parent, Sibling" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nextOfKinContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nextOfKinNationalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>National ID Number</FormLabel>
                          <FormControl>
                            <Input placeholder="National ID number" {...field} value={field.value || ""} />
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
                    label="Medical Certificate of Death"
                    description="Upload death certificate from hospital or medical professional"
                    onFileSelect={(file) => handleFileUpload('deathCert', file)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />

                  <FileUpload
                    label="Next of Kin Identification"
                    description="Upload copy of next of kin's national ID card"
                    onFileSelect={(file) => handleFileUpload('nextOfKinId', file)}
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
                    className="bg-gov-red hover:bg-red-700 text-white"
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
