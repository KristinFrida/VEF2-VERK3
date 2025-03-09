import { Hono, Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { cors } from 'hono/cors'

import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  validateCategoryCreate,
  validateCategoryUpdate,
} from './categories.db'

import {
  getQuestions,
  getQuestionsByCategoryId,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  validateQuestionCreate,
  validateQuestionUpdate,
} from './questions.db'

export const app = new Hono()

app.use('/*', cors())

function errorResponse(c: Context, message: string, code = 500, error?: any) {
  console.error(message)
  if (error) console.error(error)
  return c.json({ error: message }, { status: code as ContentfulStatusCode })
}

app.get('/', (c) => c.json({ message: 'Hello from Hono!' }))

app.get('/categories', async (c) => {
  try {
    const { limit = '10', offset = '0' } = c.req.query()
    const categories = await getCategories(Number(limit), Number(offset))
    return c.json(categories, 200)
  } catch (err) {
    return errorResponse(c, 'Error fetching categories', 500, err)
  }
})

app.get('/categories/:slug', async (c) => {
  try {
    const { slug } = c.req.param()
    const category = await getCategoryBySlug(slug)
    if (!category) return errorResponse(c, 'Category not found', 404)
    return c.json(category, 200)
  } catch (err) {
    return errorResponse(c, 'Error fetching category', 500, err)
  }
})

app.post('/category', async (c) => {
  try {
    const body = await c.req.json().catch(() => {
      throw new Error('Invalid JSON')
    })
    const parsed = validateCategoryCreate(body)
    if (!parsed.success) {
      return c.json({ error: 'Invalid data', details: parsed.error.flatten() }, 400)
    }
    const category = await createCategory(parsed.data)
    return c.json(category, 201)
  } catch (err) {
    return errorResponse(c, 'Error creating category', 500, err)
  }
})

app.patch('/categories/:slug', async (c) => {
  const { slug } = c.req.param()
  try {
    const body = await c.req.json().catch(() => {
      throw new Error('Invalid JSON')
    })
    const parsed = validateCategoryUpdate(body)
    if (!parsed.success) {
      return c.json({ error: 'Invalid data', details: parsed.error.flatten() }, 400)
    }
    const updatedCategory = await updateCategory(slug, parsed.data)
    return c.json(updatedCategory, 200)
  } catch (err: any) {
    if (err?.code === 'P2025') return errorResponse(c, 'Category not found', 404)
    return errorResponse(c, 'Error updating category', 500, err)
  }
})

app.delete('/categories/:slug', async (c) => {
  const { slug } = c.req.param()
  try {
    await deleteCategory(slug)
    return c.body(null, 204)
  } catch (err: any) {
    if (err?.code === 'P2025') return errorResponse(c, 'Category not found', 404)
    return errorResponse(c, 'Error deleting category', 500, err)
  }
})

app.get('/questions', async (c) => {
  try {
    const { limit = '10', offset = '0' } = c.req.query()
    const questions = await getQuestions(Number(limit), Number(offset))
    return c.json(questions, 200)
  } catch (err) {
    return errorResponse(c, 'Error fetching questions', 500, err)
  }
})

app.get('/categories/:slug/questions', async (c) => {
  const { slug } = c.req.param()
  const { limit = '10', offset = '0' } = c.req.query()
  try {
    const category = await getCategoryBySlug(slug)
    if (!category) return errorResponse(c, 'Category not found', 404)
    const questions = await getQuestionsByCategoryId(category.id, Number(limit), Number(offset))
    return c.json(questions, 200)
  } catch (err) {
    return errorResponse(c, 'Error fetching questions for category', 500, err)
  }
})

app.get('/questions/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) return errorResponse(c, 'Invalid ID', 400)
  try {
    const question = await getQuestionById(id)
    if (!question) return errorResponse(c, 'Question not found', 404)
    return c.json(question, 200)
  } catch (err) {
    return errorResponse(c, 'Error fetching question', 500, err)
  }
})

app.post('/questions', async (c) => {
  try {
    const body = await c.req.json().catch(() => {
      throw new Error('Invalid JSON')
    })
    const parsed = validateQuestionCreate(body)
    if (!parsed.success) {
      return c.json({ error: 'Invalid data', details: parsed.error.flatten() }, 400)
    }
    const newQuestion = await createQuestion(parsed.data)
    return c.json(newQuestion, 201)
  } catch (err) {
    return errorResponse(c, 'Error creating question', 500, err)
  }
})

app.post('/categories/:slug/questions', async (c) => {
  const { slug } = c.req.param()
  try {
    const category = await getCategoryBySlug(slug)
    if (!category) return errorResponse(c, 'Category not found', 404)

    const body = await c.req.json().catch(() => {
      throw new Error('Invalid JSON')
    })
    const parsed = validateQuestionCreate(body)
    if (!parsed.success) {
      return c.json({ error: 'Invalid data', details: parsed.error.flatten() }, 400)
    }
    const newQuestion = await createQuestion({
      ...parsed.data,
      categoryId: category.id,
    })
    return c.json(newQuestion, 201)
  } catch (err) {
    return errorResponse(c, 'Error creating question in category', 500, err)
  }
})

app.patch('/questions/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) return errorResponse(c, 'Invalid ID', 400)
  try {
    const body = await c.req.json().catch(() => {
      throw new Error('Invalid JSON')
    })
    const parsed = validateQuestionUpdate(body)
    if (!parsed.success) {
      return c.json({ error: 'Invalid data', details: parsed.error.flatten() }, 400)
    }
    const updatedQuestion = await updateQuestion(id, parsed.data)
    return c.json(updatedQuestion, 200)
  } catch (err: any) {
    if (err?.code === 'P2025') return errorResponse(c, 'Question not found', 404)
    return errorResponse(c, 'Error updating question', 500, err)
  }
})

app.delete('/questions/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) return errorResponse(c, 'Invalid ID', 400)
  try {
    await deleteQuestion(id)
    return c.body(null, 204)
  } catch (err: any) {
    if (err?.code === 'P2025') return errorResponse(c, 'Question not found', 404)
    return errorResponse(c, 'Error deleting question', 500, err)
  }
})
