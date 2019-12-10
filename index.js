const express = require("express");

const PORT = process.env.PORT || 3000;
const INDEX = "/index.html";

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const WebSocket = require("ws");

const wss = new WebSocket.Server({ server });

const users = new Map();
let lastId = 0;

wss.on("connection", ws => {
  const id = lastId + 1;
  lastId = id;
  users.set(id, ws);

  ws.send(JSON.stringify({ type: "wsIdSet", data: { id } }));

  console.log("users: ", users.size);

  ws.on("message", message => {
    const parsedMessage = JSON.parse(message);
    try {
      switch (parsedMessage.type) {
        case "callForStream":
          console.log("callForStream userId: ", parsedMessage.data.userId);
          return users
            .get(parseFloat(parsedMessage.data.userId))
            .send(
              JSON.stringify({ type: "calledToStream", data: id })
            );
        case "sendOffer":
          console.log("sendOffer userId: ", parsedMessage.data.userId);
          return users
            .get(parseFloat(parsedMessage.data.userId))
            .send(
              JSON.stringify({
                type: "getOffer",
                data: parsedMessage.data.offer
              })
            );
        case "sendAnswer":
          console.log("sendAnswer userId: ", parsedMessage.data.userId);
          return users.get(parseFloat(parsedMessage.data.userId)).send(
            JSON.stringify({
              type: "getAnswer",
              data: parsedMessage.data.answer
            })
          );
        case "setCandidate":
          console.log("setCandidate userId: ", parsedMessage.data.userId);
          return users.get(parseFloat(parsedMessage.data.userId)).send(
            JSON.stringify({
              type: "getCandidate",
              data: parsedMessage.data.candidate
            })
          );
        case "disconnectFromStream":
          console.log(
            "disconnectFromStream userId: ",
            parsedMessage.data.userId
          );
          return users.get(parseFloat(parsedMessage.data.userId)).send(
            JSON.stringify({
              type: "disconnectedFromStream"
            })
          );
        default:
          return false;
      }
    } catch (e) {
      console.log(e);
    }
  });

  ws.on("close", () => {
    users.delete(id);
  });
});
