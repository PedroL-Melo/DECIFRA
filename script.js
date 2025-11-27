/* =================================================================== */
/* CLASSE: MINESWEEPER GAME                        */
/* =================================================================== */
class MinesweeperGame {
    constructor() {
        this.currentPhase = 1;
        this.maxPhases = 5;
        this.board = [];
        this.gameOver = false;
        this.rows = 0;
        this.cols = 0;
        this.isGameStarted = false;
        this.initializeElements();
        this.bindEvents();
    }
    initializeElements() {
        this.welcomeScreen = document.getElementById("welcomeScreen");
        this.gameContainer = document.getElementById("gameContainer");
        this.gameGrid = document.getElementById("gameGrid");
        this.currentPhaseEl = document.getElementById("currentPhase");
        this.progressEl = document.getElementById("progress");
        this.gameStatusEl = document.getElementById("gameStatus");
        this.hintText = document.getElementById("hintText");
        this.statusMessage = document.getElementById("statusMessage");
        this.retryButton = document.getElementById("retryButton");
        this.nextPhaseButton = document.getElementById("nextPhaseButton");
        this.startButton = document.getElementById("startButton");
    }
    bindEvents() {
        this.startButton.addEventListener("click", () => this.startGame());
        this.retryButton.addEventListener("click", () => this.retryPhase());
        this.nextPhaseButton.addEventListener("click", () => this.nextPhase());
    }
    startGame() {
        this.welcomeScreen.style.display = "none";
        this.gameContainer.style.display = "block";
        this.isGameStarted = true;
        this.createBoard();
    }
    getBoardSize() {
        return this.currentPhase === 5 ? {
            rows: 9,
            cols: 9
        } : {
            rows: 5,
            cols: 5
        };
    }
    createBoard() {
        const e = this.getBoardSize();
        this.rows = e.rows;
        this.cols = e.cols;
        this.gameGrid.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        this.board = [];
        this.gameGrid.innerHTML = "";
        this.gameOver = false;
        this.updateGameInfo();
        this.updateHint();
        this.hideButtons();
        for (let e = 0; e < this.rows; e++) {
            this.board[e] = [];
            for (let s = 0; s < this.cols; s++) {
                const t = document.createElement("div");
                t.classList.add("cell");
                t.dataset.row = e;
                t.dataset.col = s;
                t.addEventListener("click", e => this.revealCell(e));
                this.board[e][s] = {
                    mine: false,
                    revealed: false,
                    element: t,
                    count: 0
                };
                this.gameGrid.appendChild(t);
            }
        }
        this.applyMinePattern();
        this.calculateCounts();
    }
    defineMineByphase(e, s) {
        switch (this.currentPhase) {
            case 1:
                return e === s || e + s === this.rows - 1;
            case 2:
                return (e + 1) % 2 == 0;
            case 3:
                return e < s;
            case 4:
                return e * e - 3 * s < 0;
            case 5:
                return (e % 2 == 0 && e % 4 == 0) || (e % 2 === 1 && s % 3 == 0);
            default:
                return false;
        }
    }
    getPhaseDescription() {
        return {
            1: "As bombas estão nas diagonais.",
            2: "As bombas estão nas linhas pares.",
            3: "As bombas formam uma matriz triangular superior.",
            4: "Bombas onde a função $a_{ij} = i^2 - 3j < 0$.",
            5: "Padrão complexo: investigue!"
        } [this.currentPhase] || "";
    }
    applyMinePattern() {
        for (let e = 0; e < this.rows; e++)
            for (let s = 0; s < this.cols; s++) this.defineMineByphase(e, s) && (this.board[e][s].mine = true);
    }
    calculateCounts() {
        for (let e = 0; e < this.rows; e++)
            for (let s = 0; s < this.cols; s++) {
                if (this.board[e][s].mine) continue;
                let t = 0;
                for (let l = -1; l <= 1; l++)
                    for (let n = -1; n <= 1; n++) {
                        const o = e + l,
                            r = s + n;
                        o >= 0 && o < this.rows && r >= 0 && r < this.cols && this.board[o][r].mine && t++;
                    }
                this.board[e][s].count = t;
            }
    }
    revealCell(e) {
        if (this.gameOver) return;
        const s = parseInt(e.target.dataset.row),
            t = parseInt(e.target.dataset.col),
            l = this.board[s][t];
        if (l.revealed) return;
        l.revealed = true;
        l.element.classList.add("revealed");
        if (l.mine)
            return (
                l.element.classList.add("mine"),
                (l.element.textContent = "💣"),
                (this.gameOver = true),
                this.showGameOverMessage(),
                this.revealAllMines(),
                void(this.retryButton.style.display = "inline-block")
            );
        l.count > 0 ?
            ((l.element.textContent = l.count), l.element.classList.add("safe")) :
            this.revealAdjacent(s, t);
        this.checkWin();
    }
    revealAdjacent(e, s) {
        for (let t = -1; t <= 1; t++)
            for (let l = -1; l <= 1; l++) {
                const n = e + t,
                    o = s + l;
                if (n >= 0 && n < this.rows && o >= 0 && o < this.cols) {
                    const e = this.board[n][o];
                    e.revealed ||
                        e.mine ||
                        ((e.revealed = true),
                            e.element.classList.add("revealed"),
                            e.count > 0 ?
                            ((e.element.textContent = e.count), e.element.classList.add("safe")) :
                            this.revealAdjacent(n, o));
                }
            }
    }
    revealAllMines() {
        for (let e = 0; e < this.rows; e++)
            for (let s = 0; s < this.cols; s++) {
                const t = this.board[e][s];
                t.mine && !t.revealed && (t.element.classList.add("mine"), (t.element.textContent = "💣"));
            }
    }
    checkWin() {
        let e = 0,
            s = 0;
        for (let t = 0; t < this.rows; t++)
            for (let l = 0; l < this.cols; l++)
                this.board[t][l].revealed && e++, this.board[t][l].mine && s++;
        if (e === this.rows * this.cols - s) {
            this.gameOver = true;
            if (this.currentPhase < this.maxPhases)
                this.showPhaseCompleteMessage(), (this.nextPhaseButton.style.display = "inline-block");
            else this.showGameCompleteMessage();
        }
    }
    showGameOverMessage() {
        this.statusMessage.textContent = "💥 Missão falhou!";
        this.statusMessage.className = "feedback-box feedback-incorrect";
        this.gameStatusEl.textContent = "Eliminado";
    }
    showPhaseCompleteMessage() {
        this.statusMessage.textContent = `🎉 Fase ${this.currentPhase} conquistada!`;
        this.statusMessage.className = "feedback-box feedback-correct";
        this.gameStatusEl.textContent = "Venceu!";
    }
    showGameCompleteMessage() {
        this.statusMessage.textContent = "🏆 MISSÃO COMPLETA!";
        this.statusMessage.className = "feedback-box feedback-correct";
        this.gameStatusEl.textContent = "Mestre!";
    }
    retryPhase() {
        this.createBoard();
    }
    nextPhase() {
        this.currentPhase < this.maxPhases && (this.currentPhase++, this.createBoard());
    }
    updateGameInfo() {
        this.currentPhaseEl.textContent = this.currentPhase;
        this.progressEl.textContent = `${this.currentPhase}/${this.maxPhases}`;
        this.gameStatusEl.textContent = "Em jogo";
    }
    updateHint() {
        this.hintText.innerHTML = this.getPhaseDescription();
    }
    hideButtons() {
        this.statusMessage.className = "feedback-box hidden";
        this.retryButton.style.display = "none";
        this.nextPhaseButton.style.display = "none";
    }
}


