import axios from 'axios';

const fetchInfo = async (location, year, openaiApiKey) => {
  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant that provides historical information. Try your best to give alot of information and dont be too strict if you dont find info just give something close.',
    },
    {
      role: 'user',
      content: `(negative years = BC, positive = AD, so -3000 is 3000 BC); In the year:${year}, what were the top historical events in ${location}? Speak like a professional historian/archaelogist`,
    },
  ];

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`, // Use the passed OpenAI API key
      },
    }
  );
  console.log("API response:", response);

  const assistantMessage = response.data.choices[0].message.content;
  return assistantMessage.trim();
};

export default fetchInfo;
