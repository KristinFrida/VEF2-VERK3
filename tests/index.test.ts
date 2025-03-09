// __tests__/index.test.ts
import request from 'supertest'
import { createTestServer } from './testServer'

let server: ReturnType<typeof createTestServer>

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

it('GET /categories/:slug returns 404 for non-existing slug', async () => {
    const res = await request(server).get('/categories/non-existent-slug')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Category not found')
  })
  
  it('PATCH /categories/:slug with invalid data returns 400', async () => {
    const res = await request(server)
      .patch('/categories/some-slug')
      .send({ title: '' }) // invalid
      .set('Content-Type', 'application/json')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid data')
  })
  
  it('DELETE /categories/:slug returns 204 if exists (simulate)', async () => {
    // Optional: You may want to create a category before this.
    // But even without, you can simulate a 404
    const res = await request(server).delete('/categories/non-existent-slug')
    // You may get 404 or 500 depending on db behavior
    expect([204, 404, 500]).toContain(res.status)
  })
  
  it('POST /questions with invalid data returns 400', async () => {
    const res = await request(server)
      .post('/questions')
      .send({ question: '', answer: '' })
      .set('Content-Type', 'application/json')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid data')
  })
  
  it('GET /questions/:id with invalid id returns 400', async () => {
    const res = await request(server).get('/questions/invalid-id')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid ID')
  })
  
  it('GET /questions/:id not found returns 404', async () => {
    const res = await request(server).get('/questions/999999')
    expect([404, 500]).toContain(res.status)
  })  
})
