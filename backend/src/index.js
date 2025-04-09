import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import TicketController from "./ticketController.js";
import pool from "./db.js";
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());

const ticket = new TicketController();

// api endpoints

// sign up - req name, email, password

app.post('/signup', async(req, res) => {

    const { name, email, password } = req.body;

    // Here make the postgres query

    return res.status(200).json({
        name,
        email,
        password
    })
})

// sign in - req email, password

app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    // Here make the postgres query

    return res.status(200).json({
        email,
        password
    })
})

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