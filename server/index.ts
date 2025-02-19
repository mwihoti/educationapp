import 'dotenv/config';
import express, { type Request, type Response, type NextFunction} from 'express';
import { MongoClient, type Db, ObjectId } from 'mongodb';
import cors from 'cors';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const app = express();
app.use(cors());
app.use(express.json())

const PORT = process.env.PORT||3000
const CONNECTION = process.env.DB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const databaseName = "testApp";

if (!CONNECTION) {
    throw new Error("DB_URI is not defined in environment variables");
}

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in enviroment variable")
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

// Middleware to verify JWT TOKEN
const authenticateToken = (req: Request, res: Response,  next: NextFunction) => {
    const authHeader = req.header["authorization"]
    const token = authHeader && authHeader.split(" ")[1];

    if (token  == null) return res.sendStatus(401)

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403) 
      :(req as any).user = user
      next()
})
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
