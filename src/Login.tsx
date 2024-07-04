import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 这里应该有实际的登录逻辑
    // 现在我们只是模拟登录成功
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Enroll</CardTitle>
          <CardDescription>
            Enroll for bear token in api interaction.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="user">User</Label>
            <Input
              id="user"
              type="text"
              placeholder="Username (default: admin)"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Password (default: adminpw)" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full">
            Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
