const API_KEY = "sk-DK0Lt1CWGZYnmrL7zCBeCsQjmikpPiv4E5swK7peCzSD1w2W";
const API_URL = "https://api.stability.ai/v2beta/stable-image/generate/sd3";

// Grab DOM elements
const inputField = document.querySelector(".input-field");
const submitButton = document.getElementById("submit-btn");
const messagesContainer = document.querySelector(".messages");



// Chat history
let chatHistory = [];

// Adjust textarea height based on content
inputField.addEventListener("input", () => {
  inputField.style.height = "auto";
  inputField.style.height = `${inputField.scrollHeight}px`;
});

// Save chat history to localStorage
function saveHistory() {
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

// Load chat history from localStorage
function loadHistory() {
  const storedHistory = localStorage.getItem("chatHistory");
  if (storedHistory) {
    chatHistory = JSON.parse(storedHistory);
    chatHistory.forEach((message) => {
      const isUser = message.role === "user";
      if (message.isImage) {
        // Jika pesan adalah gambar, tambahkan sebagai elemen gambar
        addBubble(`<img class="generated-image" src="${message.text}" alt="Generated Image" />`, isUser, true);
      } else {
        // Jika pesan adalah teks, tambahkan sebagai bubble teks
        addBubble(message.text, isUser);
      }
    });
  }
}

// Add a message to chat history
function addToHistory(role, text, isImage = false) {
  chatHistory.push({ role, text, isImage });
  if (chatHistory.length > 20) {
    chatHistory.shift();
  }
  saveHistory();
  
}

// Add a chat bubble to the UI
function addBubble(content, isUser = true, isHtml = false) {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble", isUser ? "user-bubble" : "response-bubble");
  if (isHtml) {
    bubble.innerHTML = content; // Jika konten berupa HTML, gunakan innerHTML
  } else {
    bubble.textContent = content; // Jika konten berupa teks, gunakan textContent
  }
  messagesContainer.appendChild(bubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Generate image using Stable Diffusion API
async function generateImage(prompt) {
  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("output_format", "jpeg");
  formData.append("aspect_ratio", "1:1");
  formData.append("seed", "0");
  formData.append("model", "sd3.5-medium");

  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "image/*",
      },
      responseType: "arraybuffer",
    });

    if (response.status === 200) {
      const base64Image = btoa(
        new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      return `data:image/jpeg;base64,${base64Image}`;
    } else {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

// Handle message submission
async function handleSubmit() {
  const userInput = inputField.value.trim();
  if (userInput) {
    addBubble(userInput, true);
    addToHistory("user", userInput);
    inputField.value = "";

    // Add a loader bubble
    const loaderBubble = document.createElement("div");
    loaderBubble.classList.add("bubble", "response-bubble", "loader-bubble");
    loaderBubble.innerHTML = '<div class="loader"></div>';
    messagesContainer.appendChild(loaderBubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const imageUrl = await generateImage(userInput);

    if (imageUrl) {
      const imgElement = document.createElement("img");
      imgElement.src = imageUrl;
      imgElement.alt = "Generated Image";
      imgElement.classList.add("generated-image");
      loaderBubble.innerHTML = "";
      loaderBubble.appendChild(imgElement); 
      addToHistory("model",imageUrl, true);
    } else {
      loaderBubble.textContent = "Failed to generate image. Please try again.";
    }

    loaderBubble.classList.remove("loader-bubble");
  }
}

// Initialize event listeners
submitButton.addEventListener("click", handleSubmit);
inputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSubmit();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    chatHistory = []; // Kosongkan riwayat di memori
    localStorage.removeItem("chatHistory"); // Hapus dari localStorage
    messagesContainer.innerHTML = "";
  }
});

window.onload = loadHistory;
