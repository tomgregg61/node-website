// Directives
"use strict";
// Imports
import express from "express";
import * as path from "path";
import { fileURLToPath } from "url";
import userRouter from "./routes/users.js";
import ridesRouter from "./routes/rides.js";
import ordersRouter from "./routes/orders.js";
import db from "./db/connection.js"; // Adjust the path as needed

// Store Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Application Objects
const app = express();

// Configuration
app.disable("x-powered-by");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Preroute MIDDLEWARE -------------------------------------------------------
app.use(express.static(path.join(__dirname, "public")));
app.use("/favicon.ico", express.static("public/assets/ico/favicon.ico"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ROUTERS -------------------------------------------------------------------
app.use("/users", userRouter);
app.use("/rides", ridesRouter);
app.use("/orders", ordersRouter);
// ROUTE ---------------------------------------------------------------------
app.get("/", async (req, res) => {
  try {
    let collection = db.collection("rides");
    let results = await collection.find({}).toArray();
    console.log("Rendering home view with rides:", results);

    res.render("home", {
      rides: results,
    });
  } catch (err) {
    console.error("Error fetching rides for home page", err);
    res.render("home", { rides: [] });
  }
});

// START SERVER --------------------------------------------------------------
app.listen(8080, () => {
  console.log("The server is listening for port 8080");
});
