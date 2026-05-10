const OpenAI = require('openai');

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

const generateCVText = async (full_name, skills, profession_category, city, education, experience) => {
  const prompt = `Generate a professional CV summary in English for a student named ${full_name}. 
Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
${profession_category ? `Category: ${profession_category}` : ''}
${city ? `Location: ${city}` : ''}
${education ? `Education: ${education}` : ''}
${experience ? `Experience: ${experience}` : ''}
Write 2-3 sentences highlighting their strengths and what they are looking for. Keep it concise.`;

  const completion = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });
  return completion.choices[0].message.content;
};

const parseEmployerQuery = async (query) => {
  const prompt = `Extract search filters from this employer query for student profiles.
Query: "${query}"
Return JSON with these fields (only if mentioned, otherwise omit):
- gender: "male" or "female"
- min_age: number
- max_age: number
- degree: string
- city: string
- skills: array of strings
Example: {"gender":"female","min_age":20,"max_age":30,"degree":"electrical engineering","city":"Cairo","skills":["autocad","matlab"]}
Only output valid JSON, no explanation.`;

  const completion = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  });
  return JSON.parse(completion.choices[0].message.content.trim());
};

module.exports = { generateCVText, parseEmployerQuery };