// ==========================
// 🧮 CALCULADORA
// ==========================
const calcPanel = document.getElementById("calculator-panel");
const calcBtn = document.getElementById("calculator-button");
const closeCalcBtn = document.getElementById("close-calculator-button");

if (calcBtn && closeCalcBtn) {
    calcBtn.addEventListener("click", () => calcPanel.classList.toggle("open"));
    closeCalcBtn.addEventListener("click", () => calcPanel.classList.remove("open"));
}

function insertCalc(value) {
    document.getElementById("calc-display").value += value;
}

function calcClear() {
    document.getElementById("calc-display").value = "";
}

function calcResult() {
    const display = document.getElementById("calc-display");
    try {
        // Uso intencional de eval para função simples de calculadora
        display.value = eval(display.value); 
    } catch {
        display.value = "Erro";
    }
}


/* =================================================================== */
/* CLASSE: CHATBOT IA (Gemini)                          */
/* =================================================================== */
class ChatBot {
    constructor() {
        // Aponta para o seu servidor local. 
        // Quando hospedar o backend (ex: no Render), troque essa URL.
        this.backendUrl = "http://localhost:3000/api/chat";
        this.isWaiting = false;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.chatHistory = document.getElementById("chatHistory");
        this.messageInput = document.getElementById("messageInput");
        this.sendButton = document.getElementById("sendButton");
        this.statusMessage = document.getElementById("ai-status-message");
    }

    bindEvents() {
        this.sendButton.addEventListener("click", () => this.sendMessage());
        this.messageInput.addEventListener("keyup", e => {
            if (e.key === "Enter") this.sendMessage();
        });
    }

    setLoadingState(isLoading) {
        this.isWaiting = isLoading;
        if (isLoading) {
            if(this.statusMessage) {
                this.statusMessage.textContent = "🤖 Pensando...";
                this.statusMessage.className = "feedback-box feedback-info";
            }
            this.sendButton.disabled = true;
            this.messageInput.disabled = true;
        } else {
            if(this.statusMessage) {
                this.statusMessage.className = "feedback-box hidden";
            }
            this.sendButton.disabled = false;
            this.messageInput.disabled = false;
            this.messageInput.value = "";
            this.messageInput.focus();
        }
    }

