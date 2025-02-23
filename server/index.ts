import 'dotenv/config';
import express, { Request, Response,  NextFunction} from 'express';
import { MongoClient, type Db, ObjectId } from 'mongodb';
import cors from 'cors';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { error } from 'console';
import { GoogleGenerativeAI } from "@google/generative-ai"

import { questions as initialQuestions, Question } from "../src/data/data"

const app: express.Application = express();
app.use(cors());
app.use(express.json())

const PORT = process.env.PORT||3000
const CONNECTION = process.env.DB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const databaseName = "testApp";

if (!CONNECTION) {
    throw new Error("DB_URI is not defined in environment variables");
}

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in enviroment variable")
}
if (!GEMINI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not defined in enviroment variable")
}

let database: Db;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({  model: "gemini-1.5-pro" })

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

// Function to parse the generated question
function parseGeneratedQuestion(text: string) {
    // Implement your parsing logic here based on the expected format of the generated text
    // This is a placeholder, replace with actual parsing
    return {
      question: text,
      answer: "Parsed Answer",
      explanation: "Parsed Explanation",
    }
  }
  
 // Helper function to clean and parse JSON response
function cleanAndParseJSON(text: string): any {
    try {
      // Remove any prefixes like "json" or whitespace
      const cleanedText = text.replace(/^(?:json\s*)?/, "").trim()
  
      // Remove any backticks or other extraneous characters
      const sanitizedText = cleanedText.replace(/^```json\s*|\s*```$/g, "")
  
      return JSON.parse(sanitizedText)
    } catch (error) {
      console.error("Error parsing JSON:", error)
      throw new Error("Invalid JSON format in response")
    }
  }
  
  // Modified generate-similar-questions endpoint
  app.post("/generate-similar-questions", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { originalQuestion, difficulty, userAnswer } = req.body
  
      // Validate input
      if (!originalQuestion || !difficulty) {
        return res.status(400).json({
          error: "Missing required fields: originalQuestion and difficulty",
        })
      }
  
      const prompt = `As a math tutor, help a student understand this concept better.
        Original question: ${originalQuestion.question}
        Student's answer: ${userAnswer}
        Correct answer: ${originalQuestion.answer}
        Difficulty level: ${difficulty}
  
        Please provide:
        1. A similar question that helps reinforce the same concept
        2. Step-by-step guidance on how to solve both the original and new question
        3. Key concepts the student should understand
        4. Common mistakes to avoid
  
        Format the response EXACTLY as a JSON object with the following structure:
        {
          "question": "new similar question",
          "answer": "correct answer",
          "steps": ["step 1", "step 2"],
          "concepts": ["concept 1", "concept 2"],
          "mistakes": ["mistake 1", "mistake 2"]
        }
  
        Do not include any additional text or formatting outside of this JSON structure.`
  
      const result = await model.generateContent(prompt)
      const generatedContent = result.response.text()
  
      // Clean and parse the response
      const parsedResponse = cleanAndParseJSON(generatedContent)
  
      // Store the new question in the database
      const questionsCollection = database.collection("questions")
      await questionsCollection.insertOne({
        ...parsedResponse,
        difficulty,
        generatedFrom: originalQuestion,
        createdAt: new Date(),
      })
  
      res.json(parsedResponse)
    } catch (error) {
      console.error("Error generating similar question:", error)
      res.status(500).json({
        error: "Failed to generate similar question",
        details: error.message,
      })
    }
  })
  
  app.post("/generate-similar-question", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { originalQuestion, difficulty } = req.body
  
      const prompt = `Generate a math question similar to this one, but with different numbers or slight variations. Keep the same difficulty level (${difficulty}) and format:
  
  Original question: ${originalQuestion.question}
  Original answer: ${originalQuestion.answer}
  Original explanation: ${originalQuestion.explanation}
  
  New question:`
  
      
    const result = await model.generateContent(prompt)
    const generatedContent = result.response.text()
  
      // Parse the generated text into a question object
      const newQuestion = parseGeneratedQuestion(generatedContent)
  
      // Save the new question to the database
      const questionsCollection = database.collection("questions")
      await questionsCollection.insertOne(newQuestion)
  
      res.json(newQuestion)
    } catch (error) {
      console.error("Error generating similar question:", error)
      res.status(500).json({ error: "Failed to generate similar question" })
    }
  })
  
  export { database }