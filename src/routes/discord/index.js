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

function getCommandValue(msg) {
    return msg.data.options ? msg.data.options[0].value : false
}

function sendToBannerBot(message, state) {
    try {
        const websockets = state.getWebSockets()
        const payload = {
            command: message.data.name,
            value: getCommandValue(message),
            issued_by: getUserName(message)
        }
        for (const ws of websockets) {
            ws.send(JSON.stringify(payload))
        }
    } catch (e) {
        console.log(e)
    }
}

async function getBotState(env, message, state) {
    try {
        const stmt = env.DB.prepare("SELECT * FROM bot WHERE id=1")
        const values = await stmt.first()
        const status = values.loggedIntoEphinea == 1 ? "Logged into Ephinea" : "Logged out of Ephinea"

        sendToBannerBot(message, state)
        return new SERIALIZE({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Banner Bot status: ${status}... \nIssuer = ${getUserName(message)}`,
            },
        })
    } catch (e) {
        return new SERIALIZE({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Banner Bot status: error can't get status... \nIssuer = ${getUserName(message)}`,
            },
        })
    }
}

async function enableBot(env, message, state) {
    try {
        const stmt = env.DB.prepare("SELECT * FROM bot WHERE id=1")
        const values = await stmt.first()

        if (values.state_id == 10) {
            return new SERIALIZE({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `Bot VM instance is turned off!... \nIssuer = ${getUserName(message)}`,
                },
            })
        }

        if
        (
            values.state_id == 1     ||
            values.loggedIntoEphinea
        )
        {
            return new SERIALIZE({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `Bot is already enabled and logged into Ephinea!... \nIssuer = ${getUserName(message)}`,
                },
            })
        }

        sendToBannerBot(message, state)
        return new SERIALIZE({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `VM is online and bot is logging into Ephinea... \nIssuer = ${getUserName(message)}`,
            },
        })
    } catch (e) {
        return new SERIALIZE({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Error enabling bot! \nIssuer = ${getUserName(message)}`,
            },
        }) 
    }
}

async function disableBot(env, message, state) {
    try {
        const stmt = env.DB.prepare("SELECT * FROM bot WHERE id=1")
        const values = await stmt.first()

        sendToBannerBot(message, state)
        return new SERIALIZE({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Disabling bot... \nIssuer = ${getUserName(message)}`,
            },
        })
    } catch (e) {
        return new SERIALIZE({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Error in disabling bot... \nIssuer = ${getUserName(message)}`,
            },
        }) 
    }
}

async function changeShip(env, message, state) {
    try {
        const sel_stmt = env.DB.prepare("SELECT * FROM bot WHERE id=1")
        const values = await sel_stmt.first()

        if
        (
            values.state_id !== 7 &&
            values.state_id !== 8
        )
        {
            return new SERIALIZE({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `[DENIED]: Need to wait for Bot to finish executing current command before issuing a new one. \nIssuer = ${getUserName(message)}`,
                },
            })
        }

        const up_stmt = env.DB.prepare("UPDATE bot SET state_id=3 WHERE id=1")
        const up_res = await up_stmt.run()

        sendToBannerBot(message, state)
        return new SERIALIZE({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `[ACCEPTED]: Changing to Ship ${getCommandValue(message)}. \nIssuer = ${getUserName(message)}`,
            },
        })
    } catch (e) {
        return new SERIALIZE({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Error in changing Ship... \nIssuer = ${getUserName(message)}`,
            },
        }) 
    }
}

async function changeBlock(env, message, state) {
    try {
        const stmt = env.DB.prepare("SELECT * FROM bot")
        const values = await stmt.first()

        if
        (
            values.state_id !== 7 &&
            values.state_id !== 8
        )
        {
            return new SERIALIZE({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `[DENIED]: Need to wait for Bot to finish executing current command before issuing a new one. \nIssuer = ${getUserName(message)}`,
                },
            })
        }

        const up_stmt = env.DB.prepare("UPDATE bot SET state_id=4 WHERE id=1")
        const up_res = await up_stmt.run()

        sendToBannerBot(message, state)
        return new SERIALIZE({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `[ACCEPTED]: Changing to Block ${getCommandValue(message)}. \nIssuer = ${getUserName(message)}`,
            },
        })
    } catch (e) {
        return new SERIALIZE({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Error in changing Block ${getCommandValue(message)}. \nIssuer = ${getUserName(message)}`,
            },
        }) 
    }
}

async function changeLobby(env, message, state) {
    try {
        const stmt = env.DB.prepare("SELECT * FROM bot WHERE id=1")
        const values = await stmt.first()

        if
        (
            values.state_id !== 8 &&
            values.state_id !== 7
        )
        {
            return new SERIALIZE({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `[DENIED]: Need to wait for Bot to finish executing current command before issuing a new one. \nIssuer = ${getUserName(message)}`,
                },
            })
        }
        const up_stmt = env.DB.prepare("UPDATE bot SET state_id=5")
        const up_res = await up_stmt.run()

        sendToBannerBot(message, state)
        return new SERIALIZE({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `[ACCEPTED]: Changing to Lobby${getCommandValue(message)} \nIssuer = ${getUserName(message)}`,
            },
        })
    } catch (e) {
        return new SERIALIZE({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Error in changing Lobby... \nIssuer = ${getUserName(message)}`,
            },
        }) 
    }
}

async function handlePost(request, env, state) {
    try {
        const message = await request.json()
        if (message.type === InteractionType.PING) {
            // The `PING` message is used during the initial webhook handshake, and is
            // required to configure the webhook in the developer portal.
            console.log("Handling Ping request")
            return new SERIALIZE({
                type: InteractionResponseType.PONG,
            })
        }

        switch(message.data.name) {
            case "bot_status":
                    return getBotState(env, message, state)
            case "enable_bot":
                    return enableBot(env, message, state)
            case "disable_bot":
                    return disableBot(env, message, state)
            case "change_ship":
                    return changeShip(env, message, state)
            case "change_block":
                    return changeBlock(env, message, state)
            case "change_lobby":
                    return changeLobby(env, message, state)
            default:
                    return new SERIALIZE({ error: "Unknown Type" }, { status: 400 })
        }
    } catch (err) {
        return new SERIALIZE({ error: err.toString() }, { status: 400 })
    }
}

export async function discordHandler(request, env, state) {
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
            return handlePost(request, env, state)
        default:
            return new Response("Not found", { status: 404 })
    }
}