interface Specialty { id: string; name: string; summary: string; nextSlotDays: number }
interface Unit { name: string; minutes: number }
type Period = "manha" | "tarde";
interface Booking { name: string; phone: string; specialtyId: string; date: string; period: Period; consent: boolean }
type Errors = Partial<Record<keyof Booking, string>>;

const specialties: Specialty[] = [
  { id: "clinica", name: "Clínica geral", summary: "Porta de entrada para exames e encaminhamentos.", nextSlotDays: 1 },
  { id: "cardio", name: "Cardiologia", summary: "Check-up do coração, arritmias e hipertensão.", nextSlotDays: 2 },
  { id: "pedia", name: "Pediatria", summary: "Bebês, crianças e adolescentes, do pré-natal à alta.", nextSlotDays: 0 },
  { id: "gineco", name: "Ginecologia e Obstetrícia", summary: "Pré-natal, parto e saúde da mulher.", nextSlotDays: 2 },
  { id: "orto", name: "Ortopedia", summary: "Lesões, coluna, joelho e reabilitação.", nextSlotDays: 3 },
  { id: "onco", name: "Oncologia", summary: "Diagnóstico e tratamento com equipe multidisciplinar.", nextSlotDays: 3 },
  { id: "derma", name: "Dermatologia", summary: "Pele, cabelo e unhas, com mapeamento de pintas.", nextSlotDays: 4 },
  { id: "neuro", name: "Neurologia", summary: "Enxaqueca, epilepsia e distúrbios do movimento.", nextSlotDays: 6 },
];

const units: Unit[] = [
  { name: "Pronto-socorro adulto", minutes: 25 },
  { name: "Pronto-socorro infantil", minutes: 12 },
  { name: "Maternidade", minutes: 8 },
  { name: "Exames de imagem", minutes: 48 },
];

const $ = <T extends HTMLElement>(sel: string): T => {
  const el = document.querySelector<T>(sel);
  if (!el) throw new Error("Elemento não encontrado: " + sel);
  return el;
};

const levelOf = (m: number): { cls: string; label: string } =>
  m < 20 ? { cls: "low", label: "Espera curta" }
  : m < 45 ? { cls: "mid", label: "Espera moderada" }
  : { cls: "high", label: "Espera longa" };

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let built = false;

