import { PrismaClient, Question as PrismaQuestion } from '@prisma/client'
import { z } from 'zod'
import xss from 'xss'

const prisma = new PrismaClient()

/**
 * Zod schemas
 */
const QuestionCreateSchema = z.object({
  question: z.string().min(3).max(2000),
  answer: z.string().min(3).max(2000),
  categoryId: z.number().optional(),
})

const QuestionUpdateSchema = QuestionCreateSchema.partial()

/**
 * Types
 */
export type QuestionCreateType = z.infer<typeof QuestionCreateSchema>
export type QuestionUpdateType = z.infer<typeof QuestionUpdateSchema>

/**
 * Fetch a list of questions
 * @param limit 
 * @param offset 
 * @returns 
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
 * Fetch a question by id
 * @param id 
 * @returns 
 */
export async function getQuestionById(id: number): Promise<PrismaQuestion | null> {
  return prisma.question.findUnique({
    where: { id },
  })
}

/**
 * Validate data for creating a question
 * @param data 
 * @returns
 */
export function validateQuestionCreate(data: unknown) {
  return QuestionCreateSchema.safeParse(data)
}

/**
 * Create a new question
 * @param data
 * @returns 
 */
export async function createQuestion(
  data: QuestionCreateType
): Promise<PrismaQuestion> {
  const { question, answer, categoryId } = data

  return prisma.question.create({
    data: {
      question: xss(question),
      answer: xss(answer),
      categoryId: categoryId ?? null,
    },
  })
}

/**
 * Validate data for updating a question
 * @param data 
 * @returns 
 */
export function validateQuestionUpdate(data: unknown) {
  return QuestionUpdateSchema.safeParse(data)
}

/**
 * Update a question
 * @param id 
 * @param data 
 * @returns 
 */
export async function updateQuestion(
  id: number,
  data: QuestionUpdateType
): Promise<PrismaQuestion> {
  const updateData: Partial<PrismaQuestion> = {}

  if (data.question) {
    updateData.question = xss(data.question)
  }
  if (data.answer) {
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
 * Delete a question
 * @param id 
 * @returns 
 */
export async function deleteQuestion(id: number): Promise<PrismaQuestion> {
  return prisma.question.delete({
    where: { id },
  })
}
