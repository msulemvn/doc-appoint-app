import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <AuthLayout
      title="Create an account"
      description="Enter your details below to create your account"
    >
      <form className="flex flex-col gap-6">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              name="name"
              required
              autoFocus
              autoComplete="name"
              placeholder="Full name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="email@example.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              required
              autoComplete="new-password"
              placeholder="Password"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password_confirmation">Confirm password</Label>
            <Input
              id="password_confirmation"
              type="password"
              name="password_confirmation"
              required
              autoComplete="new-password"
              placeholder="Confirm password"
            />
          </div>

          <Button
            type="submit"
            className="mt-2 w-full"
            data-test="register-user-button"
          >
            Create account
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="hover:underline">
            Log in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
