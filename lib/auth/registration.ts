/** Registro público desactivado cuando INVITE_ONLY=true (salvo token de invitación). */
export function isPublicRegistrationEnabled(inviteToken?: string | null): boolean {
  if (process.env.INVITE_ONLY !== "true") return true

  const expected = process.env.REGISTRATION_INVITE_TOKEN?.trim()
  if (!expected) return false

  return Boolean(inviteToken?.trim() && inviteToken.trim() === expected)
}

export function registrationClosedMessage(): string {
  return "El registro público está cerrado. Solicite acceso a su gestoría o use un enlace de invitación."
}
