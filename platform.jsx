import React, { useState, useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  بيانات المواد — التيرم الأول                                        */
/* ------------------------------------------------------------------ */

const TERM_CODE = "TERM1-2026";
const WATCH_THRESHOLD = 70;
const PASS_THRESHOLD = 60;
const QUIZ_MINUTES = 30;
const QUESTIONS_PER_QUIZ = 5;
// لينك الـ Apps Script بتاع الشيت
const REGISTRATION_ENDPOINT = "https://script.google.com/macros/s/AKfycbz9K3q7AAuflERj4qbtvhMg9QGEdqFQnixlgBpWE_hdDmSKkJSsOZa431Hjc8YEjccq/exec";

const SUBJECTS = [
  {
    id: "em", name: "كهربية ومغناطيسية", code: "EM-2026",
    tagline: "من الشحنة الساكنة إلى المجال المغناطيسي", accent: "amber", icon: "magnet",
    lectures: [
      { id: 1, title: "الشحنة الكهربية وقانون كولوم", code: "EM-L1", videoUrl: "https://youtu.be/UzEuRQMEPB0", durationMinutes: 20, fileUrl: "https://drive.google.com/file/d/1b1aPLjTSQaMrVWwKc3U7VVIXD6A-Cy9c/view?usp=sharing" },
      { id: 2, title: "المجال الكهربي وخطوط المجال", code: "EM-L2", videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", durationMinutes: 1 },
      { id: 3, title: "الجهد الكهربي والسعة", code: "EM-L3", videoUrl: "", durationMinutes: 20 },
      { id: 4, title: "المجال المغناطيسي وقوة لورنتز", code: "EM-L4", videoUrl: "", durationMinutes: 20 },
    ],
  },
  {
    id: "st", name: "استاتيكا", code: "ST-2026",
    tagline: "اتزان القوى والعزوم في الأجسام الساكنة", accent: "teal", icon: "lever",
    lectures: [
      { id: 1, title: "أنظمة القوى المتقابلة", code: "ST-L1", videoUrl: "", durationMinutes: 20 },
      { id: 2, title: "العزم وشروط الاتزان", code: "ST-L2", videoUrl: "", durationMinutes: 20 },
      { id: 3, title: "مركز الثقل للأجسام المنتظمة", code: "ST-L3", videoUrl: "", durationMinutes: 20 },
      { id: 4, title: "الاحتكاك والأسطح المائلة", code: "ST-L4", videoUrl: "", durationMinutes: 20 },
    ],
  },
  {
    id: "ht", name: "حرارة", code: "HT-2026",
    tagline: "الطاقة الحرارية وانتقالها وتأثيرها على المادة", accent: "amber", icon: "thermo",
    lectures: [
      { id: 1, title: "درجة الحرارة وقوانين الغازات", code: "HT-L1", videoUrl: "", durationMinutes: 20 },
      { id: 2, title: "طرق انتقال الحرارة", code: "HT-L2", videoUrl: "", durationMinutes: 20 },
      { id: 3, title: "التمدد الحراري", code: "HT-L3", videoUrl: "", durationMinutes: 20 },
      { id: 4, title: "القانون الأول للديناميكا الحرارية", code: "HT-L4", videoUrl: "", durationMinutes: 20 },
    ],
  },
  {
    id: "mp", name: "خواص المادة", code: "MP-2026",
    tagline: "المرونة والموائع والشد السطحي", accent: "teal", icon: "lattice",
    lectures: [
      { id: 1, title: "المرونة وقانون هوك", code: "MP-L1", videoUrl: "", durationMinutes: 20 },
      { id: 2, title: "الضغط في الموائع الساكنة", code: "MP-L2", videoUrl: "", durationMinutes: 20 },
      { id: 3, title: "الشد السطحي والخاصية الشعرية", code: "MP-L3", videoUrl: "", durationMinutes: 20 },
      { id: 4, title: "اللزوجة وقانون ستوكس", code: "MP-L4", videoUrl: "", durationMinutes: 20 },
    ],
  },
];

const ALL_LECTURE_CODES = SUBJECTS.flatMap((s) => s.lectures.map((l) => ({ code: l.code, subjectId: s.id, lectureId: l.id })));
const SUBJECT_CODES = SUBJECTS.map((s) => ({ code: s.code, subjectId: s.id }));

/* ------------------------------------------------------------------ */
/*  بنك أسئلة تجريبي                                                     */
/* ------------------------------------------------------------------ */

const QUESTION_BANK = [
  { q: "أي كمية فيزيائية تقاس بوحدة الجول؟", options: ["الطاقة", "القوة", "السرعة"], correct: 0 },
  { q: "الاتزان الساكن يتحقق عندما يكون محصلة القوى والعزوم:", options: ["أكبر من صفر", "تساوي صفر", "غير ثابتة"], correct: 1 },
  { q: "وحدة قياس الشحنة الكهربية هي:", options: ["الفولت", "الكولوم", "الأوم"], correct: 1 },
  { q: "انتقال الحرارة من جسم لآخر بدون وسيط مادي يسمى:", options: ["توصيل", "حمل", "إشعاع"], correct: 2 },
  { q: "قانون هوك يربط بين القوة و:", options: ["الاستطالة", "الكتلة", "الزمن"], correct: 0 },
  { q: "خطوط المجال المغناطيسي تخرج من:", options: ["القطب الجنوبي", "القطب الشمالي", "منتصف المغناطيس"], correct: 1 },
  { q: "الضغط داخل مائع ساكن يزداد مع:", options: ["نقصان العمق", "زيادة العمق", "لا علاقة بالعمق"], correct: 1 },
  { q: "التمدد الحراري للمواد الصلبة سببه:", options: ["زيادة طاقة الجزيئات الحركية", "نقصان الكتلة", "تغير اللون"], correct: 0 },
  { q: "الصورة التالية توضح خطوط المجال حول مغناطيس. اتجاه الخطوط برّه المغناطيس يكون من:", image: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Magnet0873.png", options: ["الجنوب للشمال", "الشمال للجنوب", "بيبقى ثابت مايتحركش"], correct: 1 },
];

// كل سؤال ممكن يتحط له: q (نص) بس، أو image بس (سيب q فاضية أو وصف مختصر)، أو الاتنين مع بعض.
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function buildQuizSet() {
  const picked = shuffle(QUESTION_BANK).slice(0, Math.min(QUESTIONS_PER_QUIZ, QUESTION_BANK.length));
  return picked.map((item) => {
    const withFlag = item.options.map((opt, i) => ({ opt, isCorrect: i === item.correct }));
    const s = shuffle(withFlag);
    return { q: item.q, image: item.image, options: s.map((o) => o.opt), correct: s.findIndex((o) => o.isCorrect) };
  });
}

/* ------------------------------------------------------------------ */
/*  أيقونات                                                              */
/* ------------------------------------------------------------------ */

function Icon({ name, className }) {
  const c = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "magnet": return (<svg viewBox="0 0 64 64" className={className} {...c}><path d="M20 12h10a12 12 0 0 1 12 12v10a12 12 0 0 1-12 12H20V12z" /><path d="M20 12v36M20 22h12M20 36h12" /><path d="M40 20c6 2 6 20 0 22" strokeDasharray="2 4" opacity="0.6" /><path d="M45 16c9 4 9 26 0 30" strokeDasharray="2 4" opacity="0.35" /></svg>);
    case "lever": return (<svg viewBox="0 0 64 64" className={className} {...c}><path d="M8 40l48-16" /><path d="M32 32v-8m0 0l-5 6m5-6l5 6" /><path d="M24 47l-9-14M40 34l9 14" /><path d="M10 47h10M45 47h10" /><circle cx="32" cy="24" r="3" /></svg>);
    case "thermo": return (<svg viewBox="0 0 64 64" className={className} {...c}><path d="M28 12v28a9 9 0 1 0 8 0V12a4 4 0 0 0-8 0z" /><path d="M32 22v14" strokeWidth="4" /><path d="M44 18c3 2 3 6 0 8M48 22c3 2 3 6 0 8M44 30c3 2 3 6 0 8" opacity="0.5" /></svg>);
    case "lattice": return (<svg viewBox="0 0 64 64" className={className} {...c}><path d="M16 16l16-8 16 8v16l-16 8-16-8V16z" /><path d="M16 16l16 8 16-8M32 24v24" /><circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" /><circle cx="48" cy="16" r="2" fill="currentColor" stroke="none" /><circle cx="32" cy="8" r="2" fill="currentColor" stroke="none" /><circle cx="16" cy="32" r="2" fill="currentColor" stroke="none" /><circle cx="48" cy="32" r="2" fill="currentColor" stroke="none" /><circle cx="32" cy="48" r="2" fill="currentColor" stroke="none" /></svg>);
    case "lock": return (<svg viewBox="0 0 24 24" className={className} {...c}><rect x="5" y="10.5" width="14" height="9.5" rx="1.5" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></svg>);
    case "unlock": return (<svg viewBox="0 0 24 24" className={className} {...c}><rect x="5" y="10.5" width="14" height="9.5" rx="1.5" /><path d="M8 10.5V7a4 4 0 0 1 7.2-2.4" /></svg>);
    case "play": return (<svg viewBox="0 0 24 24" className={className} {...c} fill="currentColor" stroke="none"><path d="M8 5.5v13l11-6.5-11-6.5z" /></svg>);
    case "file": return (<svg viewBox="0 0 24 24" className={className} {...c}><path d="M7 3h7l4 4v14H7V3z" /><path d="M14 3v4h4M9.5 12h5M9.5 15.5h5" /></svg>);
    case "quiz": return (<svg viewBox="0 0 24 24" className={className} {...c}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.2c0-1.5 1.1-2.4 2.5-2.4s2.4.8 2.4 2c0 1.6-2.4 1.6-2.4 3.4" /><circle cx="12" cy="16.3" r="0.9" fill="currentColor" stroke="none" /></svg>);
    case "check": return (<svg viewBox="0 0 24 24" className={className} {...c}><path d="M5 12.5l5 5 9-10" /></svg>);
    case "clock": return (<svg viewBox="0 0 24 24" className={className} {...c}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>);
    case "user": return (<svg viewBox="0 0 24 24" className={className} {...c}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1.5-4 4.5-6 7-6s5.5 2 7 6" /></svg>);
    case "shield": return (<svg viewBox="0 0 24 24" className={className} {...c}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /></svg>);
    case "upload": return (<svg viewBox="0 0 24 24" className={className} {...c}><path d="M12 16V6M8 10l4-4 4 4" /><path d="M5 18h14" /></svg>);
    default: return null;
  }
}

/* ------------------------------------------------------------------ */
/*  تحويل لينك المحاضرة                                                  */
/* ------------------------------------------------------------------ */

function isDirectFile(url) { return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url); }
function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
      const id = u.searchParams.get("v");
      if (id) return id;
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
    }
    return null;
  } catch { return null; }
}
function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("vimeo.com")) { const id = u.pathname.split("/").filter(Boolean).pop(); return `https://player.vimeo.com/video/${id}`; }
    return url;
  } catch { return url; }
}

