/*************************
 * 1. CONSTANTES GLOBALES
 * -----------------------
 * - API_URL : URL de base de l’API fournie
 * - token : jeton stocké dans le localStorage après connexion
 *************************/
const API_URL = "http://localhost:5678/api";
const token = localStorage.getItem("token");


/*************************
 * 2. ÉTAT GLOBAL
 * -----------------------
 * Variables utilisées dans tout le script
 * - works : liste des projets (travaux)
 * - categories : liste des catégories
 *************************/
let works = [];
let categories = [];


/*************************
 * 3. SÉLECTEURS DOM
 * -----------------------
 * Récupération des éléments HTML nécessaires
 *************************/
const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector(".filters");
const modalOverlay = document.getElementById("modal-overlay");
const modalGallery = document.querySelector(".modal-gallery");

const addPhotoForm = document.getElementById("add-photo-form");
const photoInput = document.getElementById("photo-input");
const previewImage = document.getElementById("preview-image");
const photoTitleInput = document.getElementById("photo-title");
const photoCategorySelect = document.getElementById("photo-category");


/*************************
 * 4. APPELS API
 * -----------------------
 * Récupération des données depuis l’API
 *************************/

// Récupère tous les travaux
async function fetchWorks() {
  const response = await fetch(`${API_URL}/works`);
  works = await response.json();
}

// Récupère toutes les catégories
async function fetchCategories() {
  const response = await fetch(`${API_URL}/categories`);
  categories = await response.json();
}


/*************************
 * 5. AFFICHAGE DE LA GALERIE
 * -----------------------
 * Affiche les projets dans la page principale
 *************************/
function displayWorks(list) {
  gallery.innerHTML = ""; // Vide la galerie avant affichage

  list.forEach(work => {
    const figure = document.createElement("figure");

    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <figcaption>${work.title}</figcaption>
    `;

    gallery.appendChild(figure);
  });
}


/*************************
 * 6. FILTRES
 * -----------------------
 * Création et gestion des boutons de filtre
 *************************/
function setupFilters() {
  // Si utilisateur connecté → pas de filtres
  if (token) {
    filtersContainer.style.display = "none";
    return;
  }

  filtersContainer.innerHTML = "";

  // Bouton "Tous"
  const allBtn = document.createElement("button");
  allBtn.textContent = "Tous";
  allBtn.classList.add("filter-btn", "active");

  allBtn.addEventListener("click", () => {
    setActive(allBtn);
    displayWorks(works);
  });

  filtersContainer.appendChild(allBtn);

  // Boutons par catégorie
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat.name;
    btn.classList.add("filter-btn");

    btn.addEventListener("click", () => {
      setActive(btn);
      displayWorks(
        works.filter(w => w.categoryId === cat.id)
      );
    });

    filtersContainer.appendChild(btn);
  });
}

// Gestion du bouton actif
function setActive(activeBtn) {
  document.querySelectorAll(".filter-btn").forEach(btn =>
    btn.classList.remove("active")
  );
  activeBtn.classList.add("active");
}


/*************************
 * 7. MODE ÉDITION (ADMIN)
 * -----------------------
 * Visible uniquement si l’utilisateur est connecté
 *************************/
function setupEditMode() {
  const loginLink = document.querySelector("nav ul li:nth-child(3) a");

  // Utilisateur non connecté
  if (!token) {
    loginLink.textContent = "login";
    return;
  }

  // Gestion logout
  loginLink.textContent = "logout";
  loginLink.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("token");
    location.reload();
  });

  // Bandeau "Mode édition"
  const banner = document.createElement("div");
  banner.className = "edit-banner";
  banner.innerHTML = `
    <p>
      <i class="fa-regular fa-pen-to-square"></i>
      Mode édition
    </p>
  `;
  document.body.prepend(banner);

  // Bouton "modifier"
  const title = document.querySelector("#portfolio h2");
  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.innerHTML = `
    <i class="fa-regular fa-pen-to-square"></i>
    modifier
  `;
  title.appendChild(editBtn);

  editBtn.addEventListener("click", openModal);
}


/*************************
 * 8. MODALE
 * -----------------------
 * Ouverture, fermeture et navigation interne
 *************************/

// Ouvre la modale
function openModal() {
  modalOverlay.style.display = "flex";
  showGallerySection();
  loadModalGallery();
}

// Ferme la modale
function closeModal() {
  modalOverlay.style.display = "none";
}

// Affiche la galerie dans la modale
function showGallerySection() {
  document.querySelector(".modal-gallery-section").style.display = "block";
  document.querySelector(".modal-add-section").style.display = "none";
}

// Affiche la section ajout photo
function showAddSection() {
  document.querySelector(".modal-gallery-section").style.display = "none";
  document.querySelector(".modal-add-section").style.display = "block";
  populateCategorySelect();
}

// Remplit le select catégories
function populateCategorySelect() {
  photoCategorySelect.innerHTML = "";

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    photoCategorySelect.appendChild(option);
  });
}

// Événements modale
function setupModalEvents() {
  document.querySelector(".close-modal").addEventListener("click", closeModal);

  modalOverlay.addEventListener("click", e => {
    if (e.target === modalOverlay) closeModal();
  });

  document
    .querySelector(".open-add-photo")
    .addEventListener("click", showAddSection);

  document
    .querySelector(".back-arrow")
    .addEventListener("click", showGallerySection);
}

/*************************
 * 9. GALERIE DANS LA MODALE
 * -----------------------
 * Affichage + suppression de travaux
 *************************/
function loadModalGallery() {
  modalGallery.innerHTML = "";

  works.forEach(work => {
    const figure = document.createElement("figure");
    figure.classList.add("modal-item");

    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <button class="delete-btn" data-id="${work.id}">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;

    const deleteBtn = figure.querySelector(".delete-btn");

    // Suppression d’un projet
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();

      const id = deleteBtn.dataset.id;

      const response = await fetch(`${API_URL}/works/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Suppression locale
        figure.remove();
        works = works.filter(w => w.id !== Number(id));
        displayWorks(works);
      } else {
        console.error("Erreur lors de la suppression");
      }
    });

    modalGallery.appendChild(figure);
  });
}


