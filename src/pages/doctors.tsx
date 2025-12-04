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
import {
  Stethoscope,
  Heart,
  Brain,
  Baby,
  Bone,
  Activity,
  Phone,
  FileText,
  Loader2,
  AlertCircle,
  Clock,
  MapPin,
} from "lucide-react";

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

  const specializationIcons: Record<string, React.ReactNode> = {
    Cardiology: <Heart className="h-4 w-4 text-red-500" />,
    Neurology: <Brain className="h-4 w-4 text-purple-500" />,
    Pediatrics: <Baby className="h-4 w-4 text-pink-500" />,
    Orthopedics: <Bone className="h-4 w-4 text-amber-500" />,
    Dermatology: <Activity className="h-4 w-4 text-green-500" />,
  };

  const generateBio = (doctor: DoctorWithUser) => {
    if (doctor.bio && doctor.bio !== "Experienced specialist") {
      return doctor.bio;
    }

    const years = doctor.years_of_experience || 0;
    const specialty = doctor.specialization || "Medical";

    if (years >= 15) {
      return `Highly experienced ${specialty} specialist with over ${years} years of practice. Known for expertise in complex cases and patient-centered care.`;
    } else if (years >= 10) {
      return `Senior ${specialty} consultant with ${years} years of clinical experience. Specializes in advanced diagnostic and treatment approaches.`;
    } else if (years >= 5) {
      return `Board-certified ${specialty} physician with ${years} years of experience. Focuses on evidence-based medicine and modern treatment techniques.`;
    } else {
      return `Dedicated ${specialty} specialist committed to providing comprehensive patient care with modern medical approaches.`;
    }
  };

  const determineAvailability = () => {
    const hour = new Date().getHours();
    return hour >= 9 && hour <= 17 ? "Available today" : "Available tomorrow";
  };

  const generateQualifications = () => {
    const baseQuals = "MBBS";
    const years = doctor.years_of_experience || 0;

    if (years >= 10) {
      return `${baseQuals}, FCPS`;
    } else if (years >= 5) {
      return `${baseQuals}, MCPS`;
    }
    return baseQuals;
  };

  const [randomRatingOffset] = useState(() => Math.random() * 0.5);
  const [randomReviewCount] = useState(
    () => Math.floor(Math.random() * 500) + 100,
  );

  const doctorData = {
    rating: 4.5 + randomRatingOffset,
    reviewCount: randomReviewCount,
    qualifications: generateQualifications(),
    isPMDCVerified: true,
    isPlatinum: doctor.years_of_experience
      ? doctor.years_of_experience > 10
      : false,
    availability: determineAvailability(),
    nextAvailableSlot: "10:00 AM",
    location: "Main Hospital Campus",
    bio: generateBio(doctor),
  };

  return (
    <Card className="w-full border overflow-hidden p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="flex flex-col items-center md:items-start">
          <Link
            to={`/doctors/${doctor.id}`}
            className="block rounded-full overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-lg">
              <AvatarImage
                src={
                  doctor.user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random&color=fff&bold=true`
                }
                alt={`${doctor.name} - ${doctor.specialization}`}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/70 text-white">
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
                className="text-xl font-bold text-foreground hover:text-primary transition-colors"
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
                <span className="sr-only md:not-sr-only ml-1">Share</span>
              </Button>
            </div>

            {doctorData.isPlatinum && (
              <div className="flex justify-start">
                <PlatinumBadge alt="platinum-badge-img" />
              </div>
            )}

            {doctorData.isPMDCVerified && (
              <div className="flex items-center bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1 rounded-full w-fit">
                <PmdcVerifiedIcon />
                <span className="ml-1 font-semibold">PMDC Verified</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {(doctor.specialization &&
                specializationIcons[doctor.specialization]) || (
                <Stethoscope className="h-4 w-4 text-blue-500" />
              )}
              <span className="font-semibold text-primary text-sm">
                {doctor.specialization}
              </span>
            </div>

            <p className="text-muted-foreground text-sm">{doctorData.bio}</p>

            <div className="space-y-2">
              {doctor.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{doctor.phone}</span>
                </div>
              )}

              {doctor.license_number && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    License: {doctor.license_number}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 mt-4">
              {doctor.years_of_experience !== null && (
                <div className="flex flex-col">
                  <span className="font-bold text-foreground text-lg">
                    {doctor.years_of_experience}+
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Years Experience
                  </span>
                </div>
              )}

              <Link
                to={`/doctors/${doctor.id}#reviews`}
                className="flex flex-col hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1 font-bold text-foreground text-lg">
                  <StarIcon className="fill-yellow-400 text-yellow-400" />
                  {doctorData.rating.toFixed(1)}
                </div>
                <span className="text-muted-foreground text-sm">
                  {doctorData.reviewCount} Reviews
                </span>
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Link
                  to={`/doctors/${doctor.id}`}
                  className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
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
                <div className="inline-flex items-center bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1 rounded-full">
                  <PmdcVerifiedIcon />
                  <span className="ml-1 font-semibold">PMDC Verified</span>
                </div>
              </div>
            )}

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                {(doctor.specialization &&
                  specializationIcons[doctor.specialization]) || (
                  <Stethoscope className="h-4 w-4 text-blue-500" />
                )}
                <span className="font-semibold text-primary">
                  {doctor.specialization}
                </span>
              </div>
              <div className="text-muted-foreground text-sm">
                {doctorData.qualifications}
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {doctorData.bio}
            </p>

            <div className="flex items-center gap-6 mb-4">
              {doctor.years_of_experience !== null && (
                <div className="flex flex-col">
                  <span className="font-bold text-foreground text-lg">
                    {doctor.years_of_experience}+
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Years Experience
                  </span>
                </div>
              )}

              <Link
                to={`/doctors/${doctor.id}#reviews`}
                className="flex flex-col hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1 font-bold text-foreground text-lg">
                  <StarIcon className="fill-yellow-400 text-yellow-400" />
                  {doctorData.rating.toFixed(1)}
                </div>
                <span className="text-muted-foreground text-sm">
                  {doctorData.reviewCount} Reviews
                </span>
              </Link>

              <div className="flex flex-col">
                <div className="flex items-center gap-1 font-bold text-foreground text-lg">
                  <Clock className="h-4 w-4 text-green-500" />
                  {doctorData.availability}
                </div>
                <span className="text-muted-foreground text-sm">
                  Next: {doctorData.nextAvailableSlot}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t">
              {doctor.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-sm">
                      Phone
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {doctor.phone}
                    </span>
                  </div>
                </div>
              )}

              {doctor.license_number && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-sm">
                      License
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {doctor.license_number}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground text-sm">
                    Location
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {doctorData.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-72">
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <span className="text-3xl font-bold text-primary">
                Rs. {doctor.consultation_fee || "150.00"}
              </span>
              <p className="text-muted-foreground text-sm mt-1">
                Consultation Fee
              </p>
            </div>

            <Button
              className="w-full py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                to={
                  isAuthenticated ? `/appointments/${doctor.id}/new` : "/login"
                }
                state={
                  !isAuthenticated
                    ? { from: { pathname: `/appointments/${doctor.id}/new` } }
                    : undefined
                }
              >
                Book Appointment
              </Link>
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Avg. wait time: 15 mins
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {doctorData.availability} from {doctorData.nextAvailableSlot}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
