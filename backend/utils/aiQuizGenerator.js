const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateQuizFromPYQ = async (pyqText, subjectName, numQuestions = 10) => {
  try {
    const prompt = `You are a quiz generator for college students. Based on the following Previous Year Question (PYQ) content for the subject "${subjectName}", generate ${numQuestions} multiple-choice questions.

Each question must have:
- A clear question text
- 4 options (A, B, C, D)
- The correct answer (index 0-3)
- A brief explanation

PYQ Content:
${pyqText}

Return a valid JSON array of objects with fields: questionText, options (array of 4 strings), correctAnswer (number 0-3), explanation`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful quiz generator. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : parsed.questions || parsed.quizzes || [];
  } catch (error) {
    console.error('Groq Quiz generation error:', error.message);
    throw new Error('Failed to generate quiz questions');
  }
};

const generateSubjectQuiz = async ({ subjectName, pyqText, numQuestions = 10, difficulty = 'medium' }) => {
  try {
    const prompt = `You are a quiz generator for college students. Based on the following Previous Year Question (PYQ) content for the subject "${subjectName}", generate ${numQuestions} questions at "${difficulty}" difficulty level.

Create a MIX of question types:
- 60% Objective (MCQ): 4 options, single correct answer
- 40% Subjective: short answer (2-3 sentence) and long answer (paragraph) questions

For subjective questions, provide a model/expected answer.

PYQ Content:
${pyqText}

Return a JSON object with a "questions" array. Each question object has these fields:
- type: "objective" or "subjective"
- questionType: "mcq" for objective, "short" or "long" for subjective
- difficulty: "easy", "medium", or "hard"
- questionText: the question
- options: array of 4 strings (only for objective/mcq)
- correctAnswer: number index 0-3 (only for objective/mcq)
- expectedAnswer: model answer string (only for subjective)
- explanation: brief explanation`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful quiz generator. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 6000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    const parsed = JSON.parse(content);
    return parsed.questions || parsed.quizzes || (Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    console.error('Groq Subject Quiz generation error:', error.message);
    throw new Error('Failed to generate quiz questions');
  }
};

module.exports = { generateQuizFromPYQ, generateSubjectQuiz };