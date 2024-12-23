function startProgress() {
    const progressBar = document.getElementById('progress-bar');
    const timerDisplay = document.getElementById('timer');
    let width = 0;
    let seconds = 0;
    let minutes = 0;
    
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width++;
            progressBar.style.width = width + '%';
            progressBar.innerHTML = width + '%';

            // Update timer
            if (width % 10 === 0) { // Update timer every 10% increment
                seconds += 1;
                if (seconds === 60) {
                    minutes += 1;
                    seconds = 0;
                }
                timerDisplay.innerHTML = 
                    (minutes < 10 ? '0' + minutes : minutes) + ':' + 
                    (seconds < 10 ? '0' + seconds : seconds);
            }
        }
    }, 100);
}