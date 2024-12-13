import { GoogleGenerativeAI } from "@google/generative-ai";
import MarkdownIt from "markdown-it";
import Base64 from "base64-js";

const API_KEY = "AIzaSyD9kfu12pR3Yqizf_ZqoBzQMr5SXoqCmn0"; // Gantilah dengan API key Anda
const genAI = new GoogleGenerativeAI(API_KEY);

// Ambil elemen DOM
const fileInput = document.querySelector(".file-input");
const inputField = document.querySelector(".input-field");
const textarea = document.querySelector(".input-field");
const submitButton = document.getElementById("submit-btn");
const messagesContainer = document.querySelector(".messages");
const attachmentButton = document.getElementById("attachment-btn");
const filePreviewContainer = document.getElementById("file-preview"); // Elemen untuk menampilkan preview file

let chatHistory = [];

// Fungsi untuk menangani klik tombol attachment
attachmentButton.addEventListener("click", () => {
  fileInput.click(); // Memicu klik pada input file yang tersembunyi
});

// Fungsi untuk menyesuaikan tinggi textarea
textarea.addEventListener("input", () => {
  textarea.style.height = "auto"; // Reset tinggi ke default
  textarea.style.height = `${textarea.scrollHeight}px`; // Set tinggi sesuai konten
});

