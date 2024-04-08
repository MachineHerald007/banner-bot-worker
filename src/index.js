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
    if (message === "CONNECTED") {
      ws.send(JSON.stringify({ status: 200, timestamp: new Date() }))
    } else {
      ws.send(JSON.stringify({ error: "Unknown message received", timestamp: new Date() }))
    }

    if (message === "bot_status") {}
    if (message === "enabled_bot") {}
    if (message === "disabled_bot") {}
    if (message === "changed_ship") {}
    if (message === "changed_block") {}
    if (message === "changed_lobby") {}
  }

  async webSocketClose(ws, code, reason, wasClean) {
    ws.close(code, "Durable Object is closing WebSocket")
  }
}

export default {
  //queues won't be needed for now
  async queue(batch, env) {
    for (const msg of batch.messages) {
        console.log("QUEUE MSG: ", msg)
    }
  },
  async fetch(request, env) {
    let id = env.BANNER_BOT_WORKER.idFromName("interactions")
    let stub = env.BANNER_BOT_WORKER.get(id)
    // We call `fetch()` on the stub to send a request to the Durable Object instance
    // The Durable Object instance will invoke its fetch handler to handle the request
    let response = await stub.fetch(request, env)
    return response
  }
}