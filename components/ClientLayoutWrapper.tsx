"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const ConditionalNavbar = dynamic(
  () => import("@/components/ConditionalNavbar"),
  { ssr: false },
);

const Footer = dynamic(() => import("@/components/landing/Footer"), {
  ssr: false,
});

export default function ClientLayoutWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <ConditionalNavbar />
      {children}
      <Footer />
    </>
  );
}
