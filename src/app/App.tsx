import React from 'react';
import { OcrWorkspace } from '../features/ocr/components/OcrWorkspace';

function App() {
  return (
    <div className="min-h-screen bg-[#FFF3D5]/20 flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-10">
        
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#4D694E] sm:text-5xl">
            Textify
          </h1>
          <p className="mt-4 text-lg text-[#4D694E]/80 font-medium">
            Extract Text Instantly. Organize in the Cloud.
          </p>
        </div>
        
        {/* Main Workspace */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#4D694E]/10">
          <OcrWorkspace />
        </div>

      </div>
    </div>
  );
}

export default App;