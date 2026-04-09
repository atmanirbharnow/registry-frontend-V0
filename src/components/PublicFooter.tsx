export default function PublicFooter() {
  return (
    <footer className='w-full bg-slate-50 border-t border-slate-200 mt-12'>
      <div className='max-w-6xl mx-auto px-6 py-10 md:py-12 text-slate-500 text-sm leading-relaxed'>
        <div className="flex flex-col gap-4">
          <p className='font-bold text-slate-700 max-w-3xl'>
            Climate Asset Registry tracks low-carbon actions and carbon-credit
            preparedness. Credit issuance is subject to registry methodologies,
            MRV requirements, and host-country authorization.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <p className="font-medium">ESG actions do not automatically qualify as carbon credits.</p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">© 2026 Climate Asset Foundation</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
