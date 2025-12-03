import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/layouts/public-layout";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInitials } from "@/hooks/use-initials";
import { useAuthStore } from "@/stores/auth.store";
import { doctorService, type DoctorWithUser } from "@/services/doctor.service";
import { type BreadcrumbItem } from "@/types";
import { Stethoscope, Loader2, AlertCircle } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Doctors",
    href: "/doctors",
  },
];

export default function Doctors() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [doctors, setDoctors] = useState<DoctorWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await doctorService.getAvailableDoctors();

        if (response && Array.isArray(response.doctors)) {
          setDoctors(response.doctors);
        } else if (Array.isArray(response)) {
          setDoctors(response as unknown as DoctorWithUser[]);
        } else {
          setDoctors([]);
          setError("Unexpected response format from server");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load doctors",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const content = (
    <>
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Our Doctors</h1>
        <p className="text-lg text-muted-foreground">
          Browse our qualified healthcare professionals and book an appointment
        </p>
      </div>

      {loading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading doctors...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                Failed to Load Doctors
              </h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && Array.isArray(doctors) && doctors.length === 0 && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <Stethoscope className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                No Doctors Available
              </h3>
              <p className="text-muted-foreground">
                Check back later for available doctors
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && Array.isArray(doctors) && doctors.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </>
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

interface DoctorCardProps {
  doctor: DoctorWithUser;
}

function DoctorCard({ doctor }: DoctorCardProps) {
  const getInitials = useInitials();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={doctor.user?.avatar} alt={doctor.name} />
            <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl">{doctor.name}</CardTitle>
            {doctor.specialization && (
              <CardDescription className="mt-1">
                {doctor.specialization}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {doctor.bio && (
          <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
            {doctor.bio}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {doctor.years_of_experience !== null &&
            doctor.years_of_experience > 0 && (
              <Badge variant="secondary">
                {doctor.years_of_experience} years exp.
              </Badge>
            )}
          {doctor.consultation_fee !== null && (
            <Badge variant="secondary">${doctor.consultation_fee}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link to={`/doctors/${doctor.id}`}>View Profile</Link>
        </Button>
        <Button className="flex-1" asChild>
          <Link to={isAuthenticated ? "/appointments/new" : "/login"}>
            Book Now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
