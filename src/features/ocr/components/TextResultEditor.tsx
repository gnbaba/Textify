interface Props {
  text: string;
}

export default function TextResultEditor({ text }: Props) {
  return (
    <textarea
      className="w-full h-64 mt-4 p-4 border-2 border-[#4D694E] bg-[#FFF3D5] text-[#4D694E] font-mono-industrial text-xs focus:outline-none"
      value={text}
      readOnly
    />
  );
}
