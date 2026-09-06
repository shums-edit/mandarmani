/* ---------------- Typewriter title ---------------- */
(function typewriter() {
  const text = "Mandarmani Vacation Qualifier";
  const el = document.getElementById("typedText");
  const cursor = document.getElementById("cursor");
  let i = 0;
  const speed = 55;

  function tick() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(tick, speed);
    } else {
      setTimeout(() => { cursor.style.animation = "none"; }, 1200);
    }
  }

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = text;
    cursor.style.display = "none";
  } else {
    tick();
  }
})();

/* ---------------- Family member blocks ---------------- */

const familyCountInput = document.getElementById("familyCount");
const addMemberBtn = document.getElementById("addMemberBtn");
const addRow = document.getElementById("addRow");
const membersContainer = document.getElementById("membersContainer");
const progressNote = document.getElementById("progressNote");
const submitBtn = document.getElementById("submitBtn");
const form = document.getElementById("registrationForm");
const formError = document.getElementById("formError");

let targetCount = 0;
let blocks = []; // { id, type: 'married'|'unmarried'|null }
let blockIdSeq = 0;

function weightOf(block) {
  if (block.type === "married") return 2;
  if (block.type === "unmarried") return 1;
  return 0;
}

function peopleAdded() {
  return blocks.reduce((sum, b) => sum + weightOf(b), 0);
}

function remainingCapacity() {
  return targetCount - peopleAdded();
}

familyCountInput.addEventListener("input", () => {
  const val = parseInt(familyCountInput.value, 10);
  targetCount = (val && val > 0) ? val : 0;
  refreshAddButton();
  updateProgress();
  updateSubmitState();
});

addMemberBtn.addEventListener("click", () => {
  if (remainingCapacity() <= 0) return;
  if (blocks.length > 0 && !isBlockComplete(blocks[blocks.length - 1])) return;
  addBlock();
  updateProgress();
  refreshAddButton();
  updateSubmitState();
});

function refreshAddButton() {
  const lastIncomplete = blocks.length > 0 && !isBlockComplete(blocks[blocks.length - 1]);
  addMemberBtn.disabled = targetCount === 0 || remainingCapacity() <= 0 || lastIncomplete;
}

function updateProgress() {
  if (targetCount === 0) {
    progressNote.textContent = "";
    return;
  }
  const added = peopleAdded();
  const lastIncomplete = blocks.length > 0 && !isBlockComplete(blocks[blocks.length - 1]);
  if (lastIncomplete) {
    progressNote.innerHTML = `<strong>${added}</strong> of <strong>${targetCount}</strong> added — finish this member's details to add another`;
  } else {
    progressNote.innerHTML = `<strong>${added}</strong> of <strong>${targetCount}</strong> family members added`;
  }
}

function categoryForAge(age) {
  if (age < 6) return "Infant";
  if (age <= 12) return "Child";
  return "Adult";
}

// Same naming pattern the admin panel uses ("Tarek's family") — based on
// the first family member added, so families recognize their own entry.
function familyDisplayName(members) {
  const first = members[0];
  if (!first) return "Your family";
  const name = first.type === "married" ? first.husbandName : first.name;
  return name ? `${name}'s family` : "Your family";
}

// Keeps the phone field on whichever block is currently first, and the
// add-row control pinned right after the last block.
function syncLayout() {
  const wraps = membersContainer.querySelectorAll(".member-block");
  wraps.forEach((w, idx) => w.classList.toggle("is-first", idx === 0));
  membersContainer.appendChild(addRow);
}

function addBlock() {
  const id = ++blockIdSeq;
  blocks.push({ id, type: null });

  const wrap = document.createElement("div");
  wrap.className = "member-block";
  wrap.dataset.id = id;
  wrap.innerHTML = `
    <div class="member-block__header">
      <span class="member-block__label">Family member ${blocks.length}</span>
      <button type="button" class="member-block__remove" data-remove="${id}">Remove</button>
    </div>

    <div class="radio-row">
      <label class="radio-option">
        <input type="radio" name="status-${id}" value="married"> Married
      </label>
      <label class="radio-option">
        <input type="radio" name="status-${id}" value="unmarried"> Unmarried
      </label>
    </div>
    <p class="error-text hidden" data-capacity-error="${id}"></p>

    <div class="member-fields" data-fields="married-${id}">
      <div class="married-name-row">
        <div class="field">
          <label>Husband's name</label>
          <input type="text" data-role="husbandName">
        </div>
        <span class="heart" aria-hidden="true">&#10084;</span>
        <div class="field">
          <label>Wife's name</label>
          <input type="text" data-role="wifeName">
        </div>
      </div>
    </div>

    <div class="member-fields" data-fields="unmarried-${id}">
      <div class="field">
        <label>Name</label>
        <input type="text" data-role="name">
      </div>
      <div class="field">
        <label>Age</label>
        <input type="number" min="0" max="120" data-role="age">
      </div>
    </div>

    <div class="field family-phone-field">
      <label>Phone number (one number for the whole family)</label>
      <input type="tel" data-role="familyPhone">
    </div>
  `;

  membersContainer.appendChild(wrap);
  syncLayout();

  const radios = wrap.querySelectorAll(`input[name="status-${id}"]`);
  const marriedFields = wrap.querySelector(`[data-fields="married-${id}"]`);
  const unmarriedFields = wrap.querySelector(`[data-fields="unmarried-${id}"]`);
  const capacityError = wrap.querySelector(`[data-capacity-error="${id}"]`);

  radios.forEach(r => r.addEventListener("change", () => {
    const block = blocks.find(b => b.id === id);
    const newWeight = r.value === "married" ? 2 : 1;
    const otherPeople = peopleAdded() - weightOf(block);
    const wouldBeTotal = otherPeople + newWeight;

    if (wouldBeTotal > targetCount) {
      capacityError.textContent = r.value === "married"
        ? `Only ${targetCount - otherPeople} spot(s) left in this family — not enough room for a married couple (2 people). Choose Unmarried here, or increase the family size above.`
        : `Only ${targetCount - otherPeople} spot(s) left in this family.`;
      capacityError.classList.remove("hidden");
      r.checked = false;
      return;
    }

    capacityError.classList.add("hidden");
    block.type = r.value;
    wrap.classList.add("type-chosen");
    marriedFields.classList.toggle("active", r.value === "married");
    unmarriedFields.classList.toggle("active", r.value === "unmarried");
    updateProgress();
    refreshAddButton();
    updateSubmitState();
  }));

  wrap.querySelector(`[data-remove="${id}"]`).addEventListener("click", () => {
    blocks = blocks.filter(b => b.id !== id);
    wrap.remove();
    relabelBlocks();
    syncLayout();
    updateProgress();
    refreshAddButton();
    updateSubmitState();
  });

  wrap.addEventListener("input", () => {
    updateProgress();
    refreshAddButton();
    updateSubmitState();
  });
}

