export default function AuthCard({ children }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
      {children}
    </div>
  );
}