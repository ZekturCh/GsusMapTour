const CLOUD_NAME = "dsnptnqil";
const UPLOAD_PRESET = "boda_unsigned";
const FOLDER = "Boda28feb";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");

const sideMenu = document.getElementById("sideMenu");
const menuButton = document.getElementById("menuButton");
const closeMenu = document.getElementById("closeMenu");

const uploadFileBtn = document.getElementById("uploadFileBtn");
const fileInput = document.getElementById("fileInput");

let currentFacingMode = "environment";
let currentStream = null;

menuButton.onclick = () => {
  sideMenu.style.left =
    sideMenu.style.left === "0px" ? "-220px" : "0px";
};
closeMenu.onclick = () => {
  sideMenu.style.left = "-220px";
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

fileInput.onchange = async () => {
  const files = Array.from(fileInput.files);

  if (files.length === 0) return;

  if (files.length > 6) {
    alert("Máximo 6 fotos por carga 📸");
    fileInput.value = "";
    return;
  }

  uploadFileBtn.disabled = true;
  document.getElementById("uploadLoader").style.display = "block";

  try {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", FOLDER);
      formData.append("tags", "Boda28feb");

      await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
      });
    }

    alert("Fotos subidas correctamente 📸✨");

  } catch (error) {
    alert("Error subiendo una de las fotos");
    console.error(error);
  }

  uploadFileBtn.disabled = false;
  document.getElementById("uploadLoader").style.display = "none";
  fileInput.value = "";
};
const downloadAllBtn = document.getElementById("downloadAllBtn");

downloadAllBtn.onclick = async () => {

  downloadAllBtn.disabled = true;
  downloadAllBtn.innerText = "Preparando descarga...";

  try {

    const response = await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/${FOLDER}.json`);
    const data = await response.json();

    if (!data.resources || data.resources.length === 0) {
      alert("No hay fotos para descargar 📸");
      return;
    }

    const zip = new JSZip();

    for (const item of data.resources) {

      const imageUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v${item.version}/${item.public_id}.${item.format}`;

      const imgResponse = await fetch(imageUrl);
      const blob = await imgResponse.blob();

      zip.file(`${item.public_id}.${item.format}`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = "Boda28feb.zip";
    link.click();

  } catch (error) {
    console.error(error);
    alert("Error preparando descarga");
  }

  downloadAllBtn.disabled = false;
  downloadAllBtn.innerText = "📥 Descargar Todas";
};
