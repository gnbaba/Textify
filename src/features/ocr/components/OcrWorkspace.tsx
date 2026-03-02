import { ImageDropzone } from './ImageDropzone';
import TextResultEditor from './TextResultEditor';
import { useOcrProcessor } from '../hooks/useOcrProcessor';

export default function OcrWorkspace() {
  const { status, text, process } = useOcrProcessor();

  return (
    <div className="bg-white p-4 rounded shadow">
      <ImageDropzone onImageCaptured={process} />
      {status === 'loading' && <p>Processing...</p>}
      {status === 'error' && <p className="text-red-500">Error occurred.</p>}
      {status === 'success' && <TextResultEditor text={text} />}
    </div>
  );
}
