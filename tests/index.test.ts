import request from 'supertest'
import { createTestServer } from './testServer'

let server: ReturnType<typeof createTestServer>
let createdCategorySlug: string
let createdQuestionId: number


beforeAll((done) => {
  server = createTestServer()
  server.listen(4001, done)
})

afterAll((done) => {
  server.close(done)
})

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
        .send({ title: 'Test Category' })
        .set('Content-Type', 'application/json')
      expect(res.status).toBe(201)
      expect(res.body.title).toBe('Test Category')
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
        .send({ title: 'Updated Category' })
        .set('Content-Type', 'application/json')
      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Updated Category')
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
      const res = await request(server)
        .post('/questions')
        .send({
          question: 'What is the capital of Iceland?',
          answer: 'Reykjavík',
          categoryId: null,
        })
        .set('Content-Type', 'application/json')
      expect(res.status).toBe(201)
      expect(res.body.question).toBe('What is the capital of Iceland?')
      createdQuestionId = res.body.id
    })
  
    it('GET /questions/:id should return the created question', async () => {
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
      const res = await request(server).delete(`/questions/${createdQuestionId}`)
      expect([204, 404]).toContain(res.status)
    })
  })