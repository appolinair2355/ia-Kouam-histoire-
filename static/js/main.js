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

/* ----------  UTILITAIRE  ---------- */
async function call(url, body) {
    const res = await fetch(url, {
        method : 'POST',
        headers: {'Content-Type': 'application/json'},
        body   : JSON.stringify(body)
    });
    return res.json();
}

/* ----------  GÉNÉRATION  ---------- */
genBtn.addEventListener('click', async () => {
    if (!titreIn.value.trim() || !auteurIn.value.trim() || !contenuIn.value.trim()) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

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
    if (data.error) { alert(data.error); return; }

    result.textContent = data.story;
    history[episodeIn.value] = data.story;
});

/* ----------  ÉPISODE SUIVANT  ---------- */
nextBtn.addEventListener('click', () => {
    episodeIn.value = +episodeIn.value + 1;
    contenuIn.value = '';
});

/* ----------  STYLE + EMOJIS  ---------- */
styleBtn.addEventListener('click', async () => {
    if (!result.textContent) { alert("Aucun texte à styliser."); return; }

    const data = await call('/style', {text: result.textContent});
    if (data.error) { alert(data.error); return; }

    // on affiche tel quel (OpenAI renvoie déjà **gras** *italique* emojis)
    result.textContent = data.styled;
});
      
