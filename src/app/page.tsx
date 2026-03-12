import PublicShell from "@/components/PublicShell";
import Link from "next/link";

export default function HomePage() {
  return (
    <PublicShell>
      <section className='max-w-4xl mx-auto'>
        <h1 className='text-4xl font-black mb-2'>Climate Asset Registry</h1>
        <h2 className='text-2xl font-bold text-gray-600 mb-6'>Aggregate. Verify. Monetize.</h2>

        <p className='text-lg mb-4'>
          A public registry for verified low-carbon actions and carbon-credit
          preparedness.
        </p>

        <p className='text-lg mb-8'>
          This platform tracks emissions reduction, readiness, and impact — not
          instant carbon credits.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/register"
            className="px-6 py-3 bg-[rgb(32,38,130)] text-white text-center font-bold rounded-xl hover:bg-[rgb(25,30,110)] transition-colors"
          >
            Register Your Action
          </Link>
          <Link
            href="/partners"
            className="px-6 py-3 bg-white text-[rgb(32,38,130)] border border-[rgb(32,38,130)] text-center font-bold rounded-xl hover:bg-blue-50 transition-colors"
          >
            For Partners: View Asset Pipeline
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
