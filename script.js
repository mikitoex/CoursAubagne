let appData = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentCategoryKey = "";

// CHARGEMENT
document.addEventListener('DOMContentLoaded', () => {
    fetch('quiz.json?t=' + Date.now())
        .then(response => {
            if (!response.ok) { throw new Error("Fichier introuvable"); }
            return response.json();
        })
        .then(data => {
            appData = data;
            generateMenu();
        })
        .catch(err => {
            console.error(err);
            document.getElementById('menu-grid').innerHTML = "<p>Chargement...</p>";
        });
});

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

            card.innerHTML = `
                <div class="icon">${category.icon || '📝'}</div>
                <h3>${category.title}</h3>
                <p>${count} Questions</p>
            `;
            grid.appendChild(card);
        });
    }
}

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
        btnElement.style.backgroundColor = "#d4edda";
        btnElement.style.borderColor = "#28a745";
        document.getElementById('feedback-title').innerText = "✅ Bonne réponse !";
        feedbackBox.classList.add('correct');
        feedbackBox.classList.remove('wrong');
    } else {
        btnElement.style.backgroundColor = "#f8d7da";
        btnElement.style.borderColor = "#dc3545";
        document.getElementById('feedback-title').innerText = "❌ Faux !";
        feedbackBox.classList.add('wrong');
        feedbackBox.classList.remove('correct');
        
        allButtons.forEach(btn => {
            if (btn.innerText === questionObj.answer) {
                btn.style.backgroundColor = "#d4edda";
                btn.style.borderColor = "#28a745";
            }
        });
    }
    
    document.getElementById('feedback-text').innerText = questionObj.explanation || "";
    feedbackBox.classList.remove('hidden');
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

// --- C'EST ICI QUE J'AI FAIT LE CHANGEMENT ---
function showResults() {
    document.getElementById('score').innerText = score;
    document.getElementById('total-questions').innerText = currentQuestions.length;
    
    const rewardSection = document.getElementById('reward-section');
    const pdfLink = document.getElementById('pdf-link');
    const currentCategory = appData.categories.find(c => c.key === currentCategoryKey);

    // On vérifie :
    // 1. Si un PDF existe
    // 2. ET (&&) si le score est égal au nombre total de questions (TOUT JUSTE)
    if (currentCategory && currentCategory.pdf && score === currentQuestions.length) {
        
        rewardSection.innerHTML = `
            <p>🎁 Bravo ! Un score parfait !<br>Voici ton cadeau :</p>
            <a id="pdf-link" href="#" download class="download-btn">📄 Télécharger le Cours (PDF)</a>
        `;
        rewardSection.classList.remove('hidden');

        // Configuration du lien
        let pdfPath = currentCategory.pdf.startsWith('/') ? currentCategory.pdf.substring(1) : currentCategory.pdf;
        const link = document.getElementById('pdf-link');
        link.href = pdfPath;
        link.setAttribute('download', pdfPath);

    } else {
        // Si pas de PDF ou pas le score parfait
        rewardSection.classList.remove('hidden'); // On affiche quand même la zone pour encourager
        rewardSection.innerHTML = `
            <p style="color: #666;">Obtiens <strong>100% de bonnes réponses</strong> pour débloquer le PDF du cours ! 🔒</p>
        `;
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