// Fungsi untuk menyimpan riwayat ke localStorage
function saveHistory() {
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

// Fungsi untuk memuat riwayat dari localStorage
function loadHistory() {
  const storedHistory = localStorage.getItem("chatHistory");
  if (storedHistory) {
    chatHistory = JSON.parse(storedHistory);
    chatHistory.forEach((message) => {
      const isUser = message.role === "user";
      addBubble(message.parts[0].text, isUser);
    });
  }
}

function addToHistory(role, text) {
  chatHistory.push({ role, parts: [{ text }] });
  if (chatHistory.length > 20) {
    chatHistory.shift(); // Batasi panjang history
  }
  saveHistory();
}

// Fungsi untuk menambah bubble chat
function addBubble(text, isUser = true) {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble", isUser ? "user-bubble" : "response-bubble");
  const md = new MarkdownIt();

  if (!isUser) {
    bubble.innerHTML = md.render(text);
  } else {
    bubble.textContent = text;
  }
  messagesContainer.appendChild(bubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll ke bawah
}

// Fungsi untuk menampilkan preview file
fileInput.addEventListener("change", (event) => {
  const files = event.target.files;
  filePreviewContainer.innerHTML = ""; // Kosongkan preview sebelumnya

  Array.from(files).forEach((file) => {
    const fileItem = document.createElement("div");
    fileItem.classList.add("file-item");

    // Tentukan ikon berdasarkan tipe file
    let iconClass;
    if (file.type.startsWith("image/")) {
      iconClass = "fas fa-file-image"; // Ikon gambar
    } else if (file.type.startsWith("audio/")) {
      iconClass = "fas fa-file-audio"; // Ikon audio
    } else if (
      file.type === "application/pdf" ||
      file.type === "application/msword" ||
      file.type.startsWith("application/vnd")
    ) {
      iconClass = "fas fa-file-alt"; // Ikon dokumen
    } else {
      iconClass = "fas fa-file"; // Ikon default
    }

    // Buat elemen ikon
    const fileIcon = document.createElement("i");
    fileIcon.className = iconClass;
    fileIcon.style.marginRight = "8px"; // Jarak ikon dengan nama file

    // Buat elemen nama file
    const fileName = document.createElement("span");
    fileName.classList.add("file-name");
    fileName.textContent = file.name;

    // Buat tombol hapus
    const removeButton = document.createElement("span");
    removeButton.classList.add("file-remove");
    removeButton.textContent = "×";
    removeButton.style.marginLeft = "8px"; // Jarak tombol dengan nama file
    removeButton.addEventListener("click", () => {
      fileItem.remove(); // Hapus preview file
      fileInput.value = ""; // Reset input file
    });

    // Gabungkan elemen-elemen ke dalam file item
    fileItem.appendChild(fileIcon);
    fileItem.appendChild(fileName);
    fileItem.appendChild(removeButton);

    // Tambahkan file item ke container preview
    filePreviewContainer.appendChild(fileItem);
  });
});


// Fungsi untuk menangani submit
async function handleSubmit() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const userInput = inputField.value.trim();
  const file = fileInput.files[0];

  if (userInput || file) {
    // Jika ada file, tambahkan bubble untuk file (UI saja, tanpa mengubah prompt)
    if (file) {
      const fileBubble = document.createElement("div");
      fileBubble.classList.add("bubble", "user-bubble");

      // Tentukan ikon berdasarkan tipe file
      const validMimeTypes = [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/flac",
        "audio/aac",
        "audio/mp4",
        "audio/x-m4a",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/rtf",
        "application/vnd.oasis.opendocument.text",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/bmp",
        "image/tiff",
      ];
      if (!validMimeTypes.includes(file.type)) {
        alert(`Tipe file "${file.type}" tidak didukung.`);
        return;
      }

      let iconClass;
      if (file.type.startsWith("image/")) {
        iconClass = "fas fa-file-image"; // Ikon gambar
      } else if (file.type.startsWith("audio/")) {
        iconClass = "fas fa-file-audio"; // Ikon audio
      } else if (
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type.startsWith("application/vnd")
      ) {
        iconClass = "fas fa-file-alt"; // Ikon dokumen
      } else {
        iconClass = "fas fa-file"; // Ikon default
      }

      const fileIcon = document.createElement("i");
      fileIcon.className = iconClass;
      fileIcon.style.marginRight = "8px";

      const fileName = document.createElement("span");
      fileName.textContent = file.name;

      fileBubble.appendChild(fileIcon);
      fileBubble.appendChild(fileName);
      messagesContainer.appendChild(fileBubble);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Jika ada teks user, tambahkan bubble untuk teks
    if (userInput) {
      addBubble(userInput, true); // Tambahkan bubble untuk pesan user
      addToHistory("user", userInput);
      inputField.value = "";
    }

    // Tambahkan loader sementara untuk respons
    const loaderBubble = document.createElement("div");
    loaderBubble.classList.add("bubble", "response-bubble", "loader-bubble");
    loaderBubble.innerHTML = '<div class="loader"></div>';
    messagesContainer.appendChild(loaderBubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      let contents = [];
      if (file) {
        // Konversi file ke Base64
        const fileBase64 = await file
          .arrayBuffer()
          .then((buffer) => Base64.fromByteArray(new Uint8Array(buffer)));

        contents.push({
          role: "user",
          parts: [
            { inline_data: { mime_type: file.type, data: fileBase64 } },
            ...(userInput ? [{ text: userInput }] : []), // Tambahkan teks jika ada
          ],
        });
      } else {
        contents.push({
          role: "user",
          parts: [{ text: userInput }],
        });
      }

      let fullResponse = "";
      const result = await model.generateContentStream({ contents });
      for await (let response of result.stream) {
        fullResponse += response.text(); // Gabungkan semua chunk
      }

      // Gantikan loader dengan respons teks dari AI
      loaderBubble.innerHTML = marked.parse(fullResponse);
      loaderBubble.classList.remove("loader-bubble");

      chatHistory.push({ role: "model", parts: [{ text: fullResponse }] });
    } catch (error) {
      console.error(error);
      loaderBubble.innerHTML =
        "Oops! Terjadi kesalahan dalam mendapatkan respons.";
    }
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const toggleSidebarBtn = document.getElementById("toggle-sidebar-btn");
  const container = document.querySelector(".container");

  toggleSidebarBtn.addEventListener("click", () => {
    container.classList.toggle("sidebar-hidden");
  });
});


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
