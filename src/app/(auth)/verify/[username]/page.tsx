'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';
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

const verifySchema = z.object({
  username: z.string().min(1, 'Username is required'),
  code: z.string().length(6, 'Code must be 6 digits'),
});

const VerifyCodePage = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      username: '',
      code: '',
    },
  });

  const onSubmit = async (values: { username: string; code: string }) => {
    try {
      await axios.post('/api/verify-code', values);
      toast.success('Verification successful! You can now log in.');
      router.replace('/sign-in');
    } catch {
      toast.error('Verification failed');
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
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-800">Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserCheck
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <Input
                        placeholder="Your username"
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
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerifyCodePage;
