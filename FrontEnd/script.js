const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector(".filters");

let allWorks = [];

// Je charge les projets
async function loadWorks() {
  const response = await fetch("http://localhost:5678/api/works");
  allWorks = await response.json();
  displayWorks(allWorks);
}

// J'affiche les projets dans la galerie
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

// Je charge les catégories
async function loadCategories() {
  const response = await fetch("http://localhost:5678/api/categories");
  const categories = await response.json();

  // Bouton "Tous"
  const allBtn = document.createElement("button");
  allBtn.textContent = "Tous";
  allBtn.classList.add("filter-btn");
  filtersContainer.appendChild(allBtn);

  allBtn.addEventListener("click", () => {
    setActive(allBtn);
    displayWorks(allWorks);
  });

  // Boutons catégories
  categories.forEach(category => {
    const btn = document.createElement("button");
    btn.textContent = category.name;
    btn.classList.add("filter-btn");

    btn.addEventListener("click", () => {
      setActive(btn);
      const filteredWorks = allWorks.filter(work => work.categoryId === category.id);
      displayWorks(filteredWorks);
    });

    filtersContainer.appendChild(btn);
  });
}

// Gestion bouton actif
function setActive(activeButton) {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  activeButton.classList.add("active");
}

// Je lance (à ne surtout pas oublié !!)
loadWorks();
loadCategories();
