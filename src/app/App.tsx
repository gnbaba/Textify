import OcrWorkspace from '../features/ocr/components/OcrWorkspace';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Textify OCR</h1>
      <OcrWorkspace />
    </div>
  );
}