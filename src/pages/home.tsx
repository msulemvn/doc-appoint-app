import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/layouts/public-layout";
import { Calendar, Users, Clock, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <PublicLayout>
      <section className="container mx-auto flex flex-col items-center gap-8 py-24 md:py-32">
        <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Book Doctor Appointments with Ease
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Connect with qualified healthcare professionals and schedule
            appointments at your convenience. Your health, simplified.
          </p>
          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/doctors">Browse Doctors</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid w-full max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Qualified Doctors</h3>
            <p className="text-center text-sm text-muted-foreground">
              Access to verified healthcare professionals
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Easy Scheduling</h3>
            <p className="text-center text-sm text-muted-foreground">
              Book appointments in just a few clicks
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Flexible Timing</h3>
            <p className="text-center text-sm text-muted-foreground">
              Choose times that work for your schedule
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Instant Confirmation</h3>
            <p className="text-center text-sm text-muted-foreground">
              Get immediate booking confirmations
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
