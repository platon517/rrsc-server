const express = require('express');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));


const WebSocket = require("ws");

const wss = new WebSocket.Server({ server });

const users = new Set();

wss.on("connection", ws => {
  const user = {
    id: users.size > 0 ? ([...users].pop().id + 1) : 0,
    ws
  };
  users.add(user);

  ws.send(JSON.stringify({ type: "wsIdSet", data: { id: user.id } }));

  console.log("users: ", users.size);

  ws.on("message", message => {
    const parsedMessage = JSON.parse(message);
    switch (parsedMessage.type) {
      case "sendOffer":
        console.log(1);
        return [...users]
          .find(item => item.id === parseFloat(parsedMessage.data.userId))
          .ws.send(
            JSON.stringify({ type: "getOffer", data: parsedMessage.data.offer })
          );
      case "sendAnswer":
        console.log(2);
        return [...users]
          .find(item => item.id === parseFloat(parsedMessage.data.userId))
          .ws.send(
            JSON.stringify({
              type: "getAnswer",
              data: parsedMessage.data.answer
            })
          );
      case "setCandidate":
        console.log(3);
        return [...users]
          .find(item => item.id === parseFloat(parsedMessage.data.userId))
          .ws.send(
            JSON.stringify({
              type: "getCandidate",
              data: parsedMessage.data.candidate
            })
          );
      default:
        return false;
    }
  });

  ws.on("close", () => {
    users.delete(user);
  });
});
