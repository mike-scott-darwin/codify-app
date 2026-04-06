export function InlineCTA() {
  return (
    <section className="py-8 md:py-12">
      <div className="max-w-[600px] mx-auto px-6 md:px-12 text-center">
        <a
          href="/get-started"
          className="inline-flex items-center justify-center gap-2 bg-blue text-black font-semibold text-sm px-8 py-3.5 rounded-lg hover:brightness-110 transition-all w-full sm:w-auto"
        >
          Find My Missing Revenue
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            className="ml-1"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        <p className="text-xs text-dim mt-3">
          Free opportunity scan — results in 15 minutes.
        </p>
      </div>
    </section>
  );
}
