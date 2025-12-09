import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import PublicLayout from "@/layouts/public-layout";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useInitials } from "@/hooks/use-initials";
import { useAuthStore } from "@/stores/auth.store";
import { doctorService, type DoctorWithUser } from "@/services/doctor.service";
import { type BreadcrumbItem } from "@/types";
import {
  Phone,
  Mail,
  Briefcase,
  DollarSign,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function DoctorDetail() {
  const { id: doctorId } = useParams();
  const getInitials = useInitials();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [doctor, setDoctor] = useState<DoctorWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await doctorService.getDoctorById(Number(doctorId));
        setDoctor(response.doctor);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load doctor details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  if (!doctorId) {
    return <Navigate to="/doctors" replace />;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Doctors",
      href: "/doctors",
    },
    {
      title: doctor?.name || "Doctor Profile",
      href: `/doctors/${doctorId}`,
    },
  ];

  const content = (
    <div className="mx-auto max-w-5xl space-y-8">
      {loading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading doctor details...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                Failed to Load Doctor
              </h3>
              <p className="text-muted-foreground">{error}</p>
              <Button asChild className="mt-4">
                <Link to="/doctors">Back to Doctors</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && doctor && (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={doctor.user?.avatar}
                      alt={doctor.user?.name || doctor.name}
                    />
                    <AvatarFallback className="text-2xl">
                      {getInitials(
                        doctor.user?.name || doctor.name || "Unknown",
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <CardTitle className="text-3xl">
                        {doctor.user?.name || doctor.name}
                      </CardTitle>
                      {doctor.specialization && (
                        <CardDescription className="mt-2 text-lg">
                          {doctor.specialization}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doctor.years_of_experience !== null &&
                        doctor.years_of_experience > 0 && (
                          <Badge variant="secondary">
                            {doctor.years_of_experience} years experience
                          </Badge>
                        )}
                      {doctor.license_number && (
                        <Badge variant="secondary">
                          License: {doctor.license_number}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {doctor.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{doctor.bio}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {doctor.specialization && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Specialization</h3>
                      <p className="text-sm text-muted-foreground">
                        {doctor.specialization}
                      </p>
                    </div>
                  </div>
                )}
                {doctor.years_of_experience !== null &&
                  doctor.years_of_experience > 0 && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <Briefcase className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">Experience</h3>
                          <p className="text-sm text-muted-foreground">
                            {doctor.years_of_experience} years in practice
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                {doctor.license_number && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <FileText className="mt-1 h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">License Number</h3>
                        <p className="text-sm text-muted-foreground">
                          {doctor.license_number}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{doctor.email}</span>
                </div>
                {doctor.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{doctor.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {doctor.consultation_fee !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>Consultation Fee</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-7 w-7 text-primary" />
                    <span className="text-3xl font-bold">
                      {doctor.consultation_fee}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    per consultation
                  </p>
                </CardContent>
              </Card>
            )}

            <Button asChild className="w-full" size="lg">
              <Link
                to={
                  isAuthenticated ? `/appointments/${doctorId}/new` : "/login"
                }
                state={
                  !isAuthenticated
                    ? { from: { pathname: `/appointments/${doctorId}/new` } }
                    : undefined
                }
              >
                Book Appointment
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (isAuthenticated) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="p-6">{content}</div>
      </AppLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="container mx-auto py-12">{content}</section>
    </PublicLayout>
  );
}
