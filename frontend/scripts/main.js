async function pingServer() {
  const startTime = performance.now();
  
  try {
    // HEAD fragt nur den Header ab, lädt nicht die ganze Seite runter (spart Daten)
    await fetch('http://localhost:3000', { method: 'GET', mode: 'no-cors' });
    
    const duration = performance.now() - startTime;
    // console.log(`Server ist erreichbar! Antwortzeit: ${duration.toFixed(0)} ms`);
    return duration;
  } catch (error) {
    // console.error("Server ist offline oder nicht erreichbar:", error);
    if(window.location.pathname == '/dashboard.html' || window.location.pathname == '/cart.html') {
        window.location = "./userAuth.html?msg=500";
    }
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async (_) => {
    await pingServer();
})

