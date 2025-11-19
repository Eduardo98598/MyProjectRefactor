const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.getElementById("chat-input");
const sendChatBtn = document.querySelector(".chat-input span");

// Uená variable para almacenar la clave de API (se cargará desde config.js)
let userApiKey;

const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span>🤖</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

const generateResponse = (chatElement) => {
    console.log(chatInput.value)
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    const messageElement = chatElement.querySelector("p");

    // Opciones para la solicitud a la API
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": userApiKey,
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: chatInput.value
                }]
            }]
        })
    }

    // Enviar solicitud POST a la API, obtener respuesta y establecerla como texto del párrafo
    fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
        messageElement.textContent = data.candidates[0].content.parts[0].text.trim();
    }).catch(() => {
        messageElement.classList.add("error");
        messageElement.textContent = "¡Vaya! Algo salió mal. Por favor, inténtalo de nuevo.";
    }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    const userMessage = chatInput.value.trim();
    if(!userMessage) return;

    //chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => {
    // Cargar la clave de API desde config.js si aún no está cargada
    if (!userApiKey) {
        userApiKey = window.GEMINI_API_KEY;
    }
    document.body.classList.toggle("show-chatbot")
});
