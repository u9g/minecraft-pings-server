Bun.serve<{ username: string; ip: string }>({
	websocket: {
		message(ws, message) {
			if (typeof message !== "string") return
			try {
				const packet = JSON.parse(message)
				console.log(`received packet: ${JSON.stringify(packet)}`)
				if (packet.type === "connected") {
					ws.data = { ip: packet.ip, username: packet.username }

					if (ws.data.ip.includes('midnightsky.'))
						ws.data.ip = 'midnightsky'

					ws.subscribe(packet.ip)
				} else if (packet.type === "disconnected") {
					ws.unsubscribe(packet.ip)
					ws.data.ip = ""
				} else if (packet.type === "ping") {
					if (ws.data.ip === "") return
					console.log("sending ping: " + JSON.stringify(ws.data))
					ws.publish(
						ws.data.ip,
						JSON.stringify({
							x: packet.x,
							y: packet.y,
							z: packet.z,
							username: ws.data.username,
						})
					)
				}
			} catch (e) {
				console.log(e)
				return
			}
		},
	},
	fetch(request, server) {
		const upgraded = server.upgrade(request)
		if (!upgraded) {
			return new Response("Upgrade failed", { status: 400 })
		}
	},
})
