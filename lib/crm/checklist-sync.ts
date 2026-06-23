import { prisma } from "@/lib/prisma/client"

export type ChecklistItem = { id: string; label: string; done: boolean }

export async function getChecklist(customerId: string): Promise<ChecklistItem[]> {
  const profile = await prisma.customerProfile.findUnique({ where: { customerId } })
  return (profile?.checklist as ChecklistItem[] | null) ?? []
}

export async function updateChecklistItem(customerId: string, itemId: string, done: boolean) {
  const profile = await prisma.customerProfile.findUnique({ where: { customerId } })
  if (!profile) return null

  const checklist = (profile.checklist as ChecklistItem[] | null) ?? []
  const updated = checklist.map((c) => (c.id === itemId ? { ...c, done } : c))
  const doneCount = updated.filter((c) => c.done).length

  return prisma.customerProfile.update({
    where: { customerId },
    data: {
      checklist: updated,
      onboardingStep: doneCount,
      onboardingStatus:
        doneCount === updated.length && updated.length > 0
          ? "COMPLETE"
          : doneCount > 0
            ? "IN_PROGRESS"
            : "PENDING",
    },
  })
}

export async function markChecklistDone(customerId: string, itemId: string) {
  return updateChecklistItem(customerId, itemId, true)
}

/** Marca tareas de onboarding relacionadas como hechas. */
export async function completeOnboardingTasks(customerId: string, companyId: string, keyword: string) {
  await prisma.customerTask.updateMany({
    where: {
      customerId,
      companyId,
      status: { not: "DONE" },
      title: { contains: keyword, mode: "insensitive" },
    },
    data: { status: "DONE", completedAt: new Date() },
  })
}
