async function pingServer() {
  const startTime = performance.now();
  
  try {
    // HEAD fragt nur den Header ab, lädt nicht die ganze Seite runter (spart Daten)
    await fetch('/', { method: 'GET', mode: 'no-cors' });
    
    const duration = performance.now() - startTime;
    // console.log(`Server ist erreichbar! Antwortzeit: ${duration.toFixed(0)} ms`);
    return duration;
  } catch (error) {
    // console.error("Server ist offline oder nicht erreichbar:", error);
    if(window.location.pathname == '/' || window.location.pathname == '/cart') {
        window.location = "./userAuth?msg=500";
    }
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async (_) => {
    await pingServer();
    setLoginState();
})


function setLoginState() {
  const isLoggedIn = localStorage.getItem('user-letter') !== null;
  const accountIcon = document.querySelector('.user-logged-in');
  console.log("loalStorage --------", localStorage.getItem('user-letter'));
  

  if (isLoggedIn && localStorage.getItem('user-letter') !== 'undefined') {
    accountIcon.innerHTML = `<span class="user-letter">${localStorage.getItem('user-letter')}</span>`;
  }
}
