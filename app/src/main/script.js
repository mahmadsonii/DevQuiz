// 1. Танзимоти аввалиндараҷа ва овозҳо
let langCoins = JSON.parse(localStorage.getItem('langCoins')) || { python: 0, html5: 0, css: 0, js: 0 };
let currentLang = '', currentPart = 0, currentQIdx = 0, correctInPart = 0;

const sounds = {
    correct: new Audio('https://www.soundjay.com/buttons/sounds/button-37a.mp3'),
    wrong: new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3'),
    buy: new Audio('https://www.soundjay.com/misc/sounds/coins-purchase-1.mp3'),
    win: new Audio('https://www.soundjay.com/human/sounds/applause-01.mp3')
};

function playSound(name) {
    if (sounds[name]) {
        sounds[name].currentTime = 0;
        sounds[name].play().catch(e => console.log("Audio error:", e));
    }
}

// 2. Навигатсия ва Экранҳо
function showScreen(screenId, push = true) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');

    // Мо танҳо вақте pushState мекунем, ки ба экрани "Levels" гузарем
    if (push) {
        history.pushState({ screenId: screenId }, "");
    }
}

window.onpopstate = function(event) {
    if (event.state && event.state.screenId) {
        // Агар дар тест бошем ва назад пахш кунем, ба рӯйхати қисмҳо меравем
        if (event.state.screenId === 'quiz-screen') {
            showScreen('level-screen', false);
        } else {
            showScreen(event.state.screenId, false);
        }
    } else {
        // Ҳолати аввала - экрани интихоби забон
        showScreen('lang-screen', false);
    }
};

// 3. Функсияи Тангаҳо
function updateCoins() {
    const coinEl = document.getElementById('user-coins');
    if (coinEl && currentLang) {
        coinEl.innerText = `💰 ${currentLang.toUpperCase()}: ${langCoins[currentLang]}`;
    }
    localStorage.setItem('langCoins', JSON.stringify(langCoins));
}

// 4. Намоиши Қисмҳо ва Харид
function showLevels(lang) {
    currentLang = lang;
    updateCoins();
    const container = document.getElementById('levels-container');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 1; i <= 20; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        
        const isFirst = i === 1;
        const isPrevDone = i > 1 && localStorage.getItem(`${lang}_part${i-1}_done`) === 'true';
        const isBought = localStorage.getItem(`${lang}_part${i}_bought`) === 'true';
        const isDone = localStorage.getItem(`${lang}_part${i}_done`) === 'true';
        
        const price = i * 10;

        btn.innerHTML = `<span>Қисми ${i}</span>`;

        if (isFirst || isPrevDone || isBought || isDone) {
            if (isDone) btn.classList.add('completed');
            btn.onclick = () => startPart(i);
        } else {
            btn.classList.add('locked');
            btn.innerHTML += ` <small>🔒 ${price}</small>`;
            btn.onclick = () => buyLevel(i, price);
        }
        container.appendChild(btn);
    }
    document.getElementById('selected-lang-title').innerText = lang.toUpperCase();
    showScreen('level-screen');
}

function buyLevel(part, price) {
    // 1. Тафтиш: Оё корбар тангаи кофӣ дорад?
    if (langCoins[currentLang] >= price) {
        
        // Пурсиш барои тасдиқи харид
        const confirmBuy = confirm(`Оё мехоҳед Қисми ${part}-ро бо ${price} танга харед?`);
        
        if (confirmBuy) {
            // 2. Кам кардани тангаҳо
            langCoins[currentLang] -= price;
            
            // 3. Сабт дар хотира (localStorage)
            // Мо қайд мекунем, ки ин қисм харида шудааст
            localStorage.setItem(`${currentLang}_part${part}_bought`, 'true');
            
            // Муҳим: Мо инчунин ин қисмро "иҷрошуда" қайд мекунем, 
            // то қисми навбатиаш ҳам ба таври автоматӣ кушода шавад (агар хоҳӣ)
            localStorage.setItem(`${currentLang}_part${part}_done`, 'true'); 
            
            // 4. Эффектҳои визуалӣ ва овозӣ
            updateCoins();       // Нав кардани рақами тангаҳо дар экран
            playSound('buy');    // Овози тангаҳо
            startCoinRain();     // Борони танга дар экран
            
            alert(`🛒 Табрик! Қисми ${part} бомуваффақият харида шуд.`);
            
            // 5. Навсозии рӯйхати тугмаҳо дар экран
            showLevels(currentLang); 
        }
    } else {
        // Агар танга нарасад
        playSound('wrong');
        alert(`😔 Тангаи шумо кам аст! Барои харид ${price} танга лозим, шумо бошад танҳо ${langCoins[currentLang]} танга доред.`);
    }
}


