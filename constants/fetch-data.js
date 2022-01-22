
module.exports = Object.freeze({
  url: "https://d.flashscore.com/x/feed/",
  baseUrl: "https://www.flashscore.com/",
  // agent: keepaliveAgent,
  options: {
    method: "get",
    headers: {
      authority: "d.flashscore.com",
      Connection: "keep-alive",
      "Keep-Alive": "timeout=5, max=100",
      "Content-Type": "text/plain",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
      "x-fsign": "SW9D1eZo",
    },
  },
  params: {
    headers: {
      authority: "d.flashscore.com",
      Connection: "keep-alive",
      "Content-Type": "text/plain",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
      "x-fsign": "SW9D1eZo",
    },
    // agent: keepaliveAgent,
  },  
});

