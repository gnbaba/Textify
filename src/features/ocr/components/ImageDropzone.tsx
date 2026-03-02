
interface Props {
  onFileSelect: (file: File) => void;
}

export default function ImageDropzone({ onFileSelect }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <input type="file" accept="image/*" onChange={handleChange} />
  );
}
