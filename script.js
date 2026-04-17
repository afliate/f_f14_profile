// 전투직만
const jobCategories = {
  "전투": {
    "탱커": ["pld","war","drk","gnb"],
    "힐러": ["whm","sch","ast","sge"],
    "근딜": ["mnk","drg","nin","sam","rpr","vpr"],
    "원딜": ["brd","mch","dnc"],
    "마딜": ["blm","smn","rdm","pct","blu"]
  }
};

// 플레이스타일 (빈칸 제외)
const playstyleList = [
  { id: 1,  label: "RP" },
  { id: 2,  label: "플레이어 이벤트" },
  { id: 3,  label: "레벨링" },
  { id: 4,  label: "초보자" },
  { id: 5,  label: "부담 없이 즐기기" },
  { id: 6,  label: "진지한 공략" },
  { id: 9,  label: "제작" },
  { id: 10, label: "채광/원예" },
  { id: 11, label: "하우징" },
  { id: 12, label: "마물사냥" },
  { id: 13, label: "보물찾기" },
  { id: 14, label: "PvP" },
  { id: 15, label: "낚시" },
  { id: 16, label: "작패유희" },
  { id: 17, label: "악기 연주" },
  { id: 18, label: "장비 투영" },
  { id: 19, label: "단체 자세" },
  { id: 20, label: "골드 소서" },
  { id: 21, label: "대화 나누기" },
  { id: 22, label: "메인 퀘스트" },
  { id: 23, label: "특수 필드 탐색" },
  { id: 24, label: "특수 던전 탐색" },
  { id: 25, label: "무인도 개척" },
  { id: 26, label: "길 모으기" },
  { id: 27, label: "업적" },
  { id: 28, label: "던전" },
  { id: 29, label: "레이드" },
  { id: 30, label: "토벌전" },
  { id: 31, label: "절 레이드" },
  { id: 32, label: "딥 던전" },
  { id: 33, label: "무작위 임무" },
  { id: 34, label: "청마도사" },
  { id: 35, label: "멘토" },
];

let selectedJobs = [];
let mainJob = null;
let activeTimes = [];
let selectedPlaystyles = [];

function updateCard() {
  const titleVal = document.getElementById("titleInput").value || "EORZEAN";
  document.getElementById("mainTitle").innerText = titleVal;

  document.getElementById("featureBox").innerText =
    document.getElementById("titleBoxInput").value || "모험가";

  document.getElementById("cardName").innerText =
    document.getElementById("nameInput").value || "캐릭터";

  // 인게임 달라요
  const ingameCheck = document.getElementById("ingameCheck").checked;
  document.getElementById("ingameNote").style.display = ingameCheck ? "block" : "none";

  // 서버
  const server = document.getElementById("serverInput").value;
  document.getElementById("barcodeLabel").innerText =
    (document.getElementById("nameInput").value || "FF14").toUpperCase().slice(0,12);

  // 메인잡
  const mainIcon = document.getElementById("mainJobIcon");
  if (mainJob) {
    mainIcon.src = `images/jobs/ffxivjobssvg_meteor/${mainJob}.svg`;
    mainIcon.style.display = "block";
  } else {
    mainIcon.style.display = "none";
  }

  // 나머지 잡 (메인 제외, 가로 2열)
  const allJobs = getAllJobsInOrder();
  const subJobs = allJobs.filter(j => selectedJobs.includes(j) && j !== mainJob);
  let subHtml = "";
  for (let i = 0; i < subJobs.length; i += 2) {
    subHtml += `<div class="sub-job-row">`;
    subHtml += `<img class="job-card-icon-sub" src="images/jobs/ffxivjobssvg_meteor/${subJobs[i]}.svg">`;
    if (subJobs[i+1]) {
      subHtml += `<img class="job-card-icon-sub" src="images/jobs/ffxivjobssvg_meteor/${subJobs[i+1]}.svg">`;
    }
    subHtml += `</div>`;
  }
  document.getElementById("subJobDisplay").innerHTML = subHtml;

  // 플레이스타일
  document.getElementById("playstyleDisplay").innerHTML =
    selectedPlaystyles.map(id => {
      const num = String(id).padStart(2, "0");
      return `<img class="ps-card-icon" src="images/activity/1/${num}.png" title="${playstyleList.find(p=>p.id===id)?.label||''}">`;
    }).join("");

  // 활동 시간
  const timeContainer = document.getElementById("activeTimeDisplay");
  const slots = ["아침","점심","저녁","심야"]
    .map(t => `<div class="time-slot ${activeTimes.includes(t) ? 'active' : ''}">${t}</div>`)
    .join("");
  timeContainer.innerHTML = `<div class="time-label">ACTIVE TIME</div>${slots}`;

  // 태그
  document.getElementById("cardTags").innerHTML =
    document.getElementById("tagInput").value
      .split(",").map(t => t.trim()).filter(t => t)
      .map(t => `<span class="tag">${t}</span>`).join("");

  // 메모
  document.getElementById("cardMemo").innerText =
    document.getElementById("memoInput").value || "";
}

