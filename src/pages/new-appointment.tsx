import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useInitials } from "@/hooks/use-initials";
import { type BreadcrumbItem } from "@/types";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";

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
    href: "/appointments/new",
  },
];

export default function NewAppointment() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const getInitials = useInitials();

  const availableSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/appointments");
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
                <h2 className="mb-4 text-xl font-semibold">Select Doctor</h2>
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{getInitials("Doctor Name")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Dr. [Name]</h3>
                    <p className="text-sm text-muted-foreground">
                      [Specialization]
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                  >
                    Change
                  </Button>
                </div>
              </div>

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
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
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
                              selectedTime === slot ? "default" : "outline"
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <textarea
                      id="notes"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      placeholder="Any additional information..."
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
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!date || !selectedTime}
                  className="flex-1"
                >
                  Book Appointment
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border p-6">
              <h3 className="mb-4 font-semibold">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Doctor</p>
                  <p className="font-medium">Dr. [Name]</p>
                </div>
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
                  <p className="text-xl font-bold">[Fee Amount]</p>
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
