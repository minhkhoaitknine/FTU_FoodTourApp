"use client";

import { ChangeEvent, FormEvent, PointerEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, ImagePlus, Trash2, X, ZoomIn } from "lucide-react";

import { UserAvatar } from "@/components/common/user-avatar";
import { Button, Input } from "@/components/ui";
import type { SafeUser } from "@/lib/auth/users";

const MAX_AVATAR_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_AVATAR_DATA_URL_LENGTH = 1000000;
const AVATAR_DIMENSION = 512;
const AVATAR_CROP_VIEWPORT_SIZE = 320;
const AVATAR_SOURCE_MAX_DIMENSION = 1400;

type ProfileFormProps = {
  user: SafeUser;
};

type Status = {
  tone: "info" | "success" | "error";
  text: string;
};

type CropEditor = {
  src: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  naturalWidth: number;
  naturalHeight: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
};

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cropFrameRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl);
  const [cropEditor, setCropEditor] = useState<CropEditor | null>(null);
  const [cropFrameSize, setCropFrameSize] = useState(AVATAR_CROP_VIEWPORT_SIZE);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [status, setStatus] = useState<Status>({ tone: "info", text: "Profile ready." });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (!cropEditor || !cropFrameRef.current) return;

    const element = cropFrameRef.current;
    const updateSize = () => setCropFrameSize(Math.max(240, Math.round(element.clientWidth || AVATAR_CROP_VIEWPORT_SIZE)));

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [cropEditor]);

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingProfile(true);
    setStatus({ tone: "info", text: "Saving profile..." });

    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") ?? ""),
      email: String(form.get("email") ?? ""),
      avatarUrl
    };

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !result?.ok) {
        setStatus({ tone: "error", text: result?.error ?? "Cannot save profile." });
        return;
      }

      setStatus({ tone: "success", text: "Profile updated." });
      router.refresh();
    } catch {
      setStatus({ tone: "error", text: "Network error while saving profile." });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setStatus({ tone: "error", text: "New password confirmation does not match." });
      return;
    }

    setIsSavingPassword(true);
    setStatus({ tone: "info", text: "Changing password..." });

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !result?.ok) {
        setStatus({ tone: "error", text: result?.error ?? "Cannot change password." });
        return;
      }

      formElement.reset();
      setStatus({ tone: "success", text: "Password changed." });
    } catch {
      setStatus({ tone: "error", text: "Network error while changing password." });
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    try {
      setStatus({ tone: "info", text: "Opening avatar editor..." });
      const src = await prepareAvatarSource(file);
      await openAvatarEditor(src);
      setStatus({ tone: "info", text: "Adjust the circle crop, then apply it." });
    } catch (error) {
      setStatus({ tone: "error", text: error instanceof Error ? error.message : "Cannot process avatar." });
    }
  }

  async function openAvatarEditor(src: string | null = avatarUrl) {
    if (!src) {
      fileInputRef.current?.click();
      return;
    }

    try {
      const image = await loadImage(src);
      setCropEditor({
        src,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight
      });
    } catch {
      setStatus({ tone: "error", text: "Cannot open this avatar image." });
    }
  }

  function closeAvatarEditor() {
    dragRef.current = null;
    setIsDraggingCrop(false);
    setCropEditor(null);
  }

  async function applyCroppedAvatar() {
    if (!cropEditor) return;

    try {
      const croppedAvatar = await cropAvatar(cropEditor, cropFrameSize);
      setAvatarUrl(croppedAvatar);
      setCropEditor(null);
      setStatus({ tone: "success", text: "Avatar crop is ready. Save profile to apply it." });
    } catch (error) {
      setStatus({ tone: "error", text: error instanceof Error ? error.message : "Cannot crop avatar." });
    }
  }

  function updateCropZoom(value: number) {
    setCropEditor((current) => {
      if (!current) return current;

      const zoom = clamp(value, 1, 3);
      const offsets = clampCropOffset(current, current.offsetX, current.offsetY, zoom, cropFrameSize);
      return { ...current, zoom, ...offsets };
    });
  }

  function moveCropBy(deltaX: number, deltaY: number) {
    setCropEditor((current) => {
      if (!current) return current;

      const offsets = clampCropOffset(current, current.offsetX + deltaX, current.offsetY + deltaY, current.zoom, cropFrameSize);
      return { ...current, ...offsets };
    });
  }

  function startCropDrag(event: PointerEvent<HTMLDivElement>) {
    if (!cropEditor) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: cropEditor.offsetX,
      offsetY: cropEditor.offsetY
    };
    setIsDraggingCrop(true);
  }

  function dragCrop(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setCropEditor((current) => {
      if (!current) return current;

      const offsets = clampCropOffset(
        current,
        drag.offsetX + event.clientX - drag.startX,
        drag.offsetY + event.clientY - drag.startY,
        current.zoom,
        cropFrameSize
      );
      return { ...current, ...offsets };
    });
  }

  function stopCropDrag(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      setIsDraggingCrop(false);
    }
  }

  const cropMetrics = cropEditor ? getCropMetrics(cropEditor, cropFrameSize) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.92fr]">
      <section className="rounded-[28px] bg-surface-elevated/[0.65] p-5 shadow-panel backdrop-blur">
        <form className="space-y-5" onSubmit={submitProfile}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              aria-label={avatarUrl ? "Open avatar editor" : "Upload avatar"}
              className="group relative w-fit rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25"
              onClick={() => void openAvatarEditor()}
              type="button"
            >
              <UserAvatar name={user.fullName} size="xl" src={avatarUrl} />
              <span className="absolute inset-0 grid place-items-center rounded-full bg-black/0 text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100 group-focus-visible:bg-black/35 group-focus-visible:opacity-100">
                <Camera aria-hidden="true" size={24} />
              </span>
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold uppercase text-brand-strong">Profile photo</p>
              <p className="mt-1 text-sm leading-6 text-content-muted">
                Upload an image, then drag and zoom the circle crop before saving it as your avatar.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-app bg-brand px-4 text-sm font-semibold text-content-inverse transition hover:bg-brand-strong">
                  <ImagePlus aria-hidden="true" size={17} />
                  Upload avatar
                  <input
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleAvatarFileChange}
                    type="file"
                  />
                </label>
                {avatarUrl ? (
                  <Button onClick={() => void openAvatarEditor()} type="button" variant="outline">
                    <Camera aria-hidden="true" size={17} />
                    Edit crop
                  </Button>
                ) : null}
                <Button
                  onClick={() => {
                    setAvatarUrl(null);
                  }}
                  type="button"
                  variant="outline"
                >
                  <Trash2 aria-hidden="true" size={17} />
                  Use default
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-content">Full name</span>
              <Input autoComplete="name" className="mt-2" name="fullName" required defaultValue={user.fullName} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-content">Email</span>
              <Input autoComplete="email" className="mt-2" name="email" required type="email" defaultValue={user.email} />
            </label>
          </div>

          <Button isLoading={isSavingProfile} loadingLabel="Saving profile" type="submit">
            Save profile
          </Button>
        </form>
      </section>

      <section className="rounded-[28px] bg-surface-elevated/[0.65] p-5 shadow-panel backdrop-blur">
        <form className="space-y-4" onSubmit={submitPassword}>
          <div>
            <p className="text-sm font-semibold uppercase text-brand-strong">Security</p>
            <h2 className="mt-1 text-section-title text-content">Change password</h2>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-content">Current password</span>
            <Input autoComplete="current-password" className="mt-2" name="currentPassword" required type="password" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-content">New password</span>
            <Input autoComplete="new-password" className="mt-2" minLength={8} name="newPassword" required type="password" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-content">Confirm new password</span>
            <Input autoComplete="new-password" className="mt-2" minLength={8} name="confirmPassword" required type="password" />
          </label>
          <Button isLoading={isSavingPassword} loadingLabel="Changing password" type="submit" variant="secondary">
            Change password
          </Button>
        </form>
      </section>

      <div
        className={`rounded-app px-4 py-3 text-sm font-semibold lg:col-span-2 ${
          status.tone === "error"
            ? "bg-danger-soft text-danger"
            : status.tone === "success"
              ? "bg-success-soft text-success"
              : "bg-surface-muted text-content-muted"
        }`}
        role={status.tone === "error" ? "alert" : "status"}
      >
        {status.text}
      </div>

      {cropEditor ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6 backdrop-blur-sm"
          role="dialog"
        >
          <div className="w-full max-w-[560px] rounded-[28px] bg-surface-elevated p-4 shadow-panel sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase text-brand-strong">Profile photo</p>
                <h2 className="mt-1 text-section-title text-content">Adjust visible area</h2>
              </div>
              <Button aria-label="Close avatar editor" onClick={closeAvatarEditor} size="icon" type="button" variant="ghost">
                <X aria-hidden="true" size={18} />
              </Button>
            </div>

            <div
              ref={cropFrameRef}
              className={`relative mx-auto mt-5 aspect-square w-full max-w-80 touch-none overflow-hidden rounded-[24px] bg-surface-muted ${
                isDraggingCrop ? "cursor-grabbing" : "cursor-grab"
              }`}
              onPointerCancel={stopCropDrag}
              onPointerDown={startCropDrag}
              onPointerMove={dragCrop}
              onPointerUp={stopCropDrag}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Avatar crop source"
                className="absolute select-none"
                draggable={false}
                src={cropEditor.src}
                style={
                  cropMetrics
                    ? {
                        height: cropMetrics.drawHeight,
                        left: cropMetrics.drawLeft,
                        top: cropMetrics.drawTop,
                        width: cropMetrics.drawWidth
                      }
                    : undefined
                }
              />
              <div className="pointer-events-none absolute inset-0 bg-black/30 [clip-path:polygon(0_0,100%_0,100%_100%,0_100%,0_0)]" />
              <div className="pointer-events-none absolute inset-0 rounded-full border-4 border-white shadow-[0_0_0_999px_rgba(0,0,0,0.36)]" />
            </div>

            <div className="mt-5 space-y-3">
              <label className="flex items-center gap-3 text-sm font-semibold text-content">
                <ZoomIn aria-hidden="true" className="shrink-0 text-brand-strong" size={18} />
                <input
                  aria-label="Avatar zoom"
                  className="h-2 min-w-0 flex-1 cursor-pointer accent-brand"
                  max="3"
                  min="1"
                  onChange={(event) => updateCropZoom(Number(event.currentTarget.value))}
                  step="0.01"
                  type="range"
                  value={cropEditor.zoom}
                />
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Button onClick={() => moveCropBy(0, -12)} type="button" variant="outline">
                  Up
                </Button>
                <Button onClick={() => moveCropBy(0, 12)} type="button" variant="outline">
                  Down
                </Button>
                <Button onClick={() => moveCropBy(-12, 0)} type="button" variant="outline">
                  Left
                </Button>
                <Button onClick={() => moveCropBy(12, 0)} type="button" variant="outline">
                  Right
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button onClick={() => fileInputRef.current?.click()} type="button" variant="outline">
                <ImagePlus aria-hidden="true" size={17} />
                Choose another
              </Button>
              <Button onClick={() => void applyCroppedAvatar()} type="button">
                <Check aria-hidden="true" size={17} />
                Apply crop
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

async function prepareAvatarSource(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a JPG, PNG or WebP image file.");
  }

  if (file.size > MAX_AVATAR_UPLOAD_BYTES) {
    throw new Error("Avatar file is too large. Please choose an image under 4 MB.");
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const scale = Math.min(1, AVATAR_SOURCE_MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot process this avatar in the browser.");

  context.fillStyle = "#fff7e6";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  for (const quality of [0.84, 0.7, 0.56]) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= MAX_AVATAR_DATA_URL_LENGTH) return dataUrl;
  }

  throw new Error("Avatar source is too large after compression. Please choose a smaller image.");
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Cannot read this image file."));
    reader.readAsDataURL(file);
  });
}

