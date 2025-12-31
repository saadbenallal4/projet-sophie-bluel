// Je récupère le formulaire et les champs
const form = document.querySelector(".login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.querySelector(".error-message");

// Écoute de l’envoi du formulaire
form.addEventListener("submit", async function (event) {
  event.preventDefault(); // Empêche le rechargement automatique

  // Récupération des valeurs
  const loginData = {
    email: emailInput.value,
    password: passwordInput.value,
  };

  // On vide les anciens messages d'erreur
  errorMessage.textContent = "";

  // Requête POST vers l’API
const response = await fetch("http://localhost:5678/api/users/login", {

    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(loginData)}
  );

  // Lecture de la réponse JSON
  const data = await response.json();

  // Si identifiants corrects → connexion OK
  if (response.ok) {
    localStorage.setItem("token", data.token); // On stocke le token
    window.location.href = "index.html"; // On redirige vers la page d’accueil
  } 
  // Sinon → erreur affichée
  else {
    errorMessage.textContent = "E-mail ou mot de passe incorrect.";
  }
});
