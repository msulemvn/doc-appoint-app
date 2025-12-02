import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Profile settings",
    href: "/settings",
  },
];

const mockUser = {
  name: "John Doe",
  email: "john@example.com",
};

export default function Settings() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Profile information
          </h2>
          <p className="text-sm text-muted-foreground">
            Update your name and email address
          </p>
        </div>

        <form className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              className="mt-1 block w-full"
              defaultValue={mockUser.name}
              name="name"
              required
              autoComplete="name"
              placeholder="Full name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              className="mt-1 block w-full"
              defaultValue={mockUser.email}
              name="email"
              required
              autoComplete="username"
              placeholder="Email address"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button data-test="update-profile-button">Save</Button>
          </div>
        </form>

        <div className="border-t pt-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Update password
            </h2>
            <p className="text-sm text-muted-foreground">
              Ensure your account is using a long, random password to stay
              secure
            </p>
          </div>

          <form className="mt-6 space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="current_password">Current password</Label>
              <Input
                id="current_password"
                type="password"
                name="current_password"
                required
                autoComplete="current-password"
                placeholder="Current password"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                required
                autoComplete="new-password"
                placeholder="New password"
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

            <div className="flex items-center gap-4">
              <Button>Update password</Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
