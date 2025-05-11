"use strict";

// Imports
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import { ObjectId } from "mongodb";

import db from "../db/connection.js";
import fb from "../fb/firebase.js";

// Router Objects
const router = express.Router();

async function allowed(req, res, next) {
  const sessionCookie = req.cookies.session || "";
  try {
    const decodedClaims = await fb.auth().verifySessionCookie(sessionCookie);
    res.locals.uid = decodedClaims.sub;
    next();
  } catch (error) {
    // Cookie was unavailable or invalid user is unauthorised
    error.status = 401;
    next(error);
  }
}

// Middleware for This Router
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());

// Routes for This Router (all routes “/orders” onwards)
router.get("/", allowed, async (req, res) => {
  res.redirect("/orders/new-order");
});

router.get("/confirmed/:orderId", allowed, async (req, res, next) => {
  try {
    const collection = db.collection("orders");
    const userID = (await fb.auth().getUser(res.locals.uid)).uid;
    const findID = new ObjectId(req.params.orderId);
    const result = await collection.findOne({ _id: findID });

    if (!result) {
      res.status(404).send("Order not found");
      next();
    } else {
      console.log("Order found:", result);
      if (userID !== result.buyer.toString()) {
        const error = new Error();
        error.status = 403;
        next(error);
      } else {
        res.render("order-confirmed", {
          order: { ...result, _id: result._id.toString() },
        });
      }
    }
  } catch (error) {
    next(error);
  }
});

router.get("/new-order", allowed, async (req, res, next) => {
  const collection = db.collection("rides");
  const results = await collection.find({}).toArray();

  res.render("order", { rides: results });
});

router.post("/new-order", allowed, async (req, res, next) => {
  try {
    const collection = db.collection("orders");
    const userID = (await fb.auth().getUser(res.locals.uid)).uid;

    let newDoc = {};
    let result;

    newDoc.buyer = userID;
    newDoc.date = req.body.orderDate;
    newDoc.total = parseFloat(req.body.total);
    const orderDate = new Date(req.body.orderDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison

    if (orderDate < today) {
      return res.status(400).send("Order date cannot be in the past");
    }

    result = await collection.insertOne(newDoc);

    res.redirect(`/orders/confirmed/${result.insertedId}`);
  } catch (error) {
    error.status = 409;
    next(error);
  }
});

router.get("/my-orders", allowed, async (req, res, next) => {
  try {
    const collection = db.collection("orders");
    const findID = (await fb.auth().getUser(res.locals.uid)).uid;
    const result = await collection.find({ buyer: findID }).toArray();

    res.render("my-orders", { orders: result });
  } catch (error) {
    error.status = 418;
    next(error);
  }
});

router.get("/:orderId", allowed, async (req, res, next) => {
  try {
    const collection = db.collection("orders");
    const userID = (await fb.auth().getUser(res.locals.uid)).uid;
    const findID = new ObjectId(req.params.orderId);
    const result = await collection.findOne({ _id: findID });

    if (!result) {
      res.status(404).send("Order not found");
      next();
    } else {
      console.log("Order found:", result);
      if (userID !== result.buyer.toString()) {
        const error = new Error();
        error.status = 403;
        next(error);
      } else {
        res.render("view-order", {
          order: result,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    next(error);
  }
});

export default router;
