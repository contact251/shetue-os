// LPG Dashboard Mock Logic

document.addEventListener('DOMContentLoaded', () => {
    
    // Simulate stock calculation
    setTimeout(() => {
        document.getElementById('val-stock').innerText = "18,450 KG";
    }, 800);

    // Initial tank animation
    setTimeout(() => {
        document.getElementById('tank-1-liquid').style.height = '75%';
        document.getElementById('tank-2-liquid').style.height = '40%';
    }, 100);
});
