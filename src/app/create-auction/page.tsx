'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock, Monitor, ShoppingBag, Palette, Star, Layers } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format, setHours, setMinutes, addHours } from 'date-fns';
import { toast } from 'sonner';
import { z } from 'zod';

const Turnstile = lazy(() => import('react-turnstile'));
const AuctionImageUploader = lazy(() => import('@/components/AuctionImageUploader'));

interface AuctionFormData {
  title: string;
  description: string;
  startingPrice: string;
  startTime: string;
  endTime: string;
  images: string[];
  category: string;
}

const categoryOptions = ['Collectibles', 'Art', 'Electronics', 'Fashion', 'Other'];

const categoryIcons: Record<string, React.JSX.Element> = {
  Art: <Palette className="w-4 h-4 mr-2" />,
  Electronics: <Monitor className="w-4 h-4 mr-2" />,
  Fashion: <ShoppingBag className="w-4 h-4 mr-2" />,
  Collectibles: <Star className="w-4 h-4 mr-2" />,
  Other: <Layers className="w-4 h-4 mr-2" />,
};

const auctionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  startingPrice: z.coerce.number().gt(0, 'Price must be greater than zero'),
  startTime: z.string(),
  endTime: z.string(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  category: z.string(),
});

const getLocalTimeString = (date = new Date()) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function CreateAuction() {
  const { data: session } = useSession();
  const now = new Date();

  const [formData, setFormData] = useState<AuctionFormData>({
    title: '',
    description: '',
    startingPrice: '',
    startTime: now.toISOString(),
    endTime: addHours(now, 1).toISOString(),
    images: [],
    category: 'Other',
  });

  const [startDate, setStartDate] = useState<Date | null>(now);
  const [endDate, setEndDate] = useState<Date | null>(addHours(now, 1));
  const [startTime, setStartTime] = useState(getLocalTimeString());
  const [endTime, setEndTime] = useState(getLocalTimeString(addHours(now, 1)));
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const [h, m] = startTime.split(':').map(Number);
    const start = setMinutes(setHours(new Date(), h), m);
    const end = addHours(start, 1);
    setFormData((prev) => ({
      ...prev,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    }));
    setStartDate(start);
    setEndDate(end);
    setEndTime(getLocalTimeString(end));
  }, [startTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    const capitalizedValue =
      (name === 'title' || name === 'description') && value.length > 0
        ? value.charAt(0).toUpperCase() + value.slice(1)
        : value;

    setFormData({ ...formData, [name]: capitalizedValue });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newTime = getLocalTimeString(now);
      setStartTime(newTime);

      if (startDate) {
        const [h, m] = newTime.split(':').map(Number);
        const updated = setMinutes(setHours(startDate, h), m);
        setStartDate(updated);
        setFormData((prev) => ({ ...prev, startTime: updated.toISOString() }));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [startDate]);

  const handleImageUpload = (imageUrls: string[]) =>
    setFormData({ ...formData, images: imageUrls });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    if (!session) {
      toast('You must be logged in to create an auction.');
      setLoading(false);
      return;
    }

    const validation = auctionSchema.safeParse({
      ...formData,
      startingPrice: Number(formData.startingPrice),
    });

    if (!validation.success) {
      const errorMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errorMap[err.path[0]] = err.message;
      });
      setFieldErrors(errorMap);
      toast(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    if (!token) {
      toast('CAPTCHA validation failed.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auction/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, startingPrice: Number(formData.startingPrice), token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      toast('Auction created successfully!');
      const newStart = new Date();
      const newEnd = addHours(newStart, 1);

      setFormData({
        title: '',
        description: '',
        startingPrice: '',
        startTime: newStart.toISOString(),
        endTime: newEnd.toISOString(),
        images: [],
        category: 'Other',
      });
      setStartTime(getLocalTimeString(newStart));
      setEndTime(getLocalTimeString(newEnd));
      setStartDate(newStart);
      setEndDate(newEnd);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>
          {formData.title ? `${formData.title} - Create Auction` : 'Create Auction - MyMarketplace'}
        </title>
        <meta
          name="description"
          content={
            formData.description ||
            'Create and list your auction items with images, pricing, and timing.'
          }
        />
        <meta property="og:title" content={formData.title || 'Create Auction - MyMarketplace'} />
        <meta
          property="og:description"
          content={formData.description || 'List your auction with ease.'}
        />
      </Head>

      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        {session ? (
          <div className="w-full max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
              Create Auction
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <fieldset disabled={loading} className="space-y-5">
                {/* Title & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter auction title"
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                      aria-invalid={!!fieldErrors['title']}
                      aria-describedby="title-error"
                    />
                    {fieldErrors.title && (
                      <p id="title-error" className="text-red-500 text-sm mt-1">
                        {fieldErrors.title}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Starting Price (₹)
                    </label>
                    <input
                      type="number"
                      name="startingPrice"
                      value={formData.startingPrice}
                      onChange={handleInputChange}
                      required
                      min="1"
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="e.g. 1000"
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                      aria-invalid={!!fieldErrors['startingPrice']}
                      aria-describedby="startingPrice-error"
                    />
                    {fieldErrors.startingPrice && (
                      <p id="startingPrice-error" className="text-red-500 text-sm mt-1">
                        {fieldErrors.startingPrice}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                    aria-invalid={!!fieldErrors['description']}
                    aria-describedby="description-error"
                  />
                  {fieldErrors.description && (
                    <p id="description-error" className="text-red-500 text-sm mt-1">
                      {fieldErrors.description}
                    </p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      label: 'Start',
                      date: startDate,
                      time: startTime,
                      setDate: setStartDate,
                      setTime: setStartTime,
                      updateField: 'startTime',
                    },
                    {
                      label: 'End',
                      date: endDate,
                      time: endTime,
                      setDate: setEndDate,
                      setTime: setEndTime,
                      updateField: 'endTime',
                    },
                  ].map(({ label, date, time, setDate, setTime, updateField }) => (
                    <div key={label} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {label} Date & Time
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-full p-3 border rounded-xl shadow-sm text-left"
                          >
                            {date ? format(date, 'PPP') : `Pick a ${label.toLowerCase()} date`}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date || undefined}
                            onSelect={(selectedDate) => {
                              if (!selectedDate) return;
                              const [h, m] = time.split(':').map(Number);
                              const fullDate = setMinutes(setHours(selectedDate, h), m);
                              setDate(fullDate);
                              setFormData({ ...formData, [updateField]: fullDate.toISOString() });
                            }}
                            disabled={(d) => d < new Date()}
                            className="bg-white border rounded-xl"
                          />
                        </PopoverContent>
                      </Popover>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newTime = e.target.value;
                          const [h, m] = newTime.split(':').map(Number);

                          const now = new Date();
                          const isToday = date?.toDateString() === now.toDateString();
                          const currentMinutes = now.getHours() * 60 + now.getMinutes();
                          const selectedMinutes = h * 60 + m;

                          if (label === 'Start' && isToday && selectedMinutes < currentMinutes) {
                            toast("You can't select a past time today.");
                            return;
                          }

                          setTime(newTime);

                          if (date) {
                            const updated = setMinutes(setHours(date, h), m);
                            setDate(updated);
                            setFormData({ ...formData, [updateField]: updated.toISOString() });
                          }
                        }}
                        className="w-full p-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Category with Icons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger className="w-full rounded-xl border focus:ring-2 focus:ring-emerald-500">
                      <SelectValue>
                        <div className="flex items-center">
                          {categoryIcons[formData.category]} {formData.category}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          <div className="flex items-center">
                            {categoryIcons[cat]} {cat}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Image Upload */}
                <Suspense fallback={<div>Loading uploader...</div>}>
                  <AuctionImageUploader onUpload={handleImageUpload} />
                </Suspense>

                {/* CAPTCHA */}
                <div className="flex justify-center mt-4">
                  <Suspense fallback={<div>Loading CAPTCHA...</div>}>
                    <Turnstile
                      sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                      onSuccess={setToken}
                    />
                  </Suspense>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full hover:cursor-pointer p-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Auction'
                  )}
                </Button>
              </fieldset>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 p-6 rounded-lg shadow-lg bg-white">
            <Lock size={48} className="text-gray-500" />
            <p className="text-lg text-gray-700">You must log in to create an auction.</p>
            <Link href="/sign-in">
              <Button className="bg-emerald-600 text-white">Login</Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
