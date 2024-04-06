import { httpRequestHandler } from "./routes/httpRequestHandler.js"

// Durable Object
export class BannerBotWorker {
  constructor(state, env) {
    this.state = state
    this.env = env
  }

  // Handle HTTP requests from clients.
  async fetch(request) {
    return httpRequestHandler(request, this.env, this.state)
  }

  async webSocketMessage(ws, message) {
    if (message === "CLICK") {
      ws.send(JSON.stringify({ count: 99, tz: new Date() }))
    } else {
      ws.send(JSON.stringify({ error: "Unknown message received", tz: new Date() }))
    }
  }

  async webSocketClose(ws, code, reason, wasClean) {
    ws.close(code, "Durable Object is closing WebSocket");
  }
}

export default {
  async queue(batch, env) {
    for (const msg of batch.messages) {
        console.log("QUEUE: ", msg)
    }
  },
  async fetch(request, env) {
    let id = env.BANNER_BOT_WORKER.idFromName(new URL(request.url).pathname)
    let stub = env.BANNER_BOT_WORKER.get(id)
    // We call `fetch()` on the stub to send a request to the Durable Object instance
    // The Durable Object instance will invoke its fetch handler to handle the request
    let response = await stub.fetch(request, env)
    return response
  }
}