import http from 'http'
import { app } from '../src/app'

export function createTestServer() {
  return http.createServer(async (req, res) => {
    const url = `http://${req.headers.host}${req.url}`
    const request = new Request(url, {
        method: req.method,
        headers: req.headers as HeadersInit,
        body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : req as any,
        duplex: 'half',
      } as any)      
    const response = await app.fetch(request)

    res.writeHead(response.status, Object.fromEntries(response.headers.entries()))

    const body = await response.text()
    res.end(body)
  })
}
