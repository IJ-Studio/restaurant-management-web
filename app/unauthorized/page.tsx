import Link from 'next/link';
import styles from '../unauthorized.module.css';

export default function Unauthorized() {
    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-center bg-gray-50 overflow-hidden">
            {/* Background Text */}
            <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[20rem] font-black text-gray-200 select-none z-0 whitespace-nowrap opacity-60">
                401
            </h1>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col items-center gap-12">

                {/* Animation: Clipboard with 'NO' stamp */}
                <div className={styles.clipboardContainer}>
                    <div className={styles.clip}></div>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>

                    <div className={styles.stamp}>FULL</div>
                </div>

                {/* Text and Action */}
                <div className="text-center space-y-4 px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        ¿Tienes reservación?
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        No hemos encontrado tu nombre en la lista. Por favor, inicia sesión para acceder a tu mesa.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                        <Link
                            href="/login"
                            className="px-8 py-3 bg-[#232f38] text-white rounded-xl font-semibold hover:bg-[#3b4b57] transition-all shadow-lg hover:shadow-xl"
                        >
                            Iniciar Sesión
                        </Link>
                        <Link
                            href="/register"
                            className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow hover:shadow-md"
                        >
                            Registrarse
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
