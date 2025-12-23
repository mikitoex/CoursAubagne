let appData = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentCategoryKey = "";

// 1. CHARGEMENT (Avec anti-cache)
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

// 2. GÉNÉRER LE MENU (Logique Image vs Emoji)
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

            // --- C'EST ICI QUE TOUT SE JOUE ---
            let iconHtml;

            // CAS 1 : Une image est définie (Priorité absolue)
            if (category.image) {
                let imgPath = category.image.startsWith('/') ? category.image.substring(1) : category.image;
                iconHtml = `<img src="${imgPath}" class="category-img" alt="${category.title}">`;
            
            // CAS 2 : Un emoji est défini
            } else if (category.emoji) {
                iconHtml = `<div class="icon">${category.emoji}</div>`;
            
            // CAS 3 : Rien défini (ou vieux format), on met par défaut
            } else {
                // Compatibilité avec ton ancien système 'icon' s'il existe encore
                let oldIcon = category.icon || '📝'; 
                if (oldIcon.includes('.') || oldIcon.includes('/')) {
                     let oldPath = oldIcon.startsWith('/') ? oldIcon.substring(1) : oldIcon;
                     iconHtml = `<img src="${oldPath}" class="category-img" alt="${category.title}">`;
                } else {
                     iconHtml = `<div class="icon">${oldIcon}</div>`;
                }
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

// 4. RÉSULTATS (Score Parfait = PDF)
function showResults() {
    document.getElementById('score').innerText = score;
    document.getElementById('total-questions').innerText = currentQuestions.length;
    
    const rewardSection = document.getElementById('reward-section');
    const currentCategory = appData.categories.find(c => c.key === currentCategoryKey);

    // CONDITION : Il faut le PDF ET que le score soit parfait (score === total)
    if (currentCategory && currentCategory.pdf && score === currentQuestions.length) {
        let pdfPath = currentCategory.pdf.startsWith('/') ? currentCategory.pdf.substring(1) : currentCategory.pdf;
        
        rewardSection.innerHTML = `
            <p>🎁 <strong>MachaAllah ! Score parfait !</strong><br>Voici ton cadeau :</p>
            <a href="${pdfPath}" download class="download-btn">📄 Télécharger le Cours (PDF)</a>
        `;
        rewardSection.classList.remove('hidden');
    } else if (currentCategory && currentCategory.pdf) {
        // Message d'encouragement
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
