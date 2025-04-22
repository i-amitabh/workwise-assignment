import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import TicketSeatController from "./seatAllocationAlgo/ticketSeatController.js";
import pool from "./config/db.js";
// import setupDatabase from "./setupDatabase.js";
import authMiddleware from "./middleware/middleware.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { returnParsedResponse } from "./utils/returnParsedResposne.js";
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors({
  //origin: process.env.FRONTEND_ORIGIN,
  origin: "*",
  credentials: true
}));
app.use(cookieParser());

// creats and populate table
// setupDatabase();

// api endpoints

// sign up - required name, email, password
app.post("/sign-up", async (req, res) => {
  const { name, email, password } = req.body;

  // return error if required fields not present
  if (!name || !email || !password) {
    return res.status(500).json({
      success: false,
      message: "Payload is incorrect or syntax may not be correct",
    });
  }

  // first see if the email is already in use or not
  let userCheck;
  try {
    userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: `${JSON.stringify(e)}`,
      message: "Something went wrong while connecting database",
    });
  }

  // if email already in use return
  if (userCheck.rows.length > 0) {
    return res
      .status(409)
      .json({ success: false, message: "User already exists, please sign in" });
  }

  // create hashed password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create new user
  let newUser;
  try {
    newUser = await pool.query(
      `INSERT INTO users (name, email, password) 
             VALUES ($1, $2, $3)
             RETURNING id, email`,
      [name, email, hashedPassword]
    );
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: `${JSON.stringify(e)}`,
      message: "Something went wrong while connecting database",
    });
  }

  const user = newUser.rows[0];

  // create jwt token to access other routes
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  // set that token to the user cookie
  // res.cookie("token", token, {
  //   httpOnly: true,
  //   secure: true, // Mandatory for SameSite=None
  //   sameSite: "none",
  //   maxAge: 3600 * 1000, // 1 hour
  //   sameSite: 'lax',
  //   path: "/", // all routes
  // });

  // user created successfully
  return res.status(200).json({
    "success": true,
    "authToken": token,
    "message": "Signed in successfully",
  });
});

// sign in - required email, password
app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  // if email or password not present return
  if (!email || !password) {
    return res.status(500).json({
      success: false,
      message: "Payload is incorrect or syntax may not be correct",
    });
  }

  // check if user exist or not
  let userCheck;
  try {
    userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: `${JSON.stringify(e)}`,
      message: "Something went wrong while connecting database",
    });
  }

  // if user doesn't exist return
  if (userCheck.rows.length === 0) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const user = userCheck.rows[0];

  // compare the password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  // if password not correct return
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // if password correct, create a jwt token
  const token = jwt.sign(
    {
      userId: user.id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // set that jwt token to the cookie
  // res.cookie("token", token, {
  //   httpOnly: true,
  //   secure: true, // Mandatory for SameSite=None
  //   sameSite: "none",
  //   maxAge: 3600 * 1000, // 1 hour
  //   path: "/", // all routes
  // });

  // sign in sccessfully
  return res.status(200).json({
    "success": true,
    "authToken": token,
    "message": "Signed in successfully",
  });
});

// middleware to protect the other routes
app.use(authMiddleware);

app.get("/sign-out", (req, res) => {
  // remove the cookies
  res.clearCookie("token", {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    sameSite: "strict",
    path: "/",
  });
  res.json({ success: true, message: "Signed out successfully" });
});

// get all booked seats - no requirment
app.get("/get-all-seats", async (req, res) => {
  try {
    // query the status of all the seats
    const currentSeatResponse = await pool.query(
      "SELECT (seat_id, status) FROM seats ORDER BY seat_id;"
    );
    let parsedCurrentSeatResponse = returnParsedResponse(currentSeatResponse);

    // successfully queried
    return res.status(200).json({
      success: true,
      message: "Seat status retrieved successfully",
      seatStatus: parsedCurrentSeatResponse,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: `${JSON.stringify(e)}`,
      message: "Something went wrong while getting seat status",
    });
  }
});

// reset the seats booked by the users - no requirment
app.get("/reset-all-seats", async (req, res) => {
  const { id } = req.user;
  try {
    await pool.query(`UPDATE seats SET status = false WHERE user_id = $1`, [
      id,
    ]);
    await pool.query(`UPDATE seats SET user_id = NULL WHERE user_id = $1`, [
      id,
    ]);

    // get current seat status
    const currentSeatResponse = await pool.query(
      "SELECT (seat_id, status) FROM seats ORDER BY seat_id;"
    );
    const parsedCurrentSeatResponse = returnParsedResponse(currentSeatResponse);

    return res.status(200).json({
      success: true,
      message: "Reset every seats successfully",
      seatStatus: parsedCurrentSeatResponse,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: `${JSON.stringify(e)}`,
      message: "Something went wrong while resetting the seats",
    });
  }
});

// post booked seats - req numberOfSeats
app.post("/book-seats", async (req, res) => {
  const { id } = req.user;
  const { numberOfSeats } = req.body;

  const NUMBER_OF_SEAT = 80;
  const SEATS_PER_ROW = 7;

  // if the payload is incorrect
  if (!numberOfSeats || !Number.isInteger(numberOfSeats) || numberOfSeats > 7) {
    return res.status(400).json({
      success: false,
      message: "Payload is incorrect or syntax may not be correct",
    });
  }

  // current seat status
  let currentSeatResponse;
  try {
    currentSeatResponse = await pool.query(
      "SELECT (seat_id, status) FROM seats ORDER BY seat_id;"
    );
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: `${JSON.stringify(e)}`,
      message: "Something went wrong while connecting database",
    });
  }
  const parsedCurrentSeatResponse = returnParsedResponse(currentSeatResponse);

  // pass the current seat status to the controller
  const ticket = new TicketSeatController(parsedCurrentSeatResponse, NUMBER_OF_SEAT, SEATS_PER_ROW);

  // get the seat allotment according to the algorithm
  const seatsArray = ticket.getSeatAllotment(parseInt(numberOfSeats));
  if(!seatsArray) {
    return res.status(400).json({
      success: false,
      message: `Can't allot you seats`,
    });
  }
  const placeholders = seatsArray.map((_, i) => `$${i + 2}`).join(",");

  // set the returned seats to database
  try {
    await pool.query(
      `
            UPDATE seats 
            SET 
                status = TRUE, 
                user_id = $1 
            WHERE 
                seat_id IN (${placeholders})
        `,
      [id, ...seatsArray]
    );
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: `${JSON.stringify(e)}`,
      message: "Something went wrong while connecting database",
    });
  }

  // get the current status
  let updateSeatResponse;
  try {
    updateSeatResponse = await pool.query(
      "SELECT (seat_id, status) FROM seats ORDER BY seat_id;"
    );
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: `${JSON.stringify(e)}`,
      message: "Something went wrong while connecting database",
    });
  }
  let parsedUpdateSeatResponse = returnParsedResponse(updateSeatResponse);
  return res.status(200).json({
    success: true,
    message: "Booked seats successfully",
    currentBookedSeat: seatsArray,
    seatStatus: parsedUpdateSeatResponse,
  });
});

app.listen(PORT, () => {
  console.log("Server is running at", PORT);
});
