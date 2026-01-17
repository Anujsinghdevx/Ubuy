'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { signUpSchema } from '@/schemas/SignUpSchema';
import { FcGoogle } from 'react-icons/fc';
import { Lock, Mail, User } from 'lucide-react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

const Page = () => {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounced = useDebounceCallback(setUsername, 500);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage('');
        try {
          const response = await axios.get(`/api/check-username-unique?username=${username}`);
          setUsernameMessage(response.data.message);
        } catch (error: unknown) {
          setUsernameMessage(
            error instanceof Error ? error.message : 'An unexpected error occurred'
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  interface FormData {
    username: string;
    email: string;
    password: string;
  }

  const onSubmit = async (data: FormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      await axios.post('/api/sign-up', data);
      toast.success('Account created successfully');
      router.replace(`/verify/${data.username}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden ">
      {/* Blurred full background image */}
      <Image
        src="/authbg.png"
        alt="Blurred background"
        fill
        className="object-cover blur-xl brightness-75 z-0"
      />

      {/* Split card layout */}
      <div className="relative z-10 w-full max-w-6xl min-h-[60vh] sm:min-h-[80vh] grid grid-cols-1 md:grid-cols-2 bg-gray-100 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden mx-4">
        {/* Form Side */}
        <div className="flex flex-col justify-center h-full px-8 py-12 md:px-12">
          <div className=" mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              Join U-Buy
            </h1>
            <p className="mt-2 text-gray-600 text-base">Create an account to start bidding</p>
          </div>

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
                      <div className="flex items-center relative">
                        <User className="absolute left-3 text-gray-400" size={20} />
                        <Input
                          placeholder="Username"
                          className="pl-10 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            debounced(e.target.value);
                          }}
                        />
                      </div>
                    </FormControl>
                    {isCheckingUsername && (
                      <p className="text-sm text-gray-500">Checking availability...</p>
                    )}
                    <p
                      className={`text-sm ${usernameMessage.includes('available') ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {usernameMessage}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-800">Email</FormLabel>
                    <FormControl>
                      <div className="flex items-center relative">
                        <Mail className="absolute left-3 text-gray-400" size={20} />
                        <Input
                          placeholder="Email"
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
                        <Lock className="absolute left-3 text-gray-400" size={20} />
                        <Input
                          type="password"
                          placeholder="Password"
                          className="pl-10 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Sign-Up Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:cursor-pointer text-white py-2 rounded-md text-sm hover:bg-emerald-600"
              >
                {isSubmitting ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          </Form>

          {/* Google Sign-In */}
          <Button
            type="button"
            onClick={() => signIn('google')}
            className="w-full hover:cursor-pointer flex items-center justify-center border border-gray-300 bg-white text-gray-800 rounded-md py-2 text-sm hover:bg-gray-100 mt-4" // added margin top here
          >
            <FcGoogle size={20} /> Sign in with Google
          </Button>

          {/* Sign-in Link */}
          <div className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="text-emerald-600 hover:cursor-pointer font-medium hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="relative hidden md:block">
          <Image src="/authbg.png" alt="Signup background" fill className="object-cover" />
        </div>
      </div>
    </div>
  );
};

export default Page;
