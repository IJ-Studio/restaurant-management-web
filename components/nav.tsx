import Image from "next/image";
import Logo from "@/public/assets/logo.png";

interface NavProps {
  children?: React.ReactNode;
}

export default function Nav({ children }: NavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-10">
      <nav className="border-b border-gray-100 bg-white/80 shadow-lg backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="shrink-0">
              <Image src={Logo} width={100} alt="Logo del restaurante" />
            </div>
            <div className="flex items-center space-x-3">{children}</div>
          </div>
        </div>
      </nav>
    </header>
  );
}