/*************************
 * 10. PRÉVISUALISATION IMAGE
 *************************/
function setupImagePreview() {
  photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];
    if (!file) return;

    previewImage.src = URL.createObjectURL(file);
    previewImage.style.display = "block";
  });
}


/*************************
 * 11. AJOUT D’UNE PHOTO
 *************************/
function setupAddPhotoForm() {
  addPhotoForm.addEventListener("submit", async e => {
    e.preventDefault();

    const file = photoInput.files[0];
    const title = photoTitleInput.value.trim();
    const category = photoCategorySelect.value;

    // Vérification des champs
    if (!file || !title || !category) {
      alert("Tous les champs sont obligatoires");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    formData.append("category", category);

    const response = await fetch(`${API_URL}/works`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      alert("Erreur lors de l'ajout");
      return;
    }

    // Mise à jour sans recharger la page
    const newWork = await response.json();
    works.push(newWork);

    displayWorks(works);
    loadModalGallery();
    showGallerySection();

    addPhotoForm.reset();
    previewImage.style.display = "none";
  });
}

/*************************
 * 10. FORMULAIRE CONTACT
 *************************/

// Sélecteurs du formulaire
const contactForm = document.getElementById("contact-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");
const contactError = document.querySelector(".contact-error");

// Regex email : xxx@xxx.xxx
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

contactForm.addEventListener("submit", function (e) {
  e.preventDefault(); // empêche l'envoi automatique

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();

  // Reset message erreur
  contactError.textContent = "";

  // Vérification champs vides
  if (!name || !email || !message) {
    contactError.textContent = "Tous les champs sont obligatoires.";
    return;
  }

  // Vérification format email
  if (!emailRegex.test(email)) {
    contactError.textContent = "Adresse email invalide (ex: nom@email.com).";
    return;
  }

  // Tout est OK
  alert("Message envoyé avec succès !");
  contactForm.reset();
});


/*************************
 * 12. MAIN
 * -----------------------
 * Point d’entrée du script
 *************************/
async function main() {
  await fetchWorks();
  await fetchCategories();

  displayWorks(works);
  setupFilters();
  setupEditMode();
  setupModalEvents();
  setupImagePreview();
  setupAddPhotoForm();
}

// Lancement du script
main();
