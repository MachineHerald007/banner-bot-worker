class SERIALIZE extends Response {
  constructor(body, init) {
    const toJSON = JSON.stringify(body)
    init = init || {
      headers: {
        'content-type': "application/json;charset=UTF-8",
      },
    }
    super(toJSON, init)
  }
}

export async function handle(request, env, state) {
    // Return a HTTP 403 (Forbidden) if the auth key is invalid/incorrect/misconfigured
    let authToken = request.headers.get("Authorization") || ""
    let encoder = new TextEncoder()

    // Securely compare our secret with the auth token provided by the client
    try {
        if (!crypto.subtle.timingSafeEqual(encoder.encode(env.QUEUE_AUTH_SECRET), encoder.encode(authToken))) {
            return Response.json({ err: "invalid auth token provided" }, { status: 403 })
        }
    } catch (e) {
        return Response.json({ err: "invalid auth token provided" }, { status: 403 })
    }

    if (request.method === "OPTIONS") {
        return handleOptions(request, env, state)
    } else if (request.method === "POST") {
        return handlePost(request, env, state)
    } else if (request.method === "GET" || request.method == "HEAD") {
        return handleGet(request, env, state)
    } else {
        return new Response(null, {
            status: 405,
            statusText: "Method Not Allowed",
        })
    }
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

function handleOptions(request, env, state) {
    if (request.headers.get("Origin") !== null &&
        request.headers.get("Access-Control-Request-Method") !== null &&
        request.headers.get("Access-Control-Request-Headers") !== null) {
        // Handle CORS pre-flight request.
        return new Response(null, {
            headers: corsHeaders
        })
    } else {
        // Handle standard OPTIONS request.
        return new Response(null, {
            headers: {
                "Allow": "GET, HEAD, POST, OPTIONS",
            }
        })
    }
}

async function handleBotLogin(request, env, state) {
    const url = `${env.DISCORD_API_ENDPOINT}/${env.COMMAND_CENTER_WEBHOOK_ID}/${env.COMMAND_CENTER_WEBHOOK_TOKEN}`
    const headers = new Headers({"Content-Type": "application/json"})
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            content: "Banner Bot successfully logged in"
        }),
        headers
    })
    return new SERIALIZE(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
    })
}

async function handleBotLogout(request, env, state) {
    const url = `${env.DISCORD_API_ENDPOINT}/${env.COMMAND_CENTER_WEBHOOK_ID}/${env.COMMAND_CENTER_WEBHOOK_TOKEN}`
    const headers = new Headers({"Content-Type": "application/json"})
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            content: "Banner Bot successfully logged out"
        }),
        headers
    })
    return new SERIALIZE(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
    })
}

async function handlePost(request, env, state) {
    try {
        if (request.headers.get("Content-Type") !== "application/json") {
            return new Response(null, {
                status: 415,
                statusText: "Unsupported Media Type",
                headers: corsHeaders,
            })
        }

        // Detect parse failures by setting `json` to null.
        let json = await request.json().catch(e => null)
        if (json === null) {
            return new Response("JSON parse failure", {
                status: 400,
                statusText: "Bad Request",
                headers: corsHeaders,
            })
        }

        //parse message and send to queue
        switch (json.messages[0].msg) {
            case "LOGGED_IN":
                console.log("CASE IS LOGGED IN")
                return handleBotLogin(request, env, state)
            case "LOGGED_OUT":
                console.log("CASE IS LOGGED OUT")
                return handleBotLogout(request, env, state)
            default:
                return new SERIALIZE(JSON.stringify(json), {
                    headers: {
                        "Content-Type": "application/json",
                        ...corsHeaders,
                    }
                })
        }
    } catch (e) {
        console.log(e)
        return new Response(null, {
            status: 500
        })  
    }
}

async function handleGet(request, env, state) {
    return new Response(null, {
        headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
        }
    })
}