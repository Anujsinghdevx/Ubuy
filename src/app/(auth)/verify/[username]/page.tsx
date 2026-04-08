'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';
import { useState } from 'react';
import { verifySchema } from '@/schemas/VerifySchema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UserCheck, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

const VerifyCodePage = () => {
  const router = useRouter();
  const params = useParams();
  const routeEmail = decodeURIComponent((params?.username as string) || '');
  const [isResending, setIsResending] = useState(false);
  const form = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: routeEmail,
      code: '',
    },
  });

  const onSubmit = async (values: { email: string; code: string }) => {
    try {
      await axios.post('/api/verify-code', values);
      toast.success('Verification successful! You can now log in.');
      router.replace('/sign-in');
    } catch {
      toast.error('Verification failed');
    }
  };

  const handleResendCode = async () => {
    const email = form.getValues('email')?.trim();
    if (!email) {
      toast.error('Email is required to resend code');
      return;
    }

    try {
      setIsResending(true);
      const res = await axios.post('/api/resend-code', { email });
      toast.success(res?.data?.message || 'Verification code resent');
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error)
          ? error.response?.data?.message || error.response?.data?.error || 'Failed to resend code'
          : 'Failed to resend code';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-100">
      {/* Blurred background image */}
      <Image
        src="/authbg.png"
        alt="Blurred background"
        fill
        className="object-cover blur-xl brightness-75 z-0"
      />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md bg-gray-100 backdrop-blur-md shadow-2xl rounded-2xl px-8 py-10 sm:px-10 sm:py-12 mx-4">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Account</h1>
          <p className="mt-2 text-gray-600 text-base">Enter the 6-digit code sent to your email</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-800">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserCheck
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <Input
                        placeholder="Your email"
                        className="pl-10 border border-gray-300 placeholder:text-gray-400 px-4 py-2 text-sm"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Verification Code */}
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-800">
                    Verification Code
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <ShieldCheck
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <Input
                        placeholder="6-digit code"
                        maxLength={6}
                        className="pl-10 border border-gray-300 placeholder:text-gray-400 px-4 py-2 text-sm"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full hover:cursor-pointer bg-emerald-500 text-white py-2 text-sm rounded-md hover:bg-emerald-600"
            >
              Verify Account
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isResending}
              onClick={handleResendCode}
              className="w-full"
            >
              {isResending ? 'Resending...' : 'Resend Code'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerifyCodePage;