/* ------------------------------------------------------------------ */
/*  علامة مائية متحركة فوق الفيديو                                       */
/* ------------------------------------------------------------------ */

const WATERMARK_SPOTS = [
  { top: "8%", left: "8%" }, { top: "8%", right: "8%" },
  { bottom: "16%", left: "8%" }, { bottom: "16%", right: "8%" },
  { top: "45%", left: "50%", transform: "translateX(-50%)" },
];

function Watermark({ text }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % WATERMARK_SPOTS.length), 7000);
    return () => clearInterval(t);
  }, []);
  if (!text) return null;
  return <div className="watermark" style={WATERMARK_SPOTS[idx]}>{text}</div>;
}

/* ------------------------------------------------------------------ */
/*  مشغلات الفيديو                                                       */
/* ------------------------------------------------------------------ */

function LecturePlayer({ url, durationMinutes, initialWatched = 0, onProgress, watermarkText }) {
  if (!url) return (<div className="lu-placeholder"><Icon name="play" className="lu-mini" /> المحاضرة غير متوفرة الآن</div>);
  const ytId = extractYouTubeId(url);
  if (ytId) return <YouTubePlayer videoId={ytId} initialWatched={initialWatched} onProgress={onProgress} watermarkText={watermarkText} />;
  return isDirectFile(url)
    ? <DirectVideoPlayer src={url} initialWatched={initialWatched} onProgress={onProgress} watermarkText={watermarkText} />
    : <EmbeddedVideoPlayer url={url} durationMinutes={durationMinutes} initialWatched={initialWatched} onProgress={onProgress} watermarkText={watermarkText} />;
}

/* تحميل مكتبة يوتيوب الرسمية مرة واحدة بس وإعادة استخدامها */
let ytApiPromise = null;
function loadYouTubeAPI() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prevReady) prevReady(); resolve(window.YT); };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

