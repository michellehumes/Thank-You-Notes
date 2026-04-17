import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-24">
        <div className="text-center px-6">
          <p className="text-pink font-heading font-bold text-6xl mb-4">404</p>
          <h1 className="font-heading text-2xl font-bold text-charcoal mb-3">
            Page Not Found
          </h1>
          <p className="text-text-light mb-8 max-w-md mx-auto">
            The page you are looking for does not exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-block bg-pink hover:bg-pink-hover text-white font-heading font-semibold px-8 py-3.5 rounded-lg transition text-center"
            >
              Browse the Shop
            </Link>
            <Link
              href="/"
              className="inline-block border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white font-heading font-semibold px-8 py-3.5 rounded-lg transition text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
