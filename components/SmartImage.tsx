"use client";

import Image, { type ImageProps } from "next/image";
import { CldImage } from "next-cloudinary";

type SmartImageProps = Omit<ImageProps, "src"> & { src: string };

/**
 * platillo/categoria images live in Supabase Storage (full https URLs), not
 * as Cloudinary public IDs — CldImage looks those up inside the Cloudinary
 * cloud and fails with "Resource not found". Route real Cloudinary assets
 * (bare public IDs or res.cloudinary.com URLs) through CldImage, everything
 * else through next/image (mdygrtdebtmuhmirnbxz.supabase.co is already
 * whitelisted in next.config.js).
 */
export default function SmartImage({ src, ...props }: SmartImageProps) {
  const isCloudinaryAsset = !src.startsWith("http") || src.includes("res.cloudinary.com");

  if (isCloudinaryAsset) {
    return <CldImage src={src} {...(props as any)} />;
  }

  return <Image src={src} {...props} />;
}
