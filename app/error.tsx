'use client';
import { useEffect } from 'react';
import styles from './error.module.css';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
    useEffect(() => {
        // Aquí podrías loguear el error a un servicio de reporte
        console.error(error);
    }, [error]);

    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-center bg-gray-50 overflow-hidden">
            {/* Background Text */}
            <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[20rem] font-black text-red-50 select-none z-0 whitespace-nowrap opacity-80">
                500
            </h1>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col items-center gap-8">

                {/* Animation: Boiling Pot */}
                <div className={`${styles.potContainer} ${styles.shakingPot}`}>
                    <div className={styles.bubble}></div>
                    <div className={styles.bubble}></div>
                    <div className={styles.bubble}></div>
                    <div className={styles.bubble}></div>

                    <div className={styles.potBody}>
                        <div className={styles.potRim}></div>
                    </div>
                    <div className={styles.potHandle}></div>
                </div>

                {/* Text and Action */}
                <div className="text-center space-y-4 px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        ¡Se nos quemó la cocina!
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Hubo un error inesperado en nuestro servidor. Nuestros chefs digitales ya están trabajando para limpiarlo.
                    </p>

                    <button
                        onClick={reset}
                        className="inline-block mt-4 px-8 py-3 bg-[#c0392b] text-white rounded-xl font-semibold hover:bg-[#a93226] transition-all shadow-lg hover:shadow-xl"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        </div>
    );
}