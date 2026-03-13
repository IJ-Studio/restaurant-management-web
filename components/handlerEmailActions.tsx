// COMENTADO: Firebase Email Actions Handler - Migration to Supabase
// 'use client';
//
// import { useSearchParams, useRouter } from "next/navigation"; //Lecuta de parametros en url
// import { useEffect, useState } from "react";
// import { handleVerifyEmail}  from "@/actions/(email-actions)/handleVerifyEmail"
// import {auth} from "@/lib/firebaseConfig"
//
// export default function handlerEmailActions() {
//     const router = useRouter();
//
//     const PARAMS = useSearchParams();
//     const MODE = PARAMS.get('mode');
//     const ACTIONCODE = PARAMS.get('oobCode');
//     const CONTINUEURL = PARAMS.get('continueUrl');
//     const [RESPONSE, SETRESPONSE] = useState("");
//
//     useEffect(() => {
//         if (!MODE || !ACTIONCODE) return;
//
//         async function handleAction() {
//             try {
//                 switch (MODE) {
//                     case 'resetPassword':
//                         router.replace(`/auth/reset?mode=${MODE}&oobCode=${ACTIONCODE}&continueUrl=${CONTINUEURL || ""}`);
//                         break;
//                     case 'verifyEmail':
//                         const result = await handleVerifyEmail(auth, ACTIONCODE);
//
//                         if (result.success) {
//                             SETRESPONSE("Correo verificado correctamente.");
//                             setTimeout(() => router.replace("/login"), 1500);
//                         } else {
//                             SETRESPONSE("El enlace no es válido o ya fue usado.");
//                         }
//                             break;
//                     default:
//                         SETRESPONSE("Acción no reconocida");
//                 }
//             } catch (err) {
//                 SETRESPONSE("El enlace no es válido o ha expirado.");
//             }
//         }
//
//         handleAction();
//
//     }, [MODE, ACTIONCODE, CONTINUEURL, router]);
//
//
//     return <div>{RESPONSE || "Procesando enlace de verificación..."}</div>;
// }

// NOTA: Email actions ahora manejadas por Supabase
'use client';

export default function handlerEmailActions() {
    return (
        <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
            <p>Email verification is now handled by Supabase. This component is deprecated.</p>
        </div>
    );
}