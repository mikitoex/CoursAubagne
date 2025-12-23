let appData = {}; // On stockera les données ici
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentCategoryKey = "";

// 1. CHARGEMENT AUTOMATIQUE DES DONNÉES (Lien avec l'Admin)
document.addEventListener('DOMContentLoaded', () => {
    // On ajoute ?t=... pour empêcher le navigateur de garder l'ancien fichier en mémoire
fetch('quiz.json?t=' + Date.now())
        .then(response => {
            if (!response.ok) {
                throw new Error("Impossible de trouver quiz.json");
            }
            return response.json();
        })
        .then(data => {
            // On stocke les données reçues
            appData = data; 
            // On génère le menu d'accueil
            generateMenu();
        })
        .catch(err => {
            console.error("Erreur :", err);
            document.getElementById('menu-grid').innerHTML = "<p>Erreur de chargement des questions.</p>";
        });
});

// 2. GÉNÉRER LE MENU D'ACCUEIL
function generateMenu() {
    const grid = document.getElementById('menu-grid');
    if (!grid) return; // Sécurité si on n'est pas sur la bonne page
    
    grid.innerHTML = ""; 

    // On vérifie si on a bien des catégories
    if (appData.categories) {
        appData.categories.forEach(category => {
            const count = category.questions ? category.questions.length : 0;
            
            const card = document.createElement('div');
            card.className = count === 0 ? 'card locked' : 'card';
            
            // Si la catégorie a des questions, on rend le clic actif
            if (count > 0) {
                card.onclick = () => startQuiz(category);
            } else {
                card.onclick = () => alert("⚠️ Cette section est en construction !");
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

// 3. LANCER UN QUIZ
function startQuiz(categoryObj) {
    currentQuestions = categoryObj.questions;
    currentCategoryKey = categoryObj.key;
    currentQuestionIndex = 0;
    score = 0;

    // Mise à jour du titre
    document.getElementById('category-badge').innerText = categoryObj.title.toUpperCase();
    
    showScreen('quiz-screen');
    loadQuestion();
}

// 4. AFFICHER UNE QUESTION
function loadQuestion() {
    // Reset de l'affichage
    document.getElementById('feedback-box').className = "hidden";
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = "";

    const questionObj = currentQuestions[currentQuestionIndex];

    // Afficher textes
    document.getElementById('question-text').innerText = questionObj.question;
    document.getElementById('progress').innerText = `${currentQuestionIndex + 1} / ${currentQuestions.length}`;

    // Générer boutons
    questionObj.options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option;
        button.classList.add('option-btn');
        button.onclick = () => checkAnswer(option, button);
        optionsContainer.appendChild(button);
    });
}

// 5. VÉRIFIER LA RÉPONSE
function checkAnswer(selectedOption, btnElement) {
    const questionObj = currentQuestions[currentQuestionIndex];
    const feedbackBox = document.getElementById('feedback-box');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackText = document.getElementById('feedback-text');
    
    // Désactiver tous les boutons
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(btn => btn.disabled = true);

    if (selectedOption === questionObj.answer) {
        score++;
        styleButton(btnElement, 'correct');
        
        feedbackBox.classList.remove('hidden');
        feedbackBox.classList.add('correct');
        feedbackBox.classList.remove('wrong');
        feedbackTitle.innerText = "✅ Bonne réponse !";
    } else {
        styleButton(btnElement, 'wrong');

        // Montrer la bonne réponse
        allButtons.forEach(btn => {
            if (btn.innerText === questionObj.answer) {
                styleButton(btn, 'correct');
            }
        });

        feedbackBox.classList.remove('hidden');
        feedbackBox.classList.add('wrong');
        feedbackBox.classList.remove('correct');
        feedbackTitle.innerText = "❌ Faux !";
    }

    feedbackText.innerText = questionObj.explanation || "Pas d'explication supplémentaire.";
}

// Utilitaire pour le style des boutons
function styleButton(btn, type) {
    if (type === 'correct') {
        btn.style.backgroundColor = "#d4edda";
        btn.style.borderColor = "#28a745";
        btn.style.color = "#155724";
    } else {
        btn.style.backgroundColor = "#f8d7da";
        btn.style.borderColor = "#dc3545";
        btn.style.color = "#721c24";
    }
}

// 6. QUESTION SUIVANTE
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

// 7. RÉSULTATS ET PDF
function showResults() {
    document.getElementById('score').innerText = score;
    document.getElementById('total-questions').innerText = currentQuestions.length;
    
    // Gestion du PDF cadeau
    const rewardSection = document.getElementById('reward-section');
    const pdfLink = document.getElementById('pdf-link');
    
    // On retrouve la catégorie actuelle dans les données pour choper le PDF
    const currentCategory = appData.categories.find(c => c.key === currentCategoryKey);

    if (currentCategory && currentCategory.pdf) {
        rewardSection.classList.remove('hidden');
        // Nettoyage du chemin (parfois le CMS met un / au début)
        let pdfPath = currentCategory.pdf.startsWith('/') ? currentCategory.pdf.substring(1) : currentCategory.pdf;
        
        pdfLink.href = pdfPath;
        pdfLink.setAttribute('download', pdfPath);
    } else {
        rewardSection.classList.add('hidden');
    }

    showScreen('result-screen');
}

// NAVIGATION
function returnToHome() {
    showScreen('category-screen');
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

