async function chatRequest(history, botState, setHistory, setBotState) {
  try {
    console.log(history, botState, setHistory, setBotState);
    const response = await fetch(
      "https://1gtw7ttl-8000.inc1.devtunnels.ms/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: history, state: botState }),
      }
    );
    const content = await response.json();
    console.log(content);
    setHistory([...history, content.botResponse]);
    setBotState(content.newState);
  } catch (error) {
    console.error("Failed to send chat history:", error);
  }
}

export default chatRequest;