function tween(el: HTMLElement, from: number, to: number): void {
  if (reduce || from === to) { el.textContent = to + " min"; return; }
  const t0 = performance.now();
  const step = (t: number): void => {
    const p = Math.min(1, (t - t0) / 800);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))) + " min";
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderUnits(): void {
  const ul = $("#units");
  if (!built) {
    ul.innerHTML = units.map((u) => `<li class="unit">
      <div class="unit-top"><span class="unit-name">${u.name}</span><span class="unit-min">0 min</span></div>
      <div class="bar" aria-hidden="true"><i style="width:0%"></i></div>
      <span class="unit-lvl"></span></li>`).join("");
    void ul.offsetWidth;
    built = true;
  }
  ul.querySelectorAll<HTMLElement>(".unit").forEach((li, i) => {
    const u = units[i];
    const l = levelOf(u.minutes);
    li.className = "unit " + l.cls;
    const min = li.querySelector<HTMLElement>(".unit-min") as HTMLElement;
    tween(min, Number(min.dataset.v ?? 0), u.minutes);
    min.dataset.v = String(u.minutes);
    (li.querySelector(".bar i") as HTMLElement).style.width = Math.min(100, Math.round((u.minutes / 90) * 100)) + "%";
    (li.querySelector(".unit-lvl") as HTMLElement).textContent = l.label;
  });
  $("#stamp").textContent = "Atualizado às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

interface Stat { value: number; suffix: string; label: string }
interface Step { title: string; text: string }
interface Faq { q: string; a: string }

const stats: Stat[] = [
  { value: 24, suffix: "h", label: "Pronto-socorro sempre aberto" },
  { value: 35, suffix: "+", label: "Especialidades médicas" },
  { value: 320, suffix: "", label: "Leitos, 60 deles de UTI" },
  { value: 4800, suffix: "", label: "Atendimentos por mês" },
];
const steps: Step[] = [
  { title: "Chegada e cadastro", text: "Você é recebido na entrada e o cadastro é feito em poucos minutos." },
  { title: "Triagem", text: "Um enfermeiro classifica a gravidade em até 5 minutos. Casos graves passam direto." },
  { title: "Atendimento médico", text: "Consulta, exames e medicação no mesmo andar, com a equipe acompanhando cada etapa." },
  { title: "Alta ou internação", text: "Você sai com orientações por escrito ou vai ao leito, com a família informada." },
];
const faq: Faq[] = [
  { q: "Preciso de encaminhamento para agendar?", a: "Na maioria das especialidades, não. Alguns convênios pedem guia, e a central avisa na confirmação." },
  { q: "Quais convênios vocês aceitam?", a: "Atendemos os principais convênios e também particular. Ligue para a central para confirmar o seu plano." },
  { q: "Posso ir com acompanhante?", a: "Sim, conforme a rotina de cada unidade. Crianças, idosos e gestantes sempre podem ter acompanhante." },
  { q: "Como recebo os resultados dos exames?", a: "Pelo portal do paciente e por e-mail, em geral no mesmo dia para exames de rotina." },
];

const fmt = (n: number, s: string): string => n.toLocaleString("pt-BR") + s;

function renderContent(): void {
  $("#stats").innerHTML = stats.map((s) => `<li class="stat"><b data-count="${s.value}" data-suffix="${s.suffix}">${fmt(s.value, s.suffix)}</b><span>${s.label}</span></li>`).join("");
  $("#steps").innerHTML = steps.map((s) => `<li><h3>${s.title}</h3><p>${s.text}</p></li>`).join("");
  $("#faq").innerHTML = faq.map((f, i) => `<div class="qa"><h3><button type="button" class="q" id="q${i}" aria-expanded="false" aria-controls="a${i}">${f.q}<span class="pm" aria-hidden="true"></span></button></h3><div class="a" id="a${i}" role="region" aria-labelledby="q${i}"><div><p>${f.a}</p></div></div></div>`).join("");
  $("#faq").addEventListener("click", (ev) => {
    const btn = (ev.target as HTMLElement).closest<HTMLButtonElement>(".q");
    if (!btn) return;
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    btn.closest(".qa")?.classList.toggle("open", open);
  });
}

function countUp(el: HTMLElement): void {
  const to = Number(el.dataset.count);
  const sfx = el.dataset.suffix ?? "";
  const t0 = performance.now();
  const step = (t: number): void => {
    const p = Math.min(1, (t - t0) / 1600);
    el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 4))), sfx);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function setupReveal(): void {
  if (reduce || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("js");
  const rv = document.querySelectorAll<HTMLElement>("section .t, section .sub, .book > div, .fcols > div, #faq .qa");
  const trg = document.querySelectorAll<HTMLElement>(".trg");
  trg.forEach((t) => t.querySelectorAll<HTMLElement>("[data-count]").forEach((c) => { c.textContent = fmt(0, c.dataset.suffix ?? ""); }));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const t = e.target as HTMLElement;
      t.classList.add("in");
      t.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
      io.unobserve(t);
    });
  }, { threshold: 0.2 });
  rv.forEach((el, i) => { el.classList.add("rv"); el.style.transitionDelay = (i % 3) * 90 + "ms"; io.observe(el); });
  trg.forEach((el) => io.observe(el));
}

function setupHero(): void {
  if (reduce) return;
  const h1 = $(".hero h1");
  const text = h1.textContent ?? "";
  h1.setAttribute("aria-label", text);
  h1.classList.add("split");
  h1.innerHTML = text.split(" ").map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(" ");
  const stage = $(".stage");
  stage.addEventListener("pointermove", (e: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    stage.style.setProperty("--mx", e.clientX - r.left + "px");
    stage.style.setProperty("--my", e.clientY - r.top + "px");
  });
}

