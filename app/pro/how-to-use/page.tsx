const HowToUsePage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">How to Use Our Platform</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Schedule Setup</h2>
        <div className="flex items-center justify-center">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Schedule Setup
          </button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Preview Your Landing Page</h2>
        <div className="flex items-center justify-center">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Preview Landing Page
          </button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Other Features</h2>
        <p>Explore other features of our platform to maximize your experience.</p>
      </section>
    </div>
  )
}

export default HowToUsePage
