export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-semibold">Page Not Found</h1>
      <p className="text-gray-500 mt-2">
        The page you are looking for does not exist.
      </p>

      <a href="/" className="mt-6 text-blue-500 underline">
        Go back home
      </a>
    </div>
  );
}
