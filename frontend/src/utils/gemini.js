export const runChat = async (prompt) => {
  const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  
  // This URL matches your successful browser test EXACTLY
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `System: You are 'CoreFour Medical Assistant'. Answer only health and medicine questions. User: ${prompt}` }] 
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return `System Error: ${data.error.message}`;
    }

    if (data.candidates && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    
    return "I'm ready, but I couldn't generate a response. Please try again.";

  } catch (err) {
    console.error("Fetch Error:", err);
    return "Network error. Please check your connection.";
  }
};