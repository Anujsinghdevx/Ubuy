'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import axios from 'axios';
import { Lock } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ResetPasswordPage() {
  const params = useParams();
  const username = params?.username as string | undefined;
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await axios.post('/api/reset-password', {
        username,
        password: values.password,
      });
      toast.success('Password reset successfully');
      router.push('/sign-in');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Something went wrong');
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-100">
      {/* Blurred Background */}
      <Image
        src="/authbg.png"
        alt="Reset background"
        fill
        className="object-cover blur-xl brightness-75 z-0"
      />

      {/* Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md bg-gray-100 backdrop-blur-md shadow-2xl rounded-2xl px-8 py-10 sm:px-10 sm:py-12 mx-4">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reset Your Password</h1>
          <p className="mt-2 text-gray-600 text-base">Enter your new password below</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-800">New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <Input
                        type="password"
                        placeholder="New password"
                        className="pl-10 border border-gray-300 placeholder:text-gray-400 px-4 py-2 text-sm"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              name="confirmPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-800">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <Input
                        type="password"
                        placeholder="Confirm new password"
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
              Reset Password
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
