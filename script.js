let appData = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentCategoryKey = "";
let studentName = "";

// 1. CHARGEMENT
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

// NOUVEAU : Sauvegarder le prénom et passer au menu
function saveNameAndStart() {
    const nameInput = document.getElementById('student-name').value.trim();
    if (!nameInput) {
        alert("S'il te plaît, entre ton prénom !");
        return;
    }
    studentName = nameInput;
    document.getElementById('welcome-title').innerText = "Salut " + studentName + " !";
    showScreen('category-screen');
}

// 2. GÉNÉRER LE MENU
function generateMenu() {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;
    
    grid.innerHTML = ""; 

    if (appData.categories) {
        appData.categories.forEach(category => {
            let qCount = 0;
            if (category.bulk_json && category.bulk_json.trim() !== "") {
                try {
                    qCount = JSON.parse(category.bulk_json).length;
                } catch(e) { qCount = 0; }
            } else if (category.questions) {
                qCount = category.questions.length;
            }

            const card = document.createElement('div');
            card.className = qCount === 0 ? 'card locked' : 'card';
            
            if (qCount > 0) {
                card.onclick = () => startQuiz(category);
            } else {
                card.onclick = () => alert("En construction !");
            }

            let iconHtml;
            if (category.image) {
                let imgPath = category.image.startsWith('/') ? category.image.substring(1) : category.image;
                iconHtml = `<img src="${imgPath}" class="category-img" alt="${category.title}">`;
            } else if (category.emoji) {
                iconHtml = `<div class="icon">${category.emoji}</div>`;
            } else {
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
                <p>${qCount} Questions</p>
            `;
            grid.appendChild(card);
        });
    }
}

// 3. LANCER LE QUIZ
function startQuiz(categoryObj) {
    currentCategoryKey = categoryObj.title; // On garde le titre pour l'envoi Netlify
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('category-badge').innerText = categoryObj.title;

    if (categoryObj.bulk_json && categoryObj.bulk_json.trim() !== "") {
        try {
            currentQuestions = JSON.parse(categoryObj.bulk_json);
        } catch (e) {
            alert("Erreur dans le code JSON collé ! Vérifie le format.");
            currentQuestions = categoryObj.questions || [];
        }
    } else {
        currentQuestions = categoryObj.questions || [];
    }

    if (currentQuestions.length === 0) {
        alert("Aucune question trouvée pour ce quiz !");
        return;
    }

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

// 4. RÉSULTATS (Netlify Forms & PDF)
function showResults() {
    document.getElementById('score').innerText = score;
    document.getElementById('total-questions').innerText = currentQuestions.length;
    document.getElementById('result-name-label').innerText = "Bravo " + studentName + " !";
    
    // ENVOI SILENCIEUX DES RESULTATS A NETLIFY
    sendResultsToNetlify();

    const rewardSection = document.getElementById('reward-section');
    const currentCategory = appData.categories.find(c => c.title === currentCategoryKey);

    if (currentCategory && currentCategory.pdf && score === currentQuestions.length) {
        let pdfPath = currentCategory.pdf.startsWith('/') ? currentCategory.pdf.substring(1) : currentCategory.pdf;
        
        rewardSection.innerHTML = `
            <p>🎁 <strong>MachaAllah ! Score parfait !</strong><br>Voici ton cadeau :</p>
            <a href="${pdfPath}" download class="download-btn">📄 Télécharger le Cours (PDF)</a>
        `;
        rewardSection.classList.remove('hidden');
    } else if (currentCategory && currentCategory.pdf) {
        rewardSection.innerHTML = `
            <p style="color: #666; font-size: 0.9rem;">Obtiens <strong>100% de bonnes réponses</strong> pour débloquer le PDF du cours ! 🔒</p>
        `;
        rewardSection.classList.remove('hidden');
    } else {
        rewardSection.classList.add('hidden');
    }
    showScreen('result-screen');
}

function sendResultsToNetlify() {
    const formData = new URLSearchParams();
    formData.append("form-name", "resultats-examens");
    formData.append("prenom", studentName);
    formData.append("examen", currentCategoryKey);
    formData.append("score", score);
    formData.append("total", currentQuestions.length);
    formData.append("pourcentage", Math.round((score / currentQuestions.length) * 100) + "%");

    fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
    }).catch(err => console.error(err));
}

function returnToHome() {
    showScreen('category-screen');
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}