/* ---------------- Password show/hide ---------------- */

const passwordInput = document.getElementById("loginPassword");
const togglePasswordBtn = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

const eyeOpenPath = `<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/>`;
const eyeClosedPath = `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.6 20.6 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 7 11 7a20.6 20.6 0 0 1-3.22 4.14M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/>`;

togglePasswordBtn.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  eyeIcon.innerHTML = isHidden ? eyeClosedPath : eyeOpenPath;
  togglePasswordBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
});

/* ---------------- Auth ---------------- */

const loginCard = document.getElementById("loginCard");
const adminShell = document.getElementById("adminShell");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginError = document.getElementById("loginError");

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  loginError.classList.add("hidden");
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    loginError.textContent = "Couldn't sign in — check your email and password.";
    loginError.classList.remove("hidden");
  }
});

logoutBtn.addEventListener("click", () => auth.signOut());

auth.onAuthStateChanged(user => {
  if (user) {
    loginCard.classList.add("hidden");
    adminShell.classList.remove("hidden");
    loadRegistrations();
  } else {
    loginCard.classList.remove("hidden");
    adminShell.classList.add("hidden");
  }
});

/* ---------------- Tabs ---------------- */

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

/* ---------------- Data ---------------- */

let allFamilies = []; // {id, ...data}

function memberSummaryLine(m) {
  if (m.type === "married") {
    return `${m.husbandName} & ${m.wifeName} — married`;
  }
  return `${m.name} — ${m.age} yrs · ${m.category}`;
}

function familyDisplayName(fam) {
  const first = fam.members && fam.members[0];
  if (!first) return "Family";
  const name = first.type === "married" ? first.husbandName : first.name;
  return name ? `${name}'s family` : "Family";
}

function loadRegistrations() {
  db.collection("registrations").onSnapshot(snap => {
    allFamilies = [];
    snap.forEach(doc => allFamilies.push({ id: doc.id, ...doc.data() }));
    renderActive();
    renderBin();
    renderTotals();
  });
}

function renderTotals() {
  const active = allFamilies.filter(f => !f.deleted);
  let adults = 0, child = 0, infant = 0;
  active.forEach(f => {
    adults += (f.totals && f.totals.Adult) || 0;
    child += (f.totals && f.totals.Child) || 0;
    infant += (f.totals && f.totals.Infant) || 0;
  });
  document.getElementById("totalFamilies").textContent = active.length;
  document.getElementById("totalAdults").textContent = adults;
  document.getElementById("totalChild").textContent = child;
  document.getElementById("totalInfant").textContent = infant;
}

function badgesFor(fam) {
  const t = fam.totals || {};
  const parts = [];
  if (t.Adult) parts.push(`<span class="badge">${t.Adult} Adult${t.Adult === 1 ? "" : "s"}</span>`);
  if (t.Child) parts.push(`<span class="badge">${t.Child} Child${t.Child === 1 ? "" : "ren"}</span>`);
  if (t.Infant) parts.push(`<span class="badge">${t.Infant} Infant${t.Infant === 1 ? "" : "s"}</span>`);
  return parts.join("");
}

function renderActive() {
  const list = document.getElementById("familyList");
  const active = allFamilies.filter(f => !f.deleted);
  document.getElementById("emptyActive").classList.toggle("hidden", active.length !== 0);
  list.innerHTML = "";

  active.forEach(fam => {
    const row = document.createElement("div");
    row.className = "family-row";
    row.innerHTML = `
      <div class="family-row__head">
        <div>
          <div class="family-row__title">${familyDisplayName(fam)}</div>
          <div class="family-row__badges">${badgesFor(fam)}</div>
        </div>
        <span class="family-row__chevron">▾</span>
      </div>
      <div class="family-row__body"></div>
    `;

    row.querySelector(".family-row__head").addEventListener("click", () => {
      row.classList.toggle("open");
    });

    const body = row.querySelector(".family-row__body");

    const phoneRow = document.createElement("div");
    phoneRow.className = "member-line";
    phoneRow.innerHTML = `
      <div class="member-line__top"><span>Family contact number</span></div>
      <input type="text" value="${escapeHtml(fam.phone || "")}" data-family-phone>
    `;
    body.appendChild(phoneRow);

    fam.members.forEach((m, idx) => {
      const line = document.createElement("div");
      line.className = "member-line";
      if (m.type === "married") {
        line.innerHTML = `
          <div class="member-line__top"><span>Married couple</span></div>
          <div class="married-name-row">
            <div><label style="font-size:0.75rem;">Husband's name</label>
              <input type="text" value="${escapeHtml(m.husbandName)}" data-field="husbandName"></div>
            <span class="heart" aria-hidden="true">&#10084;</span>
            <div><label style="font-size:0.75rem;">Wife's name</label>
              <input type="text" value="${escapeHtml(m.wifeName)}" data-field="wifeName"></div>
          </div>
        `;
      } else {
        line.innerHTML = `
          <div class="member-line__top"><span>${m.category}</span></div>
          <label style="font-size:0.75rem;">Name</label>
          <input type="text" value="${escapeHtml(m.name)}" data-field="name">
          <label style="font-size:0.75rem;">Age</label>
          <input type="number" value="${m.age}" data-field="age">
        `;
      }
      line.dataset.index = idx;
      body.appendChild(line);
    });

    const actions = document.createElement("div");
    actions.className = "family-row__actions";
    actions.innerHTML = `
      <button class="btn btn-outline btn-small" data-action="save">Save changes</button>
      <button class="btn btn-danger btn-small" data-action="delete">Delete family</button>
    `;
    body.appendChild(actions);

    actions.querySelector('[data-action="save"]').addEventListener("click", (e) => {
      e.stopPropagation();
      saveFamily(fam, body);
    });
    actions.querySelector('[data-action="delete"]').addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Move this family to the recycle bin?")) {
        db.collection("registrations").doc(fam.id).update({
          deleted: true,
          deletedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    });

    list.appendChild(row);
  });
}

