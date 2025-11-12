'use client';

import { useSearchParams, useRouter } from "next/navigation"; //Lecuta de parametros en url
import { useEffect, useState } from "react";

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
                    // case 'verifyEmail':
                    //     await handleVerifyEmail(auth, ACTIONCODE, CONTINUEURL);
                    //     break;
                    // case 'recoverEmail':
                    //     handleRecoverEmail(auth, ACTIONCODE, CONTINUEURL);
                    //         break;
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