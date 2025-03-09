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
})
