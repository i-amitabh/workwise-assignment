import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import TicketController from "./ticketController.js";
import pool from "./db.js";
import setupDatabase from "./setupDatabase.js";
import authMiddleware from "./middleware.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

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
            return res.status(409).json({ success: false, message: "User already exists" });
        }
    } catch (error) {
        console.error("Database error during user check:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

    // Hash password and create user
    try {
        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            `INSERT INTO users (name, email, password) 
             VALUES ($1, $2, $3)
             RETURNING id, email`, // Return essential user data
            [name, email, hashedPassword]
        );

        // Generate JWT
        const user = newUser.rows[0];
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expiration
        );

        res.cookie('token', token, {
            httpOnly: true,          // Prevent XSS attacks
            // secure: process.env.NODE_ENV === 'production', // HTTPS only
            sameSite: 'strict',       // Prevent CSRF attacks
            maxAge: 3600 * 1000,      // 1 hour (matches JWT expiration)
            path: '/'                 // Available across all routes
        });

        return res.status(200).json({
            success: true,
            message: "Signed in successfully"
        });

        // return res.status(201).json({
        //     success: true,
        //     message: "User created successfully",
        //     token: token,
        //     userId: user.id
        // });

    } catch (error) {
        console.error("Database error during user creation:", error);
        
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
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const user = userCheck.rows[0];
        
        // Compare password with stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.id, // Add if you have roles
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' } // Token expiration
            );

            res.cookie('token', token, {
                httpOnly: true,          // Prevent XSS attacks
                // secure: process.env.NODE_ENV === 'production', // HTTPS only
                sameSite: 'strict',       // Prevent CSRF attacks
                maxAge: 3600 * 1000,      // 1 hour (matches JWT expiration)
                path: '/'                 // Available across all routes
            });
    
            return res.status(200).json({
                success: true,
                message: "Signed in successfully"
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
    } catch (error) {
        console.error("Sign-in error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
});

// authenication middleware
app.use(authMiddleware);

// get all booked seats - 

app.get('/sign-out', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
    res.json({ success: true, message: "Signed out successfully" });
});

function convertStringToObject(input) {
    // Remove parentheses and whitespace, then split into parts
    if(typeof input === 'string') {
        const [key, value] = input.replace(/[()\s]/g, '').split(',');
  
        // Convert to object with integer key and boolean value
        return {
          [parseInt(key)]: value.toLowerCase() === 't'
        };
    }
}

function returnResponseObj(input) {
    let responseObj = {};
    input.rows.forEach((obj) => {
        responseObj = { ...responseObj, ...convertStringToObject(obj.row) };
    });

    return responseObj;
}

app.get('/get-all-seats', async (req, res) => {

    // const allSeatAllotment = ticket.getAllSeatStatus();

    const response = await pool.query('SELECT (seat_id, status) FROM seats ORDER BY seat_id;');
    let responseObj = returnResponseObj(response);

    if(responseObj) {
        return res.status(200).json({
            "success": true,
            "message": "Seat status retrieved successfully",
            "seatStatus": responseObj
        })
    } else {
        return res.status(500).json({
            "success": false,
            "message": "Something went wrong"
        })
    }
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