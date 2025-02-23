import 'dotenv/config';
import express, { Request, Response,  NextFunction} from 'express';
import { MongoClient, type Db, ObjectId } from 'mongodb';
import cors from 'cors';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { error } from 'console';
import { openai} from '@ai-sdk/openai';
import { generateText } from 'ai'
import { questions as initialQuestions, Question } from "../src/data/data"

const app: express.Application = express();
app.use(cors());
app.use(express.json())

const PORT = process.env.PORT||3000
const CONNECTION = process.env.DB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const databaseName = "testApp";

if (!CONNECTION) {
    throw new Error("DB_URI is not defined in environment variables");
}

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in enviroment variable")
}
if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not defined in enviroment variable")
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

async function seedQuestions() {
    const questionsCollection = database.collection("questions");
    const count = await questionsCollection.countDocuments()

    if (count === 0) {
        await questionsCollection.insertMany(initialQuestions)
        console.log("Initial questions seeded.")
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
        // Check if username already exists
        const existingUsername = await users.findOne({ username});
        if (existingUsername) {
            return res.status(400).json({ error: "username already exists"})
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
        console.error("Error during registration:", error);
        res.status(500).json({ error: "Registration failed" });
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
        const { username, password } = req.body;
        const users = database.collection("users")


        //Find user
        const user = await users.findOne({ username })
        if (!user) {
            return res.status(400).json({ error: "User not found"})
        }

        //Check password
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid password"})
        }
        // create and assign token
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1h"})
        res.status(200).json({ token, userId: user._id,  message: "Logged in successfully"})


    } catch (error) {
        console.error("Login failed", error);

        res.status(500).json({ error: "Login failed"})
    }
})

app.get('/profile', authenticateToken, async (req: Request, res: Response) => {
    try {
        const users = database.collection("users")
        const user = await users.findOne({ _id: new ObjectId((req as any).user.id) })
        
        if (!user) {
            return res.status(404).json({ error: "user not found"})
        } 
        res.json({
            username: user.username,
            createdAt: user._id.getTimestamp(),
            profile: user.profile})
    } catch (error) {
            console.error("Failed to fetch profile", error)
            res.status(500).json({error: "Failed to fetch profile"})
        }
    
});

app.put('/profile', authenticateToken, async ( req: Request, res: Response) => {
    try {
        const { about} = req.body;
        const users = database.collection("users");
       

        const result = await users.updateOne(
            { _id: new ObjectId(( req as any).user.id)},
            { $set: { "profile.about": about}}
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found"})
        }
        res.json({ message: "Profile updated successfully"});
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({error: "Failed to update profile"})
    }
})

app.put("/update-score", authenticateToken, async ( req: Request, res: Response) => {
    try {
        const { correct } = req.body;
        // validate the correct answer/parameters
        if (typeof correct !== 'boolean') {
            return res.status(400).json({error: "The 'correct' field must be a boolean"});
        }
        const users =  database.collection("users")
        const userId = (req as any).user.id;

        const result = await users.updateOne(
            { _id: new ObjectId(userId)},
            {
                $inc: {
                    "profile.totalQuestions": 1,
                    "profile.correctAnswers": correct ? 1 : 0,
                    "profile.incorrectAnswers": correct ? 0 : 1 
                },
            },
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found"});
        }
        res.json({ message: "Score updated successfully", updated: true})

    } catch (error) {
        console.error('Failed to update score', error)
        res.status(500).json({ error: "Failed to update score"})
    }
})

app.post("/generate-similar-question", authenticateToken, async (req: Request, res: Response) => {
    try {
        const { originalQuestion, difficulty} = req.body;
        const prompt = ` Generate a math question similar to this one, but with different numbers or slight variations.
        Keep the same difficult levele {${difficulty}} and format:

        Original question: ${originalQuestion.question}
        Original answer: ${originalQuestion.answer}
        Original explanation: ${originalQuestion.explanation}

        New question:
        `
        const { text } = await generateText({
            model: openai("gpt-4o"),
            prompt: prompt
        });

        const newQuestion = parseGenerateQuestion(text);
        const questionCollection = database.collection("questions")
        await questionCollection.insertOne(newQuestion)

        res.json(newQuestion)

    } catch (error) {
        console.error("Error generating similar question", error)
        res.status(500).json({ error: "Failed to generate similar question"})
    }
})

function parseGenerateQuestion(text: string): Question {
    // Implement parsing logic here to extract question answer and explanation
    const lines = text.split("\n")
    return {
        difficulty: "entry",
        question: lines[0],
        answer: lines[1].split(": ")[1],
        explanation: lines[2].split(": ")[1]
    }
}

