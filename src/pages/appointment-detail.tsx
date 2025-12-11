import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useInitials } from "@/hooks/use-initials";
import { useAuthStore } from "@/stores/auth.store";
import { appointmentService } from "@/services/appointment.service";
import { type BreadcrumbItem, type Appointment } from "@/types";
import { handleApiError } from "@/lib/error-handler";
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  Loader2,
  CheckCircle,
  XCircle,
  User,
  MessageCircle,
  CreditCard,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { startConversation } from "@/services/chat.service";
import { paymentService } from "@/services/payment.service";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo;
  }
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ appointmentId }: { appointmentId: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?appointment_id=${appointmentId}`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-semibold">Complete Payment</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        The doctor has confirmed your appointment. Please complete the payment
        to finalize your booking.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement onReady={() => setIsPaymentElementReady(true)} />
        <Button
          type="submit"
          disabled={!stripe || !isPaymentElementReady || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getInitials = useInitials();
  const { user } = useAuthStore();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState<"default" | "destructive">(
    "default",
  );
  const isDoctor = user?.role === "doctor";

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await appointmentService.getAppointmentById(Number(id));
        setAppointment(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load appointment",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();

    if (!user?.id || !window.Echo) return;

    const channelName = `App.Models.User.${user.id}`;
    const channel = window.Echo.private(channelName);

    const handleRealtimeUpdate = (e: { appointment: Appointment }) => {
      if (e.appointment.id === Number(id)) {
        setAppointment(e.appointment);
      }
    };

    channel.listen(".appointment.status.updated", handleRealtimeUpdate);

    return () => {
      if (window.Echo) {
        channel.stopListening(
          ".appointment.status.updated",
          handleRealtimeUpdate,
        );
        window.Echo.leave(channelName);
      }
    };
  }, [id, user]);

  useEffect(() => {
    const loadPaymentIntent = async () => {
      if (
        !appointment ||
        appointment.status !== "awaiting_payment" ||
        isDoctor ||
        clientSecret
      ) {
        return;
      }

      setLoadingPayment(true);
      try {
        const { clientSecret: secret } =
          await paymentService.createPaymentIntent({
            appointment_id: appointment.id,
          });
        setClientSecret(secret);
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoadingPayment(false);
      }
    };

    loadPaymentIntent();
  }, [appointment, isDoctor, clientSecret]);

  const handleDoctorStatusUpdate = async (
    status: "confirmed" | "cancelled" | "completed",
  ) => {
    if (!id || !appointment) return;

    const setLoadingState =
      status === "completed" ? setCompleting : setCancelling;

    try {
      setLoadingState(true);
      const updatedAppointment =
        await appointmentService.updateAppointmentStatus(Number(id), {
          status,
        });
      setAppointment(updatedAppointment);
    } catch (err) {
      setShowAlert(true);
      setAlertMessage(
        err instanceof Error ? err.message : "Failed to update status",
      );
      setAlertVariant("destructive");
    } finally {
      setLoadingState(false);
    }
  };

  const handleDoctorConfirmAppointment = async () => {
    if (!id || !appointment) return;
    try {
      setConfirming(true);
      const updatedAppointment =
        await appointmentService.doctorConfirmAppointment(Number(id));
      setAppointment(updatedAppointment);
    } catch (err) {
      setShowAlert(true);
      setAlertMessage(
        err instanceof Error
          ? err.message
          : "Failed to confirm appointment by doctor",
      );
      setAlertVariant("destructive");
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = () => handleDoctorStatusUpdate("cancelled");

  const handleStartChat = async () => {
    if (!appointment) return;
    const otherUserId = isDoctor
      ? appointment.patient?.user?.id
      : appointment.doctor?.user?.id;
    if (!otherUserId) return;
    setIsStartingChat(true);
    try {
      const chat = await startConversation(otherUserId);
      if (chat) {
        navigate(`/chats/${chat.uuid}`);
      }
    } catch (err) {
      setShowAlert(true);
      setAlertMessage(
        err instanceof Error ? err.message : "Failed to start chat",
      );
      setAlertVariant("destructive");
    } finally {
      setIsStartingChat(false);
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Dashboard",
      href: "/",
    },
    {
      title: "Appointments",
      href: "/appointments",
    },
    {
      title: `Appointment #${id}`,
      href: `/appointments/${id}`,
    },
  ];

  if (loading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="flex h-full flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (error || !appointment) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-4">
          <p className="text-destructive">{error || "Appointment not found"}</p>
          <Button onClick={() => navigate("/appointments")}>
            Back to Appointments
          </Button>
        </div>
      </AppLayout>
    );
  }

  const displayPerson = isDoctor ? appointment.patient : appointment.doctor;
  const displayName = displayPerson?.user?.name || "Unknown";
  const appointmentDate = new Date(appointment.appointment_date);
  const dateStr = appointmentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
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

  const canConfirm = isDoctor && appointment.status === "pending";
  const canComplete = isDoctor && appointment.status === "confirmed";
  const canCancel =
    appointment.status !== "cancelled" && appointment.status !== "completed";
  const canChat =
    appointment.status === "confirmed" || appointment.status === "completed";

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alertVariant === "destructive" ? "Error" : "Success"}
            </AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlert(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Appointment Details</h1>
            <p className="text-muted-foreground">Appointment #{id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canConfirm && (
              <Button
                onClick={handleDoctorConfirmAppointment}
                disabled={confirming}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm
              </Button>
            )}
            {canComplete && (
              <Button
                onClick={() => handleDoctorStatusUpdate("completed")}
                disabled={completing}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete
              </Button>
            )}
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={cancelling}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md mx-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Cancel Appointment #{id}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel appointment #{id}? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel}>
                      Confirm Cancellation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {!isDoctor &&
                appointment.status === "awaiting_payment" &&
                (loadingPayment ? (
                  <div className="rounded-lg border p-6 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Loading payment...
                    </p>
                  </div>
                ) : clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm appointmentId={appointment.id} />
                  </Elements>
                ) : null)}
              <div className="rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">
                  Appointment Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 border-b pb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback>
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{displayName}</h3>
                      {!isDoctor && appointment.doctor?.specialization && (
                        <p className="text-sm text-muted-foreground">
                          {appointment.doctor.specialization}
                        </p>
                      )}
                      {isDoctor && appointment.patient?.date_of_birth && (
                        <p className="text-sm text-muted-foreground">
                          DOB:{" "}
                          {new Date(
                            appointment.patient.date_of_birth,
                          ).toLocaleDateString()}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[appointment.status as keyof typeof statusColors]}`}
                        >
                          {statusLabels[appointment.status]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex gap-3">
                      <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm text-muted-foreground">
                          {dateStr}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Clock className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p className="text-sm text-muted-foreground">
                          {timeStr}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {appointment.notes && (
                <div className="rounded-lg border p-6">
                  <h2 className="mb-4 text-xl font-semibold">
                    {isDoctor ? "Patient Notes" : "Notes"}
                  </h2>
                  <p className="text-muted-foreground">{appointment.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border p-6">
              <h3 className="mb-4 font-semibold">
                {isDoctor ? "Patient Contact" : "Doctor Contact"}
              </h3>
              <div className="space-y-3 text-sm">
                {displayPerson?.phone && (
                  <div className="flex gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{displayPerson.phone}</span>
                  </div>
                )}
                {displayPerson?.user?.email && (
                  <div className="flex gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{displayPerson.user.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-6">
              <h3 className="mb-4 font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                {canChat && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleStartChat}
                    disabled={isStartingChat}
                  >
                    {isStartingChat ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <MessageCircle className="mr-2 h-4 w-4" />
                    )}
                    Chat with{" "}
                    {isDoctor
                      ? appointment.patient?.user?.name
                      : appointment.doctor?.user?.name}
                  </Button>
                )}
                {!isDoctor && appointment.doctor && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/doctors/${appointment.doctor.id}`}>
                      <User className="mr-2 h-4 w-4" />
                      View Doctor Profile
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/appointments")}
                >
                  Back to Appointments
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
