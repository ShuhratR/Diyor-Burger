"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  RESTAURANT_MEDIA_BUCKET,
  restaurantMediaPath,
  validateRestaurantImage,
  describeRestaurantImageUploadError,
  type RestaurantMediaPrefix,
} from "@/lib/media/restaurant-media";
import "./admin-image-input.css";

export function AdminImageInput({
  name = "imageUrl",
  defaultValue = "",
  prefix,
  onUrlChange,
  onUploadingChange,
}: {
  name?: string;
  defaultValue?: string;
  prefix: RestaurantMediaPrefix;
  onUrlChange?: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [state, setState] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");

  async function upload(file: File) {
    const issue = validateRestaurantImage(file);
    if (issue) {
      setError(issue);
      setState("error");
      return;
    }
    const client = createSupabaseBrowserClient();
    if (!client) {
      setError("Supabase не настроен.");
      setState("error");
      return;
    }
    setState("uploading");
    onUploadingChange?.(true);
    setError("");
    try {
      const path = restaurantMediaPath(prefix, file.type, crypto.randomUUID());
      const { error: uploadError } = await client.storage
        .from(RESTAURANT_MEDIA_BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });
      if (uploadError) {
        setError(describeRestaurantImageUploadError(uploadError));
        setState("error");
        return;
      }
      const { data } = client.storage.from(RESTAURANT_MEDIA_BUCKET).getPublicUrl(path);
      setUrl(data.publicUrl);
      onUrlChange?.(data.publicUrl);
      setState("idle");
    } catch (cause) {
      setError(
        describeRestaurantImageUploadError({
          message: cause instanceof Error ? cause.message : "Не удалось связаться с сервером.",
        }),
      );
      setState("error");
    } finally {
      onUploadingChange?.(false);
    }
  }

  return (
    <div className="admin-image-input">
      <input type="hidden" name={name} value={url} />
      <label>
        Изображение
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={state === "uploading"}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            // Allow choosing the exact same file after a failed attempt.
            event.currentTarget.value = "";
            if (file) void upload(file);
          }}
        />
      </label>
      {state === "uploading" && <p aria-live="polite">Загрузка…</p>}
      {error && <p className="admin-image-error" role="alert">{error}</p>}
      {url && (
        <div className="admin-image-preview">
          <img src={url} alt="Предпросмотр изображения" />
          <button type="button" onClick={() => { setUrl(""); onUrlChange?.(""); }}>Убрать</button>
        </div>
      )}
    </div>
  );
}
