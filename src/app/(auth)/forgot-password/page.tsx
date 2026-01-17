'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import axios from 'axios';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Key } from 'lucide-react';
import Image from 'next/image';

const emailSchema = z.object({ email: z.string().email() });
const codeSchema = z.object({ code: z.string().length(6, 'Code must be 6 digits') });

export default function ForgotPasswordPage() {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter();

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const codeForm = useForm({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const handleSendCode = async (values: z.infer<typeof emailSchema>) => {
    try {
      await axios.post('/api/forgot-password', { email: values.email });
      toast.success('Reset code sent');
      setEmail(values.email);
      setIsCodeSent(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to send reset code');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleVerifyCode = async (values: z.infer<typeof codeSchema>) => {
    try {
      const res = await axios.post('/api/reset-code', {
        email,
        code: values.code,
      });
      toast.success('Code verified');
      router.push(`/reset-password/${res.data.username}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Invalid code');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-100">
      <Image
        src="/authbg.png"
        alt="Blurred background"
        fill
        className="object-cover blur-xl brightness-75 z-0"
      />

      <div className="relative z-10 w-full max-w-md bg-gray-100 backdrop-blur-md shadow-2xl rounded-2xl px-8 py-10 sm:px-10 sm:py-12 mx-4">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
          <p className="mt-2 text-gray-600 text-base">
            {!isCodeSent
              ? "We'll send a code to your email"
              : 'Enter the 6-digit code sent to your email'}
          </p>
        </div>

        {!isCodeSent ? (
          <FormProvider {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleSendCode)} className="space-y-6">
              {/* Email Input */}
              <FormField
                name="email"
                control={emailForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-800">Email</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3  text-gray-400" size={20} />
                        <Input {...field} placeholder="Enter your email" className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full hover:cursor-pointer bg-emerald-500 text-white py-2 text-sm rounded-md hover:bg-emerald-600"
              >
                Send Reset Code
              </Button>
            </form>
          </FormProvider>
        ) : (
          <>
            {/* Code Sent Info */}
            <p className="text-sm text-gray-700 mb-4 text-center">
              Code sent to: <span className="font-semibold">{email}</span>
            </p>

            {/* Code Form */}
            <FormProvider {...codeForm}>
              <form onSubmit={codeForm.handleSubmit(handleVerifyCode)} className="space-y-6">
                <FormField
                  name="code"
                  control={codeForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-800">
                        Verification Code
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={20}
                          />
                          <Input
                            {...field}
                            placeholder="6-digit code"
                            className="pl-10 border border-gray-300 placeholder:text-gray-400 px-4 py-2 text-sm"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full hover:cursor-pointer bg-emerald-500 text-white py-2 text-sm rounded-md hover:bg-emerald-600"
                >
                  Verify Code
                </Button>
              </form>
            </FormProvider>

            {/* Change Email Option */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsCodeSent(false)}
                className="text-sm text-emerald-600 hover:underline"
              >
                Change email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