/* مشغل يوتيوب الحقيقي — بيتابع وقت التشغيل الفعلي من الفيديو نفسه (مش تايمر افتراضي) */
function YouTubePlayer({ videoId, initialWatched, onProgress, watermarkText }) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const furthestRef = useRef(initialWatched);
  const [displayPercent, setDisplayPercent] = useState(initialWatched);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let destroyed = false;
    let pollTimer = null;
    let commitTimer = null;

    function commit() { onProgress(Math.round(furthestRef.current)); }
    function startTicking() {
      stopTicking();
      pollTimer = setInterval(() => {
        const p = playerRef.current;
        if (!p || typeof p.getDuration !== "function") return;
        const duration = p.getDuration();
        if (!duration) return;
        const percent = (p.getCurrentTime() / duration) * 100;
        if (percent > furthestRef.current) { furthestRef.current = percent; setDisplayPercent(percent); }
      }, 1000);
      commitTimer = setInterval(commit, 5000);
    }
    function stopTicking() {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      if (commitTimer) { clearInterval(commitTimer); commitTimer = null; commit(); }
    }

    loadYouTubeAPI().then((YT) => {
      if (destroyed || !YT || !mountRef.current) return;
      playerRef.current = new YT.Player(mountRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onError: () => setBlocked(true),
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) startTicking();
            else stopTicking();
            if (e.data === YT.PlayerState.ENDED) { furthestRef.current = 100; setDisplayPercent(100); commit(); }
          },
        },
      });
    });

    return () => {
      destroyed = true;
      stopTicking();
      if (playerRef.current && playerRef.current.destroy) { try { playerRef.current.destroy(); } catch (e) {} }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return (
    <div className="player-wrap">
      <div className="yt-embed-wrap">
        <div ref={mountRef} />
      </div>
      {blocked && <p className="yt-blocked-hint">لو الفيديو مش شغال هنا، جرب افتح الصفحة المنشورة بدل المعاينة داخل الشات.</p>}
      <Watermark text={watermarkText} />
      <div className="watch-bar-row">
        <div className="watch-bar"><div className="watch-bar-fill" style={{ width: `${Math.min(100, displayPercent)}%` }} /></div>
        <span className="watch-percent">{Math.round(displayPercent)}%</span>
      </div>
    </div>
  );
}

function DirectVideoPlayer({ src, initialWatched, onProgress, watermarkText }) {
  const videoRef = useRef(null);
  const furthestRef = useRef(initialWatched);
  const lastTimeRef = useRef(0);
  const [displayPercent, setDisplayPercent] = useState(initialWatched);
  function commit() { onProgress(Math.round(furthestRef.current)); }
  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const current = v.currentTime;
    const jump = current - lastTimeRef.current;
    if (jump >= 0 && jump <= 1.5) {
      const percent = (current / v.duration) * 100;
      if (percent > furthestRef.current) { furthestRef.current = percent; setDisplayPercent(percent); }
    }
    lastTimeRef.current = current;
  }
  return (
    <div className="player-wrap">
      <video ref={videoRef} src={src} controls controlsList="nodownload" onTimeUpdate={handleTimeUpdate} onPause={commit}
        onEnded={() => { furthestRef.current = 100; setDisplayPercent(100); commit(); }} className="lecture-video" />
      <Watermark text={watermarkText} />
      <div className="watch-bar-row">
        <div className="watch-bar"><div className="watch-bar-fill" style={{ width: `${Math.min(100, displayPercent)}%` }} /></div>
        <span className="watch-percent">{Math.round(displayPercent)}%</span>
      </div>
    </div>
  );
}

