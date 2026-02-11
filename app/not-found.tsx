import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-gray-50 overflow-hidden">
      {/* Background Text */}
      <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[20rem] font-black text-gray-200 select-none z-0 whitespace-nowrap opacity-60">
        404
      </h1>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col items-center gap-8">

        {/* Animation Container */}
        <div className={styles.loader}>
          <div className={styles.panWrapper}>
            <div className={styles.pan}>
              <div className={styles.food}></div>
              <div className={styles.panBase}></div>
              <div className={styles.panHandle}></div>
            </div>
            <div className={styles.panShadow}></div>
          </div>
        </div>

        {/* Text and Action */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Página no encontrada
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Parece que la página que buscas se está cocinando o ya no existe.
          </p>

          <Link
            href="/dashboard"
            className="inline-block mt-4 px-8 py-3 bg-[#232f38] text-white rounded-xl font-semibold hover:bg-[#3b4b57] transition-all shadow-lg hover:shadow-xl"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}