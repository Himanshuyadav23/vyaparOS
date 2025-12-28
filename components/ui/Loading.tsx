export default function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-primary-600"></div>
        <p className="mt-4 text-base text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

