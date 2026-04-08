import { z } from 'zod';

export const createAuctionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  startingPrice: z.coerce.number().gt(0, 'Price must be greater than zero'),
  startTime: z.string(),
  endTime: z.string(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  category: z.string(),
});
