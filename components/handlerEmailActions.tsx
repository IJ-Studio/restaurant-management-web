'use client';

import { useSearchParams, useRouter } from "next/navigation"; //Lecuta de parametros en url
import { useEffect, useState } from "react";
import { handleVerifyEmail}  from "@/actions/(email-actions)/handleVerifyEmail"
import {auth} from "@/lib/firebaseConfig"

export default function handlerEmailActions() {
    const router = useRouter();

    const PARAMS = useSearchParams();
    const MODE = PARAMS.get('mode');
    const ACTIONCODE = PARAMS.get('oobCode');
    const CONTINUEURL = PARAMS.get('continueUrl');
    const [RESPONSE, SETRESPONSE] = useState("");

    useEffect(() => {
        if (!MODE || !ACTIONCODE) return;

        async function handleAction() {
            try {
                switch (MODE) {
                    case 'resetPassword':
                        router.replace(`/auth/reset?mode=${MODE}&oobCode=${ACTIONCODE}&continueUrl=${CONTINUEURL || ""}`);
                        break;
                    case 'verifyEmail':
                        const result = await handleVerifyEmail(auth, ACTIONCODE);

                        if (result.success) {
                            SETRESPONSE("Correo verificado correctamente.");
                            setTimeout(() => router.replace("/login"), 1500);
                        } else {
                            SETRESPONSE("El enlace no es válido o ya fue usado.");
                        }
                            break;
                    default:
                        SETRESPONSE("Acción no reconocida");
                }
            } catch (err) {
                SETRESPONSE("El enlace no es válido o ha expirado.");
            }
        }

        handleAction();

    }, [MODE, ACTIONCODE, CONTINUEURL, router]);


    return <div>{RESPONSE || "Procesando enlace de verificación..."}</div>;

}