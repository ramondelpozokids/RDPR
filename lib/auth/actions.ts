"use server"

import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { signIn } from "@/lib/auth/config"

export type LoginState = {
  error?: string
  fieldErrors?: {
    email?: string
    password?: string
  }
}

function safeCallbackUrl(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard"
  }
  return value
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl"))

  const fieldErrors: LoginState["fieldErrors"] = {}
  if (!email) fieldErrors.email = "El email es obligatorio"
  else if (!/\S+@\S+\.\S+/.test(email)) fieldErrors.email = "Email inválido"
  if (!password) fieldErrors.password = "La contraseña es obligatoria"
  if (Object.keys(fieldErrors).length) return { fieldErrors }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error || result?.ok === false) {
      return { error: "Email o contraseña incorrectos" }
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email o contraseña incorrectos" }
    }
    throw error
  }

  redirect(callbackUrl)
}
