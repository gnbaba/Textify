
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button(props: Props) {
  return (
    <button
      {...props}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    />
  );
}