function saveFamily(fam, body) {
  const phoneInput = body.querySelector("[data-family-phone]");
  const phone = phoneInput ? phoneInput.value.trim() : (fam.phone || "");

  const lines = body.querySelectorAll(".member-line[data-index]");
  const members = fam.members.map((m, idx) => {
    const line = lines[idx];
    const updated = { ...m };
    line.querySelectorAll("[data-field]").forEach(input => {
      const field = input.dataset.field;
      updated[field] = field === "age" ? parseInt(input.value, 10) : input.value.trim();
    });
    if (updated.type === "unmarried") {
      updated.category = updated.age < 6 ? "Infant" : (updated.age <= 12 ? "Child" : "Adult");
    }
    return updated;
  });

  const totals = { Adult: 0, Child: 0, Infant: 0 };
  members.forEach(m => {
    if (m.type === "married") totals.Adult += 2;
    else totals[m.category] += 1;
  });
  const totalPeople = totals.Adult + totals.Child + totals.Infant;

  db.collection("registrations").doc(fam.id).update({ phone, members, totals, totalPeople })
    .then(() => alert("Saved."));
}

/* ---------------- Recycle bin ---------------- */

function renderBin() {
  const list = document.getElementById("binList");
  const bin = allFamilies.filter(f => f.deleted);
  document.getElementById("emptyBin").classList.toggle("hidden", bin.length !== 0);
  list.innerHTML = "";

  bin.forEach(fam => {
    const row = document.createElement("div");
    row.className = "family-row";
    row.innerHTML = `
      <div class="family-row__head">
        <div>
          <div class="family-row__title">${familyDisplayName(fam)}</div>
          <div class="family-row__badges">${badgesFor(fam)}</div>
        </div>
        <span class="family-row__chevron">▾</span>
      </div>
      <div class="family-row__body">
        <div class="family-row__actions">
          <button class="btn btn-outline btn-small" data-action="restore">Restore</button>
          <button class="btn btn-danger btn-small" data-action="purge">Delete permanently</button>
        </div>
      </div>
    `;
    row.querySelector(".family-row__head").addEventListener("click", () => row.classList.toggle("open"));
    row.querySelector('[data-action="restore"]').addEventListener("click", (e) => {
      e.stopPropagation();
      db.collection("registrations").doc(fam.id).update({ deleted: false, deletedAt: null });
    });
    row.querySelector('[data-action="purge"]').addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Permanently delete this family? This cannot be undone.")) {
        db.collection("registrations").doc(fam.id).delete();
      }
    });
    list.appendChild(row);
  });
}

document.getElementById("emptyBinBtn").addEventListener("click", () => {
  const bin = allFamilies.filter(f => f.deleted);
  if (bin.length === 0) return;
  if (!confirm(`Permanently delete all ${bin.length} families in the recycle bin? This cannot be undone.`)) return;
  const batch = db.batch();
  bin.forEach(f => batch.delete(db.collection("registrations").doc(f.id)));
  batch.commit();
});

/* ---------------- CSV export ---------------- */

document.getElementById("exportCsvBtn").addEventListener("click", () => {
  const active = allFamilies.filter(f => !f.deleted);
  const rows = [["Family", "Phone", "Member Type", "Name", "Age", "Category"]];

  active.forEach(fam => {
    const famName = familyDisplayName(fam);
    fam.members.forEach(m => {
      if (m.type === "married") {
        rows.push([famName, fam.phone || "", "Married", `${m.husbandName} & ${m.wifeName}`, "", "Adult"]);
      } else {
        rows.push([famName, fam.phone || "", "Unmarried", m.name, m.age, m.category]);
      }
    });
  });

  const csv = rows.map(r => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mandarmani-vacation-registrations.csv";
  a.click();
  URL.revokeObjectURL(url);
});

function csvEscape(val) {
  const s = String(val ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
