let users = [];
let currentUser = null;

function showMessage(msg, type) {
  let box = document.getElementById("message");
  box.textContent = msg;
  box.className = type ? type : "";
  box.style.display = "block";
  setTimeout(() => box.style.display = "none", 1000);
}

function hideAllSections() {
  document.querySelectorAll(".container > div").forEach(div => {
    if (div.id !== "message") div.style.display = "none";
  });
}

function showRegister() {
  hideAllSections();
  document.getElementById("registerSection").style.display = "block";

  // rerest vlaue
  document.getElementById('regName').value = '';
  document.getElementById('regEmail').value = '';
  document.getElementById('regPass').value = '';
}

function showLogin() {
  hideAllSections();
  document.getElementById("loginSection").style.display = "block";

  // inputs reset
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPass').value = '';
}


function goBackToStart() {
  hideAllSections();
  document.getElementById("startMenu").style.display = "block";
}

function showMainMenu() {
  hideAllSections();
  document.getElementById("mainMenu").style.display = "block";
}

function showAddPerson() {
  hideAllSections();
  document.getElementById("addPersonSection").style.display = "block";
}

function showRemovePerson() {
  hideAllSections();
  document.getElementById("removePersonSection").style.display = "block";
}

function register() {
  let name = document.getElementById("regName").value.trim();
  let email = document.getElementById("regEmail").value.trim();
  let password = document.getElementById("regPass").value.trim();

  //  Empty fields check
  if (!name || !email || !password) {
    showMessage("All fields are required", "error");
    return;
  }

  // Email format check
  let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|pk|edu|org|net|gov|edu\.pk)$/i;
  if (!emailRegex.test(email)) {
    showMessage("❌Invalid email format!", "error");
    return;
  }

  //  Already registered email check
  if (users.find(u => u.email === email)) {
    showMessage("Email already registered!", "error");
    return;
  }

  //  Strong password check
  let passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
  if (!passRegex.test(password)) {
    showMessage("Weak password!", "error");
    return;
  }

  // User creation
  let newUser = { name, email, password, people: [] };
  users.push(newUser);
  currentUser = newUser;

  // Success message
  showMessage("Registered & Logged in", "success");
  showMainMenu();
}

function login() {
  let email = document.getElementById("loginEmail").value.trim();
  let password = document.getElementById("loginPass").value.trim();

  let user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    showMessage("Invalid credentials!", "error");
    return;
  }

  currentUser = user;
  showMessage("Login successful", "success");
  showMainMenu();
}

function logout() {
  currentUser = null;
  showMessage("Logged out", "success");
  goBackToStart();
}

function addPerson() {
  let name = document.getElementById("personName").value.trim();
  let type = document.getElementById("personType").value;

  if (!name) {
    showMessage("Name required", "error");
    return;
  }

  let id = currentUser.people.length + 1;
  currentUser.people.push({ id, name, type });
  showMessage("Person added successfully!", "success");

  document.getElementById("personName").value = "";
  showMainMenu();
}

function showRemovePerson() {
  hideAllSections();
  document.getElementById("removePersonSection").style.display = "block";

  let dropdown = document.getElementById("removePersonDropdown");
  dropdown.innerHTML = "";

  if (currentUser.people.length === 0) {
    let opt = document.createElement("option");
    opt.textContent = "No people available";
    opt.disabled = true;
    opt.selected = true;
    dropdown.appendChild(opt);
    return;
  }

  currentUser.people.forEach(p => {
    let typeName = p.type === "1" ? "Doctor" : "Patient";
    let option = document.createElement("option");
    option.value = p.id;
    option.textContent = `ID: ${p.id} - ${p.name} (${typeName})`;
    dropdown.appendChild(option);
  });
}

function resetIds() {
  currentUser.people.forEach((p, index) => {
    p.id = index + 1; // index 0 se start hota hai, is liye +1
  });
}


function removeSelectedPerson() {
  let dropdown = document.getElementById("removePersonDropdown");
  let id = parseInt(dropdown.value);

  let index = currentUser.people.findIndex(p => p.id === id);
  if (index === -1) {
    showMessage("Person not found!", "error");
    showMainMenu();
    return;
  }

  // Array se remove
  currentUser.people.splice(index, 1);
  
  // Success msg show
  showMessage("Person removed successfully!", "success");
  resetIds();
  showRemovePerson();
  
}

function viewPeople() {
  hideAllSections();
  document.getElementById("viewPeopleSection").style.display = "block";

  let container = document.getElementById("peopleList");
  container.innerHTML = "";

  if (currentUser.people.length === 0) {
    container.innerHTML = "<p>No people found.</p>";
    return;
  }

  currentUser.people.forEach(p => {
    let typeName = p.type === "1" ? "Doctor" : "Patient";
    let div = document.createElement("div");
    div.className = "list-item";
    div.textContent = `ID: ${p.id}, Name: ${p.name}, Type: ${typeName}`;
    container.appendChild(div);
  });
}

function downloadUsersJSON() {
  let dataStr = JSON.stringify(users, null, 2); 
  let blob = new Blob([dataStr], { type: "application/json" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "users.json"; 
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

function showUsersJSON() {
  hideAllSections();
  document.getElementById("showUsersSection").style.display = "block";

  let jsonBox = document.getElementById("usersJSON");
  jsonBox.textContent = JSON.stringify(users, null, 2);
}

function uploadJsonFile(event) {
  let file = event.target.files[0];
  if (!file) {
    showMessage("No file selected!", "error");
    return;
  }

  let reader = new FileReader();
  reader.onload = function (e) {
    try {
      let data = JSON.parse(e.target.result);

      // ✅ Ensure data is array of users
      if (Array.isArray(data)) {
        data.forEach(newUser => {
          // Check agar same username/password wala user already exist karta hai
          let existingUser = users.find(u => u.username === newUser.username && u.password === newUser.password);

          if (existingUser) {
            // ✅ Agar user already hai → uske people merge kar do
            if (Array.isArray(newUser.people)) {
              existingUser.people = [...existingUser.people, ...newUser.people];
              resetIds(existingUser.people); // IDs reset karni hongi
            }
          } else {
            // ✅ Agar user new hai → direct push
            if (!Array.isArray(newUser.people)) {
              newUser.people = []; // agar "people" missing ho to empty bana do
            }
            resetIds(newUser.people);
            users.push(newUser);
          }
        });

        // ✅ Show Users JSON update karo
        hideAllSections();
        document.getElementById("showUsersSection").style.display = "block";
        document.getElementById("usersJSON").textContent = JSON.stringify(users, null, 2);

        showMessage("JSON merged successfully!", "success");
      } else {
        showMessage("Invalid JSON format! Must be an array of users.", "error");
        return;
      }
    } catch (err) {
      console.error(err);
      showMessage("Invalid JSON file!", "error");
    }
  };
  reader.readAsText(file);
}