export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="gradient-brand h-9 w-9 rounded-xl" />
          <span className="text-xl font-extrabold tracking-tight">Spendly</span>
        </div>
        {children}
      </div>
    </div>
  );
}
