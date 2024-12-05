// Ambil elemen DOM
const inputField = document.getElementById('input-field');
const submitButton = document.getElementById('submit-btn');
const messagesContainer = document.querySelector('.messages');

// Fungsi untuk menambah bubble chat
function addBubble(text, isUser = true) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble', isUser ? 'user-bubble' : 'response-bubble');
    bubble.textContent = text;
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll ke bawah
}

// Fungsi untuk menangani submit
function handleSubmit() {
    const userInput = inputField.value.trim();
    if (userInput) {
        // Tambahkan teks pengguna sebagai bubble
        addBubble(userInput, true);

        // Bersihkan input
        inputField.value = '';

        // Tambahkan respons otomatis (simulasi)
        setTimeout(() => {
            const response = getResponse(userInput);
            addBubble(response, false);
        }, 500); // Simulasi jeda respons
    }
}

// Fungsi untuk mendapatkan respons (contoh respons sederhana)
function getResponse(input) {
    if (input.toLowerCase().includes('halo')) {
        return 'Halo! Ada yang bisa saya bantu? 😊';
    }
    return 'Terima kasih telah menghubungi! Saya akan membantu Anda.';
}

// Tamb
