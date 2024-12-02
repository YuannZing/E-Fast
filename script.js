const chatContent = document.getElementById("chat-content");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");

sendButton.addEventListener("click", () => {
  const userMessage = chatInput.value.trim();
  if (userMessage) {
    addMessage(userMessage, "user");
    chatInput.value = "";

    // Simulasi respons AI
    setTimeout(() => {
      addMessage("Ini adalah respons dari AI.", "ai");
    }, 1000);
  }
});

function addMessage(text, type) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message", type);
  messageElement.textContent = text;
  chatContent.appendChild(messageElement);
  chatContent.scrollTop = chatContent.scrollHeight;
}
