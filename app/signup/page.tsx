"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // In a real app, you would call an API to create the user
      // For this demo, we'll just redirect to the login page
      router.push("/login?registered=true");
    } catch (error) {
      setError("An error occurred during sign up");
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded bg-red-50 p-3 text-red-500 dark:bg-red-900/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium" 
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
