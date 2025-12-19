/*************************
 * 1. CONSTANTES GLOBALES
 *************************/
const API_URL = "http://localhost:5678/api";
const token = localStorage.getItem("token");

/*************************
 * 2. ÉTAT GLOBAL
 *************************/
let works = [];
let categories = [];

/*************************
 * 3. SÉLECTEURS DOM
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
 * 4. API
 *************************/
async function fetchWorks() {
  const response = await fetch(`${API_URL}/works`);
  works = await response.json();
}

async function fetchCategories() {
  const response = await fetch(`${API_URL}/categories`);
  categories = await response.json();
}

/*************************
 * 5. AFFICHAGE GALERIE
 *************************/
function displayWorks(list) {
  gallery.innerHTML = "";

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
 *************************/
function setupFilters() {
  if (token) {
    filtersContainer.style.display = "none";
    return;
  }

  filtersContainer.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.textContent = "Tous";
  allBtn.classList.add("filter-btn", "active");
  allBtn.addEventListener("click", () => {
    setActive(allBtn);
    displayWorks(works);
  });
  filtersContainer.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat.name;
    btn.classList.add("filter-btn");

    btn.addEventListener("click", () => {
      setActive(btn);
      displayWorks(works.filter(w => w.categoryId === cat.id));
    });

    filtersContainer.appendChild(btn);
  });
}

function setActive(activeBtn) {
  document.querySelectorAll(".filter-btn").forEach(btn =>
    btn.classList.remove("active")
  );
  activeBtn.classList.add("active");
}

/*************************
 * 7. MODE ÉDITION
 *************************/
function setupEditMode() {
  const loginLink = document.querySelector("nav ul li:nth-child(3) a");

  if (!token) {
    loginLink.textContent = "login";
    return;
  }

  // logout
  loginLink.textContent = "logout";
  loginLink.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("token");
    location.reload();
  });

  // bandeau noir
  const banner = document.createElement("div");
  banner.className = "edit-banner";
  banner.innerHTML = `<p><i class="fa-regular fa-pen-to-square"></i> Mode édition</p>`;
  document.body.prepend(banner);

  // bouton modifier
  const title = document.querySelector("#portfolio h2");
  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> modifier`;
  title.appendChild(editBtn);

  editBtn.addEventListener("click", openModal);
}

/*************************
 * 8. MODALE
 *************************/
function openModal() {
  modalOverlay.style.display = "flex";
  showGallerySection();
  loadModalGallery();
}

function closeModal() {
  modalOverlay.style.display = "none";
}

function showGallerySection() {
  document.querySelector(".modal-gallery-section").style.display = "block";
  document.querySelector(".modal-add-section").style.display = "none";
}

function populateCategorySelect() {
  photoCategorySelect.innerHTML = "";

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    photoCategorySelect.appendChild(option);
  });
}

function showAddSection() {
  document.querySelector(".modal-gallery-section").style.display = "none";
  document.querySelector(".modal-add-section").style.display = "block";
  populateCategorySelect();
}

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

    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();

      const id = deleteBtn.dataset.id;
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/works/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Supprime dans la modale
        figure.remove();

        // Supprime dans la galerie principale (sans recharger)
        works = works.filter(w => w.id !== Number(id));
        displayWorks(works);
      } else {
        console.error("Erreur lors de la suppression");
      }
    });

    modalGallery.appendChild(figure);
  });
}

function setupImagePreview() {
  photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];
    if (!file) return;

    previewImage.src = URL.createObjectURL(file);
    previewImage.style.display = "block";
  });
}

function populateCategorySelect() {
  photoCategorySelect.innerHTML = "";

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    photoCategorySelect.appendChild(option);
  });
}

function setupAddPhotoForm() {
  addPhotoForm.addEventListener("submit", async e => {
    e.preventDefault();

    const file = photoInput.files[0];
    const title = photoTitleInput.value.trim();
    const category = photoCategorySelect.value;

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

    const newWork = await response.json();

    works.push(newWork);
    displayWorks(works);
    loadModalGallery();
    showGallerySection();
    addPhotoForm.reset();
    previewImage.style.display = "none";
  });
}

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) return;

  previewImage.src = URL.createObjectURL(file);
  previewImage.style.display = "block";
});




/*************************
 * 9. MAIN
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

main();
