async function getItenaries(body) {
  console.log(body);
  try {
    const response = await fetch(
      "https://1gtw7ttl-8000.inc1.devtunnels.ms/recommendations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to send errror", error);
  }
}

export default getItenaries;
