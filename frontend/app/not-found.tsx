import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg flex flex-col justify-center items-center px-4 py-20 sm:py-32">
        <div className="max-w-md w-full mx-auto text-center flex flex-col items-center">
          <h1 className="font-lexend text-7xl sm:text-9xl font-black text-accent tracking-tighter mb-2 select-none">
            404
          </h1>
          
          <h2 className="font-lexend text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
            Page not found
          </h2>
          
          <p className="text-secondary text-base sm:text-lg leading-relaxed mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been removed, renamed, or is temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/"
              className="btn btn-primary rounded-lg px-6 min-h-[42px] h-[42px] text-white bg-accent hover:bg-accent-hover border-none font-semibold text-sm w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm"
            >
              <ArrowLeft size={18} weight="bold" />
              Back to Home
            </Link>
            <Link
              href="/#contact"
              className="btn btn-ghost text-secondary hover:text-primary rounded-lg px-5 min-h-[42px] h-[42px] font-medium text-sm w-full sm:w-auto"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
