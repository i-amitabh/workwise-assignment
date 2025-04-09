import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());

// api endpoints

// sign up - req name, email, password

// sign in - req email, password

// get all booked seats - 

// post booked seats - req numberOfSeats

app.get('/', async (req, res) => {
    return res.status(200).json({
        "message": "Working"
    })
});

app.listen(PORT, () => {
    console.log('Server is running at', PORT);
});