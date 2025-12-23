// --- BASE DE DONNÉES AVEC EXPLICATIONS ---
const quizzes = {
    // Catégorie 1 : Ablutions (Ton cours)
    ablutions: [
        { 
            question: "Quel est le statut juridique concernant 'quelque chose qui sort des parties intimes' ?", 
            options: ["C'est une divergence", "C'est un consensus (Ijma')", "Cela dépend de la quantité"], 
            answer: "C'est un consensus (Ijma')",
            explanation: "C'est un consensus (Ijma') parmi tous les savants : tout ce qui sort des deux voies annule les ablutions."
        },
        { 
            question: "Concernant le sommeil, qu'est-ce qui annule les ablutions ?", 
            options: ["Dormir, peu importe la durée", "Seulement le sommeil profond", "Dormir allongé uniquement"], 
            answer: "Seulement le sommeil profond",
            explanation: "La distinction est faite selon la profondeur. Dormir profondément (perte de conscience totale) annule les ablutions, peu importe la durée."
        },
        { 
            question: "Si une cause entraîne les grandes ablutions (ex: menstrues), qu'en est-il des petites ablutions ?", 
            options: ["Elles sont annulées aussi", "Elles restent valides", "C'est indépendant"], 
            answer: "Elles sont annulées aussi",
            explanation: "Ce qui oblige au plus grand (Ghusl) oblige forcément à refaire le plus petit (Wudu)."
        },
        { 
            question: "Avis n°1 (Maliki, Shafi'i, Hanbali) : Toucher ses parties intimes...", 
            options: ["Annule directement", "N'annule pas", "Annule seulement avec désir"], 
            answer: "Annule directement",
            explanation: "Pour la majorité (avis n°1), le simple fait de toucher la peau directement annule les ablutions (Preuve : Hadith an-Nasa'i n°447)."
        },
        { 
            question: "Avis n°2 (Hanafi) : Pourquoi disent-ils que toucher n'annule PAS les ablutions ?", 
            options: ["Le hadith est abrogé", "Règles méthodologiques", "Aucune preuve"], 
            answer: "Règles méthodologiques",
            explanation: "Les Hanafites s'appuient sur leurs règles méthodologiques, notant par exemple que le hadith contraire est rapporté par une seule personne."
        },
        { 
            question: "Avis n°3 (Sheikh Al-Uthaymin) : Quelles conditions annulent les ablutions ?", 
            options: ["Toucher longtemps", "Toucher direct + Avec plaisir", "Toucher avec un tissu"], 
            answer: "Toucher direct + Avec plaisir",
            explanation: "Sheikh Al-Uthaymin concilie les preuves : cela annule seulement si deux conditions sont réunies : toucher sans barrage ET avec désir."
        },
        { 
            question: "Quelle est la règle choisie dans ce cours concernant le chameau ?", 
            options: ["Seule la viande rouge annule", "Tout le chameau (viande, graisse...) annule", "Rien n'annule"], 
            answer: "Tout le chameau (viande, graisse...) annule",
            explanation: "L'avis retenu est que manger de la viande de chameau et tout ce qui en découle (graisse, tripes, etc.) annule les ablutions."
        },
        { 
            question: "Quelle est l'exception qui n'annule PAS les ablutions concernant le chameau ?", 
            options: ["La bosse", "La graisse", "Le lait et l'urine"], 
            answer: "Le lait et l'urine",
            explanation: "L'exception concerne uniquement le lait et l'urine du chameau, qui ne rompent pas les ablutions."
        },
        { 
            question: "Pourquoi considérons-nous que TOUT le chameau annule (pas juste le muscle) ?", 
            options: ["Par analogie avec le porc", "C'est une tradition locale", "Par précaution"], 
            answer: "Par analogie avec le porc",
            explanation: "On fait l'analogie avec le porc cité dans le Coran : quand le texte interdit 'la viande', cela englobe tout l'animal."
        }
    ]
    // Tu pourras ajouter d'autres catégories ici plus tard (ex: 'priere': [...])
};

// --- VARIABLES ---
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

// --- FONCTIONS ---

function startQuiz(category) {
    // Si la catégorie n'existe pas ou est vide (pour les boutons "Bientôt")
    if (!quizzes[category]) {
        alert("⚠️ Cette catégorie est en cours de construction !");
        return;
    }

    currentQuestions = quizzes[category];
    currentQuestionIndex = 0;
    score = 0;

    // Mise à jour visuelle
    document.getElementById('category-badge').innerText = category.toUpperCase();
    showScreen('quiz-screen');
    loadQuestion();
}

function loadQuestion() {
    // Cacher la boite de feedback et vider les options précédentes
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

function checkAnswer(selectedOption, btnElement) {
    const questionObj = currentQuestions[currentQuestionIndex];
    const feedbackBox = document.getElementById('feedback-box');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackText = document.getElementById('feedback-text');
    
    // Désactiver tous les boutons pour empêcher le multi-clic
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(btn => btn.disabled = true);

    // Vérification
    if (selectedOption === questionObj.answer) {
        score++;
        btnElement.style.backgroundColor = "#d4edda"; // Fond vert clair
        btnElement.style.borderColor = "#28a745";     // Bordure verte
        btnElement.style.color = "#155724";           // Texte vert foncé
        
        feedbackBox.classList.remove('hidden');
        feedbackBox.classList.add('correct');
        feedbackBox.classList.remove('wrong');
        feedbackTitle.innerText = "✅ Bonne réponse !";
    } else {
        btnElement.style.backgroundColor = "#f8d7da"; // Fond rouge clair
        btnElement.style.borderColor = "#dc3545";     // Bordure rouge
        btnElement.style.color = "#721c24";           // Texte rouge foncé

        // Montrer la bonne réponse
        allButtons.forEach(btn => {
            if (btn.innerText === questionObj.answer) {
                btn.style.backgroundColor = "#d4edda";
                btn.style.borderColor = "#28a745";
            }
        });

        feedbackBox.classList.remove('hidden');
        feedbackBox.classList.add('wrong');
        feedbackBox.classList.remove('correct');
        feedbackTitle.innerText = "❌ Oups... Faux !";
    }

    // Afficher l'explication
    feedbackText.innerText = questionObj.explanation;
}

function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('score').innerText = score;
    document.getElementById('total-questions').innerText = currentQuestions.length;
    showScreen('result-screen');
}

function returnToHome() {
    showScreen('category-screen');
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}