const CLOUD_NAME = "dsnptnqil";
const UPLOAD_PRESET = "boda_unsigned";
const FOLDER = "Boda28feb";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");

const sideMenu = document.getElementById("sideMenu");
const menuButton = document.getElementById("menuButton");

menuButton.onclick = () => {
  sideMenu.style.left =
    sideMenu.style.left === "0px" ? "-220px" : "0px";
};

// 📸 Iniciar cámara automáticamente
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => alert("Error cámara: " + err));

// 📸 Tomar foto
captureBtn.onclick = () => {
  const ctx = canvas.getContext("2d");

  canvas.width = 600;
  canvas.height = 750;

  // Fondo blanco tipo polaroid
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibujar imagen centrada
  ctx.drawImage(video, 50, 50, 500, 500);

  // Fecha abajo
  ctx.fillStyle = "black";
  ctx.font = "20px sans-serif";
  ctx.fillText(new Date().toLocaleDateString(), 200, 600);

  canvas.toBlob(uploadToCloudinary, "image/jpeg", 0.9);
};

// ☁️ Subir imagen
function uploadToCloudinary(blob) {
  const formData = new FormData();
  formData.append("file", blob);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", FOLDER);

  fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      alert("Foto subida 📸✨");
      console.log(data);
    })
    .catch(err => alert("Error subiendo imagen"));
}

// 🖼 Mostrar galería
function showGallery() {
  document.getElementById("cameraSection").style.display = "none";
  document.getElementById("gallerySection").style.display = "block";
  loadGallery();
}

function showCamera() {
  document.getElementById("cameraSection").style.display = "block";
  document.getElementById("gallerySection").style.display = "none";
}

// 📂 Cargar todas las fotos
function loadGallery() {
  fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/${FOLDER}.json`)
    .then(res => res.json())
    .then(data => {
      const gallery = document.getElementById("gallery");
      gallery.innerHTML = "";

      data.resources.forEach(img => {
        const image = document.createElement("img");
        image.src = img.secure_url;
        gallery.appendChild(image);
      });
    })
    .catch(() => {
      document.getElementById("gallery").innerHTML =
        "No se pudieron cargar las fotos.";
    });
}
