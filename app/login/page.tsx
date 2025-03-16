"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred during sign in");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchParams = useSearchParams();
  const registered = searchParams?.get('registered');
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (registered) {
      setSuccessMessage("Account created successfully! Please sign in.");
    }
  }, [registered]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the chat application
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {successMessage && (
              <div className="rounded bg-green-50 p-3 text-green-600 dark:bg-green-900/20">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="rounded bg-red-50 p-3 text-red-500 dark:bg-red-900/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
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
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
