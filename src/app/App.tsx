import React from 'react';
// 1. Notice we are importing the Workspace now, NOT the Dropzone directly!
import { OcrWorkspace } from '../features/ocr/components/OcrWorkspace';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-10">
        
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Textify
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Extract Text Instantly. Zero Servers. Total Privacy.
          </p>
        </div>
        
        {/* Main Workspace - The Brains are now injected here! */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
          <OcrWorkspace />
        </div>

      </div>
    </div>
  );
}

export default App;