interface Doctor { name: string; role: string; days: string; specId: string }
const doctors: Doctor[] = [
  { name: "Dra. Helena Duarte", role: "Cardiologia", days: "Segunda, quarta e sexta", specId: "cardio" },
  { name: "Dr. Marcelo Tavares", role: "Ortopedia", days: "Terça e quinta", specId: "orto" },
  { name: "Dra. Beatriz Nogueira", role: "Pediatria", days: "Segunda a sexta", specId: "pedia" },
  { name: "Dr. Rafael Lima", role: "Neurologia", days: "Quarta e sexta", specId: "neuro" },
];
const plans: string[] = ["VidaPlena", "Saúde Total", "Nova Saúde", "Prime Care", "Clínica Unida", "Bem Estar", "Horizonte Saúde", "Amparo"];
const canHover = window.matchMedia("(hover: hover)").matches;

const initials = (n: string): string => n.replace(/^Dra?\.\s*/, "").split(" ").map((p) => p[0]).slice(0, 2).join("");

function renderTeam(): void {
  $("#team").innerHTML = doctors.map((d, i) => `<li class="doc tilt" style="--i:${i}"><span class="av" aria-hidden="true"><b>${initials(d.name)}</b></span><h3>${d.name}</h3><p class="role">${d.role}</p><p class="days">${d.days}</p><button type="button" class="link" data-id="${d.specId}">Agendar consulta</button></li>`).join("");
  const chips = (hide: boolean): string => plans.map((p) => `<span class="chip"${hide ? ' aria-hidden="true"' : ""}>${p}</span>`).join("");
  $("#plans").innerHTML = chips(false) + chips(true);
}

function setupTilt(): void {
  if (reduce || !canHover) return;
  document.addEventListener("pointermove", (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(".tilt");
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--ry", (((e.clientX - r.left) / r.width) - 0.5) * 10 + "deg");
    el.style.setProperty("--rx", (0.5 - ((e.clientY - r.top) / r.height)) * 10 + "deg");
  });
  document.addEventListener("pointerout", (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(".tilt");
    if (el && !el.contains(e.relatedTarget as Node | null)) { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); }
  });
}

function setupMagnet(): void {
  if (reduce || !canHover) return;
  document.querySelectorAll<HTMLElement>(".btn, nav .sos").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });
}

function setupMenu(): void {
  const btn = $<HTMLButtonElement>(".burger");
  const nav = $("#menu");
  const set = (open: boolean): void => {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  };
  btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("a, button")) set(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
}

function setupTyper(): void {
  if (reduce) return;
  const el = $("#rot");
  const words = ["emergências", "partos", "exames de imagem", "consultas"];
  let w = 0, c = words[0].length, dir = -1;
  const tick = (): void => {
    const word = words[w];
    el.textContent = word.slice(0, c);
    let delay = dir === 1 ? 70 : 35;
    if (dir === 1 && c === word.length) { dir = -1; delay = 1600; }
    else if (dir === -1 && c === 0) { dir = 1; w = (w + 1) % words.length; delay = 300; }
    c += dir;
    setTimeout(tick, delay);
  };
  setTimeout(tick, 5600);
}

type PageId = "login" | "inicio" | "especialidades" | "atendimento" | "agendar";
const PAGES: PageId[] = ["login", "inicio", "especialidades", "atendimento", "agendar"];
const TITLES: Record<PageId, string> = { login: "Entrar", inicio: "Início", especialidades: "Especialidades", atendimento: "Atendimento", agendar: "Agendar consulta" };
interface Session { name: string; guest: boolean }

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
let session: Session | null = null;
try {
  const raw = sessionStorage.getItem("cuidar:session");
  const p = raw ? (JSON.parse(raw) as Session) : null;
  if (p && typeof p.name === "string") session = p;
} catch { session = null; }
const saveSession = (): void => {
  try {
    if (session) sessionStorage.setItem("cuidar:session", JSON.stringify(session));
    else sessionStorage.removeItem("cuidar:session");
  } catch { /* armazenamento indisponível: a sessão vale só nesta aba */ }
};

