import { prisma } from "@/lib/prisma/client"
import { createExpenseIssueEntry } from "@/lib/accounting/journal"

export async function approveExpenseDraft(draftId: string, companyId: string) {
  const draft = await prisma.expenseDraft.findFirst({
    where: { id: draftId, companyId, status: "PENDING_REVIEW" },
    include: { document: true },
  })
  if (!draft) return null

  const expense = await prisma.expense.create({
    data: {
      companyId,
      description: draft.description,
      vendor: draft.vendor,
      category: draft.category,
      status: "PENDING",
      issueDate: draft.issueDate,
      subtotal: draft.subtotal,
      taxRate: draft.taxRate,
      taxAmount: draft.taxAmount,
      total: draft.total,
      notes: draft.document ? `Desde documento: ${draft.document.name}` : undefined,
    },
  })

  await createExpenseIssueEntry(expense)

  await prisma.expenseDraft.update({
    where: { id: draftId },
    data: { status: "APPROVED", reviewedAt: new Date(), expenseId: expense.id },
  })

  return expense
}

export async function rejectExpenseDraft(draftId: string, companyId: string) {
  return prisma.expenseDraft.updateMany({
    where: { id: draftId, companyId, status: "PENDING_REVIEW" },
    data: { status: "REJECTED", reviewedAt: new Date() },
  })
}
