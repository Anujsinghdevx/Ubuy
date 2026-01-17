'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
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
import { signIn } from 'next-auth/react';
import { signInSchema } from '@/schemas/SignInSchema';
import { FcGoogle } from 'react-icons/fc';
import { Lock, Mail } from 'lucide-react';
import Image from 'next/image';

const Page = () => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (result?.error) {
      toast.error('Invalid credentials');
    }
    if (result?.url) {
      router.replace('/');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Blurred Background Image */}
      <Image
        src="/authbg.png"
        alt="Blurred background"
        fill
        className="object-cover blur-xl brightness-75 z-0"
      />

      {/* Overlay Card Container */}
      <div className="relative z-10 w-full max-w-6xl min-h-[60vh] sm:min-h-[80vh] grid grid-cols-1 md:grid-cols-2 bg-gray-100 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden mx-4">
        {/* Form Side */}
        <div className="flex flex-col justify-center h-full px-8 py-12 md:px-12">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              Welcome back to U-Buy
            </h1>
            <p className="mt-2 text-gray-600 text-base">
              Start bidding smarter — log in to your account below.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email/Username */}
              <FormField
                name="identifier"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-800">
                      Email or Username
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center relative">
                        <Mail className="absolute left-3 text-gray-400" size={20} />
                        <Input
                          placeholder="Enter your email/username"
                          className="pl-10 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-800">Password</FormLabel>
                    <FormControl>
                      <div className="flex items-center relative">
                        <Lock className="absolute left-3  text-gray-400" size={20} />
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <div className="text-right mt-1">
                      <Link
                        href="/forgot-password"
                        className="text-sm text-emerald-600 hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sign-In Button */}
              <Button
                type="submit"
                className="w-full hover:cursor-pointer bg-emerald-500 text-white rounded-md py-2 text-sm hover:bg-emerald-600"
              >
                Sign In
              </Button>

              {/* Google Sign-In */}
              <Button
                type="button"
                onClick={() => signIn('google')}
                className="w-full flex hover:cursor-pointer items-center justify-center gap-2 border border-gray-300 bg-white text-gray-800 rounded-md py-2 text-sm hover:bg-gray-100"
              >
                <FcGoogle size={20} /> Sign in with Google
              </Button>
            </form>
          </Form>

          {/* Sign-Up */}
          <div className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{' '}
            <Link
              href="/sign-up"
              className="text-emerald-600 hover:cursor-pointer font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Right Side Image (same image, crisp) */}
        <div className="relative hidden md:block">
          <Image
            src="/authbg.png"
            alt="Auth background"
            height={1820}
            width={1024}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
