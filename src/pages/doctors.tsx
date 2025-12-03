import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/layouts/public-layout";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlatinumBadge } from "@/components/ui/platinum-badge";
import { ShareIcon, PmdcVerifiedIcon, StarIcon } from "@/components/icons";
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
        setError(err instanceof Error ? err.message : "Failed to load doctors");
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
        <div className="space-y-6">
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

  const doctorData = {
    ...doctor,
    rating: 4.9,
    reviewCount: 644,
    qualifications: "MBBS, FCPS (Dermatology), D-DERM Ireland",
    specializations: [
      doctor.specialization || "General Physician",
      "Cosmetologist",
    ].filter(Boolean),
    isPMDCVerified: true,
    isPlatinum: Math.random() > 0.5,
    availability: "Available tomorrow",
    consultationFee: doctor.consultation_fee || 2000,
  };

  return (
    <Card className="w-full border overflow-hidden p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="flex flex-col items-center md:items-start">
          <Link
            to={`/doctors/${doctor.id}`}
            className="block rounded-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-2 border-border">
              <AvatarImage
                src={
                  doctor.user?.avatar ||
                  "https://via.placeholder.com/400x400?text=Doctor"
                }
                alt={`${doctor.name} - ${doctor.specialization}`}
              />
              <AvatarFallback className="text-2xl bg-primary/10">
                {getInitials(doctor.name)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>

        <div className="flex-1">
          <div className="md:hidden flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <Link
                to={`/doctors/${doctor.id}`}
                className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {doctor.name}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground"
              >
                <ShareIcon />
                <span className="ml-1">Share</span>
              </Button>
            </div>

            {doctorData.isPlatinum && (
              <div className="flex justify-start">
                <PlatinumBadge alt="platinum-badge-img" />
              </div>
            )}

            {doctorData.isPMDCVerified && (
              <div className="flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full w-fit">
                <PmdcVerifiedIcon />
                <span className="ml-1 font-semibold">PMDC Verified</span>
              </div>
            )}

            <div className="text-muted-foreground">
              <div className="font-medium text-sm mb-1">
                {doctorData.specializations.join(", ")}
              </div>
              <div className="text-sm">{doctorData.qualifications}</div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Link
                  to={`/doctors/${doctor.id}`}
                  className="text-2xl font-semibold text-foreground hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {doctor.name}
                </Link>
                {doctorData.isPlatinum && (
                  <PlatinumBadge alt="platinum-doc-img" />
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <ShareIcon />
                <span className="ml-1">Share</span>
              </Button>
            </div>

            {doctorData.isPMDCVerified && (
              <div className="mb-3">
                <div className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  <PmdcVerifiedIcon />
                  <span className="ml-1 font-semibold">PMDC Verified</span>
                </div>
              </div>
            )}

            <div className="text-muted-foreground mb-3">
              <div className="font-medium mb-1">
                {doctorData.specializations.join(", ")}
              </div>
              <div className="text-sm">{doctorData.qualifications}</div>
            </div>

            {doctor.bio && (
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                {doctor.bio}
              </p>
            )}

            <div className="flex items-center gap-6">
              {doctor.years_of_experience !== null && (
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground text-lg">
                    {doctor.years_of_experience} Years
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Experience
                  </span>
                </div>
              )}

              <Link
                to={`/doctors/${doctor.id}#reviews`}
                className="flex flex-col hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1 font-semibold text-foreground text-lg">
                  <StarIcon />
                  {doctorData.rating}
                </div>
                <span className="text-muted-foreground text-sm">
                  {doctorData.reviewCount} Reviews
                </span>
              </Link>
            </div>
          </div>

          <div className="md:hidden mt-4">
            <div className="flex items-center gap-6">
              {doctor.years_of_experience !== null && (
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground text-lg">
                    {doctor.years_of_experience} Years
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Experience
                  </span>
                </div>
              )}

              <Link
                to={`/doctors/${doctor.id}#reviews`}
                className="flex flex-col hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1 font-semibold text-foreground text-lg">
                  <StarIcon />
                  {doctorData.rating}
                </div>
                <span className="text-muted-foreground text-sm">
                  {doctorData.reviewCount} Reviews
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full md:w-64">
          <div className="flex flex-col">
            <Button
              className="w-full py-6 text-lg font-semibold"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                to={
                  isAuthenticated
                    ? `/appointments/new?doctor=${doctor.id}`
                    : `/login`
                }
              >
                Book Appointment
              </Link>
            </Button>
            {doctorData.consultationFee && (
              <p className="text-center text-muted-foreground text-sm mt-2">
                Consultation Fee: Rs. {doctorData.consultationFee}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
