const API_URL = "http://localhost:5678/api";
const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector(".filters");


// Récupération des données

async function fetchWorks() {
  const response = await fetch(`${API_URL}/works`);
  return await response.json();
}

async function fetchCategories() {
  const response = await fetch(`${API_URL}/categories`);
  return await response.json();
}


// Affichage de la galerie

function displayWorks(works) {
  gallery.innerHTML = "";

  works.forEach(work => {
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}


// Boutons de filtres

function installFilters(categories, works) {

  // Bouton "Tous"
  const allBtn = document.createElement("button");
  allBtn.textContent = "Tous";
  allBtn.classList.add("filter-btn", "active");

  allBtn.addEventListener("click", () => {
    setActive(allBtn);
    displayWorks(works);
  });

  filtersContainer.appendChild(allBtn);

  // Boutons catégories
  categories.forEach(category => {
    const btn = document.createElement("button");
    btn.textContent = category.name;
    btn.classList.add("filter-btn");

    btn.addEventListener("click", () => {
      setActive(btn);
      const filtered = works.filter(w => w.categoryId === category.id);
      displayWorks(filtered);
    });

    filtersContainer.appendChild(btn);
  });
}


function setActive(activeButton) {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  activeButton.classList.add("active");
}


// Fonction principale

async function main() {
  const works = await fetchWorks();
  const categories = await fetchCategories();

  displayWorks(works);
  installFilters(categories, works);
}

main();


const token = localStorage.getItem("token");

function updateUIForLogin() {
    const loginLink = document.querySelector("nav ul li:nth-child(3)");
    const filters = document.querySelector(".filters");

    if (token) {
        // Remplace "login" par "logout"
        loginLink.textContent = "logout";

        // Ajoute le bandeau noir
        const banner = document.createElement("div");
        banner.className = "edit-banner";
        banner.innerHTML = '<p><i class="fa-regular fa-pen-to-square"></i> Mode édition</p>';
        document.body.prepend(banner);

        // Cache les filtres
        if (filters) filters.style.display = "none";

        // Ajoute bouton "modifier"
        const title = document.querySelector("#portfolio h2");
        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> modifier';
        title.appendChild(editButton);

        // Activation du logout
        loginLink.addEventListener("click", function () {
            localStorage.removeItem("token");
            window.location.reload();
        });

    } else {
        // Si pas connecté → rien de spécial
        loginLink.textContent = "login";
    }
}
updateUIForLogin();

// === OUVERTURE DE LA MODALE ===
const editBtn = document.querySelector(".edit-btn");
const modalOverlay = document.getElementById("modal-overlay");
const closeModal = document.querySelector(".close-modal");

editBtn.addEventListener("click", () => {
    modalOverlay.style.display = "flex";
     document.querySelector(".modal-gallery-section").style.display = "block";
    document.querySelector(".modal-add-section").style.display = "none";
    loadModalGallery();
});

// === FERMETURE ===
closeModal.addEventListener("click", () => {
    modalOverlay.style.display = "none";
});

modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.style.display = "none";
    }
});

const gallerySection = document.querySelector(".modal-gallery-section");
const addSection = document.querySelector(".modal-add-section");
const openAddPhotoBtn = document.querySelector(".open-add-photo");
const backArrow = document.querySelector(".back-arrow");

openAddPhotoBtn.addEventListener("click", () => {
    gallerySection.style.display = "none";
    addSection.style.display = "block";
});

backArrow.addEventListener("click", () => {
    addSection.style.display = "none";
    gallerySection.style.display = "block";
});

async function loadModalGallery() {
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();

    const modalGallery = document.querySelector(".modal-gallery");
    modalGallery.innerHTML = ""; // On vide pour éviter les doublons

    works.forEach(work => {
        const figure = document.createElement("figure");
        figure.classList.add("modal-item");

        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <button class="delete-btn" data-id="${work.id}">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;

        modalGallery.appendChild(figure);
    });
}

openModalButton.addEventListener("click", () => {
    modal.style.display = "flex";
    loadModalGallery(); //  charge toutes les photos
});