// 5. Логикаи Тест
function startPart(part) {
    currentPart = part;
    currentQIdx = 0;
    correctInPart = 0;
    showScreen('quiz-screen'); // Ин ҳам pushState мекунад
    loadQuestion();
}


function loadQuestion() {
    const questions = allQuestions[currentLang];
    const startIndex = (currentPart - 1) * 10;
    const q = questions[startIndex + currentQIdx];

    document.getElementById('q-counter').innerText = `${currentQIdx + 1}/10`;
    document.getElementById('progress').style.width = `${((currentQIdx + 1) / 10) * 100}%`;
    document.getElementById('question-text').innerText = q.q;
    
    const optContainer = document.getElementById('options');
    optContainer.innerHTML = '';
    
    q.a.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(i, q.c, btn);
        optContainer.appendChild(btn);
    });
}

function checkAnswer(selected, correct, btn) {
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => {
        b.disabled = true;
        b.style.pointerEvents = 'none';
    });

    if (selected === correct) {
        btn.classList.add('correct');
        playSound('correct');
        langCoins[currentLang]++;
        correctInPart++;
    } else {
        btn.classList.add('wrong');
        playSound('wrong');
        btns[correct].classList.add('correct');
    }
    updateCoins();

    setTimeout(() => {
        currentQIdx++;
        if (currentQIdx < 10) loadQuestion();
        else finishPart();
    }, 1200);
}

function finishPart() {
    if (correctInPart >= 8) {
        localStorage.setItem(`${currentLang}_part${currentPart}_done`, 'true');
        langCoins[currentLang] += 10;
        playSound('win');
        alert(`🎉 Офарин! ${correctInPart}/10. Қисми навбатӣ кушода шуд!`);
    } else {
        alert(`🙂 Натиҷа кам аст: ${correctInPart}/10. Ақаллан 8 ҷавоби дуруст диҳед.`);
    }
    updateCoins();
    showLevels(currentLang);
}
function startCoinRain() {
    const coinEmoji = ['💰', '🪙', '✨'];
    for (let i = 0; i < 40; i++) {
        const coin = document.createElement('div');
        coin.className = 'coin-rain';
        coin.innerText = coinEmoji[Math.floor(Math.random() * coinEmoji.length)];
        
        // Мавқеи тасодуфӣ дар экран
        coin.style.left = Math.random() * 100 + 'vw';
        // Суръати тасодуфии афтиш (аз 2 то 4 сония)
        coin.style.animationDuration = (Math.random() * 2 + 2) + 's';
        // Таъхири тасодуфӣ
        coin.style.animationDelay = Math.random() * 2 + 's';
        coin.style.opacity = Math.random();

        document.body.appendChild(coin);

        // Пас аз анҷоми аниматсия элементҳоро дур мекунем
        setTimeout(() => {
            coin.remove();
        }, 5000);
    }
}
function resetLanguageProgress() {
    // Пурсиши тасдиқ, то ки корбар тасодуфӣ пахш накунад
    const confirmReset = confirm(`Оё шумо мехоҳед тамоми натиҷаҳои забони ${currentLang.toUpperCase()}-ро тоза кунед? Тангаҳо ва қисмҳои кушодашуда гум мешаванд!`);

    if (confirmReset) {
        // 1. Тоза кардани қисмҳои гузашташуда ва харидашуда дар хотира
        for (let i = 1; i <= 20; i++) {
            localStorage.removeItem(`${currentLang}_part${i}_done`);
            localStorage.setItem(`${currentLang}_part${i}_bought`, 'false');
        }

        // 2. Баргардонидани тангаҳои ҳамон забон ба 0
        langCoins[currentLang] = 0;
        
        // 3. Сабти тангаҳои нав дар localStorage
        localStorage.setItem('langCoins', JSON.stringify(langCoins));

        // 4. Навсозии экран
        updateCoins();
        showLevels(currentLang);

        alert(`🔄 Пешрафти забони ${currentLang.toUpperCase()} пурра тоза шуд!`);
    }
}

// 6. БОНУС: ИНСТАГРАМ
function followInstagram() {
    if (localStorage.getItem('insta_followed') === 'true') {
        alert("⚠️ Бонус аллакай гирифта шудааст!");
        return;
    }
    window.open('https://www.instagram.com/_mahmadsoni', '_blank');
    setTimeout(() => {
        for (let key in langCoins) { langCoins[key] += 50; }
        localStorage.setItem('insta_followed', 'true');
        updateCoins();
        playSound('buy');
        const btn = document.getElementById('insta-btn');
        if (btn) btn.style.display = 'none';
        alert("🎉 Ташаккур! Ба ҳар забон +50 танга илова шуд!");
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    history.replaceState({ screenId: 'lang-screen' }, "");
    if (localStorage.getItem('insta_followed') === 'true') {
        const btn = document.getElementById('insta-btn');
        if (btn) btn.style.display = 'none';
    }
    updateCoins();
});
