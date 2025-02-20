import 'dotenv/config';
import express, { type Request, type Response, type NextFunction} from 'express';
import { MongoClient, type Db, ObjectId } from 'mongodb';
import cors from 'cors';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { error } from 'console';


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
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1];

    if (token  == null) return res.sendStatus(401)

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      (req as any).user = user
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
        const collections =  database.collection("testApp");
        const users = await collections.find({}).toArray();

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Database query failed"})
    }
})

app.post("/register", async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body
        const users = database.collection("users")

        //check if user already exists
        const existingUser = await users.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ error: "User already exists"})
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await users.insertOne({
            username,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            profile: {
                about: "",
                correctAnswers: 0,
                incorrectAnswers: 0,
                totalQuestions: 0,
            }
        })
        res.status(201).json({ message: "User created successfully ", userId: newUser.insertedId })
    } catch (error) {
        res.status(500).json({ error: "registration failed"})
    }
})
app.get("/users", async (req: Request, res: Response) => {
    try {
        const users = database.collection("users");
        const allUsers = await users.find().toArray();
        res.status(200).json(allUsers);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users"})

    }
})

app.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const users = database.collection("users")


        //Find user
        const user = await users.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: "User not found"})
        }

        //Check password
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid password"})
        }
        // create and assign token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h"})
        res.status(200).json({ token, userId: user._id,  message: "Logged in successfully"})


    } catch (error) {
        console.error("Login failed", error);

        res.status(500).json({ error: "Login failed"})
    }
})