function drawBarcode() {
  const svg = document.getElementById("barcodeSvg");
  const bars = 36, w = 100, h = 38;
  let html = "";
  for (let i = 0; i < bars; i++) {
    const x = (i / bars) * w;
    const bw = Math.random() < 0.35 ? 2.0 : 1.0;
    const bh = Math.random() < 0.18 ? h * 0.65 : h * 0.88;
    html += `<rect x="${x.toFixed(1)}" y="${(h-bh).toFixed(1)}" width="${bw}" height="${bh.toFixed(1)}" fill="white" opacity="0.6"/>`;
  }
  svg.innerHTML = html;
}

function renderJobSelect() {
  let html = "";
  for (const category in jobCategories) {
    const data = jobCategories[category];
    html += `<div class="job-category"><div class="job-title">${category}</div>`;
    if (typeof data === "object" && !Array.isArray(data)) {
      for (const sub in data) {
        html += `<div class="job-subrow"><div class="job-subtitle">${sub}</div><div class="job-row">`;
        data[sub].forEach(job => {
          html += `<img src="images/jobs/ffxivjobssvg/${job}.svg" class="job-icon" id="icon-${job}" onclick="toggleJob('${job}')" title="${job}">`;
        });
        html += `</div></div>`;
      }
    }
    html += `</div>`;
  }
  document.getElementById("jobSelect").innerHTML = html;
}

function renderPlaystyleSelect() {
  document.getElementById("playstyleSelect").innerHTML =
    playstyleList.map(p => {
      const num = String(p.id).padStart(2, "0");
      return `<img src="images/activity/1/${num}.png"
                   class="ps-icon" id="ps-${p.id}"
                   onclick="togglePlaystyle(${p.id})"
                   title="${p.label}">`;
    }).join("");
}

function togglePlaystyle(id) {
  if (selectedPlaystyles.includes(id)) {
    selectedPlaystyles = selectedPlaystyles.filter(x => x !== id);
    document.getElementById(`ps-${id}`).classList.remove("selected");
  } else {
    selectedPlaystyles.push(id);
    document.getElementById(`ps-${id}`).classList.add("selected");
  }
  updateCard();
}

function toggleJob(job) {
  if (!selectedJobs.includes(job)) {
    selectedJobs.push(job);
  } else if (mainJob !== job) {
    mainJob = job;
  } else {
    selectedJobs = selectedJobs.filter(j => j !== job);
    if (mainJob === job) mainJob = null;
  }
  updateSelectionUI();
  updateCard();
}

function updateSelectionUI() {
  document.querySelectorAll(".job-icon").forEach(el => {
    const job = el.id.replace("icon-", "");
    el.classList.remove("selected", "main-selected");
    if (job === mainJob) el.classList.add("main-selected");
    else if (selectedJobs.includes(job)) el.classList.add("selected");
  });
}

function selectAllJobs() {
  selectedJobs = getAllJobsInOrder();
  updateSelectionUI(); updateCard();
}

function clearJobs() {
  selectedJobs = []; mainJob = null;
  updateSelectionUI(); updateCard();
}

