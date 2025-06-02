import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertBirthRegistrationSchema, type InsertBirthRegistration } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Baby, Users, Upload, ArrowLeft, Send, Save } from "lucide-react";
import FileUpload from "./FileUpload";

interface BirthRegistrationFormProps {
  onBack: () => void;
}

export default function BirthRegistrationForm({ onBack }: BirthRegistrationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const form = useForm<InsertBirthRegistration>({
    resolver: zodResolver(insertBirthRegistrationSchema),
    defaultValues: {
      childFirstName: "",
      childLastName: "",
      childSex: "",
      birthDate: new Date(),
      birthPlace: "",
      fatherName: "",
      fatherNationalId: "",
      motherName: "",
      motherNationalId: "",
      hospitalCertificateUrl: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertBirthRegistration) => {
      const formData = { ...data, hospitalCertificateUrl: uploadedFile || "" };
      return await apiRequest("POST", "/api/birth-registrations", formData);
    },
    onSuccess: (response) => {
      const data = response.json();
      toast({
        title: "Birth Registration Submitted",
        description: `Application ID: ${data.applicationId}. Your registration has been submitted for review.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/birth-registrations"] });
      form.reset();
      setUploadedFile(null);
      onBack();
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
        title: "Submission Failed",
        description: "Failed to submit birth registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBirthRegistration) => {
    mutation.mutate(data);
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
            <Baby className="text-ghana-green h-8 w-8" />
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Birth Registration Form</CardTitle>
              <p className="text-gray-600 mt-1">Complete all required fields to register a birth certificate</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Child Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Baby className="text-ghana-blue mr-2 h-5 w-5" />
                Child Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="childFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter child's first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="childLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter child's last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="childSex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sex <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sex" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="birthPlace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Place of Birth <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Hospital or location of birth" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Parents Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="text-ghana-green mr-2 h-5 w-5" />
                Parents Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Father Information */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Father Details</h4>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fatherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Father's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fatherNationalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>National ID <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="GHA-123456789-0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Mother Information */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Mother Details</h4>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="motherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Mother's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="motherNationalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>National ID <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="GHA-987654321-0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="text-ghana-blue mr-2 h-5 w-5" />
                Required Documents
              </h3>
              <FileUpload
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={5 * 1024 * 1024} // 5MB
                onFileUploaded={setUploadedFile}
                label="Upload Hospital/Midwife Certificate"
                description="Drag and drop files here or click to browse"
                supportedFormats="Supported formats: PDF, JPG, PNG (Max 5MB)"
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="flex-1 bg-ghana-green hover:bg-green-600 text-white"
              >
                {mutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </div>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Birth Registration
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                className="flex-1"
                onClick={() => form.reset()}
              >
                <Save className="mr-2 h-4 w-4" />
                Clear Form
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