    addMessageToHistory(message, sender) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message-bubble ${sender}-message`;
        
        const textP = document.createElement("p");
        // Substituir quebras de linha por <br> se for resposta da IA para melhor formatação
        if (sender === 'ai') {
             textP.innerHTML = message.replace(/\n/g, '<br>');
        } else {
             textP.textContent = message; 
        }
        
        messageDiv.appendChild(textP);
        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    sendMessage() {
        const userText = this.messageInput.value.trim();
        
        if (!userText || this.isWaiting) return;

        // 1. Adiciona mensagem do usuário na tela
        this.addMessageToHistory(userText, "user");
        this.setLoadingState(true);

        // 2. Faz a chamada para o SEU servidor Node, não mais para o Google direto
        fetch(this.backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                message: userText 
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro de comunicação com o servidor.");
            }
            return response.json();
        })
        .then(data => {
            // 3. O servidor devolve um objeto { reply: "texto..." }
            if (data.reply) {
                this.addMessageToHistory(data.reply, "ai");
            } else {
                throw new Error("Resposta inválida do servidor.");
            }
        })
        .catch(error => {
            console.error("Erro no ChatBot:", error);
            if(this.statusMessage) {
                this.statusMessage.textContent = `💥 Erro: Verifique se o servidor Node está rodando.`;
                this.statusMessage.className = "feedback-box feedback-incorrect";
            }
            this.addMessageToHistory("Desculpe, não consegui conectar ao servidor.", "ai");
        })
        .finally(() => {
            this.setLoadingState(false);
        });
    }
}

/* =================================================================== */
/* CLASSE: SYSTEM RACE GAME                        */
/* =================================================================== */
class SystemRaceGame {
    constructor(e, s) {
        this.student = e;
        this.updateDashboard = s;
        this.solutions = {};
        this.timerInterval = null;
        this.startTime = 0;
        this.slotMachineInterval = null;
        this.finalSystemHTML = "";
        this.initializeElements();
        this.initializeCanvas();
        this.bindEvents();
    }
    initializeElements() {
        this.startScreen = document.getElementById("race-start-screen");
        this.gameScreen = document.getElementById("race-game-screen");
        this.generateBtn = document.getElementById("generate-system-btn");
        this.statusDisplay = document.getElementById("race-status");
        this.systemDisplay = document.getElementById("system-display");
        this.timerDisplay = document.getElementById("race-timer");
        this.inputX = document.getElementById("race-input-x");
        this.inputY = document.getElementById("race-input-y");
        this.inputZ = document.getElementById("race-input-z");
        this.submitBtn = document.getElementById("race-submit-btn");
        this.newRaceBtn = document.getElementById("race-new-btn");
        this.feedbackBox = document.getElementById("race-feedback");
    }
    bindEvents() {
        this.generateBtn.addEventListener("click", () => this.startNewRace());
        this.newRaceBtn.addEventListener("click", () => this.startNewRace());
        this.submitBtn.addEventListener("click", () => this.checkSolution());
    }
    initializeCanvas() {
        this.canvas = document.getElementById("drawing-canvas");
        this.ctx = this.canvas.getContext("2d");
        const e = document.getElementById("color-picker"),
            s = document.getElementById("brush-size"),
            t = document.getElementById("eraser-btn"),
            i = document.getElementById("clear-canvas-btn");
        let n = false,
            o = 0,
            a = 0;
        const d = () => {
                const e = this.canvas.getBoundingClientRect();
                this.canvas.width = e.width;
                this.canvas.height = e.height;
            },
            c = (e, s) => (e.touches ? s(e.touches[0]) : s(e)),
            r = e => {
                e.preventDefault();
                c(e, s => {
                    const t = this.canvas.getBoundingClientRect();
                    n = true;
                    [o, a] = [s.clientX - t.left, s.clientY - t.top];
                });
            },
            h = e => {
                if (!n) return;
                e.preventDefault();
                c(e, s => {
                    const t = this.canvas.getBoundingClientRect(),
                        i = [s.clientX - t.left, s.clientY - t.top];
                    this.ctx.beginPath();
                    this.ctx.moveTo(o, a);
                    this.ctx.lineTo(i[0], i[1]);
                    this.ctx.stroke();
                    [o, a] = i;
                });
            },
            l = () => {
                n = false;
            };
        this.canvas.addEventListener("mousedown", r);
        this.canvas.addEventListener("mousemove", h);
        this.canvas.addEventListener("mouseup", l);
        this.canvas.addEventListener("mouseout", l);
        this.canvas.addEventListener("touchstart", r, {
            passive: false
        });
        this.canvas.addEventListener("touchmove", h, {
            passive: false
        });
        this.canvas.addEventListener("touchend", l);
        e.addEventListener("change", s => {
            this.ctx.strokeStyle = s.target.value;
            this.ctx.globalCompositeOperation = "source-over";
        });
        s.addEventListener("input", e => {
            this.ctx.lineWidth = e.target.value;
        });
        t.addEventListener("click", () => {
            this.ctx.globalCompositeOperation = "destination-out";
        });
        i.addEventListener("click", () => this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height));
        this.setupBrush = () => {
            this.ctx.strokeStyle = e.value;
            this.ctx.lineWidth = s.value;
            this.ctx.lineCap = "round";
            this.ctx.lineJoin = "round";
            this.ctx.globalCompositeOperation = "source-over";
        };
        window.addEventListener("resize", d);
        d();
        this.setupBrush();
    }
    // Função auxiliar para formatar a equação de forma mais legível
    formatEquation(a, d, c, r) {
        const h = (e, s) => (0 === e ? "" : `${e > 0 ? "+ " : "- "}${Math.abs(e)}${s}`);
        let l = `${a}x ${h(d, "y")} ${h(c, "z")} = ${r}`
            .replace(/^1x/, "x")
            .replace(/^(-)1x/, "$1x")
            .replace(/^\+ /, "")
            .replace(/\+ -/g, "- ")
            .replace(/- -/g, "+ ");
        return `<p class="equation-line">${l}</p>`;
    }
    generateSystem() {
        const e = (e, s) => Math.floor(Math.random() * (s - e + 1)) + e,
            s = e(-5, 5),
            t = e(-5, 5),
            i = e(-5, 5);
        this.solutions = {
            x: s,
            y: t,
            z: i
        };
        let n = "";
        for (let o = 0; o < 3; o++) {
            // Garante que os coeficientes não sejam zero simultaneamente e usa valores de -9 a 9
            let a, d, c;
            do {
                a = e(-9, 9);
                d = e(-9, 9);
                c = e(-9, 9);
            } while (a === 0 && d === 0 && c === 0);

            const r = a * s + d * t + c * i;
            n += this.formatEquation(a, d, c, r);
        }
        return n;
    }
    generateRandomEquationHTML() {
        const e = (e, s) => Math.floor(Math.random() * (s - e + 1)) + e,
            s = e(1, 9),
            t = e(1, 9),
            i = e(1, 9),
            n = e(-20, 20),
            o = e(0, 1) ? "+" : "-",
            a = e(0, 1) ? "+" : "-";
        return `<p>${s}x ${o} ${t}y ${a} ${i}z = ${n}</p>`;
    }
    startSlotMachineEffect() {
        this.slotMachineInterval = setInterval(() => {
            this.systemDisplay.innerHTML =
                this.generateRandomEquationHTML() +
                this.generateRandomEquationHTML() +
                this.generateRandomEquationHTML();
        }, 60);
    }
    startNewRace() {
        // Para garantir que não haja timers duplos
        this.stopTimer();

        this.startScreen.classList.add("hidden");
        this.gameScreen.classList.remove("hidden");
        this.feedbackBox.classList.add("hidden");
        this.submitBtn.disabled = true;
        [this.inputX.value, this.inputY.value, this.inputZ.value] = ["", "", ""];
        this.finalSystemHTML = this.generateSystem();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.startCountdown();
        this.startSlotMachineEffect();
    }
    startCountdown() {
        let e = 3;
        this.statusDisplay.textContent = e;
        this.systemDisplay.innerHTML = "";
        const s = setInterval(() => {
            e--;
            this.statusDisplay.textContent = e > 0 ? e : "Pode começar!";
            if (e <= 0) {
                clearInterval(s);
                clearInterval(this.slotMachineInterval);
                this.systemDisplay.innerHTML = this.finalSystemHTML;
                setTimeout(() => {
                    this.statusDisplay.textContent = "";
                    this.startTimer();
                    this.submitBtn.disabled = false;
                }, 1000);
            }
        }, 1000);
    }
    startTimer() {
        // Zera o tempo na interface
        this.timerDisplay.textContent = "00:00";
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const e = Math.floor((Date.now() - this.startTime) / 1000),
                s = Math.floor(e / 60)
                .toString()
                .padStart(2, "0"),
                t = (e % 60).toString().padStart(2, "0");
            this.timerDisplay.textContent = `${s}:${t}`;
        }, 1000);
    }
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
    checkSolution() {
        const e = this.stopTimer(), // Para o timer para calcular o tempo total
            s = parseInt(this.inputX.value, 10),
            t = parseInt(this.inputY.value, 10),
            i = parseInt(this.inputZ.value, 10);

        // Desabilita o botão para evitar múltiplas submissões
        this.submitBtn.disabled = true;

        if (s === this.solutions.x && t === this.solutions.y && i === this.solutions.z) {
            let s = 500;
            if (e <= 30) {
                s = 2000;
            } else if (e <= 60) {
                s = 1000;
            }
            this.student.xp += s;
            this.updateDashboard();
            this.showFeedback(`Correto em ${e}s! +${s} XP`, "correct");
        } else {
            this.showFeedback(`Incorreto. A resposta era x=${this.solutions.x}, y=${this.solutions.y}, z=${this.solutions.z}`, "incorrect");
        }
        
        // REINICIA O TIMER para a próxima tentativa ou novo sistema
        this.startTimer(); 
    }
    showFeedback(e, s) {
        this.feedbackBox.textContent = e;
        this.feedbackBox.className = `feedback-box feedback-${s}`;
    }
}

/* =================================================================== */
/* CLASSE: SYSTEM RACE GAME                        */
/* =================================================================== */
class TrincaTrigonometricaGame {
    constructor(updateDashboardCallback) {
        // Callback para atualizar o dashboard principal (se houver um)
        this.updateDashboard = updateDashboardCallback;

        // Configurações do jogo
        this.ANGLES = [30, 45, 60];
        this.exact = {
            30: { sen: '1/2', cos: '√3/2', tan: '√3/3' },
            45: { sen: '√2/2', cos: '√2/2', tan: '1' },
            60: { sen: '√3/2', cos: '1/2', tan: '√3' },
        };
        this.formula = {
            sen: 'co/hip', // cateto oposto / hipotenusa
            cos: 'ca/hip', // cateto adjacente / hipotenusa
            tan: 'co/ca',  // cateto oposto / cateto adjacente
        };

        // Estado do jogo
        this.state = {
            score: 0,
            round: 1,
            best: Number(localStorage.getItem('trinca_drag_best') || 0),
            targetAngle: 45, // Ângulo alvo da rodada atual
            roundOver: false,
        };

        // Referências aos elementos do DOM
        this.els = {};

        this.initializeElements();
        this.bindEvents();
        this.setupGame();
    }

    /**
     * Inicializa as referências aos elementos do DOM.
     */
    initializeElements() {
        this.els.score = document.getElementById('score');
        this.els.round = document.getElementById('round');
        this.els.best = document.getElementById('best');
        this.els.theta = document.getElementById('theta');
        this.els.tray = document.getElementById('tray');
        this.els.btnShuffle = document.getElementById('btnShuffle');
        this.els.btnNew = document.getElementById('btnNew');
        this.els.cheatBody = document.getElementById('cheatBody');
        this.els.studyMode = document.getElementById('studyMode');
        this.els.studyBox = document.getElementById('studyBox');
        this.els.winModal = document.getElementById('winModal');
        this.els.winModalMessage = document.getElementById('winModalMessage');
        this.els.modalBtnClose = document.getElementById('modalBtnClose');
        this.els.modalBtnNewGame = document.getElementById('modalBtnNewGame');
    }

    /**
     * Associa os event listeners aos elementos do DOM.
     */
    bindEvents() {
        this.els.btnShuffle.addEventListener('click', () => this.shuffleCardsInTray());
        this.els.btnNew.addEventListener('click', () => this.startNewRound());
        this.els.studyMode.addEventListener('change', (e) => this.toggleStudyMode(e.target.checked));
        this.els.modalBtnClose.addEventListener('click', () => this.hideModal());
        this.els.modalBtnNewGame.addEventListener('click', () => {
            this.hideModal();
            this.startNewRound();
        });
        this.els.winModal.addEventListener('click', (e) => {
            if (e.target === this.els.winModal) {
                this.hideModal();
            }
        });
    }

    /**
     * Configura o estado inicial do jogo e inicia a primeira rodada.
     */
    setupGame() {
        this.els.best.textContent = this.state.best;
        this.fillCheatTable();
        this.buildRound();
        this.setupDroppableSlots();
    }

    /**
     * Embaralha um array (Fisher-Yates shuffle).
     * @param {Array} a O array a ser embaralhado.
     */
    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
    }

    /**
     * Embaralha as cartas que estão atualmente na bandeja.
     */
    shuffleCardsInTray() {
        const cards = Array.from(this.els.tray.children).filter(n => n.classList.contains('card'));
        this.shuffle(cards);
        this.els.tray.innerHTML = '';
        cards.forEach(c => this.els.tray.appendChild(c));
    }

    /**
     * Inicia uma nova rodada do jogo.
     */
    startNewRound() {
        this.state.round += 1;
        this.buildRound();
    }

    /**
     * Constrói uma nova rodada: escolhe um ângulo, limpa slots e gera novas cartas.
     */
    buildRound() {
        this.state.targetAngle = this.ANGLES[Math.floor(Math.random() * this.ANGLES.length)];
        this.els.theta.textContent = `θ = ${this.state.targetAngle}°`;
        this.state.score = 0;
        this.state.roundOver = false;
        this.updateHUD();
        this.hideModal();

        this.clearAllSlots();
        this.generateAndDisplayCards();
    }

    /**
     * Limpa o conteúdo e o estado visual de todos os slots de destino.
     */
    clearAllSlots() {
        document.querySelectorAll('.slot').forEach(s => {
            s.classList.remove('filled');
            s.textContent = s.dataset.type === 'formula' ? 'Fórmula' : 'Valor';
            s.dataset.func = '';
        });
    }

    /**
     * Gera um novo conjunto de cartas (corretas e distratoras) e as exibe na bandeja.
     */
    generateAndDisplayCards() {
        const cards = [];
        // Cartas corretas para o ângulo alvo
        ['sen', 'cos', 'tan'].forEach(fn => {
            cards.push(this.makeCard('formula', fn, this.formula[fn], fn));
            cards.push(this.makeCard('value', fn, this.exact[this.state.targetAngle][fn], fn));
        });

        // Cartas distratoras para preencher a bandeja
        while (cards.length < 18) { // Manter 18 cartas no total
            const types = ['formula', 'value'];
            const type = types[Math.floor(Math.random() * types.length)];
            const fn = ['sen', 'cos', 'tan'][Math.floor(Math.random() * 3)]; // Escolhe uma função aleatória

            if (type === 'formula') {
                // Distrator de fórmula: usa a fórmula de outra função
                const wrongFn = ['sen', 'cos', 'tan'].filter(x => x !== fn)[Math.floor(Math.random() * 2)];
                cards.push(this.makeCard('formula', fn, this.formula[wrongFn], wrongFn));
            } else {
                // Distrator de valor: usa o valor de outra função ou ângulo
                const otherAngles = this.ANGLES.filter(a => a !== this.state.targetAngle);
                const pickA = otherAngles[Math.floor(Math.random() * otherAngles.length)];
                cards.push(this.makeCard('value', fn, this.exact[pickA][fn], fn + '-wrong'));
            }
        }

        this.shuffle(cards);
        this.els.tray.innerHTML = '';
        cards.forEach(c => this.els.tray.appendChild(c));
    }

    /**
     * Cria um elemento de carta arrastável.
     * @param {string} kind 'formula' ou 'value'.
     * @param {string} fn A função trigonométrica à qual a carta pertence (sen, cos, tan).
     * @param {string} content O texto a ser exibido na carta.
     * @param {string} tag Um identificador auxiliar para a carta.
     * @returns {HTMLElement} O elemento DIV da carta.
     */
    makeCard(kind, fn, content, tag) {
        const el = document.createElement('div');
        el.className = `card ${kind}`;
        el.draggable = true;
        el.dataset.kind = kind;
        el.dataset.func = fn;
        el.dataset.tag = tag || fn;
        el.innerHTML = `<div class="tag">${kind === 'formula' ? 'fórmula' : 'valor'} · ${fn}</div><div class="val">${content}</div>`;

        el.addEventListener('dragstart', e => {
            el.classList.add('dragging');
            e.dataTransfer.setData('text/plain', JSON.stringify({ kind, func: fn, content, tag }));
        });
        el.addEventListener('dragend', () => el.classList.remove('dragging'));
        return el;
    }

    /**
     * Exibe o modal de vitória.
     */
    showModal() {
        this.els.winModalMessage.textContent = `Você completou sen, cos e tan de ${this.state.targetAngle}°.`;
        this.els.winModal.classList.add('visible');
    }

    /**
     * Esconde o modal de vitória.
     */
    hideModal() {
        this.els.winModal.classList.remove('visible');
    }

    /**
     * Configura os event listeners de arrastar e soltar para todos os slots.
     */
    setupDroppableSlots() {
        document.querySelectorAll('.slot').forEach(slot => {
            slot.addEventListener('dragover', e => { e.preventDefault(); }); // Permite o drop
            slot.addEventListener('drop', e => this.handleSlotDrop(e, slot));
        });
    }

    /**
     * Lida com o evento de soltar uma carta em um slot.
     * @param {Event} e O evento de drop.
     * @param {HTMLElement} slot O elemento slot onde a carta foi solta.
     */
    handleSlotDrop(e, slot) {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const parentFunc = slot.closest('.dropzone').dataset.func;
        const expectedType = slot.dataset.type;

        const typeOk = data.kind === expectedType;
        const funcOk = data.func === parentFunc;

        if (typeOk && funcOk) {
            slot.textContent = data.content;
            slot.classList.add('filled');
            slot.dataset.func = parentFunc;
            this.checkProgress();
        } else {
            // Feedback visual para drop incorreto
            slot.style.outline = '2px solid #fb7185';
            setTimeout(() => slot.style.outline = '', 250);
        }
    }

    /**
     * Verifica o progresso do jogo e se a rodada foi completada.
     */
    checkProgress() {
        let completeTrincas = 0;
        document.querySelectorAll('.dropzone').forEach(zone => {
            const formulaFilled = zone.querySelector('.slot[data-type="formula"]').classList.contains('filled');
            const valueFilled = zone.querySelector('.slot[data-type="value"]').classList.contains('filled');
            if (formulaFilled && valueFilled) completeTrincas += 1;
        });

        this.state.score = completeTrincas;
        this.updateHUD();

        if (completeTrincas === 3 && !this.state.roundOver) {
            this.state.roundOver = true;
            this.updateBestScore();
            this.showModal();

            // Opcional: Chama o callback para atualizar o dashboard principal
            if (this.updateDashboard) {
                // Você pode passar informações como XP, tempo, etc.
                this.updateDashboard({
                    game: 'Trigonometrica',
                    result: 'win',
                    xpEarned: 100 // Exemplo de XP
                });
            }
        }
    }

    /**
     * Atualiza o recorde salvo no localStorage.
     */
    updateBestScore() {
        this.state.best = Math.max(this.state.best, this.state.round); // Ou use um sistema de streak
        localStorage.setItem('trinca_drag_best', String(this.state.best));
    }

    /**
     * Atualiza os elementos da interface do usuário (HUD) com o estado atual do jogo.
     */
    updateHUD() {
        this.els.score.textContent = this.state.score;
        this.els.round.textContent = this.state.round;
        this.els.best.textContent = this.state.best;
    }

    /**
     * Preenche a tabela de "colas" (cheats) com os valores trigonométricos.
     */
    fillCheatTable() {
        const rows = this.ANGLES.map(a =>
            `<tr><td>${a}°</td><td>${this.exact[a].sen}</td><td>${this.exact[a].cos}</td><td>${this.exact[a].tan}</td></tr>`
        );
        this.els.cheatBody.innerHTML = rows.join('');
    }

    /**
     * Alterna a visibilidade do modo estudo (tabela de cheats).
     * @param {boolean} isChecked Se o checkbox do modo estudo está marcado.
     */
    toggleStudyMode(isChecked) {
        this.els.studyBox.style.display = isChecked ? 'block' : 'none';
    }
}

// Exemplo de como inicializar a classe
// Certifique-se de que todos os elementos HTML com os IDs correspondentes existem no DOM.
document.addEventListener('DOMContentLoaded', () => {
    // Função de exemplo para o callback de atualização do dashboard
    // Esta função seria definida no seu código principal para interagir com o "dashboard"
    const myUpdateDashboard = (data) => {
        console.log("Dashboard precisa ser atualizado:", data);
        // Ex: Atualizar XP do jogador na interface principal
    };

    const game = new TrincaTrigonometricaGame(myUpdateDashboard);
});


/* =================================================================== */
/* LÓGICA PRINCIPAL: DECIFRA                     */
/* =================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    // Definindo o estado inicial para xp e nível
    const e = {
            level: 0,
            xp: 6000,
            xpToNextLevel: 1000
        },
        // ARRAY DE VÍDEOS ATUALIZADO
        s = [{
            id: "lZ9onrdpusA",
            title: "Introdução às Matrizes",
            desc: "Aprenda o conceito de matrizes, ordem e representação.",
            duration: "12:50"
        }, {
            id: "3hTlEWrGtf8",
            title: "Tipos Especiais de Matrizes",
            desc: "Conheça matrizes transposta, simetrica e ante simétrica.",
            duration: "05:19"
        }, {
            id: "726AOpEEXrw",
            title: "Teoria de Laplace",
            desc: "Neste vídeo, eu trabalho com as noções de menor complementar e cofator de um elemento de uma matriz quadrada, para poder trabalhar o teorema de Laplace. O teorema de Laplace é utilizado para calcular determinantes de ordem superior.",
            duration: "16:10"
        }, {
            id: "40LjiTXFuyY",
            title: "Sistemas Lineares: escalonamento",
            desc: "O escalonamento é um método prático para se resolver sistemas.",
            duration: "12:09"
        }, ],

        // ARRAY DE QUESTÕES COM FORMATAÇÃO SIMPLIFICADA (SEM LATEX COMPLEXO)
        t = [{
            // Questão 1: Determinante 2x2 (Formato simplificado)
            question: "Qual o determinante da matriz [[2, 1], [3, 4]]?",
            options: ["5", "8", "11"],
            answer: "5",
            xp: 80
        }, {
            // Questão 2: Classificação de Sistema
            question: "Classifique o sistema: x+y=5, 2x+2y=10",
            options: ["SPD", "SPI", "SI"],
            answer: "SPI",
            xp: 30
        }, {
            // Questão 3: Classificação de Sistema
            question: "Classifique o sistema: x+y=3, x+y=4",
            options: ["SPD", "SPI", "SI"],
            answer: "SI",
            xp: 30
        }, {
            // Questão 4: Multiplicação de Matriz (Formato simplificado)
            question: "Dadas as matrizes A = [1 2] e B = [[3], [4]], qual o produto A * B?",
            options: ["[11]", "[7]", "[8]"],
            answer: "[11]",
            xp: 120
        }, {
            // Questão 5: Ordem de Matriz
            question: "Qual a ordem da matriz resultante da multiplicação de uma matriz 2x3 por uma matriz 3x4?",
            options: ["2x4", "3x3", "4x2"],
            answer: "2x4",
            xp: 90
        }, {
            // Questão 6: Soma de Matrizes (Formato simplificado)
            question: "Qual a soma das matrizes A = [[1, 0], [0, 1]] e B = [[2, 3], [4, 5]]?",
            options: ["[[3, 3], [4, 6]]", "[[2, 0], [0, 5]]", "[[3, 4], [5, 6]]"],
            answer: "[[3, 3], [4, 6]]",
            xp: 100
        }, {
            // Questão 7: Determinante 3x3 (Formato simplificado)
            question: "Qual o determinante da matriz [[1, 0, 0], [0, 2, 0], [0, 0, 3]]?",
            options: ["1", "6", "0"],
            answer: "6",
            xp: 150
        }, {
            // Questão 8: Transposta (Formato simplificado)
            question: "Se A = [[1, 4], [2, 5], [3, 6]], qual é a matriz transposta A^T?",
            options: ["[[1, 2, 3], [4, 5, 6]]", "[[4, 1], [5, 2], [6, 3]]", "[[6, 5], [4, 3], [2, 1]]"],
            answer: "[[1, 2, 3], [4, 5, 6]]",
            xp: 70
        }, {
            // Questão 9: Inversa de Matriz 2x2 (Formato simplificado)
            question: "Qual a matriz inversa de A = [[2, 1], [1, 1]]?",
            options: ["[[1, -1], [-1, 2]]", "[[2, 1], [-1, 1]]", "[[1, 1], [1, 2]]"],
            answer: "[[1, -1], [-1, 2]]",
            xp: 150
        }, {
            // Questão 10: Propriedade do Determinante
            question: "Se uma matriz quadrada A tem uma linha de zeros, qual é o valor do seu determinante?",
            options: ["1", "-1", "0"],
            answer: "0",
            xp: 50
        }, {
            // Questão 11: Classificação de Sistema 2x2
            question: "Dado o sistema x - 2y = 1 e 3x - 6y = 3, qual sua classificação?",
            options: ["Sistema Possível e Determinado (SPD)", "Sistema Possível e Indeterminado (SPI)", "Sistema Impossível (SI)"],
            answer: "Sistema Possível e Indeterminado (SPI)",
            xp: 80
        }, {
            // Questão 12: Equação de Matriz (Formato simplificado)
            question: "Se X + [[1, 2], [3, 4]] = [[5, 6], [7, 8]], qual é a matriz X?",
            options: ["[[4, 4], [4, 4]]", "[[6, 8], [10, 12]]", "[[4, 8], [4, 12]]"],
            answer: "[[4, 4], [4, 4]]",
            xp: 110
        }, {
            // Questão 13: Elemento da Matriz
            question: "Qual é o elemento a_23 da matriz A = (a_ij) 3x4 definida por a_ij = i + j?",
            options: ["5", "3", "1"],
            answer: "5", // a_23 = 2 + 3 = 5
            xp: 60
        }, ];
    let i = -1;
    const n = document.querySelectorAll(".page-content"),
        o = [...document.querySelectorAll("#desktop-nav .nav-link"), ...document.querySelectorAll("#mobile-nav .nav-link-mobile"), ],
        a = document.getElementById("student-name"),
        d = document.getElementById("student-level"),
        c = document.getElementById("xp-bar"),
        r = document.getElementById("name-modal"),
        h = document.getElementById("name-input"),
        l = document.getElementById("save-name-btn"),
        m = document.getElementById("menu-button"),
        u = document.getElementById("close-menu-button"),
        g = document.getElementById("mobile-menu-overlay"),
        p = document.getElementById("mobile-nav-container"),
        y = document.getElementById("notification-button"),
        b = document.getElementById("notifications-popup"),
        v = document.getElementById("notes-button"),
        f = document.getElementById("notes-panel"),
        E = document.getElementById("close-notes-button"),
        L = document.getElementById("notes-textarea"),
        k = document.getElementById("save-notes-btn"),
        I = document.getElementById("save-notes-feedback"),
        x = document.getElementById("video-list-container"),
        w = document.getElementById("main-video-player"),
        N = document.getElementById("video-title"),
        S = document.getElementById("video-description"),
        q = document.getElementById("question-container"),
        B = document.getElementById("feedback-container"),
        H = document.getElementById("next-question-btn"),
        A = document.querySelectorAll(".minigame-tab-btn"),
        C = document.querySelectorAll(".minigame-content"),
        // NOVO: Elementos de Tema
        themeToggleBtn = document.getElementById("theme-toggle-button"),
        sunIcon = document.getElementById("sun-icon"),
        moonIcon = document.getElementById("moon-icon"),

        // D é a função de atualização do Dashboard
        D = () => {
            // CORREÇÃO DO BUG DO XP/NÍVEL: 
            // Garante que o cálculo para a próxima meta use a meta do nível atual.
            while (e.xp >= e.xpToNextLevel) {
                e.level++;
                e.xp -= e.xpToNextLevel;
                // Calcula a próxima meta de XP APÓS a subida de nível
                e.xpToNextLevel = Math.floor(1.5 * e.xpToNextLevel); 
            }
            d.textContent = e.level;
            const s = (e.xp / e.xpToNextLevel) * 100;
            c.style.width = `${s}%`;
            const xpText = document.getElementById("xp-text");
            if (xpText) xpText.textContent = `${e.xp}/${e.xpToNextLevel} XP`;
        },
        M = e => {
            n.forEach(s => s.classList.toggle("hidden", s.id !== e));
            const s = `#${e}`;
            o.forEach(e => e.classList.toggle("active", e.getAttribute("href") === s));
            P();
        },
        P = () => {
            p.classList.remove("open");
            setTimeout(() => g.classList.add("hidden"), 300);
        },
        loadThemePreference = () => {
            const savedTheme = localStorage.getItem("decifra-theme");
            const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
            
            // Se a preferência for 'light' ou não houver preferência salva e o sistema preferir light
            if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
                document.body.classList.add("light-mode");
                if (sunIcon && moonIcon) {
                    sunIcon.style.display = "block";
                    moonIcon.style.display = "none";
                }
            } else {
                // Modo escuro (dark)
                document.body.classList.remove("light-mode");
                if (sunIcon && moonIcon) {
                    sunIcon.style.display = "none";
                    moonIcon.style.display = "block";
                }
            }
        },
        toggleTheme = () => {
            const isLight = document.body.classList.toggle("light-mode");
            const newTheme = isLight ? "light" : "dark";
            localStorage.setItem("decifra-theme", newTheme);

            // Alterna a exibição dos ícones
            if (sunIcon && moonIcon) {
                sunIcon.style.display = isLight ? "block" : "none";
                moonIcon.style.display = isLight ? "none" : "block";
            }
        },
        T = () => {
            const s = localStorage.getItem("decifra-username");
            s ? (a.textContent = s) : r.classList.remove("hidden");
            D();
        },
        U = () => {
            const e = h.value.trim();
            e && (localStorage.setItem("decifra-username", e), (a.textContent = e), r.classList.add("hidden"));
        },
        _ = () => {
            const e = b.style.display,
                s = "none" === e || !e;
            b.style.display = s ? "block" : "none";
        },
        F = () => f.classList.toggle("open"),
        G = () => {
            localStorage.setItem("decifra-notes", L.value);
            I.style.opacity = 1;
            setTimeout(() => (I.style.opacity = 0), 2000);
        },
        J = () => {
            const e = localStorage.getItem("decifra-notes");
            e && (L.value = e);
        },
        K = () => {
            x.innerHTML = "";
            s.forEach((e, s) => {
                const t = document.createElement("div");
                t.className = "video-item";
                t.dataset.videoId = e.id;
                t.dataset.videoTitle = e.title;
                t.dataset.videoDesc = e.desc;
                // Usa o ID do YouTube para gerar o thumbnail
                t.innerHTML = `<img src="https://img.youtube.com/vi/${e.id}/mqdefault.jpg" alt="${e.title}"><div class="video-item-info"><h4>${e.title}</h4><p>${e.duration}</p></div>`;
                // Se for o primeiro vídeo, define ele como o player principal
                if (s === 0) {
                    t.classList.add("active");
                    w.src = `https://www.youtube.com/embed/${e.id}`;
                    N.textContent = e.title;
                    S.textContent = e.desc;
                }
                x.appendChild(t);
            });
        },
        O = e => {
            // Garante que a URL do embed seja construída corretamente
            w.src = `https://www.youtube.com/embed/${e.dataset.videoId}`;
            N.textContent = e.dataset.videoTitle;
            S.textContent = e.dataset.videoDesc;
            document.querySelectorAll(".video-item").forEach(e => e.classList.remove("active"));
            e.classList.add("active");
        },
        Q = () => {
            i = Math.floor(Math.random() * t.length);
            const e = t[i];
            // NÃO USA MAIS LATEX complexo aqui, apenas texto simples.
            q.innerHTML = `<h3>${e.question}</h3><div id="options-list" style="margin-top:1rem;display:flex;flex-direction:column;gap:0.75rem;">${e.options.map(e=>`<label class="question-option"><input type="radio" name="answer" value="${e}" style="margin-right:0.5rem">${e}</label>`).join("")}</div>`;
            B.classList.add("hidden");
            document.querySelectorAll('input[name="answer"]').forEach(e => e.addEventListener("change", R));
        },
        R = () => {
            const s = document.querySelector('input[name="answer"]:checked');
            if (!s) return;
            const n = t[i];
            if (s.value === n.answer) {
                V(`Correto! +${n.xp} XP`, "correct");
                e.xp += n.xp;
                D();
            } else {
                V(`Incorreto. A resposta certa é ${n.answer}.`, "incorrect");
            }
            document.querySelectorAll('input[name="answer"]').forEach(e => (e.disabled = true));
        },
        V = (e, s) => {
            B.textContent = e;
            B.className = `feedback-box feedback-${s}`;
        };
    
    // --- Event Listeners ---
    o.forEach(e =>
        e.addEventListener("click", s => {
            s.preventDefault();
            M(e.getAttribute("href").substring(1));
        })
    );
    l.addEventListener("click", U);
    h.addEventListener("keypress", e => {
        "Enter" === e.key && U();
    });
    m.addEventListener("click", () => {
        (e => {
            g.classList.remove("hidden");
            setTimeout(() => p.classList.add("open"), 10);
        })();
    });
    u.addEventListener("click", P);
    g.addEventListener("click", e => {
        e.target === g && P();
    });
    y.addEventListener("click", e => {
        e.stopPropagation();
        _();
    });
    document.addEventListener("click", e => {
        b.contains(e.target) || e.target === y || (b.style.display = "none");
    });
    v.addEventListener("click", F);
    E.addEventListener("click", F);
    k.addEventListener("click", G);
    x.addEventListener("click", e => {
        const s = e.target.closest(".video-item");
        s && O(s);
    });
    H.addEventListener("click", Q);
    A.forEach(e => {
        e.addEventListener("click", () => {
            A.forEach(e => e.classList.remove("active"));
            e.classList.add("active");
            const s = e.dataset.target;
            C.forEach(e => e.classList.toggle("hidden", e.id !== s));
        });
    });

    // NOVO: Listener para alternar o tema
    themeToggleBtn.addEventListener("click", toggleTheme);

    // --- Inicialização ---
    T();
    J();
    K();
    Q();
    M("dashboard");
    loadThemePreference(); // Carrega a preferência de tema ao iniciar
    new MinesweeperGame();
    new ChatBot();
    new SystemRaceGame(e, D);

});
