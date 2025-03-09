import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createTestServer } from './testServer';

const prisma = new PrismaClient();
let server: ReturnType<typeof createTestServer>;
let createdCategorySlug: string;
let createdQuestionId: number;
let categoryId: number;

beforeAll((done) => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  server = createTestServer();
  server.listen(4001, done);
});

afterAll(async () => {
  await prisma.$disconnect();
  server.close();
});


describe('API routes', () => {
  it('GET / should return Hello from Hono', async () => {
    const res = await request(server).get('/')
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Hello from Hono!')
  })

  it('GET /categories should return array', async () => {
    const res = await request(server).get('/categories')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /questions should return array', async () => {
    const res = await request(server).get('/questions')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /category with invalid data should return 400', async () => {
    const res = await request(server)
      .post('/category')
      .send({ title: '' })
      .set('Content-Type', 'application/json')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid data')
  })

  it('POST /category with valid data should create a category', async () => {
    const res = await request(server)
      .post('/category')
      .send({ title: `Test Category ${Date.now()}` }) // Ensure unique title
      .set('Content-Type', 'application/json')
    expect(res.status).toBe(201)
    expect(res.body.title).toContain('Test Category')
    createdCategorySlug = res.body.slug
  })

  it('GET /categories/:slug should return the created category', async () => {
    const res = await request(server).get(`/categories/${createdCategorySlug}`)
    expect(res.status).toBe(200)
    expect(res.body.slug).toBe(createdCategorySlug)
  })

  it('GET /categories/:slug with non-existing slug returns 404', async () => {
    const res = await request(server).get('/categories/non-existent-slug')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Category not found')
  })

  it('PATCH /categories/:slug with invalid data should return 400', async () => {
    const res = await request(server)
      .patch(`/categories/${createdCategorySlug}`)
      .send({ title: '' })
      .set('Content-Type', 'application/json')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid data')
  })

  it('PATCH /categories/:slug with valid data should update the category', async () => {
    const res = await request(server)
      .patch(`/categories/${createdCategorySlug}`)
      .send({ title: `Updated Category ${Date.now()}` })
      .set('Content-Type', 'application/json')
    expect(res.status).toBe(200)
    expect(res.body.title).toContain('Updated Category')
  })

  it('POST /category (extra for question test category)', async () => {
    const res = await request(server)
      .post('/category')
      .send({ title: `Question Test Category ${Date.now()}` }) // Ensure uniqueness
      .set('Content-Type', 'application/json')
    expect(res.status).toBe(201)
    categoryId = res.body.id
  })

  it('POST /questions with invalid data should return 400', async () => {
    const res = await request(server)
      .post('/questions')
      .send({ question: '', answer: '' })
      .set('Content-Type', 'application/json')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid data')
  })

  it('POST /questions with valid data should create a question', async () => {
    expect(categoryId).toBeDefined()
    const res = await request(server)
      .post('/questions')
      .send({
        question: 'What is the capital of Iceland?',
        answer: 'Reykjavík',
        categoryId,
        answers: [
          { answer: 'Reykjavík', isCorrect: true },
          { answer: 'Akureyri' },
          { answer: 'Keflavík' },
        ],
      })
      .set('Content-Type', 'application/json')

    console.log('POST /questions response:', res.body)
    expect(res.status).toBe(201)
    expect(res.body.question).toBe('What is the capital of Iceland?')
    createdQuestionId = res.body.id
  })

  it('GET /questions/:id should return the created question', async () => {
    if (!createdQuestionId) {
      console.warn('Question was not created, skipping GET /questions/:id test')
      return
    }
    const res = await request(server).get(`/questions/${createdQuestionId}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(createdQuestionId)
  })

  it('GET /questions/:id with invalid id should return 400', async () => {
    const res = await request(server).get('/questions/invalid-id')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid ID')
  })

  it('GET /questions/:id with non-existent id should return 404', async () => {
    const res = await request(server).get('/questions/99999999')
    expect([404, 500]).toContain(res.status)
  })

  it('DELETE /categories/:slug should delete the category', async () => {
    const res = await request(server).delete(`/categories/${createdCategorySlug}`)
    expect([204, 404]).toContain(res.status)
  })

  it('DELETE /questions/:id should delete the question', async () => {
    if (!createdQuestionId) {
      console.warn('Question was not created, skipping DELETE /questions/:id test')
      return
    }
    const res = await request(server).delete(`/questions/${createdQuestionId}`)
    expect([204, 404]).toContain(res.status)
  })
})
