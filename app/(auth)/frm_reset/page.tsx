// COMENTADO: Firebase Password Recovery Form - Migration to Supabase
// 'use client';
//
// import { auth } from "@/lib/firebaseConfig";
// import { useState } from 'react';
// import { handleSendEmail } from "@/actions/(email-actions)/handleSendPasswordResetEmail";
// import { emailRegex } from "@/utils/validators";

"use client";

import { useState } from "react";
import { emailRegex } from "@/utils/validators";

export default function RecoverPage() {
  const [correo, setCorreo] = useState("");
  const [response, setResponse] = useState("");

  const isEmailValid = emailRegex.test(correo);
  const isFormReady = isEmailValid;

  return (
    <div className="min-h-screen bg-gray-50 lg:grid lg:grid-cols-[1fr_1.3fr] lg:items-center">
      <div className="flex flex-col justify-center px-6 py-12 lg:px-10">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <div className="flex items-center space-x-2 mb-12">
            <span className="text-xl font-medium text-[#3b4b57]">
              Restaurante El Quijote
            </span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Recuperación de contraseña
            </h2>
          </div>

          <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-md">
            <p className="text-yellow-800">
              Password recovery through email has been disabled. This feature is
              now handled by Supabase. Please contact support for password reset
              assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// COMENTADO: Función original con handleSendEmail de Firebase - Desactivada
// ========================================================================
// Las siguientes funciones y lógica han sido removidas:
// - import { handleSendEmail } from "@/actions/(email-actions)/handleSendPasswordResetEmail";
// - async function handleSend() { const result = await handleSendEmail(auth, correo); }
// - Form submit que llamaba handleSend()
// - Estado error para mostrar errores
// La lógica de envío de email será implementada en Supabase cuando sea necesario
// ========================================================================
