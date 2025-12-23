let appData = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentCategoryKey = "";

// 1. CHARGEMENT (Avec cache-buster pour mise à jour immédiate)
document.addEventListener('DOMContentLoaded', () => {
    fetch('quiz.json?t=' + Date.now())
        .then(response => {
            if (!response.ok) { throw new Error("Fichier quiz.json introuvable"); }
            return response.json();
        })
        .then(data => {
            appData = data;
            generateMenu();
        })
        .catch(err => {
            console.error(err);
            document.getElementById('menu-grid').innerHTML = "<p style='text-align:center; color:white;'>Chargement des cours...</p>";
        });
});

// 2. GÉNÉRER LE MENU (Gère Images ET Emojis)
function generateMenu() {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;
    
    grid.innerHTML = ""; 

    if (appData.categories) {
        appData.categories.forEach(category => {
            const count = category.questions ? category.questions.length : 0;
            const card = document.createElement('div');
            card.className = count === 0 ? 'card locked' : 'card';
            
            if (count > 0) {
                card.onclick = () => startQuiz(category);
            } else {
                card.onclick = () => alert("En construction !");
            }

            // --- LOGIQUE IMAGE vs EMOJI ---
            let iconHtml;
            // Si c'est une image (contient .png, .jpg, etc)
            if (category.icon && (category.icon.includes('.') || category.icon.includes('/'))) {
                let imgPath = category.icon.startsWith('/') ? category.icon.substring(1) : category.icon;
                iconHtml = `<img src="${imgPath}" class="category-img" alt="${category.title}">`;
            } else {
                // Sinon c'est un emoji ou texte
                iconHtml = `<div class="icon">${category.icon || '📝'}</div>`;
            }

            card.innerHTML = `
                ${iconHtml}
                <h3>${category.title}</h3>
                <p>${count} Questions</p>
            `;
            grid.appendChild(card);
        });
    }
}

// 3. LANCER LE QUIZ
function startQuiz(categoryObj) {
    currentQuestions = categoryObj.questions;
    currentCategoryKey = categoryObj.key;
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('category-badge').innerText = categoryObj.title;
    showScreen('quiz-screen');
    loadQuestion();
}

function loadQuestion() {
    document.getElementById('feedback-box').className = "hidden";
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = "";

    const questionObj = currentQuestions[currentQuestionIndex];
    document.getElementById('question-text').innerText = questionObj.question;
    document.getElementById('progress').innerText = `${currentQuestionIndex + 1} / ${currentQuestions.length}`;

    questionObj.options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option;
        button.className = 'option-btn';
        button.onclick = () => checkAnswer(option, button);
        optionsContainer.appendChild(button);
    });
}

function checkAnswer(selectedOption, btnElement) {
    const questionObj = currentQuestions[currentQuestionIndex];
    const feedbackBox = document.getElementById('feedback-box');
    const allButtons = document.querySelectorAll('.option-btn');
    
    allButtons.forEach(btn => btn.disabled = true);

    if (selectedOption === questionObj.answer) {
        score++;
        styleButton(btnElement, 'correct');
        document.getElementById('feedback-title').innerText = "✅ Bonne réponse !";
        feedbackBox.classList.add('correct');
        feedbackBox.classList.remove('wrong');
    } else {
        styleButton(btnElement, 'wrong');
        document.getElementById('feedback-title').innerText = "❌ Faux !";
        feedbackBox.classList.add('wrong');
        feedbackBox.classList.remove('correct');
        
        allButtons.forEach(btn => {
            if (btn.innerText === questionObj.answer) {
                styleButton(btn, 'correct');
            }
        });
    }
    
    document.getElementById('feedback-text').innerText = questionObj.explanation || "";
    feedbackBox.classList.remove('hidden');
}

function styleButton(btn, type) {
    if (type === 'correct') {
        btn.style.backgroundColor = "#d1fae5";
        btn.style.borderColor = "#10b981";
        btn.style.color = "#064e3b";
    } else {
        btn.style.backgroundColor = "#fee2e2";
        btn.style.borderColor = "#ef4444";
        btn.style.color = "#7f1d1d";
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

// 4. RÉSULTATS (Logique du score parfait)
function showResults() {
    document.getElementById('score').innerText = score;
    document.getElementById('total-questions').innerText = currentQuestions.length;
    
    const rewardSection = document.getElementById('reward-section');
    const currentCategory = appData.categories.find(c => c.key === currentCategoryKey);

    // CONDITION : Il faut le PDF ET un score parfait (égalité)
    if (currentCategory && currentCategory.pdf && score === currentQuestions.length) {
        let pdfPath = currentCategory.pdf.startsWith('/') ? currentCategory.pdf.substring(1) : currentCategory.pdf;
        
        rewardSection.innerHTML = `
            <p>🎁 <strong>MachaAllah ! Score parfait !</strong><br>Voici ton cadeau :</p>
            <a href="${pdfPath}" download class="download-btn">📄 Télécharger le Cours (PDF)</a>
        `;
        rewardSection.classList.remove('hidden');
    } else if (currentCategory && currentCategory.pdf) {
        // Message d'encouragement s'il a raté de peu
        rewardSection.innerHTML = `
            <p style="color: #666; font-size: 0.9rem;">Obtiens <strong>100% de bonnes réponses</strong> pour débloquer le PDF du cours ! 🔒</p>
        `;
        rewardSection.classList.remove('hidden');
    } else {
        rewardSection.classList.add('hidden');
    }
    showScreen('result-screen');
}

function returnToHome() {
    showScreen('category-screen');
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}
