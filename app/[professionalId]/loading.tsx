const LoadingPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-md p-8">
        <h1 className="text-2xl font-semibold text-blue-500 mb-4">Loading...</h1>
        <p className="text-gray-700">Please wait while we load this page.</p>
      </div>
    </div>
  )
}

export default LoadingPage
