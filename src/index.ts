import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

/**
 * CATEGORIES IMPORTS
 */

import {
  getCategories,
  getCategoryBySlug,
  validateCategoryCreate,
  createCategory,
  validateCategoryUpdate,
  updateCategory,
  deleteCategory,
} from './categories.db.js'

/**
 * QUESTIONS IMPORTS
 */
import {
  getQuestions,
  getQuestionById,
  validateQuestionCreate,
  createQuestion,
  validateQuestionUpdate,
  updateQuestion,
  deleteQuestion,
} from './questions.db.js'

const app = new Hono()
app.use('/*', cors())

/**
 * HELLO ROUTE
 */
app.get('/', (c) => c.json({ hello: 'hono' }))

/**
 * CATEGORIES ROUTES
 */
app.get('/categories', async (c) => {
  try {
    const { limit = '10', offset = '0' } = c.req.query()
    const categories = await getCategories(Number(limit), Number(offset))
    return c.json(categories, 200)
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [GET] /categories/:slug
 */
app.get('/categories/:slug', async (c) => {
  const { slug } = c.req.param()
  try {
    const category = await getCategoryBySlug(slug)
    if (!category) {
      return c.json({ error: 'Category not found' }, 404)
    }
    return c.json(category, 200)
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [POST] /categories
 */
app.post('/categories', async (c) => {
  try {
    const body = await c.req.json()
    const parsed = validateCategoryCreate(body)
    if (!parsed.success) {
      return c.json(
        {
          error: 'Invalid data',
          details: parsed.error.flatten(),
        },
        400
      )
    }
    const newCategory = await createCategory(parsed.data)
    return c.json(newCategory, 201)
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [PATCH] /categories/:slug
 */
app.patch('/categories/:slug', async (c) => {
  const { slug } = c.req.param()
  try {
    const body = await c.req.json()
    const parsed = validateCategoryUpdate(body)
    if (!parsed.success) {
      return c.json(
        {
          error: 'Invalid data',
          details: parsed.error.flatten(),
        },
        400
      )
    }
    const updated = await updateCategory(slug, parsed.data)
    return c.json(updated, 200)
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as any).code === 'P2025'
    ) {
      return c.json({ error: 'Category not found' }, 404)
    }
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [DELETE] /categories/:slug
 */
app.delete('/categories/:slug', async (c) => {
  const { slug } = c.req.param()
  try {
    await deleteCategory(slug)
    return c.body(null, 204)
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as any).code === 'P2025'
    ) {
      return c.json({ error: 'Category not found' }, 404)
    }
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * QUESTIONS ROUTES
 */
app.get('/questions', async (c) => {
  try {
    const { limit = '10', offset = '0' } = c.req.query()
    const questions = await getQuestions(Number(limit), Number(offset))
    return c.json(questions, 200)
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [GET] /questions/:id
 */
app.get('/questions/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400)
  }
  try {
    const question = await getQuestionById(id)
    if (!question) {
      return c.json({ error: 'Question not found' }, 404)
    }
    return c.json(question, 200)
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [POST] /questions
 */
app.post('/questions', async (c) => {
  try {
    const body = await c.req.json()
    const parsed = validateQuestionCreate(body)
    if (!parsed.success) {
      return c.json(
        {
          error: 'Invalid data',
          details: parsed.error.flatten(),
        },
        400
      )
    }
    const newQuestion = await createQuestion(parsed.data)
    return c.json(newQuestion, 201)
  } catch (err: unknown) {
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [PATCH] /questions/:id
 */
app.patch('/questions/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400)
  }
  try {
    const body = await c.req.json()
    const parsed = validateQuestionUpdate(body)
    if (!parsed.success) {
      return c.json(
        {
          error: 'Invalid data',
          details: parsed.error.flatten(),
        },
        400
      )
    }
    const updated = await updateQuestion(id, parsed.data)
    return c.json(updated, 200)
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as any).code === 'P2025'
    ) {
      return c.json({ error: 'Question not found' }, 404)
    }
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [DELETE] /questions/:id
 */
app.delete('/questions/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400)
  }
  try {
    await deleteQuestion(id)
    return c.body(null, 204)
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as any).code === 'P2025'
    ) {
      return c.json({ error: 'Question not found' }, 404)
    }
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * START SERVER
 */
serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server running on http://localhost:${info.port}`)
  }
)
