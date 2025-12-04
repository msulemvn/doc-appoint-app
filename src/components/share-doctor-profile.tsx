import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShareIcon } from "@/components/icons";
import { Check, Copy } from "lucide-react";

interface ShareDoctorProfileProps {
  doctorName: string;
  doctorProfileLink: string;
}

export function ShareDoctorProfile({
  doctorName,
  doctorProfileLink,
}: ShareDoctorProfileProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(doctorProfileLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset "Copied!" message after 2 seconds
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground"
        >
          <ShareIcon className="h-4 w-4" />
          <span className="sr-only md:not-sr-only ml-1">Share</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Share {doctorName}'s Profile</AlertDialogTitle>
          <AlertDialogDescription>
            Copy the link below to share this doctor's profile.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="doctor-link" className="sr-only">
              Doctor Profile Link
            </Label>
            <Input id="doctor-link" defaultValue={doctorProfileLink} readOnly />
          </div>
          <Button type="submit" onClick={copyLink} size="sm" className="px-3">
            {copied ? (
              <span className="flex items-center">
                <Check className="mr-1 h-4 w-4" /> Copied!
              </span>
            ) : (
              <span className="flex items-center">
                <Copy className="mr-1 h-4 w-4" /> Copy Link
              </span>
            )}
          </Button>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
