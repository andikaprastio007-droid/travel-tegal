import { LoginForm } from "./LoginForm";
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">Admin Login</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Masuk untuk mengelola booking</p>
        <LoginForm />
      </div>
    </div>
  );
}
