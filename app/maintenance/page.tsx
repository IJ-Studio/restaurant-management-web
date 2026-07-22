"use client";

import Link from 'next/link';
import styles from '../maintenance.module.css';

export default function Maintenance() {
    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-center bg-gray-50 overflow-hidden">
            {/* Background Text */}
            <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[20rem] font-black text-gray-200 select-none z-0 whitespace-nowrap opacity-60">
                503
            </h1>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col items-center gap-12 mt-16">

                {/* Animation: Whisk Mixing */}
                <div className={styles.bowlContainer}>
                    <div className={styles.whiskHandle}>
                        <div className={styles.whiskWires}></div>
                    </div>
                    <div className={styles.bowl}>
                        <div className={styles.batter}></div>
                    </div>
                </div>

                {/* Text and Action */}
                <div className="text-center space-y-4 px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Estamos preparando algo nuevo
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Nuestra cocina está en mantenimiento para servirte mejor. Volveremos a abrir en unos momentos.
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="inline-block mt-4 px-8 py-3 bg-[#f1c40f] text-gray-800 rounded-xl font-bold hover:bg-[#f39c12] transition-all shadow-lg hover:shadow-xl"
                    >
                        Refrescar Página
                    </button>
                </div>
            </div>
        </div>
    );
}
