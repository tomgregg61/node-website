// Directives
"use strict";
// Imports
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import fb from "../fb/firebase.js";

// Router Objects
const router = express.Router();

// Middleware for This Router
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());

// Routes for This Router (all routes “/users” onwards)
router.get("/", (req, res) => {
  res.redirect("/users/welcome");
});

router.post("/sign-in", create_cookie, (req, res) => {
  res.status(200).end();
  // res.redirect("/users/welcome"); could be use if fetch follows redirect
});
router.get("/sign-in", (req, res) => {
  // Could redirect to welcome if the user is known
  res.render("sign-in");
});

router.get("/sign-up", (req, res) => {
  // Could we redirect to welcome if the user is known?
  res.render("sign-up");
});

router.get("/welcome", allowed, async (req, res, next) => {
  try {
    // Local Constants
    const userRecord = await fb.auth().getUser(res.locals.uid);
    res.render("welcome", { email: userRecord.email });
  } catch (error) {
    next(error);
  }
});

router.post("/sign-out", async (req, res, next) => {
  // Local Constants
  const sessionCookie = req.cookies.session || "";
  try {
    const decodedClaims = await fb.auth().verifySessionCookie(sessionCookie);
    await fb.auth().revokeRefreshTokens(decodedClaims.sub);
    // Courtesy redirect the user
    res.clearCookie("session");
    res.redirect("/users/sign-in");
  } catch (error) {
    // Cookie was unavailable or invalid user is unauthorised
    error.status = 401;
    next(error);
  }
});

async function allowed(req, res, next) {
  const sessionCookie = req.cookies.session || "";
  console.log("Session Cookie in request:", sessionCookie);

  if (!sessionCookie) {
    console.log("No session cookie found. Redirecting to sign-up...");
    return res.redirect("/users/sign-up");
  }

  try {
    res.locals.uid = (await fb.auth().verifySessionCookie(sessionCookie)).uid;
    next();
  } catch (error) {
    console.log("Invalid session cookie. Redirecting to sign-up...");
    res.clearCookie("session"); // Remove invalid session
    return res.redirect("/users/sign-up");
  }
}

async function create_cookie(req, res, next) {
  // Local Constants
  const expiresIn = 1000 * 60 * 60 * 24 * 5;
  const idToken = req.body.idToken.toString();
  const options = { maxAge: expiresIn, httpOnly: true };
  try {
    console.log("Received ID Token:", req.body.idToken);
    // Create Cookie
    const sessionCookie = await fb
      .auth()
      .createSessionCookie(idToken, { expiresIn });
    res.cookie("session", sessionCookie, options);
    next();
  } catch (error) {
    error.status = 401;
    next(error);
  }
}

export default router;
export { allowed };
