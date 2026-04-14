export function SkeletonCard() {
  return (
    <div className="skeleton-card flex flex-col">
      <div className="skeleton h-52 rounded-t-[2.5rem]" />
      <div className="p-6 space-y-3">
        <div className="skeleton skeleton-text w-1/3" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text w-full" />
        <div className="skeleton skeleton-text w-2/3" />
        <div className="flex justify-between items-center mt-4">
          <div className="skeleton skeleton-text w-16" />
          <div className="skeleton w-9 h-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
