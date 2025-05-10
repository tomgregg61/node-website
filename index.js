"use strict";

// Imports
import * as http from "http";
// Constants
const PORT = 8080;
// Create server at 127.0.0.1:8080
http
  .createServer((req, res) => {
    console.log(req.headers["user-agent"]);
    switch (req.url) {
      case "/comp50016":
        res.end("SSP");
        break;
      default:
        res.end("Hello World");
        break;
    }
  })
  .listen(PORT);
// Log that the server is listening and on wha
