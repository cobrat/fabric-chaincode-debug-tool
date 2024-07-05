import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "./AuthContext";
import { ModeToggle } from "./ModeToggle";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [id, setId] = useState("");
  const [secret, setSecret] = useState("");
  const [baseURL, setBaseURL] = useState("http://localhost:8801");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    try {
      await login(id, secret, baseURL);
      const origin = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(origin);
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Login</CardTitle>
              <ModeToggle />
            </div>
            <CardDescription>
              Enter your ID, secret, and API base URL to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="baseURL">API Base URL</Label>
              <Input
                id="baseURL"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="id">ID</Label>
              <Input
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="secret">Secret</Label>
              <Input
                id="secret"
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Sign in"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;