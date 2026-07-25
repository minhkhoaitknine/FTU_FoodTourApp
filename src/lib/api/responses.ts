import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function validationError(error: ZodError) {
  const firstIssue = error.issues[0];
  return jsonError(firstIssue?.message ?? "Invalid request data.", 422);
}

export function serverError() {
  return jsonError("Unexpected server error.", 500);
}
