const ErrorPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-md p-8">
        <h1 className="text-2xl font-semibold text-red-500 mb-4">Error</h1>
        <p className="text-gray-700">There was an error loading this page. Please try again later.</p>
      </div>
    </div>
  )
}

export default ErrorPage
