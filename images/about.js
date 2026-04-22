let reviews = [];
let editId = null;

const reviewsList = document.getElementById("reviews-list");
const reviewModal = document.getElementById("reviewModal");
const popup = document.getElementById("popup");
const popupImg = document.getElementById("popup-img");

const defaultReviews = [
  {
    id: 1,
    name: "James Wilson",
    rating: "⭐⭐⭐⭐⭐ Excellent",
    message: "Booking was easy and the car was very clean. Great service overall.",
    files: []
  },
  {
    id: 2,
    name: "Sophia Brown",
    rating: "⭐⭐⭐⭐ Good",
    message: "Friendly staff and smooth pickup process. I would rent again.",
    files: []
  }
];

function saveReviews() {
  localStorage.setItem("carRentalReviews", JSON.stringify(reviews));
}

function loadReviews() {
  const saved = localStorage.getItem("carRentalReviews");

  if (saved) {
    reviews = JSON.parse(saved);
  } else {
    reviews = defaultReviews;
    saveReviews();
  }

  renderReviews();
}

function renderReviews() {
  reviewsList.innerHTML = "";

  reviews.forEach(function(review) {
    const reviewItem = document.createElement("div");
    reviewItem.className = "review-item";

    let imagesHTML = "";
    let filesHTML = "";

    if (review.files && review.files.length > 0) {
      review.files.forEach(function(file) {
        if (file.type.startsWith("image/")) {
          imagesHTML += `<img src="${file.data}" alt="${escapeHTML(file.name)}" class="preview-image">`;
        } else {
          filesHTML += `<a href="${file.data}" download="${escapeHTML(file.name)}" target="_blank">${escapeHTML(file.name)}</a>`;
        }
      });
    }

    reviewItem.innerHTML = `
      <div class="menu-container">
        <button type="button" class="menu-btn" data-id="${review.id}">&#8942;</button>
        <div class="menu">
          <button type="button" class="edit-btn" data-id="${review.id}">Edit</button>
          <button type="button" class="delete-btn" data-id="${review.id}">Delete</button>
        </div>
      </div>

      <h3>${escapeHTML(review.name)}</h3>
      <p><strong>${escapeHTML(review.rating)}</strong></p>
      <p class="review-message">${escapeHTML(review.message)}</p>
      <div class="review-images">${imagesHTML}</div>
      <div class="review-files">${filesHTML}</div>
    `;

    reviewsList.appendChild(reviewItem);
  });
}

function openReviewForm() {
  reviewModal.style.display = "flex";
}

function closeReviewForm() {
  reviewModal.style.display = "none";
  clearForm();
  editId = null;
}

function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("rating").selectedIndex = 0;
  document.getElementById("message").value = "";
  document.getElementById("photo").value = "";
}

function fileToDataURL(file) {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader();

    reader.onload = function(e) {
      resolve({
        name: file.name,
        type: file.type || "application/octet-stream",
        data: e.target.result
      });
    };

    reader.onerror = function() {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

async function addReview() {
  const name = document.getElementById("name").value.trim();
  const rating = document.getElementById("rating").value;
  const message = document.getElementById("message").value.trim();
  const fileInput = document.getElementById("photo");
  const selectedFiles = Array.from(fileInput.files);

  if (name === "" || message === "") {
    alert("Please fill all fields");
    return;
  }

  let convertedFiles = [];

  try {
    convertedFiles = await Promise.all(
      selectedFiles.map(function(file) {
        return fileToDataURL(file);
      })
    );
  } catch (error) {
    alert("Some files could not be uploaded.");
    return;
  }

  try {
    if (editId !== null) {
      const existingReview = reviews.find(function(item) {
        return item.id === editId;
      });

      let finalFiles = existingReview ? existingReview.files : [];

      if (convertedFiles.length > 0) {
        finalFiles = convertedFiles;
      }

      reviews = reviews.map(function(review) {
        if (review.id === editId) {
          return {
            ...review,
            name: name,
            rating: rating,
            message: message,
            files: finalFiles
          };
        }
        return review;
      });
    } else {
      const newReview = {
        id: Date.now(),
        name: name,
        rating: rating,
        message: message,
        files: convertedFiles
      };

      reviews.push(newReview);
    }

    saveReviews();
    renderReviews();
    closeReviewForm();
  } catch (error) {
    alert("Review could not be saved. Files may be too large for browser storage.");
  }
}

function toggleMenu(button) {
  const currentMenu = button.nextElementSibling;

  document.querySelectorAll(".menu").forEach(function(menu) {
    if (menu !== currentMenu) {
      menu.style.display = "none";
    }
  });

  currentMenu.style.display =
    currentMenu.style.display === "block" ? "none" : "block";
}

function editReview(id) {
  const review = reviews.find(function(item) {
    return item.id === id;
  });

  if (!review) return;

  document.getElementById("name").value = review.name;
  document.getElementById("rating").value = review.rating;
  document.getElementById("message").value = review.message;

  editId = id;
  openReviewForm();
}

function deleteReview(id) {
  reviews = reviews.filter(function(review) {
    return review.id !== id;
  });

  saveReviews();
  renderReviews();
}

function openPopup(src) {
  popup.style.display = "flex";
  popupImg.src = src;
}

function closePopup() {
  popup.style.display = "none";
  popupImg.src = "";
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* FAQ */
document.querySelectorAll(".faq-question").forEach(function(question) {
  question.addEventListener("click", function() {
    const faqItem = this.parentElement;
    const answer = faqItem.querySelector(".faq-answer");

    faqItem.classList.toggle("active");

    if (answer.style.display === "block") {
      answer.style.display = "none";
    } else {
      answer.style.display = "block";
    }
  });
});

/* Click handling */
document.addEventListener("click", function(event) {
  if (event.target.classList.contains("menu-btn")) {
    toggleMenu(event.target);
    return;
  }

  if (event.target.classList.contains("edit-btn")) {
    const id = Number(event.target.dataset.id);
    editReview(id);
    return;
  }

  if (event.target.classList.contains("delete-btn")) {
    const id = Number(event.target.dataset.id);
    deleteReview(id);
    return;
  }

  if (event.target.classList.contains("preview-image")) {
    openPopup(event.target.src);
    return;
  }

  if (!event.target.closest(".menu-container")) {
    document.querySelectorAll(".menu").forEach(function(menu) {
      menu.style.display = "none";
    });
  }

  if (event.target === popup) {
    closePopup();
  }

  if (event.target === reviewModal) {
    closeReviewForm();
  }
});

loadReviews();