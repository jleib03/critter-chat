const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-md p-8">
        <h1 className="text-2xl font-semibold text-yellow-500 mb-4 header-font">404 - Not Found</h1>
        <p className="text-gray-700 body-font">The requested page could not be found.</p>
      </div>
    </div>
  )
}

export default NotFoundPage
