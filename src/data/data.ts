export interface Question {
    difficulty: "entry" | "mid" | "advanced"
    question: string
    answer: string
    explanation: string
    generatedFrom?: string
    steps?: string[]
    concepts?: string[]
    mistakes?: string[]
}

export const questions: Question[] = [
    {
        difficulty: "entry",
        question: "What is 5 + 3",
        answer: "8",
        explanation: " To add 5 and 3, you can count up to 3 more from 5: 6, 7, 8."
    },
    {
        difficulty: "entry",
        question: "What is 10 - 4?",
        answer: "6",
        explanation: "To subtract 4 from 10, you can count backwards 4 steps from 10: 9, 8, 7, 6.",
      },
      {
        difficulty: "entry",
        question: "What is 2 × 6?",
        answer: "12",
        explanation: "2 × 6 means 2 groups of 6. You can count: 6, 12.",
      },
      {
        difficulty: "entry",
        question: "What is 15 ÷ 3?",
        answer: "5",
        explanation: "15 ÷ 3 means how many groups of 3 are in 15. You can count: 3, 6, 9, 12, 15. That's 5 groups.",
      },
      {
        difficulty: "entry",
        question: "What is 7 + 8?",
        answer: "15",
        explanation: "You can break 8 into 3 and 5. Add 3 to 7 to get 10, then add the remaining 5 to get 15.",
      },
      {
        difficulty: "mid",
        question: "What is 13 × 4?",
        answer: "52",
        explanation: "You can break this down: (10 × 4) + (3 × 4) = 40 + 12 = 52.",
      },
      {
        difficulty: "mid",
        question: "What is 72 ÷ 9?",
        answer: "8",
        explanation:
          "Think of this as 'how many 9s are in 72?' You can count by 9s: 9, 18, 27, 36, 45, 54, 63, 72. That's 8 times.",
      },
      {
        difficulty: "mid",
        question: "What is 5² (5 squared)?",
        answer: "25",
        explanation: "5² means 5 × 5 = 25.",
      },
      {
        difficulty: "mid",
        question: "What is the perimeter of a rectangle with length 7 cm and width 3 cm?",
        answer: "20 cm",
        explanation:
          "The perimeter is the distance around the rectangle. You can calculate it by adding all sides: 7 + 3 + 7 + 3 = 20 cm.",
      },
      {
        difficulty: "mid",
        question: "What is 15% of 80?",
        answer: "12",
        explanation: "To calculate 15% of 80, first calculate 10% (8) and 5% (4), then add them together: 8 + 4 = 12.",
      },
      {
        difficulty: "advanced",
        question: "Solve for x: 2x + 7 = 15",
        answer: "4",
        explanation: "Subtract 7 from both sides: 2x = 8. Then divide both sides by 2: x = 4.",
      },
      {
        difficulty: "advanced",
        question: "What is the area of a circle with radius 5 cm? (Use π = 3.14)",
        answer: "78.5 cm²",
        explanation: "The area of a circle is πr². So, 3.14 × 5² = 3.14 × 25 = 78.5 cm².",
      },
      {
        difficulty: "advanced",
        question: "What is the square root of 144?",
        answer: "12",
        explanation:
          "The square root of 144 is the number which, when multiplied by itself, gives 144. 12 × 12 = 144, so the square root is 12.",
      },
      {
        difficulty: "advanced",
        question: "If a car travels at 60 km/h, how far will it travel in 2.5 hours?",
        answer: "150 km",
        explanation: "Distance = Speed × Time. So, 60 km/h × 2.5 h = 150 km.",
      },
      {
        difficulty: "advanced",
        question: "What is the value of 3⁴?",
        answer: "81",
        explanation: "3⁴ means 3 × 3 × 3 × 3 = 81.",
      },
      {
        difficulty: "entry",
        question: "What is 20 - 7?",
        answer: "13",
        explanation: "To subtract 7 from 20, you can count backwards 7 steps from 20: 19, 18, 17, 16, 15, 14, 13.",
      },
      {
        difficulty: "mid",
        question: "What is 1/4 + 1/2?",
        answer: "3/4",
        explanation: "To add fractions, we need a common denominator. 1/2 is equivalent to 2/4. So, 1/4 + 2/4 = 3/4.",
      },
      {
        difficulty: "advanced",
        question: "Simplify: 2(x + 3) - (x - 2)",
        answer: "x + 8",
        explanation: "First, distribute 2: 2x + 6 - (x - 2). Then subtract x and add 2: x + 6 + 2 = x + 8.",
      },
      {
        difficulty: "mid",
        question: "What is the mode of the numbers: 2, 3, 3, 4, 5, 5, 5, 6?",
        answer: "5",
        explanation:
          "The mode is the number that appears most frequently. In this set, 5 appears three times, more than any other number.",
      },
      {
        difficulty: "advanced",
        question: "If f(x) = 2x² + 3x - 1, what is f(2)?",
        answer: "13",
        explanation: "Replace x with 2 in the function: f(2) = 2(2²) + 3(2) - 1 = 2(4) + 6 - 1 = 8 + 6 - 1 = 13.",
      },
]
    