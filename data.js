const appData = {
    // --- CATÉGORIE 1 ---
    ablutions: {
        title: "Les Annulatifs",     // Titre sur le bouton
        icon: "💧",                  // Icône sur le bouton
        pdf: "cours_ablutions.pdf",  // Nom du fichier PDF à gagner (doit être dans le dossier)
        questions: [
            { 
                question: "Quel est le statut de ce qui sort des parties intimes ?", 
                options: ["Divergence", "Consensus (Ijma')", "Dépend de la quantité"], 
                answer: "Consensus (Ijma')",
                explanation: "C'est un consensus (Ijma') : tout ce qui sort des deux voies annule les ablutions."
            },
            { 
                question: "Le sommeil annule-t-il les ablutions ?", 
                options: ["Oui, toujours", "Non, jamais", "Seulement le sommeil profond"], 
                answer: "Seulement le sommeil profond",
                explanation: "Seule la perte de conscience totale (sommeil profond) annule les ablutions."
            }
            // Tu peux ajouter d'autres questions ici...
        ]
    },

    // --- CATÉGORIE 2 (Exemple pour te montrer) ---
    priere: {
        title: "La Prière",
        icon: "uD83EuDD32", // Emoji prière
        pdf: "cours_priere.pdf", // Tu devras mettre ce fichier dans le dossier
        questions: [
            { 
                question: "Combien y a-t-il de prières obligatoires ?", 
                options: ["3", "4", "5"], 
                answer: "5",
                explanation: "Il y a 5 prières obligatoires par jour : Fajr, Dhuhr, Asr, Maghrib, Isha."
            },
            {
                question: "Quelle est la première sourate du Coran ?",
                options: ["Al-Baqara", "Al-Fatiha", "Al-Nas"],
                answer: "Al-Fatiha",
                explanation: "La sourate Al-Fatiha (l'Ouverture) est la première sourate."
            }
        ]
    },

    // --- CATÉGORIE 3 (Vide pour l'instant) ---
    // Tu pourras décommenter et remplir ça plus tard
    /*
    jeune: {
        title: "Le Jeûne",
        icon: "🌙",
        pdf: "cours_jeune.pdf",
        questions: []
    }
    */
};