// src/questions.db.ts
import { PrismaClient, Question as PrismaQuestion } from '@prisma/client'
import { z } from 'zod'
import xss from 'xss'

const prisma = new PrismaClient()

/**
 * Zod schema fyrir POST (create) á spurningu
 */
const QuestionCreateSchema = z.object({
  question: z.string().min(3).max(2000),
  answer: z.string().min(3).max(2000),
  categoryId: z.number().optional(),
  answers: z
    .array(
      z.object({
        answer: z.string().min(1).max(2000),
        isCorrect: z.boolean().optional().default(false),
      })
    )
    .max(4)
    .optional(),
})

// Use the refined schema to enforce that exactly one answer is correct
const QuestionCreateSchemaWithRefine = QuestionCreateSchema.superRefine((data, ctx) => {
  if (data.answers && data.answers.length > 0) {
    const correctCount = data.answers.filter((a) => a.isCorrect).length
    if (correctCount !== 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'Exactly one answer must be correct',
        path: ['answers'],
      })
    }
  }
})

/**
 * Zod schema fyrir PATCH (update) á spurningu
 */
const QuestionUpdateSchema = QuestionCreateSchema.partial()

export type QuestionCreateType = z.infer<typeof QuestionCreateSchema>
export type QuestionUpdateType = z.infer<typeof QuestionUpdateSchema>

/**
 * Validera gögn áður en spurning er búin til
 */
export function validateQuestionCreate(data: unknown) {
  // Use the refined schema so that our superRefine rules are applied.
  return QuestionCreateSchemaWithRefine.safeParse(data)
}

/**
 * Validera gögn áður en spurning er uppfærð
 */
export function validateQuestionUpdate(data: unknown) {
  return QuestionUpdateSchema.safeParse(data)
}

/**
 * Sækja lista af spurningum
 */
export async function getQuestions(
  limit = 10,
  offset = 0
): Promise<PrismaQuestion[]> {
  return prisma.question.findMany({
    skip: offset,
    take: limit,
    orderBy: { id: 'asc' },
  })
}

/**
 * Sækja allar spurningar sem tilheyra flokki (með categoryId)
 */
export async function getQuestionsByCategoryId(
  categoryId: number,
  limit = 10,
  offset = 0
): Promise<PrismaQuestion[]> {
  return prisma.question.findMany({
    skip: offset,
    take: limit,
    where: { categoryId },
    orderBy: { id: 'asc' },
  })
}

/**
 * Sækja staka spurningu eftir id
 */
export async function getQuestionById(
  id: number
): Promise<PrismaQuestion | null> {
  return prisma.question.findUnique({
    where: { id },
    include: { answers: true },
  })
}

/**
 * Búa til nýja spurningu
 */
export async function createQuestion(
  data: QuestionCreateType
): Promise<PrismaQuestion> {
  // XSS sanitize the question & answer
  const safeQuestion = xss(data.question)
  const safeAnswer = xss(data.answer)
  let answersData: { answer: string; isCorrect: boolean }[] | undefined = undefined

  if (data.answers && data.answers.length > 0) {
    answersData = data.answers.map((a) => ({
      answer: xss(a.answer),
      isCorrect: a.isCorrect === true,
    }))
  }

  return prisma.question.create({
    data: {
      question: safeQuestion,
      answer: safeAnswer, // Possibly remove if you only want to use `answers[]`
      categoryId: data.categoryId ?? null,
      // Create answers in the same transaction
      ...(answersData
        ? {
            answers: {
              create: answersData,
            },
          }
        : {}),
    },
    // Optionally return the newly created question + answers
    include: {
      answers: true,
    },
  })
}

/**
 * Uppfæra spurningu eftir id
 */
export async function updateQuestion(
  id: number,
  data: QuestionUpdateType
): Promise<PrismaQuestion> {
  const updateData: Partial<PrismaQuestion> = {}

  if (typeof data.question !== 'undefined') {
    updateData.question = xss(data.question)
  }
  if (typeof data.answer !== 'undefined') {
    updateData.answer = xss(data.answer)
  }
  if (typeof data.categoryId !== 'undefined') {
    updateData.categoryId = data.categoryId
  }

  return prisma.question.update({
    where: { id },
    data: updateData,
  })
}

/**
 * Eyða spurningu eftir id
 */
export async function deleteQuestion(id: number): Promise<PrismaQuestion> {
  return prisma.question.delete({
    where: { id },
  })
}
