import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import {
  // Category DB‐föll
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  validateCategoryCreate,
  validateCategoryUpdate,
} from './categories.db.js'

import {
  // Questions DB‐föll
  getQuestions,
  getQuestionsByCategoryId,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  validateQuestionCreate,
  validateQuestionUpdate,
} from './questions.db.js'

const app = new Hono()

// Leyfum CORS ef óskað er eftir því
app.use('/*', cors())

/**
 * Einfaldur healthcheck route
 */
app.get('/', (c) => {
  return c.json({ message: 'Hello from Hono!' })
})

/**
 * [GET] /categories
 * Skilar lista af flokkum
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
 * Skilar stökum flokki
 */
app.get('/categories/:slug', async (c) => {
  try {
    const { slug } = c.req.param()
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
 * Býr til nýjan flokk
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

    const category = await createCategory(parsed.data)
    return c.json(category, 201)
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [PATCH] /categories/:slug
 * Uppfærir flokk
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
    const updatedCategory = await updateCategory(slug, parsed.data)
    return c.json(updatedCategory, 200)
  } catch (err) {
    // Prisma "not found" villa
    if (typeof err === 'object' && err !== null && (err as any).code === 'P2025') {
      return c.json({ error: 'Category not found' }, 404)
    }
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [DELETE] /categories/:slug
 * Eyðir flokk
 */
app.delete('/categories/:slug', async (c) => {
  const { slug } = c.req.param()
  try {
    await deleteCategory(slug)
    // Skila 204 No Content
    return c.body(null, 204)
  } catch (err) {
    // Prisma "not found" villa
    if (typeof err === 'object' && err !== null && (err as any).code === 'P2025') {
      return c.json({ error: 'Category not found' }, 404)
    }
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [GET] /questions
 * Skilar lista af öllum spurningum
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
 * [GET] /categories/:slug/questions
 * Skilar öllum spurningum fyrir gefinn flokk
 */
app.get('/categories/:slug/questions', async (c) => {
  const { slug } = c.req.param()
  const { limit = '10', offset = '0' } = c.req.query()

  try {
    // Athuga hvort flokkur sé til
    const category = await getCategoryBySlug(slug)
    if (!category) {
      return c.json({ error: 'Category not found' }, 404)
    }
    // Sækja spurningar sem tilheyra þessum flokk
    const questions = await getQuestionsByCategoryId(
      category.id,
      Number(limit),
      Number(offset)
    )
    return c.json(questions, 200)
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [GET] /questions/:id
 * Skilar stakri spurningu með tilteknu id
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
 * Býr til nýja spurningu (categoryId má vera optional)
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
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [POST] /categories/:slug/questions
 * Býr til nýja spurningu BEINT undir ákveðinn flokk
 */
app.post('/categories/:slug/questions', async (c) => {
  const { slug } = c.req.param()
  try {
    const category = await getCategoryBySlug(slug)
    if (!category) {
      return c.json({ error: 'Category not found' }, 404)
    }
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

    // Setjum categoryId út frá flokknum
    const newQuestion = await createQuestion({
      ...parsed.data,
      categoryId: category.id,
    })
    return c.json(newQuestion, 201)
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [PATCH] /questions/:id
 * Uppfærir spurningu
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

    const updatedQuestion = await updateQuestion(id, parsed.data)
    return c.json(updatedQuestion, 200)
  } catch (err) {
    if (typeof err === 'object' && err !== null && (err as any).code === 'P2025') {
      return c.json({ error: 'Question not found' }, 404)
    }
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * [DELETE] /questions/:id
 * Eyðir spurningu
 */
app.delete('/questions/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400)
  }

  try {
    await deleteQuestion(id)
    return c.body(null, 204)
  } catch (err) {
    if (typeof err === 'object' && err !== null && (err as any).code === 'P2025') {
      return c.json({ error: 'Question not found' }, 404)
    }
    console.error(err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/**
 * KEYRUM SERVER MEÐ HONO
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
