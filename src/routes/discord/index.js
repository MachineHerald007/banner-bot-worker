import { verifyKey, InteractionType, InteractionResponseType } from "discord-interactions"

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

function getUserName(msg) {
    return msg.member.nick ? msg.member.nick : msg.member.user.global_name
}

async function handlePost(request) {
    try {
        const message = await request.json()
        if (message.type === InteractionType.PING) {
            // The `PING` message is used during the initial webhook handshake, and is
            // required to configure the webhook in the developer portal.
            console.log("Handling Ping request");
            return new SERIALIZE({
                type: InteractionResponseType.PONG,
            });
        }

        console.log("MSG: ", message)
        console.log("DATA: ", message.data)

        switch(message.data.name) {
            case "enable_bot":
                    return new SERIALIZE({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Banner Bot is Online. \nIssuer = ${getUserName(message)}`,
                        },
                    });
            case "disable_bot":
                    return new SERIALIZE({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Banner Bot Instance stopped. \nIssuer = ${getUserName(message)}`,
                        },
                    });
            case "change_ship":
                    return new SERIALIZE({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Banner Bot changed to Ship ${""}. \nIssuer = ${getUserName(message)}`,
                        },
                    });
            case "change_block":
                    return new SERIALIZE({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Banner Bot changed to Block ${""}. \nIssuer = ${getUserName(message)}`,
                        },
                    });
            case "change_lobby":
                    return new SERIALIZE({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Banner Bot changed to Lobby ${""}. \nIssuer = ${getUserName(message)}`,
                        },
                    });
            default:
                return new SERIALIZE({ error: "Unknown Type" }, { status: 400 });
        }
    } catch (err) {
        return new SERIALIZE({ error: err.toString() }, { status: 400 })
    }
}

export async function discordHandler(request, env) {
    // Using the incoming headers, verify this request actually came from discord.
    const signature = request.headers.get("x-signature-ed25519")
    const timestamp = request.headers.get("x-signature-timestamp")
    const body = await request.clone().arrayBuffer()
    const isValidRequest = verifyKey(
        body,
        signature,
        timestamp,
        env.DISCORD_PUBLIC_KEY
    )

    if (!isValidRequest) {
        console.error("Invalid Request");
        return new Response("Bad request signature.", { status: 401 })
    }
    
    switch(request.method) {
        case "POST":
            return handlePost(request)
        default:
            return new Response("Not found", { status: 404 })
    }
}