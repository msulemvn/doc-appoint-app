import { Paperclip, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { UseFormReturn } from "react-hook-form";

interface MessageFormData {
  message: string;
  file?: FileList;
}

interface MessageInputProps {
  form: UseFormReturn<MessageFormData>;
  onSubmit: (values: MessageFormData) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function MessageInput({
  form,
  onSubmit,
  isLoading,
  disabled = false,
}: MessageInputProps) {
  const selectedFile = form.watch("file");

  return (
    <form
      className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Input
        id="message"
        placeholder={disabled ? "Chat is closed" : "Type your message here..."}
        className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
        {...form.register("message")}
        disabled={disabled}
      />
      <div className="flex items-center p-3 pt-0">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => document.getElementById("file")?.click()}
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
          <span className="sr-only">Attach file</span>
        </Button>
        {selectedFile?.[0] && (
          <span className="text-sm text-muted-foreground mr-2">
            {selectedFile[0].name}
          </span>
        )}
        <Input
          type="file"
          id="file"
          className="hidden"
          {...form.register("file")}
          disabled={disabled}
        />
        <Button
          type="submit"
          size="sm"
          className="ml-auto gap-1.5"
          disabled={disabled || isLoading}
        >
          {isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-r-2 border-white" />
          )}
          Send Message
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
