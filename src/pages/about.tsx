import PublicLayout from "@/layouts/public-layout";
import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";

export default function About() {
  return (
    <PublicLayout>
      <section className="container mx-auto py-24">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">About Us</h1>
            <p className="text-lg text-muted-foreground">
              We're dedicated to making healthcare more accessible and
              convenient for everyone.
            </p>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-xl border">
            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="mb-3 text-2xl font-semibold">Our Mission</h2>
              <p className="text-muted-foreground">
                To bridge the gap between patients and healthcare providers by
                offering a seamless, digital-first approach to medical
                appointments. We believe quality healthcare should be accessible
                to all.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-semibold">What We Offer</h2>
              <p className="text-muted-foreground">
                Our platform connects you with verified doctors across various
                specialties. Schedule appointments at your convenience, manage
                your medical records, and receive timely reminders - all in one
                place.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-semibold">Why Choose Us</h2>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Verified and qualified healthcare professionals</li>
                <li>Easy-to-use appointment booking system</li>
                <li>Secure and private patient information</li>
                <li>Flexible scheduling options</li>
                <li>Instant booking confirmations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