function getAllJobsInOrder() {
  const all = [];
  Object.values(jobCategories).forEach(cat => {
    if (Array.isArray(cat)) all.push(...cat);
    else Object.values(cat).forEach(sub => all.push(...sub));
  });
  return all;
}

function toggleJobSection() {
  const body = document.getElementById("jobSectionBody");
  const arrow = document.getElementById("jobArrow");
  body.classList.toggle("collapsed");
  arrow.innerText = body.classList.contains("collapsed") ? "▶" : "▼";
}

function renderLineArtSelect() {
  const jobs = getAllJobsInOrder();
  document.getElementById("lineArtSelect").innerHTML =
    jobs.map(job =>
      `<img src="images/jobs/ffxivjobssvg/${job}.svg"
            style="width:22px;height:22px;cursor:pointer;filter:invert(1);opacity:0.4;"
            onclick="setLineArt('${job}')" title="${job}">`
    ).join("");
}

function setLineArt(job) {
  const la = document.getElementById("lineArt");
  la.src = `images/jobs/CL/${job.toUpperCase()}.png`;
  la.style.display = "block";
}

function toggleTime(btn) {
  const t = btn.dataset.time;
  if (activeTimes.includes(t)) {
    activeTimes = activeTimes.filter(x => x !== t);
    btn.classList.remove("active");
  } else {
    activeTimes.push(t);
    btn.classList.add("active");
  }
  updateCard();
}

let bgPosX = 50, bgPosY = 50;
let isDragging = false, dragStartX, dragStartY;

function loadBgImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const bg = document.getElementById("bgImage");
    bg.src = e.target.result;
    bg.style.cursor = "grab";
    bg.removeEventListener("mousedown", startDrag);
    bg.addEventListener("mousedown", startDrag);
  };
  reader.readAsDataURL(file);
}

function startDrag(e) {
  isDragging = true;
  dragStartX = e.clientX; dragStartY = e.clientY;
  document.getElementById("bgImage").style.cursor = "grabbing";
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
}

function onDrag(e) {
  if (!isDragging) return;
  const card = document.getElementById("card");
  bgPosX = Math.min(100, Math.max(0, bgPosX - (e.clientX - dragStartX) / card.offsetWidth * 100));
  bgPosY = Math.min(100, Math.max(0, bgPosY - (e.clientY - dragStartY) / card.offsetHeight * 100));
  document.getElementById("bgImage").style.objectPosition = `${bgPosX}% ${bgPosY}%`;
  dragStartX = e.clientX; dragStartY = e.clientY;
}

function stopDrag() {
  isDragging = false;
  document.getElementById("bgImage").style.cursor = "grab";
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
}

function setLayout(mode, btn) {
  const card = document.getElementById("card");
  card.classList.remove("vertical", "horizontal");
  card.classList.add(mode);
  document.querySelectorAll(".layout-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  fitPreview();
}

function fitPreview() {
  const card = document.getElementById("card");
  const container = document.querySelector(".preview-container");
  const wrapper = document.getElementById("previewWrapper");
  const cw = container.clientWidth - 40;
  const ch = container.clientHeight - 40;
  const cardW = card.classList.contains("vertical") ? 1080 : 1920;
  const cardH = card.classList.contains("vertical") ? 1920 : 1080;
  const scale = Math.min(cw / cardW, ch / cardH);
  wrapper.style.transform = `scale(${scale})`;
  wrapper.style.width  = cardW + "px";
  wrapper.style.height = cardH + "px";
}

function saveImage() {
  html2canvas(document.getElementById("card"), { scale: 2 }).then(canvas => {
    const link = document.createElement("a");
    link.download = "character_sheet.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

// 현재 날짜 자동
function setCurrentDate() {
  const now = new Date();
  const months = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
                  "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
  document.getElementById("cardDate").innerText = `${months[now.getMonth()]} ${now.getFullYear()}`;
}

renderJobSelect();
renderLineArtSelect();
renderPlaystyleSelect();
drawBarcode();
setCurrentDate();
updateCard();
fitPreview();
window.addEventListener("resize", fitPreview);