interface Props {
  text: string;
}

export default function TextResultEditor({ text }: Props) {
  return (
    <textarea
      className="w-full h-64 mt-4 p-4 border border-[#20251F]/20 bg-[#FFFDF7] text-[#20251F] font-mono-industrial text-xs focus:outline-none focus:border-[#20251F]"
      value={text}
      readOnly
    />
  );
}
