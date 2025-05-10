// Directives
"use strict";
// Imports
import express from "express";
// Application Constants
const app = express();
const port = 8080;
// Routes
app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>");
});
// Start Server
app.listen(port, () => {
  console.log(`Express server listening at ${port}`);
});
