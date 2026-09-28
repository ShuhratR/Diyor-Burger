"use client";

import { useRef, useState } from "react";
import { useFeedback } from "@/features/feedback/feedback-provider";

type SaveOptions<T> = {
  action: (formData: FormData) => Promise<T>;
  onSuccess?: (result: T, formData: FormData) => void | Promise<void>;
  successTitle: string;
  errorTitle: string;
};

/** Close editors only after the server action resolves successfully. */
export function useAdminSave<T>({
  action,
  onSuccess,
  successTitle,
  errorTitle,
}: SaveOptions<T>) {
  const feedback = useFeedback();
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const [error, setError] = useState("");

  const submit = async (formData: FormData) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      const result = await action(formData);
      await onSuccess?.(result, formData);
      feedback.notify(successTitle);
    } catch {
      const message = "Проверьте поля и повторите попытку. Редактор оставлен открытым.";
      setError(message);
      feedback.notify(errorTitle, message);
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  };

  return { submit, pending, error };
}
