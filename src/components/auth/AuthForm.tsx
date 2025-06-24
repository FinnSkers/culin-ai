"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { signIn, signUp, verifyOtp } from '@/app/auth/actions';
import { AlertTriangle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

const signUpSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
  inviteCode: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const otpSchema = z.object({
    otp: z.string().min(6, { message: "OTP must be 6 digits." }).max(6, { message: "OTP must be 6 digits." }),
});

export function AuthForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('signin');
  const [signupStep, setSignupStep] = useState<'details' | 'otp'>('details');
  const [userEmailForOtp, setUserEmailForOtp] = useState('');

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", inviteCode: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });
  
  const isSubmitting = signInForm.formState.isSubmitting || signUpForm.formState.isSubmitting || otpForm.formState.isSubmitting;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setServerError(null);
    setSuccessMessage(null);
    signInForm.reset();
    signUpForm.reset();
    otpForm.reset();
    setSignupStep('details');
  };

  const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
    setServerError(null);
    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('password', values.password);

    const response = await signIn(formData);

    if (response?.error) {
        setServerError(response.error);
    } else if (response?.success) {
      toast({
        title: "Signed In!",
        description: "Welcome back, little chef. Let's get cooking.",
      });
      router.refresh();
      setTimeout(() => {
        window.location.reload();
      }, 250);
      onSuccess?.();
    }
  };

  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setServerError(null);
    setSuccessMessage(null);
    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('password', values.password);
    if (values.inviteCode) {
        formData.append('inviteCode', values.inviteCode);
    }

    const response = await signUp(formData);
    if (response?.error) {
        setServerError(response.error);
    } else if (response?.success) {
        setUserEmailForOtp(values.email);
        setSignupStep('otp');
        setServerError(null);
    }
  };

  const handleVerifyOtp = async (values: z.infer<typeof otpSchema>) => {
    setServerError(null);
    const formData = new FormData();
    formData.append('email', userEmailForOtp);
    formData.append('otp', values.otp);

    const response = await verifyOtp(formData);

    if (response?.error) {
      setServerError(response.error);
    } else if (response?.success) {
      toast({
        title: "Account Verified!",
        description: "Welcome to the rebellion. Your AI sous-chef is ready.",
      });
      router.refresh();
      onSuccess?.();
    }
  };

  return (
    <div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4 pt-4">
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {signInForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="signup">
            {signupStep === 'details' && (
                <Form {...signUpForm}>
                    <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4 pt-4 animate-startup-fade-in-up-1">
                        <FormField
                            control={signUpForm.control}
                            name="email"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                <Input placeholder="you@example.com" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name="inviteCode"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Invite Code (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter an invite code" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {signUpForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign Up
                        </Button>
                    </form>
                </Form>
            )}

            {signupStep === 'otp' && (
                <div className="pt-4 animate-startup-fade-in-up-1">
                    <Button variant="ghost" size="sm" className="mb-2 -ml-3" onClick={() => { setSignupStep('details'); setServerError(null); }} disabled={isSubmitting}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to details
                    </Button>
                    <div className="text-center py-2 space-y-1">
                        <h3 className="text-lg font-semibold">Check your email</h3>
                        <p className="text-sm text-muted-foreground">
                            We sent a 6-digit code to <span className="font-bold text-foreground">{userEmailForOtp}</span>.
                        </p>
                    </div>
                    <Form {...otpForm}>
                        <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                            <FormField
                                control={otpForm.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>One-Time Password</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123456" {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {otpForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify Account
                            </Button>
                        </form>
                    </Form>
                </div>
            )}
          </TabsContent>
        </Tabs>
        
        {serverError && (
            <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Whoops!</AlertTitle>
                <AlertDescription>
                    {serverError}
                </AlertDescription>
            </Alert>
        )}
        
        {successMessage && (
            <Alert className="mt-4 border-primary/50 text-primary [&>svg]:text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                    {successMessage}
                </AlertDescription>
            </Alert>
        )}
    </div>
  );
}
