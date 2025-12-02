import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";

export default function Login() {
  return (
    <AuthLayout
      title="Log in to your account"
      description="Enter your email and password below to log in"
    >
      <form className="flex flex-col gap-6">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              name="email"
              required
              autoFocus
              autoComplete="email"
              placeholder="email@example.com"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <a
                href="/forgot-password"
                className="ml-auto text-sm hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="Password"
            />
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox id="remember" name="remember" />
            <Label htmlFor="remember">Remember me</Label>
          </div>

          <Button type="submit" className="mt-4 w-full">
            Log in
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/register" className="hover:underline">
            Sign up
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}
