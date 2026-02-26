const CLOUD_NAME = "dsnptnqil";
const UPLOAD_PRESET = "boda_unsigned";
const FOLDER = "Boda28feb";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");

const sideMenu = document.getElementById("sideMenu");
const menuButton = document.getElementById("menuButton");

const uploadFileBtn = document.getElementById("uploadFileBtn");
const fileInput = document.getElementById("fileInput");

let currentFacingMode = "environment";
let currentStream = null;

menuButton.onclick = () => {
  sideMenu.style.left =
    sideMenu.style.left === "0px" ? "-220px" : "0px";
};

// 📸 Iniciar cámara automáticamente
function startCamera() {
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: currentFacingMode }
  })
  .then(stream => {
    currentStream = stream;
    video.srcObject = stream;

    // Si es frontal, activar espejo
    if (currentFacingMode === "user") {
      video.classList.add("mirror");
    } else {
      video.classList.remove("mirror");
    }
  })
  .catch(err => alert("Error cámara: " + err));
}

startCamera();

// 📸 Tomar foto
captureBtn.onclick = () => {
  const ctx = canvas.getContext("2d");

  // Usar tamaño real del video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Si es selfie, invertir correctamente
  if (currentFacingMode === "user") {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  ctx.setTransform(1, 0, 0, 1, 0, 0);

  canvas.toBlob(uploadToCloudinary, "image/jpeg", 0.9);
};

// ☁️ Subir imagen
function uploadToCloudinary(blob) {
  const formData = new FormData();
  formData.append("file", blob);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", FOLDER);
  formData.append("tags", "Boda28feb");

  fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
  alert("Foto subida 📸✨");
  console.log(data);

  // Reiniciar cámara suavemente
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  startCamera();
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
  fetch(`https://res.cloudinary.com/dsnptnqil/image/list/Boda28feb.json`)
    .then(res => res.json())
    .then(data => {
      const gallery = document.getElementById("gallery");
      gallery.innerHTML = "";

      if (!data.resources || data.resources.length === 0) {
        gallery.innerHTML = "No hay fotos aún 📸";
        return;
      }

      data.resources.forEach(item => {

        const imageUrl = `https://res.cloudinary.com/dsnptnqil/image/upload/f_auto,q_auto/v${item.version}/${item.public_id}.${item.format}`;

        const img = document.createElement("img");
        img.src = imageUrl;
        img.loading = "lazy";

        gallery.appendChild(img);
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById("gallery").innerHTML =
        "Error cargando álbum.";
    });
}
document.getElementById("switchCameraBtn").onclick = () => {

  // Detener cámara actual
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  // Cambiar modo
  currentFacingMode =
    currentFacingMode === "environment"
      ? "user"
      : "environment";

  startCamera();
};

uploadFileBtn.onclick = () => {
  fileInput.click();
};

fileInput.onchange = () => {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", FOLDER);
  formData.append("tags", "Boda28feb");

  fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    console.log("Archivo subido:", data);
    alert("Foto subida correctamente 📸✨");
  })
  .catch(err => alert("Error subiendo archivo"));
};
