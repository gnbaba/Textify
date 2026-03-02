
interface Props {
  text: string;
}

export default function TextResultEditor({ text }: Props) {
  return (
    <textarea
      className="w-full h-64 mt-4 p-2 border rounded"
      value={text}
      readOnly
    />
  );
}
