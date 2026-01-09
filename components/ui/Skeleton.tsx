export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-4 animate-pulse">
      <div className="h-48 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded ${
            i === lines - 1 ? "w-5/6" : "w-full"
          }`}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonButton() {
  return (
    <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
  );
}



