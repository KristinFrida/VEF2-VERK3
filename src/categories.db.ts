import { PrismaClient, Category as PrismaCategory } from '@prisma/client'
import { z } from 'zod'
import xss from 'xss'

const prisma = new PrismaClient()

/**
 * Zod schema fyrir POST (create) á flokk
 */
const CategoryCreateSchema = z.object({
  title: z.string().min(3).max(1024),
})

/**
 * Zod schema fyrir PATCH (update) á flokk
 */
const CategoryUpdateSchema = z.object({
  title: z.string().min(3).max(1024).optional(),
})

/**
 * Týpur sem koma úr Zod schema
 */
export type CategoryCreateType = z.infer<typeof CategoryCreateSchema>
export type CategoryUpdateType = z.infer<typeof CategoryUpdateSchema>

/**
 * Validera gögn áður en flokk er búinn til
 */
export function validateCategoryCreate(data: unknown) {
  return CategoryCreateSchema.safeParse(data)
}

/**
 * Validera gögn áður en flokk er uppfærður
 */
export function validateCategoryUpdate(data: unknown) {
  return CategoryUpdateSchema.safeParse(data)
}

/**
 * Sækja lista af flokkum
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
 * Sækja flokk eftir slug
 */
export async function getCategoryBySlug(
  slug: string
): Promise<PrismaCategory | null> {
  return prisma.category.findUnique({
    where: { slug },
  })
}

/**
 * Búa til nýjan flokk
 */
export async function createCategory(data: CategoryCreateType): Promise<PrismaCategory> {
  const safeTitle = xss(data.title)
  let slug = safeTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  const safeSlug = xss(slug)

  return prisma.category.create({
    data: {
      title: safeTitle,
      slug: safeSlug,
    },
  })
}


/**
 * Uppfæra flokk eftir slug
 */
export async function updateCategory(
  slug: string,
  data: CategoryUpdateType
): Promise<PrismaCategory> {
  let updatedData: Partial<PrismaCategory> = {}

  if (data.title) {
    const safeTitle = xss(data.title)
    let newSlug = safeTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    const safeSlug = xss(newSlug)
    updatedData = {
      title: safeTitle,
      slug: safeSlug,
    }
  }
  if (!data.title) {
    delete updatedData.title
    delete updatedData.slug
  }

  return prisma.category.update({
    where: { slug },
    data: updatedData,
  })
}


/**
 * Eyða flokk eftir slug
 */
export async function deleteCategory(slug: string): Promise<PrismaCategory> {
  return prisma.category.delete({
    where: { slug },
  })
}
