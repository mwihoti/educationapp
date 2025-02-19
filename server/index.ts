import 'dotenv/config';
import express, { Request, Response } from 'express';
import { MongoClient, Db } from 'mongodb';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());

const PORT = process.env.PORT||3000
const CONNECTION = process.env.DB_URI;
const databaseName = "testApp";

if (!CONNECTION) {
    throw new Error("DB_URI is not defined in environment variables");
}

let database: Db;

async function connectToDatabase() {
    try {
        const client = await MongoClient.connect(CONNECTION);
        database = client.db(databaseName);
      
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process if database connection fails
    }
}

// Connect to the database before starting the server
connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`MongoDB connection successful, runing on http://localhost:${PORT}`);    });
});

app.get("/", (req, res) => {
    res.send("Server is runing")
})

app.get("/testdb", async(req: Request, res: Response) => {
    try {
        const collections = await database.collection("testApp");
        const users = collections.find({}).toArray();

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Database query failed"})
    }
})

export { database }; // If other files need access to the database
