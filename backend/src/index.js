import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import TicketController from "./ticketController.js";
import pool from "./db.js";
import setupDatabase from "./setupDatabase.js";
import authMiddleware from "./middleware.js";
import bcrypt from 'bcrypt';``
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());

const ticket = new TicketController();

// api endpoints

// sign up - req name, email, password

setupDatabase();

app.post('/sign-up', async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    try {
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ message: "User already exists" });
        }
    } catch (error) {
        console.error("Database error during user check:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

    // Hash password and create user
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10
        await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
            [name, email, hashedPassword]
        );
        return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Database error during user creation:", error);
        
        // Handle unique constraint violation (if concurrent request)
        if (error.code === '23505') {
            return res.status(409).json({ message: "User already exists" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
});


// sign in - req email, password
app.post('/sign-in', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userCheck.rows.length === 0) {
            // Avoid revealing if the user exists for security
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const user = userCheck.rows[0];
        
        // Compare plaintext password with stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            return res.status(200).json({
                success: true,
                message: "User signed in successfully"
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
    } catch (error) {
        console.error("Sign-in error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// authenication middleware
app.use(authMiddleware);

// get all booked seats - 

app.get('/get-all-seats', async (req, res) => {

    const allSeatAllotment = ticket.getAllSeatStatus();

    if(allSeatAllotment) {
        return res.status(200).json({
            "success": true,
            "message": "Seat status retrieved successfully",
            "seatStatus": allSeatAllotment
        })
    }

    return res.status(200).json({
        "numberOfSeatsAvaiable": "80"
    })
})

// post booked seats - req numberOfSeats
app.post('/book-seats', async (req, res) => {
    const { numberOfSeats } = req.body;

    const seatsArray = ticket.getSeatAllotment(parseInt(numberOfSeats));
    const allSeatAllotment = ticket.getAllSeatStatus();

    if(seatsArray) {
        return res.status(200).json({
            "success": true,
            "message": "Seat status retrieved successfully",
            "newSeatsBooked": seatsArray,
            "seatStatus": allSeatAllotment
        })
    } else {
        return res.status(400).json({
            "success": false,
            "errorMessage": "No data found"
        })
    }
})

app.get('/', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users;");
        console.log(result);
        return res.status(200).json({
            "message": "Working",
            "result": result.rows[0]
        })
    } catch(error) {
        console.log(error);
        return res.status(400).json({
            "message": "not working"
        })
    }

    // return res.send(`The database name is : ${result.rows[0].current_database}`);
});

app.listen(PORT, () => {
    console.log('Server is running at', PORT);
});