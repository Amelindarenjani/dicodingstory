import AddStoryPresenter from "./add-story-presenter";

class AddStoryPage {
  constructor() {
    this._presenter = new AddStoryPresenter({
      view: this,
    });
    this._mediaStream = null;
    this._selectedLocation = null;

    this._handleMediaSourceChange = this._handleMediaSourceChange.bind(this);
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._resetPhotoInput = this._resetPhotoInput.bind(this);
    this._stopCamera = this._stopCamera.bind(this);
  }

  async render() {
    return `
      <section class="container add-story-container" aria-labelledby="add-story-title">
        <h1 id="add-story-title" class="add-story-title">Tambah Cerita Baru</h1>
        
        <form id="add-story-form" class="add-story-form" aria-labelledby="add-story-title">
          <div class="form-group">
            <label for="description" id="description-label">Deskripsi</label>
            <textarea id="description" class="form-input" aria-labelledby="description-label" required placeholder="Ceritakan pengalaman Anda..." aria-required="true"></textarea>
          </div>
          
          <div class="form-group">
            <label for="media-source" id="media-source-label">Sumber Media</label>
            <select id="media-source" class="form-input" aria-labelledby="media-source-label">
              <option value="gallery">Galeri</option>
              <option value="camera">Kamera</option>
            </select>
          </div>
          
          <div class="form-group camera-preview-container" style="display:none;">
            <video id="camera-preview" autoplay playsinline></video>
            <button type="button" id="capture-btn" class="btn">Ambil Foto</button>
          </div>
          
          <div class="form-group">
            <canvas id="photo-canvas" style="display:none;"></canvas>
            <input type="file" id="gallery-input" accept="image/*" style="display:none;">
            <img id="photo-preview" class="photo-preview" style="display:none;">
            <button type="button" id="retake-btn" class="btn" style="display:none; margin-top:10px;">Ambil Ulang</button>
          </div>
          
          <div class="form-group">
            <label for="location-input">Lokasi</label>
            <div class="map-container">
              <div id="map" style="height: 300px;"></div>
              <small class="map-instruction">Klik pada peta untuk memilih lokasi</small>
              <input type="hidden" id="lat">
              <input type="hidden" id="lon">
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Kirim Cerita</button>
          </div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    this._initMap();

    this._mediaSourceSelect = document.getElementById("media-source");
    this._cameraPreview = document.getElementById("camera-preview");
    this._cameraContainer = document.querySelector(".camera-preview-container");
    this._galleryInput = document.getElementById("gallery-input");
    this._photoPreview = document.getElementById("photo-preview");
    this._retakeBtn = document.getElementById("retake-btn");
    this._captureBtn = document.getElementById("capture-btn");
    this._addStoryForm = document.getElementById("add-story-form");

    this._mediaSourceSelect.addEventListener("change", (e) => {
      this._handleMediaSourceChange(e.target.value);
    });

    this._addStoryForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this._handleFormSubmit();
    });

    this._retakeBtn.addEventListener("click", () => {
      this._resetPhotoInput();
    });
  }

  cleanup() {
    this._stopCamera();

    if (this._mediaSourceSelect) {
      this._mediaSourceSelect.removeEventListener(
        "change",
        this._handleMediaSourceChange,
      );
    }
    if (this._addStoryForm) {
      this._addStoryForm.removeEventListener("submit", this._handleFormSubmit);
    }
    if (this._retakeBtn) {
      this._retakeBtn.removeEventListener("click", this._resetPhotoInput);
    }
    if (this._captureBtn) {
      this._captureBtn.onclick = null;
    }
    if (this._galleryInput) {
      this._galleryInput.onchange = null;
    }

    this._mediaSourceSelect = null;
    this._cameraPreview = null;
    this._cameraContainer = null;
    this._galleryInput = null;
    this._photoPreview = null;
    this._retakeBtn = null;
    this._captureBtn = null;
    this._addStoryForm = null;
  }

  _initMap() {
    this._map = L.map("map").setView([-6.2, 106.816666], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this._map);

    // Buat custom marker dengan tampilan koordinat
    const CustomMarker = L.DivIcon.extend({
      options: {
        html: `<div class="custom-marker">
                <div class="marker-pin"></div>
                <div class="coordinate-display">Lat: 0.0000, Lng: 0.0000</div>
              </div>`,
        className: 'custom-marker-container',
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -36]
      }
    });

    this._marker = L.marker(this._map.getCenter(), { draggable: true, icon: new CustomMarker() })
      .addTo(this._map);
      // .bindPopup("Lokasi cerita Anda")
      // .openPopup();
      // Fungsi untuk update tampilan koordinat
    const updateCoordinateDisplay = (lat, lng) => {
      const display = this._marker.getElement()?.querySelector('.coordinate-display');
      if (display) {
        display.textContent = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
      }
      document.getElementById("lat").value = lat;
      document.getElementById("lon").value = lng;
      this._selectedLocation = { lat, lon: lng };
    };

    this._marker.on("dragend", (e) => {
      const { lat, lng } = e.target.getLatLng();
      updateCoordinateDisplay(lat, lng);
      // this._selectedLocation = { lat, lon: lng };
      // document.getElementById("lat").value = lat;
      // document.getElementById("lon").value = lng;
      // coordinateDisplay.textContent = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    });

    this._map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      this._marker.setLatLng([lat, lng]);
      updateCoordinateDisplay(lat, lng);
      // this._selectedLocation = { lat, lon: lng };
      // this._marker.setLatLng([lat, lng]);
      // document.getElementById("lat").value = lat;
      // document.getElementById("lon").value = lng;
      // coordinateDisplay.textContent = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    });
    // Tampilkan koordinat awal
    const center = this._map.getCenter();
    updateCoordinateDisplay(center.lat, center.lng);
    // coordinateDisplay.textContent = `Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)}`;
  }

  async _handleMediaSourceChange(source) {
    this._stopCamera();

    if (this._cameraContainer) this._cameraContainer.style.display = "none";
    if (this._galleryInput) this._galleryInput.style.display = "none";
    if (this._photoPreview) this._photoPreview.style.display = "none";
    if (this._retakeBtn) this._retakeBtn.style.display = "none";

    if (source === "camera") {
      if (!this._cameraContainer || !this._captureBtn) return;

      this._cameraContainer.style.display = "block";
      try {
        this._mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (this._cameraPreview) {
          this._cameraPreview.srcObject = this._mediaStream;
        }

        this._captureBtn.onclick = () => this._capturePhoto();
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert(
          "Tidak dapat mengakses kamera. Silakan coba lagi atau pilih dari galeri.",
        );

        if (this._mediaSourceSelect) {
          this._mediaSourceSelect.value = "gallery";
          this._handleMediaSourceChange("gallery");
        }
      }
    } else {
      if (!this._galleryInput) return;
      this._galleryInput.style.display = "block";
      this._galleryInput.click();

      this._galleryInput.onchange = (e) => {
        if (e.target.files.length > 0 && this._photoPreview) {
          this._displayPhotoPreview(URL.createObjectURL(e.target.files[0]));
        }
      };
    }
  }

  _capturePhoto() {
    const cameraPreview = document.getElementById("camera-preview");
    const canvas = document.getElementById("photo-canvas");
    const context = canvas.getContext("2d");

    canvas.width = cameraPreview.videoWidth;
    canvas.height = cameraPreview.videoHeight;
    context.drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);

    this._displayPhotoPreview(canvas.toDataURL("image/jpeg"));

    this._stopCamera();
    document.querySelector(".camera-preview-container").style.display = "none";
  }

  _displayPhotoPreview(imageSrc) {
    const photoPreview = document.getElementById("photo-preview");
    const retakeBtn = document.getElementById("retake-btn");

    photoPreview.src = imageSrc;
    photoPreview.style.display = "block";
    retakeBtn.style.display = "block";
  }

  _resetPhotoInput() {
    const photoPreview = document.getElementById("photo-preview");
    const retakeBtn = document.getElementById("retake-btn");
    const galleryInput = document.getElementById("gallery-input");

    photoPreview.src = "";
    photoPreview.style.display = "none";
    retakeBtn.style.display = "none";
    galleryInput.value = "";

    document.getElementById("media-source").value = "camera";
    this._handleMediaSourceChange("camera");
  }

  _stopCamera() {
    try {
      if (this._mediaStream) {
        this._mediaStream.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        this._mediaStream = null;
      }

      if (this._cameraPreview) {
        this._cameraPreview.pause();
        this._cameraPreview.srcObject = null;
        this._cameraPreview.load();
      }
    } catch (error) {
      console.error("Error stopping camera:", error);
    }
  }

  async _handleFormSubmit() {
    try {
      this._stopCamera();

      const description = document.getElementById("description").value;
      const lat = document.getElementById("lat").value;
      const lon = document.getElementById("lon").value;

      if (!description) {
        alert("Deskripsi harus diisi");
        return;
      }

      if (!lat || !lon) {
        alert("Silakan pilih lokasi pada peta");
        return;
      }

      let photoFile;
      const photoPreview = this._photoPreview;

      if (photoPreview.src && photoPreview.style.display !== "none") {
        if (photoPreview.src.startsWith("data:")) {
          const response = await fetch(photoPreview.src);
          const blob = await response.blob();
          photoFile = new File([blob], "story-photo.jpg", {
            type: "image/jpeg",
          });
        } else {
          photoFile = this._galleryInput?.files[0];
        }
      } else {
        alert("Silakan tambahkan foto terlebih dahulu");
        return;
      }

      await this._presenter.postStory({
        description,
        photo: photoFile,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      });
    } catch (error) {
      console.error("Error in form submission:", error);
      alert("Terjadi kesalahan saat mengirim cerita");
    }
  }

  showSuccess() {
    this._stopCamera();

    setTimeout(() => {
      window.location.hash = "#/";
    }, 300);
  }

  showError(error) {
    console.error("Gagal menambahkan cerita:", error);
    alert(`Gagal menambahkan cerita: ${error.message || "Terjadi kesalahan"}`);
  }
}

export default AddStoryPage;
