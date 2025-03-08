import { PrismaClient, Category as PrismaCategory } from '@prisma/client'
import { z } from 'zod'
import xss from 'xss'

const prisma = new PrismaClient()

/**
 * Zod schemas
 */
const CategoryCreateSchema = z.object({
  title: z.string().min(3).max(1024),
})

const CategoryUpdateSchema = z.object({
  title: z.string().min(3).max(1024).optional(),
})

export type CategoryCreateType = z.infer<typeof CategoryCreateSchema>
export type CategoryUpdateType = z.infer<typeof CategoryUpdateSchema>

/**
 * Fetch a list of categories
 * @param limit 
 * @param offset 
 * @returns 
 */
export async function getCategories(
  limit = 10,
  offset = 0
): Promise<PrismaCategory[]> {
  return prisma.category.findMany({
    skip: offset,
    take: limit,
    orderBy: { id: 'asc' },
  })
}

/**
 * Fetch a category by slug
 * @param slug 
 * @returns 
 */
export async function getCategoryBySlug(
  slug: string
): Promise<PrismaCategory | null> {
  return prisma.category.findUnique({
    where: { slug },
  })
}

/**
 * Validate data for creating a category
 * @param data 
 * @returns 
 */
export function validateCategoryCreate(data: unknown) {
  return CategoryCreateSchema.safeParse(data)
}

/**
 * Create a new category
 * @param data 
 * @returns 
 */
export async function createCategory(
  data: CategoryCreateType
): Promise<PrismaCategory> {
  // Clean title
  const title = xss(data.title)
  // Generate slug
  const slug = title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')

  return prisma.category.create({
    data: {
      title,
      slug,
    },
  })
}

/**
 * Validate data for updating a category
 * @param data 
 * @returns 
 */
export function validateCategoryUpdate(data: unknown) {
  return CategoryUpdateSchema.safeParse(data)
}

/**
 * Update a category
 * @param slug 
 * @param data 
 * @returns 
 */
export async function updateCategory(
  slug: string,
  data: CategoryUpdateType
): Promise<PrismaCategory> {
  let updatedData: Partial<PrismaCategory> = {}

  if (data.title) {
    const safeTitle = xss(data.title)
    const newSlug = safeTitle
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')

    updatedData = {
      title: safeTitle,
      slug: newSlug,
    }
  }

  return prisma.category.update({
    where: { slug },
    data: updatedData,
  })
}

/**
 * Delete a category
 * @param slug 
 * @returns 
 */
export async function deleteCategory(slug: string): Promise<PrismaCategory> {
  return prisma.category.delete({
    where: { slug },
  })
}
