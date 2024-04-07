
import { websocketHandler } from "./ws/index.js"
import { discordHandler } from "./discord/index.js"

export async function httpRequestHandler(request, env, state) {
  try {
      const url = new URL(request.url)
      switch (url.pathname) {
            case "/":
                return new Response(null, { status: 200 })
            case "/interactions":
                return discordHandler(request, env, state)
            case "/ws":
                return websocketHandler(request, env, state)
            default:
                return new Response("Not found", { status: 404 })
      }
  }
  catch (err) {
      return new Response(err.toString())
  }
}