function relabelBlocks() {
  const wraps = membersContainer.querySelectorAll(".member-block");
  wraps.forEach((w, idx) => {
    w.querySelector(".member-block__label").textContent = `Family member ${idx + 1}`;
  });
}

function updateSubmitState() {
  submitBtn.disabled = !isFormComplete();
}

function familyPhoneValue() {
  if (blocks.length === 0) return "";
  const firstWrap = membersContainer.querySelector(`.member-block[data-id="${blocks[0].id}"]`);
  const input = firstWrap && firstWrap.querySelector('[data-role="familyPhone"]');
  return input ? input.value.trim() : "";
}

// Checks one block's own fields (type, names/age, and phone if it's the
// first block) — used to gate the "+" button until the latest tab is done.
function isBlockComplete(block) {
  if (!block.type) return false;
  const wrap = membersContainer.querySelector(`.member-block[data-id="${block.id}"]`);
  if (!wrap) return false;

  if (wrap.classList.contains("is-first") && !familyPhoneValue()) return false;

  if (block.type === "married") {
    const h = wrap.querySelector('[data-role="husbandName"]').value.trim();
    const w = wrap.querySelector('[data-role="wifeName"]').value.trim();
    return !!(h && w);
  } else {
    const n = wrap.querySelector('[data-role="name"]').value.trim();
    const a = wrap.querySelector('[data-role="age"]').value;
    return !!(n && a !== "");
  }
}

function isFormComplete() {
  if (targetCount === 0 || blocks.length === 0) return false;
  if (peopleAdded() !== targetCount) return false;
  return blocks.every(isBlockComplete);
}

/* ---------------- Submit ---------------- */

// Wraps a promise so it fails fast instead of leaving the button stuck on
// "Submitting…" forever if the connection to Firebase hangs.
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error("Request timed out");
      err.timeout = true;
      reject(err);
    }, ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!isFormComplete()) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";
  formError.classList.add("hidden");

  const phone = familyPhoneValue();

  const members = blocks.map(block => {
    const wrap = membersContainer.querySelector(`.member-block[data-id="${block.id}"]`);
    if (block.type === "married") {
      return {
        type: "married",
        husbandName: wrap.querySelector('[data-role="husbandName"]').value.trim(),
        wifeName: wrap.querySelector('[data-role="wifeName"]').value.trim(),
        category: "Adult",
        adultCount: 2
      };
    } else {
      const age = parseInt(wrap.querySelector('[data-role="age"]').value, 10);
      return {
        type: "unmarried",
        name: wrap.querySelector('[data-role="name"]').value.trim(),
        age,
        category: categoryForAge(age),
        adultCount: 0
      };
    }
  });

  const totals = { Adult: 0, Child: 0, Infant: 0 };
  members.forEach(m => {
    if (m.type === "married") {
      totals.Adult += 2;
    } else {
      totals[m.category] += 1;
    }
  });

  const totalPeople = totals.Adult + totals.Child + totals.Infant;

  try {
    await withTimeout(
      db.collection("registrations").add({
        familyCount: targetCount,
        phone,
        members,
        totals,
        totalPeople,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        deleted: false
      }),
      15000
    );

    form.classList.add("hidden");
    document.getElementById("confirmCard").classList.add("active");
    document.getElementById("confirmHeadline").textContent = "Congratulations! Your registration is successfully completed.";
    document.getElementById("confirmFamilyName").innerHTML = `<strong>${familyDisplayName(members)}</strong>`;
    document.getElementById("confirmSummary").textContent =
      `${totalPeople} member${totalPeople === 1 ? "" : "s"} registered — ` +
      `${totals.Adult} adult${totals.Adult === 1 ? "" : "s"}, ` +
      `${totals.Child} child${totals.Child === 1 ? "" : "ren"}, ` +
      `${totals.Infant} infant${totals.Infant === 1 ? "" : "s"}.`;
  } catch (err) {
    console.error(err);
    formError.textContent = err && err.timeout
      ? "This is taking too long — check your internet connection and try again."
      : "Something went wrong while submitting. Please try again.";
    formError.classList.remove("hidden");
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit registration";
  }
});
