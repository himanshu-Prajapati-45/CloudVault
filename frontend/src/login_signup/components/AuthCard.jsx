export default function AuthCard({ children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-gray-200/50">
      {children}
    </div>
  );
}