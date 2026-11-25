import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Please enter your full name").max(80),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

export const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  country: z.string().min(2),
  region: z.string().min(1, "Please enter a region/state"),
  city: z.string().min(1, "Please enter a city"),
  street: z.string().min(4, "Please enter a street address"),
  postalCode: z.string().optional(),
  deliveryMethod: z.enum(["standard", "express"]),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your bag is empty"),
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(100),
  body: z.string().min(10, "Please write at least 10 characters").max(2000),
});

export const addressSchema = z.object({
  label: z.string().min(1).max(40),
  fullName: z.string().min(2),
  phone: z.string().min(7),
  country: z.string().min(2),
  region: z.string().min(1),
  city: z.string().min(1),
  street: z.string().min(4),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().min(10),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  price: z.number().int().positive(),
  comparePrice: z.number().int().nullable().optional(),
  images: z.array(z.string().url()).min(1),
  colours: z.array(z.object({ name: z.string(), hex: z.string() })).min(1),
  sizes: z.array(z.string()).min(1),
  material: z.string().default(""),
  care: z.string().default(""),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  trending: z.boolean().default(false),
  gender: z.enum(["women", "men", "unisex"]).default("unisex"),
  style: z.string().default(""),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().default(""),
  image: z.string().default(""),
  parentId: z.string().nullable().optional(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
  gender: z.enum(["women", "men", "unisex"]).default("unisex"),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(24),
  type: z.enum(["percentage", "fixed", "free_shipping"]),
  value: z.number().int().nonnegative(),
  minOrder: z.number().int().nonnegative().default(0),
  usageLimit: z.number().int().positive().default(100),
  startAt: z.string(),
  endAt: z.string(),
  active: z.boolean().default(true),
  firstOrderOnly: z.boolean().default(false),
  productIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
});

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
