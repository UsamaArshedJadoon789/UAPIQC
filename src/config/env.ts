
export const env = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  username: process.env.TEST_USERNAME || '',
  password: process.env.TEST_PASSWORD || '',
  openAI: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
};
