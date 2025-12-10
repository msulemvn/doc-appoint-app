import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type BreadcrumbItem } from "@/types";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { type DoctorWithUser, doctorService } from "@/services/doctor.service";
import { Skeleton } from "@/components/ui/skeleton";
import { appointmentService } from "@/services/appointment.service";
import { useInitials } from "@/hooks/use-initials";
import { handleApiError } from "@/lib/error-handler";
import { formatDate } from "@/lib/utils";

export default function NewAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [doctors, setDoctors] = useState<DoctorWithUser[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithUser>();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitials = useInitials();

  useEffect(() => {
    if (id && doctors.length > 0) {
      const doctor = doctors.find((d) => d.id === Number(id));
      if (doctor) {
        setSelectedDoctor(doctor);
      } else {
        navigate("/appointments/new", { replace: true });
      }
    }
  }, [id, doctors, navigate]);

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
      title: "New Appointment",
      href: id ? `/appointments/${id}/new` : "/appointments/new",
    },
  ];

  const availableSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctor || !date || !selectedTime) {
      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentDate = new Date(date);
      const [time, modifier] = selectedTime.split(" ");
      let hours = time.split(":")[0];
      const minutes = time.split(":")[1];

      if (hours === "12") {
        hours = "0";
      }

      if (modifier === "PM") {
        hours = (parseInt(hours, 10) + 12).toString();
      }

      appointmentDate.setHours(parseInt(hours, 10));
      appointmentDate.setMinutes(parseInt(minutes, 10));
      appointmentDate.setSeconds(0);
      appointmentDate.setMilliseconds(0);

      if (appointmentDate < new Date()) {
        setIsSubmitting(false);
        return;
      }

      const formattedDate = formatDate(appointmentDate);

      const appointment = await appointmentService.createAppointment({
        doctor_id: selectedDoctor.id,
        appointment_date: formattedDate,
        notes: reason,
      });

      navigate(`/appointments/${appointment.id}`);
    } catch (_error) {
      handleApiError(_error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const { doctors } = await doctorService.getAvailableDoctors();
        setDoctors(doctors);
      } catch (_error) {
        handleApiError(_error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleDoctorSelect = (doctor: DoctorWithUser) => {
    setSelectedDoctor(doctor);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        <div>
          <h1 className="text-3xl font-bold">Book New Appointment</h1>
          <p className="text-muted-foreground">
            Schedule an appointment with your doctor
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-lg border p-6">
                  <div className="space-y-2">
                    <Label>Select a Doctor</Label>
                    <div className="max-h-60 overflow-y-auto pr-2">
                      {loading ? (
                        <div className="flex w-full items-center gap-4 rounded-lg border p-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-[100px]" />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {doctors.map((doctor) => (
                            <Button
                              key={doctor.id}
                              type="button"
                              variant={
                                selectedDoctor?.id === doctor.id
                                  ? "default"
                                  : "outline"
                              }
                              className="flex items-center gap-4 justify-start h-auto"
                              onClick={() => handleDoctorSelect(doctor)}
                            >
                              <Avatar className="h-12 w-12">
                                {doctor.user?.avatar && (
                                  <AvatarImage
                                    src={doctor.user?.avatar}
                                    alt={doctor.user?.name}
                                  />
                                )}
                                <AvatarFallback>
                                  {getInitials(doctor.user?.name ?? "")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 text-left">
                                <h3 className="font-semibold">
                                  {doctor.user?.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {doctor.specialization}
                                </p>
                              </div>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedDoctor && (
                  <>
                    <div className="rounded-lg border p-6">
                      <h2 className="mb-4 text-xl font-semibold">
                        Select Date & Time
                      </h2>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label>Appointment Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? (
                                  format(date, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                disabled={[
                                  {
                                    before: new Date(
                                      new Date().setDate(
                                        new Date().getDate() + 1,
                                      ),
                                    ),
                                  },
                                ]}
                                fromDate={new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {date && (
                          <div className="space-y-2">
                            <Label>Available Time Slots</Label>
                            <div className="grid grid-cols-3 gap-2">
                              {availableSlots.map((slot) => (
                                <Button
                                  key={slot}
                                  type="button"
                                  variant={
                                    selectedTime === slot
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => setSelectedTime(slot)}
                                  className="justify-start"
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  {slot}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border p-6">
                      <h2 className="mb-4 text-xl font-semibold">
                        Appointment Details
                      </h2>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reason">Reason for Visit</Label>
                          <Input
                            id="reason"
                            placeholder="Brief description of your concern"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/appointments")}
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          !date ||
                          !selectedTime ||
                          !selectedDoctor ||
                          isSubmitting
                        }
                        className="flex-1"
                      >
                        {isSubmitting
                          ? "Booking..."
                          : "Book Appointment"}
                      </Button>
                    </div>
                  </>
                )}
              </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border p-6">
              <h3 className="mb-4 font-semibold">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                {selectedDoctor ? (
                  <div>
                    <p className="text-muted-foreground">Doctor</p>
                    <p className="font-medium">{selectedDoctor.user?.name}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-muted-foreground">Doctor</p>
                    <p className="font-medium text-muted-foreground">
                      Not selected
                    </p>
                  </div>
                )}
                {date && (
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{format(date, "PPP")}</p>
                  </div>
                )}
                {selectedTime && (
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-medium">{selectedTime}</p>
                  </div>
                )}
                <div className="border-t pt-3">
                  <p className="text-muted-foreground">Consultation Fee</p>
                  <p className="text-xl font-bold">
                    $
                    {selectedDoctor
                      ? parseFloat(
                          selectedDoctor?.consultation_fee?.toString() || "0",
                        ).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-6">
              <h3 className="mb-2 font-semibold">Important Notes</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Please arrive 10 minutes early</li>
                <li>• Bring relevant medical records</li>
                <li>• Cancellation allowed up to 24 hours prior</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
