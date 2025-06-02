import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertDeathRegistrationSchema, type InsertDeathRegistration } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserCheck, Upload, ArrowLeft, Send, Save } from "lucide-react";
import FileUpload from "./FileUpload";

interface DeathRegistrationFormProps {
  onBack: () => void;
}

export default function DeathRegistrationForm({ onBack }: DeathRegistrationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const form = useForm<InsertDeathRegistration>({
    resolver: zodResolver(insertDeathRegistrationSchema),
    defaultValues: {
      deceasedName: "",
      deathDate: new Date(),
      deathPlace: "",
      causeOfDeath: "",
      kinName: "",
      kinRelationship: "",
      kinPhone: "",
      kinNationalId: "",
      medicalCertificateUrl: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertDeathRegistration) => {
      const formData = { ...data, medicalCertificateUrl: uploadedFile || "" };
      return await apiRequest("POST", "/api/death-registrations", formData);
    },
    onSuccess: (response) => {
      const data = response.json();
      toast({
        title: "Death Registration Submitted",
        description: `Application ID: ${data.applicationId}. Your registration has been submitted for review.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/death-registrations"] });
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
        description: "Failed to submit death registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertDeathRegistration) => {
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
            <Users className="text-gray-600 h-8 w-8" />
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Death Registration Form</CardTitle>
              <p className="text-gray-600 mt-1">Complete all required fields to register a death certificate</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Deceased Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="text-gray-600 mr-2 h-5 w-5" />
                Deceased Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="deceasedName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Full name of deceased" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deathDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Death <span className="text-red-500">*</span></FormLabel>
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

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="deathPlace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Place of Death <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Hospital or location of death" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="causeOfDeath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cause of Death <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Medical cause of death as stated by physician" 
                            rows={3}
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

            {/* Next of Kin Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserCheck className="text-ghana-green mr-2 h-5 w-5" />
                Next of Kin Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="kinName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Next of kin's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kinRelationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kinPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="+233 XX XXX XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kinNationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>National ID</FormLabel>
                      <FormControl>
                        <Input placeholder="GHA-123456789-0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Medical Certificate Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="text-ghana-blue mr-2 h-5 w-5" />
                Medical Certificate
              </h3>
              <FileUpload
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={5 * 1024 * 1024} // 5MB
                onFileUploaded={setUploadedFile}
                label="Upload Medical Certificate"
                description="Death certificate from attending physician required"
                supportedFormats="Supported formats: PDF, JPG, PNG (Max 5MB)"
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="flex-1 bg-gray-700 hover:bg-gray-800 text-white"
              >
                {mutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </div>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Death Registration
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
