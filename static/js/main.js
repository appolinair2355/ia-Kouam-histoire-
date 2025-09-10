/* ----------  RÉCUPÉRATION DES CHAMPS  ---------- */
const genBtn    = document.getElementById('genBtn');
const nextBtn   = document.getElementById('nextBtn');
const styleBtn  = document.getElementById('styleBtn');

const titreIn   = document.getElementById('titre');
const episodeIn = document.getElementById('episode');
const auteurIn  = document.getElementById('auteur');
const contenuIn = document.getElementById('contenu');
const minWordsIn= document.getElementById('minWords');
const result    = document.getElementById('result');

let history = {};                 // épisode → texte
let lockUI  = false;              // verrou d’écriture

/* ----------  UTILITAIRE  ---------- */
async function call(url, body) {
    const res = await fetch(window.location.origin + url, {
        method : 'POST',
        headers: {'Content-Type': 'application/json'},
        body   : JSON.stringify(body)
    });
    if (!res.ok) throw new Error("Erreur réseau " + res.status);
    return res.json();
}

function scrollToResult() {
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setUI(disabled) {
    [genBtn, nextBtn, styleBtn].forEach(b => b.disabled = disabled);
    lockUI = disabled;
}

/* ----------  GÉNÉRATION  ---------- */
genBtn.addEventListener('click', async () => {
    if (lockUI) return;
    if (!titreIn.value.trim() || !auteurIn.value.trim() || !contenuIn.value.trim()) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    setUI(true);
    result.style.background = "#fff3cd";
    result.style.border     = "2px solid #ffc107";
    result.textContent      = "⏳⏳  Rédaction de l’histoire en cours…";
    scrollToResult();

    const previous = Object.keys(history).sort((a,b)=>+a-+b)
        .map(ep => `Épisode ${ep} : ${history[ep].split('\n')[0]}`).join('\n');

    const payload = {
        titre    : titreIn.value.trim(),
        episode  : episodeIn.value,
        auteur   : auteurIn.value.trim(),
        contenu  : contenuIn.value.trim(),
        minWords : +minWordsIn.value,
        previous
    };

    const data = await call('/generate', payload);
    if (data.error) { alert(data.error); result.textContent = ""; }
    else            { result.textContent = data.story; history[episodeIn.value] = data.story; }
    setUI(false);
    scrollToResult();
});

/* ----------  ÉPISODE SUIVANT  ---------- */
nextBtn.addEventListener('click', () => {
    if (lockUI) return;
    episodeIn.value = +episodeIn.value + 1;
    contenuIn.value = '';
    contenuIn.focus();
});

/* ----------  STYLE + EMOJIS  ---------- */
styleBtn.addEventListener('click', async () => {
    if (lockUI) return;
    if (!result.textContent) { alert("Aucun texte à styliser."); return; }

    setUI(true);
    result.textContent = "✨ Stylisation en cours…";
    const data = await call('/style', {text: result.textContent});
    if (data.error) { alert(data.error); }
    else            { result.textContent = data.styled; }
    setUI(false);
    scrollToResult();
});
        
