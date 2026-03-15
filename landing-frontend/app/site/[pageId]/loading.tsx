export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full mx-auto mb-4" />
        <p className="text-sm opacity-70">Loading landing page…</p>
      </div>
    </div>
  );
}
