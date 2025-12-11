import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useInitials } from "@/hooks/use-initials";
import { useAuthStore } from "@/stores/auth.store";
import { appointmentService } from "@/services/appointment.service";
import {
  type BreadcrumbItem,
  type Appointment,
  type AppointmentStatus,
} from "@/types";
import { Calendar, Clock, Plus, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo;
  }
}

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
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDoctor = user?.role === "doctor";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const appointmentStatuses: {
    value: AppointmentStatus | "all";
    label: string;
  }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
  ];

  const currentStatus = (searchParams.get("status") || "pending") as
    | AppointmentStatus
    | "all";

  const handleTabChange = (value: string) => {
    if (value === "pending") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", value);
    }
    navigate(`?${searchParams.toString()}`);
  };

  const fetchAllAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getAppointments();
      setAllAppointments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load appointments",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  useEffect(() => {
    if (!user || !window.Echo) return;

    const channelName = `App.Models.User.${user.id}`;
    const channel = window.Echo.private(channelName);

    const handleStatusUpdate = (e: { appointment?: Appointment }) => {
      if (!e.appointment) {
        return;
      }
      setAllAppointments((prev) => {
        const existingIndex = prev.findIndex((a) => a.id === e.appointment!.id);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = e.appointment!;
          return updated;
        }
        return prev;
      });
    };

    const handleAppointmentCreated = (e: { appointment?: Appointment }) => {
      if (!e.appointment) {
        return;
      }
      setAllAppointments((prev) => {
        const exists = prev.some((a) => a.id === e.appointment!.id);
        if (!exists) {
          return [e.appointment!, ...prev];
        }
        return prev;
      });
    };

    channel
      .listen(".appointment.status.updated", handleStatusUpdate)
      .listen(".appointment.created", handleAppointmentCreated);

    return () => {
      if (window.Echo) {
        channel
          .stopListening(".appointment.status.updated", handleStatusUpdate)
          .stopListening(".appointment.created", handleAppointmentCreated);
        window.Echo.leave(channelName);
      }
    };
  }, [user]);

  const filteredAppointments = allAppointments.filter((appointment) => {
    if (currentStatus === "all") return true;
    if (currentStatus === "pending") {
      return (
        appointment.status === "pending" ||
        appointment.status === "awaiting_payment"
      );
    }
    return appointment.status === currentStatus;
  });

  const counts = appointmentStatuses.reduce(
    (acc, status) => {
      if (status.value === "all") {
        acc[status.value] = allAppointments.length;
      } else if (status.value === "pending") {
        acc[status.value] = allAppointments.filter(
          (a) => a.status === "pending" || a.status === "awaiting_payment",
        ).length;
      } else {
        acc[status.value] = allAppointments.filter(
          (a) => a.status === status.value,
        ).length;
      }
      return acc;
    },
    {} as Record<AppointmentStatus | "all", number>,
  );

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

        <Tabs value={currentStatus} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            {appointmentStatuses.map((status) => (
              <TabsTrigger key={status.value} value={status.value}>
                {status.label}
                <Badge className="ml-2 bg-muted text-foreground hover:bg-muted">
                  {counts[status.value]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {appointmentStatuses.map((status) => (
            <TabsContent key={status.value} value={status.value}>
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

              {!loading && !error && filteredAppointments.length === 0 && (
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

              {!loading && !error && filteredAppointments.length > 0 && (
                <div className="grid gap-4">
                  {filteredAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      isDoctor={isDoctor}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
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
    ? appointment.patient?.user?.name || "Unknown Patient"
    : appointment.doctor?.user?.name || "Unknown Doctor";

  const displayInfo = isDoctor
    ? appointment.patient?.user?.email
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

  const statusColors: Record<string, string> = {
    pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
    confirmed: "border-green-200 bg-green-50 text-green-700",
    cancelled: "border-red-200 bg-red-50 text-red-700",
    completed: "border-blue-200 bg-blue-50 text-blue-700",
    awaiting_payment: "border-purple-200 bg-purple-50 text-purple-700",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
    awaiting_payment: "Awaiting Payment",
  };

  return (
    <Link
      to={`/appointments/${appointment.id}`}
      className="flex flex-col gap-4 rounded-lg border p-6 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between cursor-pointer"
    >
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
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[appointment.status] || "border-gray-200 bg-gray-50 text-gray-700"}`}
            >
              {statusLabels[appointment.status]}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
