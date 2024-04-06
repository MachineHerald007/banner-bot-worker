export const websocketHandler = async (request, state) => {
  const upgradeHeader = request.headers.get("Upgrade")
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Durable Object expected Upgrade: websocket", { status: 426 })
  }

  const webSocketPair = new WebSocketPair()
  const [client, server] = Object.values(webSocketPair)
  state.acceptWebSocket(server)

  return new Response(null, {
      status: 101,
      webSocket: client,
  })
}