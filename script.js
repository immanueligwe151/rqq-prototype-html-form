const imageInput = document.getElementById("pictures");
const quoteForm = document.getElementById("quoteForm");
const maxFiles = 3;
let selectedFiles = [];

const db = firebase.database();
const storage = firebase.storage();

// user personas
const user1 = {
    name: "Emily Carter",
    email: "emily.carter@northwind.co.uk",
    phone: "+44 7911 123456",
    company: "Northwind Traders",
    position: "Purchasing Lead",
    UID: "UID223344"
  };
  
  const user2 = {
    name: "James Osei",
    email: "james.osei@redbrickgroup.co.uk",
    phone: "+44 7512 345678",
    company: "Redbrick Group",
    position: "Supply Chain Analyst",
    UID: "UID334455"
  };
  
  const user3 = {
    name: "Claire Dupont",
    email: "claire.dupont@techavenir.fr",
    phone: "+33 6 12 34 56 78",
    company: "Tech Avenir",
    position: "Responsable Achats",
    UID: "UID556677"
  };
  

imageInput.addEventListener("change", (event) => {
    const newFiles = Array.from(event.target.files);

    for (let file of newFiles) {
        if (selectedFiles.length >= maxFiles) {
            alert("You can only upload up to 3 images.");
            break;
        }

        // to avoid adding duplicate images
        if (!selectedFiles.find(f => f.name === file.name && f.lastModified === file.lastModified)) {
            selectedFiles.push(file);
        }
    }

    alert(displaySelectedFileNames());
});

function displaySelectedFileNames() {
    let display = selectedFiles.map(f => f.name).join(', ');
    return "Selected files: " + display;
}


quoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const requestId = generateRequestID();

    try {
      await uploadImages(selectedFiles, requestId);

      const now = new Date().toISOString();

      const requestData = {
        part_number: form.part_number.value,
        manufacturer: form.manufacturer.value,
        quantity: parseInt(form.quantity.value),
        required_when: form.required_when.value,
        preferred_condition: form.querySelector('input[name="condition"]:checked')?.value || null,
        from: user1, // this will be used interchangabely during testing
        picture_path: `storage/${requestId}/image`,
        created_at: now,

        // other fields for processing
        status: "pending",
        agent_username: null,
        assigned_at: null,
        dropped_reason: null,
        drop_pending_approval: false,
        progress: {
          received: false,
          reviewed: false,
          quoted: false,
          follow_up: false
        },
      };

      await db.ref(`requests/${requestId}`).set(requestData);

      alert(`Quote request submitted with ID: ${requestId}`);
      form.reset();
      selectedFiles = [];

    } catch (error) {
      console.error("Error uploading or saving data:", error);
      alert("Something went wrong. Check console.");
    }
  });


async function uploadImages(files, requestId) {
    const uploadPromises = [];

    for (let i = 0; i < files.length; i++) {
      const fileRef = storage.ref(`storage/${requestId}/image/${files[i].name}`);
      uploadPromises.push(fileRef.put(files[i]));
    }

    return Promise.all(uploadPromises);
  }

function generateRequestID() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetters = letters.charAt(Math.floor(Math.random() * 26)) + letters.charAt(Math.floor(Math.random() * 26));
    const randomDigits = String(Math.floor(10000 + Math.random() * 90000)); // to ensure 5 digits
    return "REQ-" + randomLetters + randomDigits; // to be in the format REQ-AB12345
  }
  