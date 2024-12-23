function updateTime(){
    const currentTime = new Date();
    const output =document.getElementById('current-time');
    output.innerHTML = currentTime.toLocaleDateString()+' '+currentTime.toLocaleTimeString();
}
updateTime();

setInterval(updateTime,1000);
