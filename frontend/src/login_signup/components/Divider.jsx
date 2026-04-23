export default function Divider() {
  return (
    <div className="flex items-center my-4">
      <div className="flex-1 h-px bg-gray-200"></div>
      <span className="px-3 text-sm text-gray-400">OR</span>
      <div className="flex-1 h-px bg-gray-200"></div>
    </div>
  );
}