function registerServiceWorker(){navigator.serviceWorker&&navigator.serviceWorker.register("/sw.js").then(()=>{console.log("Service Worker: registered")})["catch"](e=>{console.log("Service Worker: registration failed ",e)})}function isCSSVariablesSupported(){return window.CSS&&window.CSS.supports("color","var(--fake-color")}function changeTheme(e){const r="t-dark"===e.target.value;r?document.documentElement.classList.add("js-t-dark"):document.documentElement.classList.remove("js-t-dark");try{sessionStorage.setItem("t-dark",r)}catch(e){}}function prefersDarkTheme(){try{const r=sessionStorage.getItem("t-dark");return!!("true"===r||"false"!==r&&window.matchMedia("(prefers-color-scheme: dark)").matches)}catch(e){return!1}}function initThemeSelector(){const e=document.querySelector(".theme-selector"),r=e.querySelectorAll('.theme-form input[type="radio"]');prefersDarkTheme()&&(document.getElementById("t-dark").checked=!0,document.documentElement.classList.add("js-t-dark")),r.forEach(e=>{e.addEventListener("click",changeTheme)}),e.classList.remove("hidden")}isCSSVariablesSupported()&&initThemeSelector(),registerServiceWorker();