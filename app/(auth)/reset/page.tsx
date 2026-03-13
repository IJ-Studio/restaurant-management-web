// COMENTADO: Firebase Password Reset - Migration to Supabase
// 'use client';
//
// import { auth } from "@/lib/firebaseConfig";
// import { useState } from 'react';
// import { useSearchParams, useRouter } from "next/navigation";
// import { handleResetPassword } from "@/actions/(email-actions)/handleResetPassword";
// import { length, lowercase, uppercase, number, specialChar } from "@/utils/validators";
//
// [El resto del código está aquí pero comentado...]

"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerificationPage() {
  const params = useSearchParams();
  const actionCode = params.get("oobCode");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 lg:grid lg:grid-cols-[1fr_1.3fr] lg:items-center p-4">
      <div className="flex flex-col justify-center mx-auto w-full max-w-sm">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Password Reset
        </h2>
        <p className="text-gray-600 mb-4">
          Firebase password reset functionality has been disabled. This feature
          is now handled by Supabase.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

// COMENTADO: Toda la lógica de reset de contraseña con Firebase está desactivada
// ===============================================================================
// Las siguientes funciones y estados han sido removidos:
// - useState para new_pass, error, response
// - handleResetPassword() - llamada a Firebase
// - Todas las validaciones de contraseña
// - handleReset() async function
// - Formulario con validaciones y submit
// Las validaciones si se necesitan pueden ser recreadas cuando Supabase sea implementado
// ===============================================================================
