"use strict";

import bodyParser from "body-parser";
import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// GET route to display rides
router.get("/", async (req, res) => {
  console.log("Fetching rides..."); // Add this line
  let collection = db.collection("rides");
  let results = await collection.find({}).toArray();
  console.log("Rides fetched:", results); // Log the fetched data

  res.render("rides", {
    rides: results,
  });
});

// POST route to handle ride purchases
router.post("/", async (req, res) => {
  // Just use "/" here
  let collection = db.collection("rides");
  let newDoc = {};
  let result;

  console.log(req.body);
  newDoc.order = [];
  newDoc.date = new Date();

  Object.keys(req.body).forEach((key) => {
    newDoc.order.push({ name: key, used: false });
  });

  result = await collection.insertOne(newDoc);
  res.render("rides-bought");
});

export default router;
