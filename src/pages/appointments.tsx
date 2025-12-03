import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useInitials } from "@/hooks/use-initials";
import { useAuthStore } from "@/stores/auth.store";
import { appointmentService } from "@/services/appointment.service";
import { type BreadcrumbItem, type Appointment } from "@/types";
import { Calendar, Clock, Plus, Loader2 } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: "/",
  },
  {
    title: "Appointments",
    href: "/appointments",
  },
];

export default function Appointments() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDoctor = user?.role === "doctor";

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await appointmentService.getAppointments();
        setAppointments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isDoctor ? "Patient Appointments" : "My Appointments"}
            </h1>
            <p className="text-muted-foreground">
              {isDoctor
                ? "View and manage patient appointments"
                : "View and manage your appointments"}
            </p>
          </div>
          {!isDoctor && (
            <Button asChild>
              <Link to="/appointments/new">
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Link>
            </Button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && appointments.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-semibold">No appointments found</h3>
              <p className="text-sm text-muted-foreground">
                {isDoctor
                  ? "No patient appointments scheduled yet"
                  : "You haven't scheduled any appointments yet"}
              </p>
            </div>
            {!isDoctor && (
              <Button asChild>
                <Link to="/appointments/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule an Appointment
                </Link>
              </Button>
            )}
          </div>
        )}

        {!loading && !error && appointments.length > 0 && (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isDoctor={isDoctor}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function AppointmentCard({
  appointment,
  isDoctor,
}: {
  appointment: Appointment;
  isDoctor: boolean;
}) {
  const getInitials = useInitials();

  const displayName = isDoctor
    ? appointment.patient?.name || "Unknown Patient"
    : appointment.doctor?.name || "Unknown Doctor";

  const displayInfo = isDoctor
    ? appointment.patient?.email
    : appointment.doctor?.specialization;

  const appointmentDate = new Date(appointment.appointment_date);
  const dateStr = appointmentDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = appointmentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusColors = {
    pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
    confirmed: "border-green-200 bg-green-50 text-green-700",
    cancelled: "border-red-200 bg-red-50 text-red-700",
    completed: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-6 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-16 w-16">
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold">{displayName}</h3>
            {displayInfo && (
              <p className="text-sm text-muted-foreground">{displayInfo}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{timeStr}</span>
            </div>
          </div>
          <div>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[appointment.status]}`}
            >
              {appointment.status}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/appointments/${appointment.id}`}>View Details</Link>
        </Button>
      </div>
    </div>
  );
}