async function loadImage(src: string) {
  const image = new window.Image();
  image.decoding = "async";
  image.src = src;

  try {
    await image.decode();
  } catch {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Cannot read this image file."));
    });
  }

  return image;
}

async function cropAvatar(editor: CropEditor, viewportSize: number) {
  const image = await loadImage(editor.src);
  const metrics = getCropMetrics(editor, viewportSize);
  const scale = metrics.drawWidth / editor.naturalWidth;
  const sourceX = (0 - metrics.drawLeft) / scale;
  const sourceY = (0 - metrics.drawTop) / scale;
  const sourceSize = viewportSize / scale;
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_DIMENSION;
  canvas.height = AVATAR_DIMENSION;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot process this avatar in the browser.");

  context.fillStyle = "#fff7e6";
  context.fillRect(0, 0, AVATAR_DIMENSION, AVATAR_DIMENSION);
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, AVATAR_DIMENSION, AVATAR_DIMENSION);

  let dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  if (dataUrl.length > MAX_AVATAR_DATA_URL_LENGTH) {
    dataUrl = canvas.toDataURL("image/jpeg", 0.68);
  }
  if (dataUrl.length > MAX_AVATAR_DATA_URL_LENGTH) {
    throw new Error("Avatar is still too large after compression. Please choose a smaller image.");
  }

  return dataUrl;
}

function getCropMetrics(editor: CropEditor, viewportSize: number) {
  const baseScale = viewportSize / Math.min(editor.naturalWidth, editor.naturalHeight);
  const scale = baseScale * editor.zoom;
  const drawWidth = editor.naturalWidth * scale;
  const drawHeight = editor.naturalHeight * scale;

  return {
    drawHeight,
    drawLeft: viewportSize / 2 - drawWidth / 2 + editor.offsetX,
    drawTop: viewportSize / 2 - drawHeight / 2 + editor.offsetY,
    drawWidth
  };
}

function clampCropOffset(editor: CropEditor, offsetX: number, offsetY: number, zoom: number, viewportSize: number) {
  const metrics = getCropMetrics({ ...editor, zoom, offsetX: 0, offsetY: 0 }, viewportSize);
  const maxOffsetX = Math.max(0, (metrics.drawWidth - viewportSize) / 2);
  const maxOffsetY = Math.max(0, (metrics.drawHeight - viewportSize) / 2);

  return {
    offsetX: clamp(offsetX, -maxOffsetX, maxOffsetX),
    offsetY: clamp(offsetY, -maxOffsetY, maxOffsetY)
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
