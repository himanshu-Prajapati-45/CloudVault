export default function Divider() {
  return (
    <div className="flex items-center my-4">
      <div className="flex-1 h-px bg-white/30"></div>
      <span className="px-3 text-sm text-gray-300">OR</span>
      <div className="flex-1 h-px bg-white/30"></div>
    </div>
  );
}