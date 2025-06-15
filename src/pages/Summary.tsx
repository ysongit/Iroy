

const Summary: React.FC = () => {
  // Mock data for the document and plagiarism summary
  const document = {
    title: "Sample Document",
    date: "Jun 23, 2025, 11:11 PM",
    plagiarismPercentage: 32,
    uniquePercentage: 68,
    confidence: "Medium",
    status: "Review Needed",
    sources: [
      { id: "Source 1", percentage: 17, type: "Exact" },
      { id: "Source 2", percentage: 10, type: "Paraphrased" },
      { id: "Source 3", percentage: 6, type: "Common" },
    ],
    documentContentSnippet: "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum"
  };

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center py-12 px-4 sm:px-6 lg:px-8 font-inter text-white">
      <div className="w-full max-w-3xl bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            {/* AROY Logo - Using a simplified SVG for the 'A' */}
            <svg
              className="w-8 h-8 text-white -ml-1 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fillRule="evenodd" clipRule="evenodd" d="M12 0L0 24H4.5L6.75 18H17.25L19.5 24H24L12 0ZM8 16L12 8L16 16H8Z" fill="currentColor"/>
            </svg>
            <span className="text-xl font-bold">ROY</span>
          </div>
          <div className="px-4 py-2 bg-gray-700 rounded-lg text-sm text-gray-300">
            0x1234...abcd {/* Placeholder user ID */}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Document Title and Date */}
          <div className="border-b border-gray-700 pb-6">
            <h1 className="text-3xl font-bold mb-1">{document.title}</h1>
            <p className="text-gray-400 text-sm">{document.date}</p>
          </div>

          {/* Plagiarism Summary Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Plagiarism Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              {/* Plagiarism Percentage */}
              <div className="col-span-1 md:col-span-1 text-red-500 text-6xl font-extrabold text-center md:text-left">
                {document.plagiarismPercentage}%
              </div>
              {/* Key Metrics */}
              <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-4 text-center md:text-left">
                <div>
                  <p className="text-lg text-gray-300">Unique</p>
                  <p className="text-xl font-bold">{document.uniquePercentage}%</p>
                </div>
                <div>
                  <p className="text-lg text-gray-300">Confidence</p>
                  <p className="text-xl font-bold">{document.confidence}</p>
                </div>
                <div>
                  <p className="text-lg text-gray-300">Status</p>
                  <p className="text-xl font-bold">{document.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sources Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Sources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {document.sources.map((source, index) => (
                <div
                  key={index}
                  className="bg-gray-700 p-4 rounded-lg border border-gray-600 flex flex-col items-start"
                >
                  <p className="text-lg font-bold mb-1">{source.id}: {source.percentage}%</p>
                  <p className="text-sm text-gray-300">{source.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Document Content Snippet */}
          <div className="p-4 bg-gray-700 rounded-lg text-gray-300 text-sm border border-red-500">
            {document.documentContentSnippet}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
