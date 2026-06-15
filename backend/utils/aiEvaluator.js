const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function jaccardSimilarity(a, b) {
  const setA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

const evaluateSubjectiveAnswers = async (answers) => {
  if (!answers || answers.length === 0) return [];

  try {
    const prompt = `You are evaluating student answers for a college quiz. For each question, compare the user's answer against the expected answer and award a score from 0 to 100 based on correctness and similarity.

Be generous with partial credit — if the user captures the core idea, award 70-100. If they partially understand, award 40-69. If they are mostly wrong, award 0-39.

Return a JSON object with a "results" array. Each result has:
- score: number 0-100
- feedback: brief 1-2 sentence constructive feedback

Questions and answers:
${answers.map((a, i) => `
Q${i + 1}: ${a.questionText}
Expected: ${a.expectedAnswer}
User: ${a.userAnswer || '(no answer)'}
`).join('\n')}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a fair grader of student answers. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 4000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    const parsed = JSON.parse(content);
    const results = parsed.results || [];

    return answers.map((a, i) => {
      if (results[i]) {
        return {
          score: Math.max(0, Math.min(100, Math.round(results[i].score))),
          feedback: results[i].feedback || ''
        };
      }
      const fallback = Math.round(jaccardSimilarity(a.expectedAnswer, a.userAnswer || '') * 100);
      return { score: fallback, feedback: '' };
    });
  } catch (error) {
    console.error('AI evaluation error:', error.message);
    return answers.map((a) => ({
      score: Math.round(jaccardSimilarity(a.expectedAnswer, a.userAnswer || '') * 100),
      feedback: ''
    }));
  }
};

module.exports = { evaluateSubjectiveAnswers };
