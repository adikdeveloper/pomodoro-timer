document.addEventListener('DOMContentLoaded', () => {
    const timeDisplay = document.getElementById('timeDisplay');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const progressRing = document.querySelector('.progress-ring-fg');

    let timeLeft;
    let totalTime;
    let isRunning = false;
    let timer = null;
    let cycles = 0;

    const modes = {
        pomodoro: { time: 25 * 60, label: 'Ishlash' },
        shortBreak: { time: 5 * 60, label: 'Qisqa dam' },
        longBreak: { time: 15 * 60, label: 'Uzoq dam' }
    };

    let currentMode = 'pomodoro';

    // Progress ring setup
    const circumference = 2 * Math.PI * 120;
    progressRing.style.strokeDasharray = circumference;

    function updateProgress(percent) {
        const offset = circumference - (percent / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;
    }

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const progress = ((totalTime - timeLeft) / totalTime) * 100;
        updateProgress(progress);

        // Update cycles dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index < cycles);
        });
        document.getElementById('cycleText').textContent = `Tugallangan sikllar: ${cycles}/4`;
    }

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            startBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
            startBtn.classList.add('pulsing');

            timer = setInterval(() => {
                timeLeft--;
                updateDisplay();

                if (timeLeft <= 0) {
                    clearInterval(timer);
                    isRunning = false;
                    playAlarm();
                    handleModeComplete();
                }
            }, 1000);
        } else {
            clearInterval(timer);
            isRunning = false;
            startBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
            startBtn.classList.remove('pulsing');
        }
    }

    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        startBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        startBtn.classList.remove('pulsing');
        timeLeft = modes[currentMode].time;
        totalTime = timeLeft;
        updateDisplay();
    }

    function switchMode(mode) {
        currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        resetTimer();
    }

    function handleModeComplete() {
        if (currentMode === 'pomodoro') {
            cycles++;
            if (cycles >= 4) {
                cycles = 0;
                switchMode('longBreak');
            } else {
                switchMode('shortBreak');
            }
        } else {
            switchMode('pomodoro');
        }
        startBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        startBtn.classList.remove('pulsing');
    }

    function playAlarm() {
        // Basic beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.5;

        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
    }

    // Event listeners
    startBtn.addEventListener('click', startTimer);
    resetBtn.addEventListener('click', resetTimer);
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    // Initialize
    timeLeft = modes[currentMode].time;
    totalTime = timeLeft;
    updateDisplay();
});