function EmbeddedVideoPlayer({ url, durationMinutes, initialWatched, onProgress, watermarkText }) {
  const furthestRef = useRef(initialWatched);
  const [displayPercent, setDisplayPercent] = useState(initialWatched);
  const minutes = durationMinutes && durationMinutes > 0 ? durationMinutes : 20;
  useEffect(() => {
    const tick = setInterval(() => {
      if (document.visibilityState === "visible") {
        const step = 100 / (minutes * 60);
        furthestRef.current = Math.min(100, furthestRef.current + step);
        setDisplayPercent(furthestRef.current);
      }
    }, 1000);
    const commitTick = setInterval(() => onProgress(Math.round(furthestRef.current)), 5000);
    return () => { clearInterval(tick); clearInterval(commitTick); onProgress(Math.round(furthestRef.current)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes]);
  return (
    <div className="player-wrap">
      <iframe src={toEmbedUrl(url)} title="فيديو المحاضرة" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen className="lecture-video lecture-iframe" />
      <Watermark text={watermarkText} />
      <div className="watch-bar-row">
        <div className="watch-bar"><div className="watch-bar-fill" style={{ width: `${Math.min(100, displayPercent)}%` }} /></div>
        <span className="watch-percent">{Math.round(displayPercent)}%</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  اختبار عشوائي بحد زمني                                               */
/* ------------------------------------------------------------------ */

function Quiz({ title, onClose, onSubmit }) {
  const [questions] = useState(() => buildQuizSet());
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_MINUTES * 60);
  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
  const percent = Math.round((score / questions.length) * 100);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => { if (s <= 1) { clearInterval(t); finish(); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  function finish() { setSubmitted(true); onSubmit(percent); }
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="quiz-overlay" onClick={submitted ? onClose : undefined}>
      <div className="quiz-box" onClick={(e) => e.stopPropagation()}>
        <div className="quiz-head">
          <span>اختبار: {title}</span>
          <div className="quiz-timer"><Icon name="clock" className="lu-mini" /> {mm}:{ss}</div>
          {submitted && <button className="quiz-close" onClick={onClose} aria-label="إغلاق">×</button>}
        </div>
        {questions.map((item, i) => (
          <div className="quiz-q" key={i}>
            {item.image && <img src={item.image} alt="" className="quiz-q-image" />}
            {item.q && <p>{item.q}</p>}
            <div className="quiz-opts">
              {item.options.map((opt, j) => (
                <label key={j} className={`quiz-opt ${submitted ? (j === item.correct ? "is-correct" : answers[i] === j ? "is-wrong" : "") : ""}`}>
                  <input type="radio" name={`q${i}`} disabled={submitted} checked={answers[i] === j} onChange={() => setAnswers((a) => ({ ...a, [i]: j }))} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
        {!submitted
          ? <button className="btn btn-amber" onClick={finish}>تسليم الإجابات</button>
          : <p className={`quiz-score ${percent >= PASS_THRESHOLD ? "pass" : "fail"}`}>النتيجة: {percent}% {percent >= PASS_THRESHOLD ? "— ناجح، المحاضرة اللي بعدها اتفتحت" : `— محتاج ${PASS_THRESHOLD}% على الأقل، جرب تاني`}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  فورم التسجيل                                                        */
/* ------------------------------------------------------------------ */

function maskNationalId(id) {
  if (!id) return "";
  const digits = id.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return "•".repeat(digits.length - 4) + digits.slice(-4);
}

function RegistrationForm({ onSubmitted }) {
  const [form, setForm] = useState({ name: "", nationalId: "", guardianPhone: "" });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.nationalId || !form.guardianPhone) return;
    setError("");

    const record = {
      id: Date.now(),
      name: form.name,
      nationalIdMasked: maskNationalId(form.nationalId),
      guardianPhone: form.guardianPhone,
      photoPreview,
      status: "pending",
    };

    if (!REGISTRATION_ENDPOINT) {
      // لسه مفيش لينك شيت متوصل — بتتسجل في معاينة الجلسة الحالية بس
      onSubmitted(record);
      setDone(true);
      return;
    }

    setSending(true);
    try {
      const photoBase64 = photoFile ? await fileToBase64(photoFile) : "";
      await fetch(REGISTRATION_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ name: form.name, nationalId: form.nationalId, guardianPhone: form.guardianPhone, photoBase64 }),
      });
      onSubmitted(record);
      setDone(true);
    } catch (err) {
      setError("حصل خطأ في إرسال الطلب، حاول تاني.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="reg-card reg-pending">
        <Icon name="shield" className="reg-pending-icon" />
        <h3>طلبك اتبعت للمراجعة</h3>
        <p>هيتم مراجعة بياناتك يدويًا من أ. محمد رمضان، وحسابك هيتفعّل بعد التأكد منها. الرقم القومي وصورة البطاقة بيانات حساسة ومحدش هيشوفها غير الأدمن.</p>
      </div>
    );
  }

  return (
    <form className="reg-card" onSubmit={submit}>
      <div className="demo-banner">
        <Icon name="shield" className="lu-mini" />
        بياناتك بتتبعت مباشرة لجدول خاص بالأدمن بس — محدش تاني يقدر يشوفها.
      </div>
      <h3>تسجيل حساب طالب جديد</h3>
      <label className="reg-field">
        <span>الاسم الكامل</span>
        <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="مثال: أحمد علي محمود" />
      </label>
      <label className="reg-field">
        <span>الرقم القومي</span>
        <input required value={form.nationalId} onChange={(e) => setForm((f) => ({ ...f, nationalId: e.target.value.replace(/\D/g, "").slice(0, 14) }))} placeholder="14 رقم" inputMode="numeric" />
      </label>
      <label className="reg-field">
        <span>رقم ولي الأمر</span>
        <input required value={form.guardianPhone} onChange={(e) => setForm((f) => ({ ...f, guardianPhone: e.target.value.replace(/\D/g, "").slice(0, 11) }))} placeholder="01xxxxxxxxx" inputMode="numeric" />
      </label>
      <label className="reg-field reg-upload">
        <span>صورة البطاقة الشخصية</span>
        <div className="upload-box">
          {photoPreview ? <img src={photoPreview} alt="معاينة البطاقة" className="upload-preview" /> : <Icon name="upload" className="upload-icon" />}
          <input type="file" accept="image/*" onChange={handlePhoto} required />
          <span className="upload-hint">{photoFile ? photoFile.name : "اضغط لرفع صورة واضحة للبطاقة"}</span>
        </div>
      </label>
      {error && <p className="inline-msg err">{error}</p>}
      <button className="btn btn-amber" type="submit" disabled={sending}>{sending ? "جاري الإرسال..." : "إرسال الطلب للمراجعة"}</button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  لوحة أدمن — معاينة فقط، تعرض طلبات نفس الجلسة الحالية بس              */
/* ------------------------------------------------------------------ */

function AdminPanel({ students, onDecide }) {
  return (
    <div className="admin-panel">
      <div className="demo-banner">
        <Icon name="shield" className="lu-mini" />
        دي معاينة لشكل لوحة الأدمن بس — الطلبات اللي بتتبعت فعليًا بتتخزن في الـ Google Sheet بتاعك، لكن اللي بيظهر جوّا اللوحة دي هنا هو بس طلبات الجلسة الحالية (مش بيقرأ من الشيت لسه).
      </div>
      <h2>طلبات التسجيل</h2>
      {students.length === 0 ? (
        <p className="admin-empty">مفيش طلبات لسه — جرب تسجل حساب من صفحة "تسجيل حساب".</p>
      ) : (
        <ul className="admin-list">
          {students.map((s) => (
            <li key={s.id} className="admin-row">
              {s.photoPreview ? <img src={s.photoPreview} alt="" className="admin-thumb" /> : <div className="admin-thumb admin-thumb-empty"><Icon name="user" className="lu-mini" /></div>}
              <div className="admin-info">
                <strong>{s.name}</strong>
                <span>رقم قومي: {s.nationalIdMasked}</span>
                <span>ولي الأمر: {s.guardianPhone}</span>
              </div>
              <div className="admin-actions">
                {s.status === "pending" ? (
                  <>
                    <button className="chip-approve" onClick={() => onDecide(s.id, "approved")}><Icon name="check" className="lu-mini" /> قبول</button>
                    <button className="chip-reject" onClick={() => onDecide(s.id, "rejected")}>رفض</button>
                  </>
                ) : (
                  <span className={`status-badge ${s.status}`}>{s.status === "approved" ? "مُفعّل" : "مرفوض"}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  صف اختبار المحاضرة السابقة                                          */
/* ------------------------------------------------------------------ */

function QuizGateRow({ lecture, watched, resultPercent, onOpen }) {
  const unlocked = watched >= WATCH_THRESHOLD;
  const done = resultPercent !== undefined;
  const passed = done && resultPercent >= PASS_THRESHOLD;
  return (
    <div className="quiz-gate">
      <div className="lu-row">
        <Icon name={passed ? "check" : "quiz"} className={`lu-icon ${passed ? "is-done" : ""}`} />
        <span className="lu-title">اختبار محاضرة: {lecture.title}</span>
      </div>
      {unlocked ? (
        <div className="lu-actions">
          <button className="lu-chip lu-chip-btn" onClick={onOpen}><Icon name="quiz" className="lu-mini" /> {done ? "إعادة الاختبار" : "ابدأ الاختبار"}</button>
          {done && <span className={`gate-result ${passed ? "pass" : "fail"}`}>آخر نتيجة: {resultPercent}%</span>}
        </div>
      ) : (
        <div className="gate-locked">
          <div className="watch-bar watch-bar-sm"><div className="watch-bar-fill" style={{ width: `${Math.min(100, watched)}%` }} /></div>
          <span className="gate-hint">اتفرجت {Math.round(watched)}% — محتاج {WATCH_THRESHOLD}% على الأقل عشان الاختبار يتفتح</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  واجهة محاضرة منفصلة داخل المادة                                      */
/* ------------------------------------------------------------------ */

function LectureStage({ subject, lecture, idx, accessUnlocked, paced, watched, resultPercent, prevLecture, prevWatched, prevResult, isLast, onProgress, onOpenQuiz, onOpenPrevQuiz, watermarkText }) {
  const fullyOpen = accessUnlocked && paced;
  return (
    <div className="lecture-stage">
      <div className="stage-head">
        <span className="stage-index">محاضرة {idx + 1}</span>
        <h4>{lecture.title}</h4>
      </div>

      {!accessUnlocked && <span className="lu-hint">كود المحاضرة: {lecture.code}</span>}

      {accessUnlocked && !paced && prevLecture && (
        <span className="lu-hint">هتتفتح بعد ما تخلص محاضرة "{prevLecture.title}" (مشاهدة {WATCH_THRESHOLD}%+ ودرجة {PASS_THRESHOLD}%+ في اختبارها)</span>
      )}

      {fullyOpen && (
        <>
          {prevLecture && (
            <QuizGateRow lecture={prevLecture} watched={prevWatched} resultPercent={prevResult} onOpen={onOpenPrevQuiz} />
          )}
          <div className="lu-actions">
            <LecturePlayer url={lecture.videoUrl} durationMinutes={lecture.durationMinutes} initialWatched={watched} onProgress={onProgress} watermarkText={watermarkText} />
            <div className="lu-buttons">
              {lecture.fileUrl
                ? <a href={lecture.fileUrl} target="_blank" rel="noopener noreferrer" className="lu-chip lu-chip-link"><Icon name="file" className="lu-mini" /> ملخص المحاضرة</a>
                : <span className="lu-chip"><Icon name="file" className="lu-mini" /> ملخص المحاضرة غير متاح</span>}
            </div>
          </div>
          {isLast && <QuizGateRow lecture={lecture} watched={watched} resultPercent={resultPercent} onOpen={onOpenQuiz} />}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  التطبيق الرئيسي                                                     */
/* ------------------------------------------------------------------ */

export default function App() {
  const [state, setState] = useState({ term: false, subjects: [], lectures: [], watched: {}, quizzesTaken: {}, lastCode: "" });
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState(null);
  const [openSubject, setOpenSubject] = useState(null);
  const [activeLecture, setActiveLecture] = useState({});
  const [quizFor, setQuizFor] = useState(null);
  const [view, setView] = useState("home"); // home | register | admin
  const [pendingStudents, setPendingStudents] = useState([]); // معاينة فقط - داخل الجلسة الحالية

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("mr-platform-unlocks", false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setState({ term: !!parsed.term, subjects: parsed.subjects || [], lectures: parsed.lectures || [], watched: parsed.watched || {}, quizzesTaken: parsed.quizzesTaken || {}, lastCode: parsed.lastCode || "" });
        }
      } catch (e) { /* لا يوجد بيانات محفوظة بعد */ }
    })();
  }, []);

  async function persist(next) {
    setState(next);
    try { await window.storage.set("mr-platform-unlocks", JSON.stringify(next), false); }
    catch (e) { console.error("تعذر حفظ حالة الفتح", e); }
  }

  function isSubjectUnlocked(subjectId) { return state.term || state.subjects.includes(subjectId); }
  function isLectureAccessUnlocked(subjectId, lectureId) { return isSubjectUnlocked(subjectId) || state.lectures.includes(`${subjectId}-${lectureId}`); }
  function watchedPercent(subjectId, lectureId) { return state.watched[`${subjectId}-${lectureId}`] || 0; }
  function quizResult(subjectId, lectureId) { return state.quizzesTaken[`${subjectId}-${lectureId}`]; }
  function isPaced(subjectId, lectures, idx) {
    if (idx === 0) return true;
    const prev = lectures[idx - 1];
    const w = watchedPercent(subjectId, prev.id);
    const qp = quizResult(subjectId, prev.id);
    return w >= WATCH_THRESHOLD && qp !== undefined && qp >= PASS_THRESHOLD;
  }

  function redeem(rawCode) {
    const c = rawCode.trim().toUpperCase();
    if (!c) return;
    if (c === TERM_CODE) { persist({ ...state, term: true, lastCode: c }); setMsg({ type: "ok", text: "تم فتح التيرم الأول كاملاً — كل المواد الأربع متاحة الآن." }); setCode(""); return; }
    const subj = SUBJECT_CODES.find((s) => s.code === c);
    if (subj) {
      if (state.subjects.includes(subj.subjectId)) setMsg({ type: "err", text: "المادة مفتوحة بالفعل." });
      else { persist({ ...state, subjects: [...state.subjects, subj.subjectId], lastCode: c }); const name = SUBJECTS.find((s) => s.id === subj.subjectId)?.name; setMsg({ type: "ok", text: `تم فتح مادة "${name}" بكل محاضراتها.` }); }
      setCode(""); return;
    }
    const lec = ALL_LECTURE_CODES.find((l) => l.code === c);
    if (lec) {
      const key = `${lec.subjectId}-${lec.lectureId}`;
      if (state.lectures.includes(key)) setMsg({ type: "err", text: "المحاضرة مفتوحة بالفعل." });
      else { persist({ ...state, lectures: [...state.lectures, key], lastCode: c }); setMsg({ type: "ok", text: "تم فتح المحاضرة." }); setOpenSubject(lec.subjectId); }
      setCode(""); return;
    }
    setMsg({ type: "err", text: "الكود غير صحيح، تأكد منه وحاول مرة أخرى." });
  }

  function handleProgress(subjectId, lectureId, percent) {
    const key = `${subjectId}-${lectureId}`;
    const current = state.watched[key] || 0;
    if (percent > current) persist({ ...state, watched: { ...state.watched, [key]: percent } });
  }
  function handleQuizSubmit(subjectId, lecture, percent) {
    const key = `${subjectId}-${lecture.id}`;
    const current = state.quizzesTaken[key];
    const best = current === undefined ? percent : Math.max(current, percent);
    persist({ ...state, quizzesTaken: { ...state.quizzesTaken, [key]: best } });
  }
  async function resetAll() { await persist({ term: false, subjects: [], lectures: [], watched: {}, quizzesTaken: {}, lastCode: "" }); setMsg(null); setOpenSubject(null); }

  function addPendingStudent(s) { setPendingStudents((list) => [s, ...list]); }
  function decideStudent(id, status) { setPendingStudents((list) => list.map((s) => (s.id === id ? { ...s, status } : s))); }

  return (
    <div className="platform" dir="rtl">
      <style>{CSS}</style>

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">م</span>
          <div className="brand-text"><strong>منصة المستر</strong><span>أ. محمد رمضان</span></div>
        </div>
        <nav className="topnav">
          <button className={`nav-link ${view === "home" ? "active" : ""}`} onClick={() => setView("home")}>المحاضرات</button>
          <button className={`nav-link ${view === "register" ? "active" : ""}`} onClick={() => setView("register")}>تسجيل حساب</button>
          <button className={`nav-link ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}>لوحة التحكم (تجريبي)</button>
        </nav>
        {view === "home" && (
          <div className="topbar-code">
            <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && redeem(code)} placeholder="أدخل كود الفتح" aria-label="كود الفتح" />
            <button className="btn btn-amber btn-sm" onClick={() => redeem(code)}>فتح</button>
          </div>
        )}
      </header>

      {view === "register" && (
        <section className="page-section">
          <RegistrationForm onSubmitted={addPendingStudent} />
        </section>
      )}

      {view === "admin" && (
        <section className="page-section">
          <AdminPanel students={pendingStudents} onDecide={decideStudent} />
        </section>
      )}

      {view === "home" && (
        <>
          <section className="hero">
            <svg className="hero-lines" viewBox="0 0 400 260" preserveAspectRatio="none" aria-hidden="true">
              <path className="draw d1" d="M20 200 Q 100 40 200 130 T 380 90" />
              <path className="draw d2" d="M30 60 C 120 10, 180 150, 300 60" />
              <circle className="draw d3" cx="330" cy="150" r="46" />
            </svg>
            <div className="hero-content">
              <p className="eyebrow-free">مجاني للدفعة الحالية — بكود دعوة</p>
              <h1>الفيزياء بشكل مبسط وميسر.</h1>
              <p className="hero-sub">
                أزيك يا مستر، أنا أخوك وزميلك محمد رمضان، وجاي علشان أوفر عليك
                صداع المصادر الكتير وأقلل التشتت اللي بتتعرضله خلال دراستك
                الجامعية. أتمنى تستفيد فعلًا من التجربة المختلفة والمميزة دي يا
                صديقي، وخليك عارف إني بحبك في الله ❤️
              </p>
              {msg && <p className={`inline-msg ${msg.type}`}>{msg.text}</p>}
            </div>
          </section>

          <section className="subjects">
            <div className="subjects-head"><h2>مواد التيرم الأول</h2><span className="subjects-count">4 مواد · 16 محاضرة</span></div>

            <div className="grid">
              {SUBJECTS.map((s) => {
                const subjectUnlocked = isSubjectUnlocked(s.id);
                const open = openSubject === s.id;
                const unlockedCount = s.lectures.filter((l) => isLectureAccessUnlocked(s.id, l.id)).length;
                const activeId = activeLecture[s.id] || s.lectures[0].id;
                const activeIdx = s.lectures.findIndex((l) => l.id === activeId);
                const activeLec = s.lectures[activeIdx];
                const accessUnlocked = isLectureAccessUnlocked(s.id, activeLec.id);
                const paced = isPaced(s.id, s.lectures, activeIdx);
                const prevLec = activeIdx > 0 ? s.lectures[activeIdx - 1] : null;

                return (
                  <div className={`card accent-${s.accent} ${open ? "is-open" : ""}`} key={s.id}>
                    <button className="card-head" onClick={() => setOpenSubject(open ? null : s.id)}>
                      <Icon name={s.icon} className="card-icon" />
                      <div className="card-title"><h3>{s.name}</h3><p>{s.tagline}</p></div>
                      <div className="card-status"><Icon name={subjectUnlocked ? "unlock" : "lock"} className="status-icon" /><span>{unlockedCount}/{s.lectures.length}</span></div>
                    </button>

                    {open && (
                      <div className="subject-body">
                        <div className="lecture-tabs">
                          {s.lectures.map((l, i) => {
                            const lAccess = isLectureAccessUnlocked(s.id, l.id);
                            const lPaced = isPaced(s.id, s.lectures, i);
                            const lOpen = lAccess && lPaced;
                            const lDone = quizResult(s.id, l.id) !== undefined && quizResult(s.id, l.id) >= PASS_THRESHOLD;
                            return (
                              <button key={l.id} className={`tab-btn ${activeId === l.id ? "is-active" : ""} ${lOpen ? "" : "is-locked"}`} onClick={() => setActiveLecture((a) => ({ ...a, [s.id]: l.id }))}>
                                <Icon name={lDone ? "check" : lOpen ? "play" : "lock"} className="lu-mini" />
                                {i + 1}
                              </button>
                            );
                          })}
                        </div>

                        <LectureStage
                          subject={s}
                          lecture={activeLec}
                          idx={activeIdx}
                          accessUnlocked={accessUnlocked}
                          paced={paced}
                          watched={watchedPercent(s.id, activeLec.id)}
                          resultPercent={quizResult(s.id, activeLec.id)}
                          prevLecture={prevLec}
                          prevWatched={prevLec ? watchedPercent(s.id, prevLec.id) : 0}
                          prevResult={prevLec ? quizResult(s.id, prevLec.id) : undefined}
                          isLast={activeIdx === s.lectures.length - 1}
                          onProgress={(p) => handleProgress(s.id, activeLec.id, p)}
                          onOpenQuiz={() => setQuizFor({ subjectId: s.id, lecture: activeLec })}
                          onOpenPrevQuiz={() => setQuizFor({ subjectId: s.id, lecture: prevLec })}
                          watermarkText={state.lastCode ? `كود: ${state.lastCode}` : ""}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      <footer className="footer">
        <p>منصة المستر © 2026 — كل حقوق المحتوى محفوظة لـ أ. محمد رمضان.</p>
        <button className="reset-link" onClick={resetAll}>إعادة تعيين الأكواد المفتوحة</button>
      </footer>

      {quizFor && (
        <Quiz title={quizFor.lecture.title} onClose={() => setQuizFor(null)} onSubmit={(percent) => handleQuizSubmit(quizFor.subjectId, quizFor.lecture, percent)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  التنسيقات                                                           */
/* ------------------------------------------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');

.platform {
  --bg: #16261F; --bg-panel: #1E332A; --bg-panel-2: #24392F;
  --chalk: #EDEAE0; --chalk-dim: #A9B8AE;
  --amber: #E3A73B; --amber-dim: #8a6a2c; --teal: #6FA8B0;
  --line: rgba(237,234,224,0.16); --line-strong: rgba(237,234,224,0.3);
  font-family: 'Tajawal', sans-serif; background: var(--bg); color: var(--chalk); min-height: 100vh;
  background-image: radial-gradient(circle at 12% 8%, rgba(237,234,224,0.035), transparent 40%), radial-gradient(circle at 90% 85%, rgba(111,168,176,0.05), transparent 45%);
}
.platform * { box-sizing: border-box; }
.platform button { font-family: inherit; cursor: pointer; }
.platform input { font-family: inherit; }

.topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 28px; border-bottom: 1px solid var(--line); flex-wrap: wrap; gap: 14px; }
.brand { display: flex; align-items: center; gap: 12px; }
.brand-mark { width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid var(--amber); color: var(--amber); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; }
.brand-text { display: flex; flex-direction: column; line-height: 1.3; }
.brand-text strong { font-size: 16px; font-weight: 700; }
.brand-text span { font-size: 12.5px; color: var(--chalk-dim); }

.topnav { display: flex; gap: 6px; flex-wrap: wrap; }
.nav-link { background: none; border: 1px solid transparent; color: var(--chalk-dim); font-size: 13px; padding: 8px 14px; border-radius: 7px; }
.nav-link:hover { color: var(--chalk); }
.nav-link.active { background: var(--bg-panel-2); border-color: var(--line-strong); color: var(--amber); font-weight: 700; }

.topbar-code { display: flex; gap: 8px; }
.topbar-code input { background: var(--bg-panel); border: 1px solid var(--line); color: var(--chalk); border-radius: 8px; padding: 9px 12px; font-size: 13.5px; width: 170px; outline: none; transition: border-color .15s; }
.topbar-code input:focus { border-color: var(--amber); }

.btn { border: none; border-radius: 8px; padding: 10px 20px; font-weight: 700; font-size: 14px; transition: transform .12s, opacity .12s; }
.btn:hover { transform: translateY(-1px); }
.btn-amber { background: var(--amber); color: #23180a; }
.btn-amber:hover { opacity: .92; }
.btn-sm { padding: 9px 16px; font-size: 13px; }

.page-section { padding: 40px 28px; max-width: 560px; margin: 0 auto; }

.demo-banner { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--amber); background: rgba(227,167,59,0.1); border: 1px dashed var(--amber-dim); border-radius: 8px; padding: 10px 12px; margin-bottom: 18px; }

.reg-card { background: var(--bg-panel); border: 1px solid var(--line); border-radius: 12px; padding: 26px; }
.reg-card h3 { margin: 0 0 18px; font-size: 18px; }
.reg-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; font-size: 13.5px; color: var(--chalk-dim); }
.reg-field input { background: var(--bg-panel-2); border: 1px solid var(--line); color: var(--chalk); border-radius: 7px; padding: 10px 12px; font-size: 14px; outline: none; }
.reg-field input:focus { border-color: var(--amber); }
.upload-box { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; border: 1.5px dashed var(--line-strong); border-radius: 9px; padding: 20px; text-align: center; }
.upload-box input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.upload-icon { width: 28px; height: 28px; color: var(--chalk-dim); }
.upload-preview { max-width: 140px; max-height: 90px; border-radius: 6px; object-fit: cover; }
.upload-hint { font-size: 12px; color: var(--chalk-dim); }

.reg-pending { text-align: center; padding: 40px 26px; }
.reg-pending-icon { width: 40px; height: 40px; color: var(--amber); margin-bottom: 12px; }
.reg-pending h3 { margin: 0 0 10px; }
.reg-pending p { color: var(--chalk-dim); font-size: 13.5px; line-height: 1.8; margin: 0; }

.admin-panel { max-width: 620px; }
.admin-panel h2 { margin: 0 0 18px; font-size: 20px; }
.admin-empty { color: var(--chalk-dim); font-size: 13.5px; }
.admin-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.admin-row { display: flex; align-items: center; gap: 14px; background: var(--bg-panel); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; }
.admin-thumb { width: 46px; height: 46px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.admin-thumb-empty { display: flex; align-items: center; justify-content: center; background: var(--bg-panel-2); color: var(--chalk-dim); }
.admin-info { flex: 1; display: flex; flex-direction: column; gap: 2px; font-size: 12.5px; color: var(--chalk-dim); }
.admin-info strong { color: var(--chalk); font-size: 14px; }
.admin-actions { display: flex; gap: 8px; }
.chip-approve, .chip-reject { border: none; border-radius: 20px; font-size: 12px; padding: 7px 13px; display: inline-flex; align-items: center; gap: 5px; font-weight: 700; }
.chip-approve { background: #3f6b39; color: #d6f0cc; }
.chip-reject { background: var(--bg-panel-2); color: var(--chalk-dim); }
.status-badge { font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 20px; }
.status-badge.approved { background: rgba(63,107,57,0.25); color: #bfe3b0; }
.status-badge.rejected { background: rgba(107,63,63,0.25); color: #e3b0b0; }

.hero { position: relative; padding: 56px 28px 48px; overflow: hidden; }
.hero-lines { position: absolute; inset: 0; width: 100%; height: 100%; color: var(--teal); opacity: .5; }
.hero-lines .draw { fill: none; stroke: currentColor; stroke-width: 1.2; }
.hero-lines .d3 { fill: none; stroke: var(--amber); opacity: .5; }
.draw { stroke-dasharray: 900; stroke-dashoffset: 900; animation: draw 2.4s ease-out forwards; }
.d2 { animation-delay: .15s; }
.d3 { stroke-dasharray: 320; stroke-dashoffset: 320; animation: draw 1.6s ease-out .3s forwards; }
@keyframes draw { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) { .draw { animation: none; stroke-dashoffset: 0; } }

.hero-content { position: relative; max-width: 620px; }
.eyebrow-free { display: inline-block; color: var(--amber); font-size: 13px; font-weight: 700; border-bottom: 1px dashed var(--amber-dim); padding-bottom: 3px; margin-bottom: 18px; }
.hero h1 { font-size: clamp(28px, 4vw, 40px); line-height: 1.35; font-weight: 900; margin: 0 0 16px; }
.hero-sub { color: var(--chalk-dim); font-size: 15.5px; line-height: 1.9; max-width: 56ch; }
.inline-msg { margin-top: 16px; font-size: 14px; padding: 10px 14px; border-radius: 8px; border: 1px solid; display: inline-block; }
.inline-msg.ok { color: #bfe3b0; border-color: #3f6b39; background: rgba(63,107,57,0.18); }
.inline-msg.err { color: #e3b0b0; border-color: #6b3f3f; background: rgba(107,63,63,0.18); }

.subjects { padding: 8px 28px 72px; }
.subjects-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 22px; border-bottom: 1px solid var(--line); padding-bottom: 14px; }
.subjects-head h2 { font-size: 21px; font-weight: 700; margin: 0; }
.subjects-count { color: var(--chalk-dim); font-size: 13px; }

.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
@media (max-width: 760px) { .grid { grid-template-columns: 1fr; } }

.card { background: var(--bg-panel); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; transition: border-color .15s; }
.card.is-open { border-color: var(--line-strong); }
.card.accent-amber .card-icon, .card.accent-amber .status-icon { color: var(--amber); }
.card.accent-teal .card-icon, .card.accent-teal .status-icon { color: var(--teal); }

.card-head { width: 100%; background: none; border: none; color: inherit; display: flex; align-items: center; gap: 16px; padding: 20px; text-align: right; }
.card-icon { width: 46px; height: 46px; flex-shrink: 0; }
.card-title { flex: 1; }
.card-title h3 { margin: 0 0 4px; font-size: 16.5px; font-weight: 700; }
.card-title p { margin: 0; font-size: 13px; color: var(--chalk-dim); }
.card-status { display: flex; align-items: center; gap: 7px; font-size: 13px; color: var(--chalk-dim); }
.status-icon { width: 17px; height: 17px; }

.subject-body { padding: 6px 20px 20px; border-top: 1px dashed var(--line); }
.lecture-tabs { display: flex; gap: 8px; padding: 14px 0 4px; flex-wrap: wrap; }
.tab-btn { display: flex; align-items: center; gap: 5px; background: var(--bg-panel-2); border: 1px solid var(--line); color: var(--chalk-dim); border-radius: 20px; padding: 7px 13px; font-size: 12.5px; font-weight: 700; }
.tab-btn.is-active { border-color: var(--amber); color: var(--amber); background: rgba(227,167,59,0.08); }
.tab-btn.is-locked { opacity: .55; }

.lecture-stage { padding: 16px 2px 4px; }
.stage-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; }
.stage-index { font-size: 12px; color: var(--chalk-dim); font-weight: 700; }
.stage-head h4 { margin: 0; font-size: 16px; font-weight: 700; }

.lu-row { display: flex; align-items: center; gap: 10px; }
.lu-icon { width: 17px; height: 17px; flex-shrink: 0; color: var(--chalk-dim); }
.lu-icon.is-done { color: #7fb56f; }
.lu-title { font-size: 14.5px; font-weight: 500; }
.lu-hint { display: block; margin: 6px 0; font-size: 12.5px; color: var(--chalk-dim); }
.lu-actions { margin-top: 10px; display: flex; flex-direction: column; gap: 10px; }
.lu-placeholder { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--chalk-dim); background: var(--bg-panel-2); border: 1px dashed var(--line-strong); border-radius: 7px; padding: 10px 12px; }
.lu-mini { width: 14px; height: 14px; }
.lu-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
.lu-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; background: var(--bg-panel-2); border: 1px solid var(--line); border-radius: 20px; padding: 7px 13px; color: var(--chalk-dim); text-decoration: none; }
.lu-chip-link { color: var(--chalk); border-color: var(--line-strong); }
.lu-chip-link:hover { border-color: var(--amber); color: var(--amber); }
.lu-chip-btn { border: none; color: var(--bg); background: var(--teal); font-weight: 700; }
.lu-chip-btn:hover { opacity: .9; }

.player-wrap { display: flex; flex-direction: column; gap: 6px; position: relative; }
.lecture-video { width: 100%; max-width: 480px; border-radius: 8px; background: #000; display: block; }
.lecture-iframe { aspect-ratio: 16/9; border: none; }
.yt-embed-wrap { position: relative; width: 100%; max-width: 480px; aspect-ratio: 16/9; border-radius: 8px; overflow: hidden; background: #000; }
.yt-embed-wrap iframe { position: absolute; inset: 0; width: 100% !important; height: 100% !important; border: none; }
.yt-blocked-hint { font-size: 12px; color: var(--chalk-dim); margin: 0; }
.watermark { position: absolute; pointer-events: none; color: rgba(237,234,224,0.55); font-size: 11.5px; font-weight: 700; padding: 3px 9px; background: rgba(0,0,0,0.2); border-radius: 5px; transition: top 1.2s ease, bottom 1.2s ease, left 1.2s ease, right 1.2s ease; user-select: none; }
.watch-bar-row { display: flex; align-items: center; gap: 8px; max-width: 480px; }
.watch-bar { flex: 1; height: 5px; border-radius: 3px; background: var(--bg-panel-2); overflow: hidden; }
.watch-bar-sm { max-width: 260px; }
.watch-bar-fill { height: 100%; background: var(--amber); transition: width .2s; }
.watch-percent { font-size: 11.5px; color: var(--chalk-dim); font-family: monospace; min-width: 34px; }

.quiz-gate { background: var(--bg-panel-2); border-radius: 8px; padding: 12px 14px; margin-bottom: 12px; border: 1px dashed var(--line-strong); }
.gate-locked { margin-top: 8px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.gate-hint { font-size: 12px; color: var(--chalk-dim); }
.gate-result { font-size: 12px; font-weight: 700; }
.gate-result.pass { color: #8fd07c; }
.gate-result.fail { color: #e3a3a3; }

.footer { display: flex; align-items: center; justify-content: space-between; padding: 20px 28px; border-top: 1px solid var(--line); flex-wrap: wrap; gap: 10px; }
.footer p { margin: 0; font-size: 12.5px; color: var(--chalk-dim); }
.reset-link { background: none; border: none; color: var(--chalk-dim); font-size: 12px; text-decoration: underline; text-underline-offset: 3px; }
.reset-link:hover { color: var(--chalk); }

.quiz-overlay { position: fixed; inset: 0; background: rgba(10,16,13,0.72); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 50; }
.quiz-box { background: var(--bg-panel); border: 1px solid var(--line-strong); border-radius: 12px; padding: 24px; max-width: 440px; width: 100%; max-height: 85vh; overflow-y: auto; }
.quiz-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-weight: 700; gap: 10px; }
.quiz-timer { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--amber); font-family: monospace; }
.quiz-close { background: none; border: none; color: var(--chalk-dim); font-size: 22px; line-height: 1; flex-shrink: 0; }
.quiz-q { margin-bottom: 18px; }
.quiz-q-image { width: 100%; max-height: 220px; object-fit: contain; border-radius: 8px; background: var(--bg-panel-2); margin-bottom: 10px; display: block; }
.quiz-q p { font-size: 14.5px; margin: 0 0 10px; }
.quiz-opts { display: flex; flex-direction: column; gap: 8px; }
.quiz-opt { display: flex; align-items: center; gap: 8px; font-size: 13.5px; background: var(--bg-panel-2); border: 1px solid var(--line); border-radius: 7px; padding: 9px 12px; }
.quiz-opt.is-correct { border-color: #3f6b39; color: #bfe3b0; }
.quiz-opt.is-wrong { border-color: #6b3f3f; color: #e3b0b0; }
.quiz-score { text-align: center; font-weight: 700; margin: 10px 0 0; }
.quiz-score.pass { color: #8fd07c; }
.quiz-score.fail { color: #e3a3a3; }
`;
