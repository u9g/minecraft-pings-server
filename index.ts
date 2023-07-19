import "fs";
import { appendFile } from "fs/promises";

Bun.serve<{ username: string; ip: string }>({
  websocket: {
    publishToSelf: true,
    message(ws, message) {
      if (typeof message !== "string") return;
      try {
        const packet = JSON.parse(message);
        console.log(`received packet: ${JSON.stringify(packet)}`);
        if (packet?.ip?.includes("midnightsky.") === true)
          packet.ip = "midnightsky";

        if (packet.type === "connected") {
          ws.data = { ip: packet.ip, username: packet.username };
          appendFile(
            "./log.txt",
            JSON.stringify({ ip: packet.ip, username: packet.username }) + "\n"
          );

          ws.subscribe(packet.ip);
        } else if (packet.type === "disconnected") {
          ws.unsubscribe(ws.data.ip);
          ws.data.ip = "";
        } else if (packet.type === "ping") {
          if (ws.data.ip === "") return;
          ws.publish(
            ws.data.ip,
            JSON.stringify({
              x: packet.x,
              y: packet.y,
              z: packet.z,
              username: ws.data.username,
            })
          );

          console.log("ping on " + ws.data.ip);
        }
      } catch (e) {
        console.log(e);
        return;
      }
    },
  },
  fetch(request, server) {
    const upgraded = server.upgrade(request);
    if (!upgraded) {
      return new Response("Upgrade failed", { status: 400 });
    }
  },
});
