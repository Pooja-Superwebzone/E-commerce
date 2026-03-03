"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";

export default function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { login, signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignup) {
        if (!name || !email || !password) {
          setError("Please fill in all fields");
          return;
        }
        await signup(email, password, name);
      } else {
        if (!email || !password) {
          setError("Please fill in all fields");
          return;
        }
        await login(email, password);
      }
      router.push("/");
    } catch (err) {
      setError(err?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="bg-white rounded-lg shadow p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-gray-600 text-center mb-6">
          {isSignup
            ? "Sign up to start shopping"
            : "Log in to your account"}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {!isSignup && (
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </Link>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
          >
            {isSignup ? "Sign Up" : "Log In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold ml-1"
            >
              {isSignup ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-4">Or continue with</p>
          <div className="flex gap-4">
            <Button variant="secondary" size="md" className="flex-1">
              Google
            </Button>
            <Button variant="secondary" size="md" className="flex-1">
              Facebook
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
