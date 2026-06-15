const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateSummary = async (text, subjectName) => {
  try {
    const prompt = `You are an AI study assistant. Summarize the following study material for "${subjectName}" in a clear, concise manner.

Focus on:
- Key concepts and definitions
- Important formulas or principles
- Main takeaways

Study Material:
${text.slice(0, 15000)}

Return a JSON object with a single field "summary" containing the summary as plain text (not markdown).`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful study assistant. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');
    const parsed = JSON.parse(content);
    return parsed.summary || '';
  } catch (error) {
    console.error('Groq Summary generation error:', error.message);
    throw new Error('Failed to generate summary');
  }
};

const extractTopics = async (text, subjectName) => {
  try {
    const prompt = `You are an AI study assistant. Extract the most important topics from the following study material for "${subjectName}".

Return a JSON object with a "topics" array of strings (each topic is a short phrase, 3-10 words). List 5-10 key topics.

Study Material:
${text.slice(0, 15000)}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful study assistant. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');
    const parsed = JSON.parse(content);
    return parsed.topics || [];
  } catch (error) {
    console.error('Groq Topics extraction error:', error.message);
    throw new Error('Failed to extract topics');
  }
};

const answerQuestion = async (text, question) => {
  try {
    const prompt = `You are an AI study assistant. Answer the user's question.

Strategy (3 tiers):
1. If the study material contains the full answer, use it — prefix your answer with "[From PDF]"
2. If the material partially addresses it, use both material + your general knowledge — prefix with "[From PDF + Model Knowledge]"
3. If the material does NOT address it at all, answer from your general knowledge — prefix with "[From Model Knowledge]"

NEVER say "not found" or refuse to answer. Always provide an educational response.

Study Material:
${text.slice(0, 15000)}

Question: ${question}

Return a JSON object with a single field "answer" containing your response as plain text with the appropriate source prefix.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful study assistant. Always answer educatively. NEVER say "not found". Use [From PDF], [From PDF + Model Knowledge], or [From Model Knowledge] prefix. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');
    const parsed = JSON.parse(content);
    return parsed.answer || '';
  } catch (error) {
    console.error('Groq Q&A error:', error.message);
    throw new Error('Failed to answer question');
  }
};

module.exports = { generateSummary, extractTopics, answerQuestion };
