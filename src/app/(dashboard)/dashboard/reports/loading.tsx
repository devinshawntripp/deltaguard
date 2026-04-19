export default function Loading() {
  return (
    <div className="grid gap-6 animate-pulse">
      <div className="surface-card p-7">
        <div className="h-8 bg-black/10 dark:bg-white/10 rounded w-48 mb-4" />
        <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-96" />
      </div>
      <div className="surface-card p-7">
        <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-full mb-3" />
        <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-3/4 mb-3" />
        <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-1/2" />
      </div>
    </div>
  );
}