let current: PageId | null = null;
let busy = false;
let target: PageId | null = null;
let pendingFocus: string | null = null;

const fromHash = (): PageId | null => {
  const h = location.hash.replace(/^#\/?/, "");
  return (PAGES as string[]).includes(h) ? (h as PageId) : null;
};
const wanted = (): PageId => {
  const p = target ?? (session ? "inicio" : "login");
  return p !== "login" && !session ? "login" : p;
};
const syncHash = (p: PageId): void => {
  try { if (location.hash !== "#/" + p) history.replaceState(null, "", "#/" + p); } catch { /* ignora */ }
};

function swap(page: PageId): void {
  if (current !== null && performance.now() > 4300) document.documentElement.classList.remove("intro");
  document.querySelectorAll<HTMLElement>(".page").forEach((p) => p.classList.toggle("active", p.dataset.page === page));
  document.body.dataset.page = page;
  document.title = "Cuidar + | " + TITLES[page];
  document.querySelectorAll<HTMLAnchorElement>("nav a[data-nav]").forEach((a) => {
    const on = a.dataset.nav === page;
    a.classList.toggle("cur", on);
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  $("#who").textContent = session ? (session.guest ? "Visitante" : "Olá, " + session.name) : "";
  $("#auth").textContent = session?.guest ? "Entrar" : "Sair";
  if (page === "inicio") { built = false; renderUnits(); }
  window.scrollTo(0, 0);
  const f = pendingFocus;
  pendingFocus = null;
  if (f) $<HTMLElement>(f).focus({ preventScroll: true });
  else if (current !== null) $("#main").focus({ preventScroll: true });
}

async function wipe(mid: () => void): Promise<void> {
  if (reduce || !("animate" in Element.prototype)) { mid(); return; }
  const el = $("#wipe");
  const [a, b] = Array.from(el.querySelectorAll<HTMLElement>(".wl"));
  const mark = $("#wipe .wm");
  const slide = (n: HTMLElement, from: string, to: string, delay: number): Promise<Animation> =>
    n.animate([{ transform: `translateX(${from})` }, { transform: `translateX(${to})` }], { duration: 520, delay, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" }).finished;
  const pop = (from: Keyframe, to: Keyframe, d: number, delay: number): Promise<Animation> =>
    mark.animate([from, to], { duration: d, delay, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }).finished;
  el.classList.add("on");
  await Promise.all([
    slide(a, "-101%", "0%", 0), slide(b, "-101%", "0%", 110),
    pop({ opacity: 0, transform: "scale(.6) rotate(-90deg)" }, { opacity: 1, transform: "scale(1) rotate(0deg)" }, 500, 330),
  ]);
  mid();
  await sleep(150);
  await pop({ opacity: 1, transform: "scale(1) rotate(0deg)" }, { opacity: 0, transform: "scale(1.25) rotate(90deg)" }, 250, 0);
  await Promise.all([slide(b, "0%", "101%", 0), slide(a, "0%", "101%", 110)]);
  [a, b, mark].forEach((n) => n.getAnimations().forEach((x) => x.cancel()));
  el.classList.remove("on");
}

async function route(): Promise<void> {
  if (busy) return;
  const page = wanted();
  if (page === current) { syncHash(page); return; }
  busy = true;
  try {
    if (current === null) swap(page); else await wipe(() => swap(page));
    current = page;
    syncHash(page);
  } finally { busy = false; }
  if (wanted() !== current) void route();
}

function navigate(p: PageId): void {
  target = p;
  try { location.hash = "#/" + p; } catch { /* ignora */ }
  void route();
}

function setupRouter(): void {
  target = fromHash();
  window.addEventListener("hashchange", () => {
    const p = fromHash();
    if (p) { target = p; void route(); }
  });
  $("#auth").addEventListener("click", () => { session = null; saveSession(); navigate("login"); });
  void route();
}

function setupLogin(): void {
  const form = $<HTMLFormElement>("#login-form");
  const email = $<HTMLInputElement>("#l-email");
  const pass = $<HTMLInputElement>("#l-pass");
  const btn = $<HTMLButtonElement>("#l-btn");
  const eye = $<HTMLButtonElement>("#l-eye");
  const setErr = (id: string, input: HTMLInputElement, msg: string): void => {
    $("#err-" + id).textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
  };
  eye.addEventListener("click", () => {
    const show = pass.type === "password";
    pass.type = show ? "text" : "password";
    eye.textContent = show ? "Ocultar" : "Mostrar";
    eye.setAttribute("aria-pressed", String(show));
  });
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    const okPass = pass.value.length >= 6;
    setErr("l-email", email, okEmail ? "" : "Digite um e-mail válido, como nome@email.com.");
    setErr("l-pass", pass, okPass ? "" : "A senha precisa ter pelo menos 6 caracteres.");
    if (!okEmail || !okPass) {
      form.classList.remove("shake");
      void form.offsetWidth;
      form.classList.add("shake");
      (okEmail ? pass : email).focus();
      return;
    }
    btn.disabled = true;
    btn.classList.add("loading");
    btn.textContent = "Entrando…";
    await sleep(reduce ? 200 : 1100);
    const first = email.value.trim().split("@")[0].split(/[._-]/)[0].slice(0, 20);
    session = { name: first.charAt(0).toUpperCase() + first.slice(1), guest: false };
    saveSession();
    pass.value = "";
    btn.disabled = false;
    btn.classList.remove("loading");
    btn.textContent = "Entrar";
    navigate("inicio");
  });
  $("#l-guest").addEventListener("click", () => { session = { name: "Visitante", guest: true }; saveSession(); navigate("inicio"); });
  $("#l-forgot").addEventListener("click", (ev) => {
    ev.preventDefault();
    $("#l-msg").textContent = "Ambiente demonstrativo: não há recuperação de senha.";
  });
}

function setupFloaters(): void {
  if (reduce) return;
  $("#fps").innerHTML = Array.from({ length: 16 }, () => {
    const s = 10 + Math.random() * 26;
    return `<i style="left:${(Math.random() * 100).toFixed(1)}%;--s:${s.toFixed(0)}px;--t:${(9 + Math.random() * 9).toFixed(1)}s;--d:${(-Math.random() * 14).toFixed(1)}s"></i>`;
  }).join("");
}

function setupScroll(): void {
  const bar = $("#progress");
  const head = $("header");
  const fab = $("#fab");
  let queued = false;
  const update = (): void => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
    head.classList.toggle("scrolled", window.scrollY > 8);
    fab.classList.toggle("show", window.scrollY > 500);
    queued = false;
  };
  window.addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

function drift(): void {
  units.forEach((u) => {
    u.minutes = Math.max(5, Math.min(90, u.minutes + Math.round(Math.random() * 10 - 5)));
  });
  renderUnits();
}

const slotText = (d: number): string => (d === 0 ? "hoje" : d === 1 ? "amanhã" : `em ${d} dias`);

function renderSpecialties(query: string): void {
  const q = query.trim().toLowerCase();
  const list = specialties.filter((s) => (s.name + " " + s.summary).toLowerCase().includes(q));
  $("#spec-list").innerHTML = list.length
    ? list.map((s, i) => `<li class="spec" style="animation-delay:${i * 60}ms">
        <span class="badge" aria-hidden="true">${s.name[0]}</span><h3>${s.name}</h3><p>${s.summary}</p>
        <div class="spec-foot"><span>Próxima vaga ${slotText(s.nextSlotDays)}</span>
        <button type="button" class="link" data-id="${s.id}">Agendar</button></div></li>`).join("")
    : `<li class="empty">Nenhuma especialidade encontrada para “${q.replace(/[<>&]/g, "")}”. Tente outro termo ou ligue para (11) 3000-0100.</li>`;
}

function validate(b: Booking): Errors {
  const e: Errors = {};
  if (b.name.trim().split(/\s+/).filter(Boolean).length < 2) e.name = "Informe nome e sobrenome.";
  const digits = b.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 11) e.phone = "Digite o telefone com DDD, por exemplo (11) 91234-5678.";
  if (!b.specialtyId) e.specialtyId = "Escolha uma especialidade.";
  if (!b.consent) e.consent = "Autorize o contato para enviar a solicitação.";
  if (!b.date) e.date = "Escolha uma data.";
  else if (b.date < todayISO()) e.date = "Escolha uma data a partir de hoje.";
  return e;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readForm(form: HTMLFormElement): Booking {
  const f = new FormData(form);
  return {
    name: String(f.get("name") ?? ""),
    phone: String(f.get("phone") ?? ""),
    specialtyId: String(f.get("specialtyId") ?? ""),
    date: String(f.get("date") ?? ""),
    period: f.get("period") === "tarde" ? "tarde" : "manha",
    consent: f.get("consent") === "on",
  };
}

const FIELDS = ["name", "phone", "specialtyId", "date", "consent"] as const;

function showErrors(form: HTMLFormElement, errs: Errors): void {
  FIELDS.forEach((k) => {
    const input = form.elements.namedItem(k) as HTMLInputElement | HTMLSelectElement;
    const out = $("#err-" + k);
    out.textContent = errs[k] ?? "";
    input.setAttribute("aria-invalid", errs[k] ? "true" : "false");
  });
  const first = FIELDS.find((k) => errs[k]);
  if (first) (form.elements.namedItem(first) as HTMLElement).focus();
}

function init(): void {
  renderUnits();
  renderContent();
  renderTeam();
  setupReveal();
  setupScroll();
  setupHero();
  setupTilt();
  setupMagnet();
  setupMenu();
  setupTyper();
  setupLogin();
  setupFloaters();
  setupRouter();
  setInterval(drift, 8000);

  const search = $<HTMLInputElement>("#search");
  renderSpecialties("");
  search.addEventListener("input", () => renderSpecialties(search.value));

  const phone = $<HTMLInputElement>("#phone");
  phone.addEventListener("input", () => {
    const d = phone.value.replace(/\D/g, "").slice(0, 11);
    phone.value = d.length > 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
      : d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
      : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
  });

  const form = $<HTMLFormElement>("#book");
  const select = $<HTMLSelectElement>("#specialtyId");
  select.insertAdjacentHTML("beforeend", specialties.map((s) => `<option value="${s.id}">${s.name}</option>`).join(""));
  $<HTMLInputElement>("#date").min = todayISO();

  const goBook = (ev: Event): void => {
    const btn = (ev.target as HTMLElement).closest<HTMLButtonElement>("button[data-id]");
    if (!btn) return;
    select.value = btn.dataset.id ?? "";
    pendingFocus = "#name";
    navigate("agendar");
  };
  $("#spec-list").addEventListener("click", goBook);
  $("#team").addEventListener("click", goBook);

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const b = readForm(form);
    const errs = validate(b);
    showErrors(form, errs);
    if (Object.keys(errs).length) return;
    const spec = specialties.find((s) => s.id === b.specialtyId);
    const [y, m, d] = b.date.split("-").map(Number);
    const when = new Date(y, m - 1, d).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    $("#ok-name").textContent = b.name.trim().split(/\s+/)[0];
    $("#ok-detail").textContent = `${spec?.name}, ${when}, período da ${b.period === "manha" ? "manhã" : "tarde"}.`;
    $("#ok-code").textContent = "CDR-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    form.hidden = true;
    $("#ok").hidden = false;
    $("#ok").focus();
  });

  $("#again").addEventListener("click", () => {
    form.reset();
    showErrors(form, {});
    $("#ok").hidden = true;
    form.hidden = false;
    $<HTMLInputElement>("#name").focus();
  });
}

document.addEventListener("DOMContentLoaded", init);
