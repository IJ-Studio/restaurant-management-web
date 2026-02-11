import Link from 'next/link';
import styles from '../forbidden.module.css';

export default function Forbidden() {
    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-center bg-gray-50 overflow-hidden">
            {/* Background Text */}
            <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[20rem] font-black text-gray-200 select-none z-0 whitespace-nowrap opacity-60">
                403
            </h1>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col items-center gap-12 mt-10">

                {/* Animation: Hanging Sign */}
                <div className={styles.signContainer}>
                    <div className={styles.nailLeft}></div>
                    <div className={styles.nailRight}></div>

                    <div className={styles.signBoard}>
                        <div className={styles.chainLeft}></div>
                        <div className={styles.chainRight}></div>

                        <div className={styles.closedText}>CERRADO</div>
                        <div className={styles.subText}>Acceso Restringido</div>
                    </div>
                </div>

                {/* Text and Action */}
                <div className="text-center space-y-4 px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Zona Exclusiva de Chefs
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Lo sentimos, no tienes los permisos necesarios para entrar a esta área de la cocina.
                    </p>

                    <Link
                        href="/dashboard"
                        className="inline-block mt-4 px-8 py-3 bg-[#232f38] text-white rounded-xl font-semibold hover:bg-[#3b4b57] transition-all shadow-lg hover:shadow-xl"
                    >
                        Volver al salón
                    </Link>
                </div>
            </div>
        </div>
    );
}
