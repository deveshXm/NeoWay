async function chatRequest(history, setHistory) {
  try {
    const response = await fetch(
      "https://1gtw7ttl-8000.inc1.devtunnels.ms/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: history }),
      }
    );
    const content = await response.json();
    setHistory([...history, content.botResponse]);
    return content;
  } catch (error) {
    console.error("Failed to send chat history:", error);
  }
}

export default chatRequest;
