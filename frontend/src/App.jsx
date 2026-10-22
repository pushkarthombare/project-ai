import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL;

/* ───────── helpers ───────── */
const MR = new Set(["आहे","आणि","काय","कसे","मला","तुम्ही","आपण","सांगा","करा","हे","ते","नाही","होय","मराठी","त्याचा","त्याची","आम्ही","तुमचा","कोण","कुठे"]);
const detectLanguage = (t) => {
  if (!/[\u0900-\u097f]/.test(t)) return "english";
  return t.split(/\s+/).some((w) => MR.has(w)) ? "marathi" : "hindi";
};
const LANG = { english: ["EN", "en", "en-IN"], hindi: ["HI", "hi", "hi-IN"], marathi: ["MR", "mr", "mr-IN"] };
const PLACEHOLDER = { english: "Ask anything — in English, Hindi or Marathi…", hindi: "कुछ भी पूछें…", marathi: "काहीही विचारा…" };
const SUGGESTIONS = ["Explain photosynthesis simply", "What is Newton's second law?", "पाणी चक्र समजावून सांगा", "Teach me recursion with an example"];
const EMPHASIS = [["none", "None"], ["reduced", "Soft"], ["moderate", "Medium"], ["strong", "Strong"]];
const MODES = [["summary", "Summary", "Short overview"], ["explain", "Explain", "Step by step"], ["keypoints", "Key points", "Bulleted takeaways"], ["simplify", "Simplify", "Plain language"], ["critical", "Critical", "Strengths & gaps"]];
const DETAIL = ["", "Brief", "Balanced", "Detailed"];
const FALLBACK_VOICES = { english: [{ id: "en-US-natalie", name: "Natalie (US)" }, { id: "en-US-ken", name: "Ken (US)" }], hindi: [{ id: "hi-IN-amit", name: "Amit" }], marathi: [{ id: "hi-IN-amit", name: "Amit" }] };

const ICONS = {
  tutor: "M12 3 2 8l10 5 8-4v6h2V8L12 3zM6 12.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-3.5L12 15.5l-6-3z",
  doc: "M6 2h8l6 6v14H6V2zm7 1.5V9h5.5L13 3.5zM9 13h8v1.6H9V13zm0 3.4h8V18H9v-1.6z",
  mic: "M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11h-2z",
  stop: "M7 7h10v10H7z",
  send: "M3 20.5v-6.8l9-1.7-9-1.7V3.5L22 12 3 20.5z",
  sliders: "M4 7h9V5h2v2h5v2h-5v2h-2V9H4V7zm0 8h5v-2h2v2h9v2H11v2H9v-2H4v-2z",
  sun: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM1 11h3v2H1v-2zm19 0h3v2h-3v-2z",
  moon: "M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z",
  play: "M7 4.5v15l12-7.5-12-7.5z",
  pause: "M6 4h4v16H6V4zm8 0h4v16h-4V4z",
  copy: "M8 3h11v14H8V3zM5 7h2v12h10v2H5V7z",
  check: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z",
  x: "M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4 17.6 5 12 10.6 6.4 5z",
  upload: "M11 16V7.8L8 10.8 6.6 9.4 12 4l5.4 5.4-1.4 1.4-3-3V16h-2zM5 18h14v2H5v-2z",
  spark: "m12 2 2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z",
  trash: "M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8H6v11zM19 5h-3.5l-1-1h-5l-1 1H5v2h14V5z",
};
const Icon = ({ n, s = 18 }) => <svg className="ic" width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={ICONS[n]} /></svg>;

/* ───────── small components ───────── */
const Toggle = ({ on, onChange, label }) => <button role="switch" aria-checked={on} aria-label={label} className={"switch" + (on ? " on" : "")} onClick={() => onChange(!on)}><i /></button>;

function Skeleton({ lines = 3 }) {
  return <div className="skel">{Array.from({ length: lines }, (_, i) => <span key={i} style={{ width: `${96 - i * 12}%` }} />)}</div>;
}

function AudioPlayer({ url, b64, error, loading, provider, autoPlay }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const src = url || (b64 ? (b64.startsWith("data:") ? b64 : `data:audio/mp3;base64,${b64}`) : null);

  useEffect(() => {
    const a = ref.current;
    if (!a || !src) return;
    a.src = src; a.load();
    if (autoPlay) a.play().catch(() => {});
  }, [src, autoPlay]);

  const fmt = (s) => (!s || isNaN(s) ? "0:00" : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`);
  if (loading) return <div className="audio muted"><span className="spin" /> Generating audio…</div>;
  if (error && !src) return <div className="audio warn">{error}</div>;
  if (!src) return null;
  return (
    <div className="audio">
      <audio ref={ref} hidden onEmptied={() => setT(0)} onTimeUpdate={(e) => setT(e.target.currentTime)} onLoadedMetadata={(e) => setDur(e.target.duration)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      <button className="round" aria-label={playing ? "Pause" : "Play"} onClick={() => (playing ? ref.current.pause() : ref.current.play())}><Icon n={playing ? "pause" : "play"} s={16} /></button>
      <input type="range" min={0} max={dur || 1} step="0.1" value={t} aria-label="Seek" onChange={(e) => { ref.current.currentTime = +e.target.value; }} style={{ "--p": dur ? (t / dur) * 100 + "%" : "0%" }} />
      <span className="mono muted">{fmt(t)} / {fmt(dur)}</span>
      {provider && <span className="chip">{provider === "murf" ? "Murf" : "gTTS"}</span>}
    </div>
  );
}

function Rich({ text }) {
  let s = (text || "").trim();
  if (s.startsWith("{") && s.includes('"result"')) {
    try { s = JSON.parse(s).result || s; } catch { const m = s.match(/"result"\s*:\s*"([\s\S]*?)"\s*[,}]/); if (m) s = m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'); }
  }
  s = s.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();
  const inline = (x) => x.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p));
  const out = []; const L = s.split("\n"); let i = 0;
  while (i < L.length) {
    const l = L[i].trim();
    if (!l) { i++; continue; }
    const list = /^\d+[.)]\s/.test(l) ? "ol" : /^[-•*]\s/.test(l) ? "ul" : null;
    if (list) {
      const re = list === "ol" ? /^\d+[.)]\s/ : /^[-•*]\s/; const items = [];
      while (i < L.length && re.test(L[i].trim())) items.push(L[i++].trim().replace(re, ""));
      const Tag = list; out.push(<Tag key={i}>{items.map((x, k) => <li key={k}>{inline(x)}</li>)}</Tag>); continue;
    }
    out.push(/^#{1,3}\s/.test(l) ? <h4 key={i}>{l.replace(/^#{1,3}\s/, "")}</h4> : <p key={i}>{inline(l)}</p>); i++;
  }
  return <div className="rich">{out}</div>;
}

/* ───────── voice drawer ───────── */
function VoiceDrawer({ open, onClose, vs, setVs, lang, autoPlay, setAutoPlay }) {
  const [catalog, setCatalog] = useState(FALLBACK_VOICES);
  const [clone, setClone] = useState("");
  const [text, setText] = useState("Hello! This is a preview of the selected voice.");
  const [pv, setPv] = useState({});
  const set = (k, v) => setVs((p) => ({ ...p, [k]: v }));

  useEffect(() => { fetch(`${API}/voices`).then((r) => r.json()).then((d) => d.voices && setCatalog(d.voices)).catch(() => {}); }, []);
  const voices = catalog[lang] || catalog.english;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!vs.voice_id && voices[0]) set("voice_id", voices[0].id); }, [lang, catalog]);

  const preview = async () => {
    setPv({ loading: true });
    try {
      const r = await fetch(`${API}/voice-preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, lang, ...vs }) });
      const d = await r.json();
      setPv({ url: d.audio_url, b64: d.audio_b64, error: d.error, provider: d.provider });
    } catch { setPv({ error: "Could not reach server." }); }
  };
  const reset = () => { setVs({ voice_id: voices[0]?.id || null, pitch: 0, rate: 0, emphasis: "none" }); setClone(""); };
  const slider = (k, label) => (
    <label className="field"><span>{label}<b className="mono">{vs[k] > 0 ? "+" : ""}{vs[k]}</b></span>
      <input type="range" min={-50} max={50} value={vs[k]} onChange={(e) => set(k, +e.target.value)} style={{ "--p": (vs[k] + 50) + "%" }} /></label>
  );
  return (
    <>
      <div className={"scrim" + (open ? " show" : "")} onClick={onClose} />
      <aside className={"drawer" + (open ? " open" : "")} aria-hidden={!open} aria-label="Voice settings">
        <header><h3>Voice settings</h3><button className="icon-btn" onClick={onClose} aria-label="Close"><Icon n="x" /></button></header>
        <div className="drawer-body">
          <div className="row between"><div><b>Auto-play audio</b><p className="muted sm">Play as soon as a response arrives</p></div><Toggle on={autoPlay} onChange={setAutoPlay} label="Auto-play" /></div>
          <label className="field"><span>Voice</span>
            <select value={vs.voice_id || ""} onChange={(e) => set("voice_id", e.target.value)}>
              {voices.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              {vs.voice_id && !voices.some((v) => v.id === vs.voice_id) && <option value={vs.voice_id}>Custom: {vs.voice_id}</option>}
            </select></label>
          <label className="field"><span>Cloned voice ID</span>
            <div className="row"><input placeholder="e.g. en-US-myvoice-abc123" value={clone} onChange={(e) => setClone(e.target.value)} /><button className="btn sm" onClick={() => clone.trim() && set("voice_id", clone.trim())}>Apply</button></div></label>
          {slider("pitch", "Pitch")}{slider("rate", "Speed")}
          <div className="field"><span>Emphasis</span><div className="seg">{EMPHASIS.map(([v, l]) => <button key={v} className={vs.emphasis === v ? "on" : ""} onClick={() => set("emphasis", v)}>{l}</button>)}</div></div>
          <div className="card flat">
            <label className="field"><span>Preview</span><textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} /></label>
            <button className="btn full" onClick={preview} disabled={pv.loading}><Icon n="play" s={14} /> {pv.loading ? "Generating…" : "Play preview"}</button>
            <AudioPlayer url={pv.url} b64={pv.b64} error={pv.error} loading={pv.loading} provider={pv.provider} autoPlay />
          </div>
          <button className="btn ghost full" onClick={reset}>Reset to defaults</button>
        </div>
      </aside>
    </>
  );
}

/* ───────── tutor ───────── */
function Answer({ turn, autoPlay }) {
  const [open, setOpen] = useState(false);
  if (turn.loading) return <div className="card"><Skeleton lines={4} /></div>;
  if (turn.error) return <div className="card alert" role="alert">{turn.error}</div>;
  const d = turn.data;
  return (
    <div className="card answer">
      <section><h3 className="eyebrow">Explanation</h3><Rich text={d.explanation} /></section>
      {d.summary && <section className="callout"><h3 className="eyebrow"><Icon n="spark" s={14} /> Key takeaway</h3><p>{d.summary}</p></section>}
      {(d.audioUrl || d.audioB64 || d.audioError) && <AudioPlayer url={d.audioUrl} b64={d.audioB64} error={d.audioError} provider={d.provider} autoPlay={autoPlay} />}
      {d.quiz.length > 0 && (
        <section>
          <button className="btn ghost" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Hide" : "Test yourself"} · {d.quiz.length} practice questions</button>
          {open && <ol className="quiz">{d.quiz.map((q, i) => <li key={i}>{q}</li>)}</ol>}
        </section>
      )}
    </div>
  );
}

function Tutor({ vs, autoPlay, lang, setLang }) {
  const [q, setQ] = useState("");
  const [turns, setTurns] = useState([]);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const rec = useRef(null), fin = useRef(""), timer = useRef(null), end = useRef(null), ta = useRef(null), seq = useRef(0);
  const busy = turns.some((t) => t.loading);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [turns]);
  useEffect(() => { const el = ta.current; if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 160) + "px"; } }, [q]);

  const patch = (id, p) => setTurns((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)));
  const send = async (text) => {
    text = text?.trim(); if (!text || busy) return;
    const id = ++seq.current; setQ(""); setTurns((ts) => [...ts, { id, q: text, loading: true }]);
    try {
      const r = await fetch(`${API}/ask`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: text, ...vs }) });
      if (!r.ok) return patch(id, { loading: false, error: `Server error: ${r.status}` });
      const d = await r.json();
      if (d.error) return patch(id, { loading: false, error: d.error });
      let ex = d.explanation || "";
      if (ex.trimStart().startsWith("{")) { try { const j = JSON.parse(ex); ex = j.explanation || j.result || ex; } catch { const m = ex.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)"/); if (m) ex = m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'); } }
      const aiErr = !ex || /taking too long|try again|could not reach|please try|failed to generate/i.test(ex);
      patch(id, { loading: false, data: { explanation: ex, summary: d.summary || "", quiz: Array.isArray(d.quiz) ? d.quiz : [], audioUrl: !aiErr && d.audio_type === "url" ? d.audio : null, audioB64: !aiErr && d.audio_type === "base64" ? d.audio : null, audioError: aiErr ? "" : d.audio_error || "", provider: aiErr ? "" : d.voice_provider || "" } });
    } catch { patch(id, { loading: false, error: "Could not connect to the server. Is the backend running on port 8000?" }); }
  };

  const mic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech recognition isn't supported in this browser. Please use Chrome.");
    if (listening) { clearTimeout(timer.current); rec.current?.stop(); return; }
    const r = new SR(); r.lang = LANG[lang][2]; r.continuous = true; r.interimResults = true; fin.current = "";
    r.onstart = () => { setListening(true); setQ(""); };
    r.onresult = (e) => {
      let im = "", got = false;
      for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript; if (e.results[i].isFinal) { fin.current += t + " "; got = true; } else im = t; }
      setQ(fin.current + im); setInterim(im);
      if (fin.current) setLang(detectLanguage(fin.current));
      if (got) { clearTimeout(timer.current); timer.current = setTimeout(() => { try { r.stop(); } catch { /* already stopped */ } }, 2000); }
    };
    r.onerror = () => { clearTimeout(timer.current); setListening(false); setInterim(""); };
    r.onend = () => { clearTimeout(timer.current); setListening(false); setInterim(""); const f = fin.current.trim(); if (f) send(f); };
    rec.current = r; r.start();
  };

  return (
    <div className="tutor">
      <div className="thread">
        {turns.length === 0 && (
          <div className="hero">
            <div className="logo lg"><Icon n="tutor" s={28} /></div>
            <h1>What would you like to learn today?</h1>
            <p className="muted">Get clear explanations, a quick summary, spoken audio and practice questions — in English, हिन्दी or मराठी.</p>
            <div className="sugs">{SUGGESTIONS.map((s) => <button key={s} className="sug" onClick={() => send(s)}>{s}</button>)}</div>
          </div>
        )}
        {turns.map((t) => (
          <div key={t.id} className="turn">
            <div className="bubble">{t.q}</div>
            <Answer turn={t} autoPlay={autoPlay} />
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="composer-wrap">
        {listening && <div className="listening"><span className="pulse" /> Listening… {interim || "speak your question, I'll send it after a short pause"}</div>}
        <div className={"composer" + (listening ? " live" : "")}>
          <span className="chip lang">{LANG[lang][0]}</span>
          <textarea ref={ta} rows={1} lang={LANG[lang][1]} value={q} placeholder={listening ? "Listening…" : PLACEHOLDER[lang]} aria-label="Your question"
            onChange={(e) => { setQ(e.target.value); setLang(e.target.value.trim() ? detectLanguage(e.target.value) : "english"); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(q); } }} />
          <button className={"icon-btn" + (listening ? " rec" : "")} onClick={mic} disabled={busy} aria-label={listening ? "Stop and send" : "Speak"}><Icon n={listening ? "stop" : "mic"} /></button>
          <button className="send" onClick={() => send(q)} disabled={busy || !q.trim()} aria-label="Send"><Icon n="send" /></button>
        </div>
        <div className="row between hint"><span className="muted sm">Enter to send · Shift+Enter for a new line</span>
          {turns.length > 0 && <button className="link" onClick={() => setTurns([])}><Icon n="trash" s={13} /> Clear chat</button>}</div>
      </div>
    </div>
  );
}

/* ───────── analyzer ───────── */
function Analyzer({ autoPlay }) {
  const [tab, setTab] = useState("text");
  const [text, setText] = useState("");
  const [img, setImg] = useState(null), [doc, setDoc] = useState(null);
  const [mode, setMode] = useState("summary"), [detail, setDetail] = useState(2);
  const [phase, setPhase] = useState("idle"); // idle | loading | streaming
  const [out, setOut] = useState(""), [outMode, setOutMode] = useState("");
  const [err, setErr] = useState(""), [copied, setCopied] = useState(false), [drag, setDrag] = useState(false);
  const [audio, setAudio] = useState({});
  const busy = phase !== "idle";

  const read = (f) => new Promise((res, rej) => { const r = new FileReader(); r.onload = (e) => res(e.target.result); r.onerror = rej; r.readAsDataURL(f); });
  const size = (b) => (b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB");
  const pick = async (f) => {
    if (!f) return; setErr("");
    try {
      if (tab === "image") { if (!f.type.startsWith("image/")) return setErr("Please choose an image file."); const d = await read(f); setImg({ name: f.name, b64: d.split(",")[1], type: f.type, url: d, size: f.size }); }
      else { if (!["pdf", "txt", "md", "csv"].includes(f.name.split(".").pop().toLowerCase())) return setErr("Supported files: PDF, TXT, MD, CSV."); const d = await read(f); setDoc({ name: f.name, b64: d.split(",")[1], size: f.size }); }
    } catch { setErr("Could not read that file."); }
  };

  const run = async () => {
    setErr(""); setOut(""); setAudio({});
    let body = { mode, detail };
    if (tab === "text") { if (!text.trim()) return setErr("Paste or type some text first."); body = { ...body, content_type: "text", text: text.trim() }; }
    else if (tab === "image") { if (!img) return setErr("Upload an image first."); body = { ...body, content_type: "image", image_base64: img.b64, image_media_type: img.type }; }
    else { if (!doc) return setErr("Upload a file first."); body = { ...body, content_type: "file", file_base64: doc.b64, file_name: doc.name }; }
    setPhase("loading"); setOutMode(mode);
    let acc = "", lang = "english";
    try {
      const r = await fetch(`${API}/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(`Server error: ${r.status}`);
      if ((r.headers.get("content-type") || "").includes("json")) {      // non-streaming backend
        const d = await r.json(); if (d.error) throw new Error(d.error); acc = d.result || ""; lang = d.lang || lang; setOut(acc);
      } else {                                                           // streaming backend
        const rd = r.body.getReader(), dec = new TextDecoder(); let first = true;
        for (;;) {
          const { done, value } = await rd.read(); if (done) break;
          const c = dec.decode(value, { stream: true });
          if (first && c.startsWith("__LANG__:")) { first = false; lang = c.replace("__LANG__:", "").trim(); setPhase("streaming"); continue; }
          first = false;
          if (c.startsWith("__ERROR__:")) throw new Error(c.replace("__ERROR__:", "").trim());
          acc += c; setOut(acc);
        }
      }
      setPhase("idle");
      if (acc.trim()) {
        setAudio({ loading: true });
        try {
          const v = await (await fetch(`${API}/voice-preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: acc.trim().slice(0, 400), lang }) })).json();
          setAudio({ url: v.audio_url, b64: v.audio_b64, error: v.error, provider: v.provider });
        } catch { setAudio({ error: "Could not generate audio." }); }
      }
    } catch (e) { setErr(e.message?.startsWith("Server") || e.message?.length > 3 ? e.message : "Could not connect to the server."); setPhase("idle"); }
  };

  const Drop = ({ kind }) => {
    const f = kind === "image" ? img : doc;
    return (
      <>
        <label className={"drop" + (drag ? " over" : "")} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}>
          <Icon n="upload" s={28} /><b>Drop {kind === "image" ? "an image" : "a file"} or click to browse</b>
          <span className="muted sm">{kind === "image" ? "PNG, JPG, WEBP, GIF — screenshots, scans, photos of text" : "PDF, TXT, MD, CSV"}</span>
          <input type="file" hidden accept={kind === "image" ? "image/*" : ".pdf,.txt,.md,.csv"} onChange={(e) => pick(e.target.files[0])} />
        </label>
        {f && <div className="file">{kind === "image" ? <img src={f.url} alt="" /> : <Icon n="doc" s={28} />}<div><b>{f.name}</b><span className="muted sm">{size(f.size)}</span></div><button className="icon-btn" aria-label="Remove" onClick={() => (kind === "image" ? setImg(null) : setDoc(null))}><Icon n="x" /></button></div>}
      </>
    );
  };

  return (
    <div className="page-scroll"><div className="analyzer">
      <div className="head"><h1>Document analyzer</h1><p className="muted">Turn text, images and files into summaries, explanations and key points.</p></div>
      <div className="card">
        <div className="seg wide" role="tablist">{[["text", "Text"], ["image", "Image"], ["file", "File"]].map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); setErr(""); }}>{l}</button>)}</div>
        {tab === "text" && <div className="textwrap"><textarea rows={7} placeholder="Paste or type your text here…" value={text} onChange={(e) => setText(e.target.value)} /><span className="count mono muted">{text.length.toLocaleString()} chars</span></div>}
        {tab === "image" && <Drop kind="image" />}
        {tab === "file" && <Drop kind="file" />}
      </div>
      <div className="card">
        <h3 className="eyebrow">What do you need?</h3>
        <div className="modes">{MODES.map(([v, l, d]) => <button key={v} className={"mode" + (mode === v ? " on" : "")} onClick={() => setMode(v)}><b>{l}</b><span>{d}</span></button>)}</div>
        <label className="field"><span>Level of detail<b>{DETAIL[detail]}</b></span><input type="range" min={1} max={3} value={detail} onChange={(e) => setDetail(+e.target.value)} style={{ "--p": ((detail - 1) / 2) * 100 + "%" }} /></label>
        <button className="btn primary full lg" onClick={run} disabled={busy}>{phase === "loading" ? <><span className="spin" /> Processing…</> : phase === "streaming" ? <><span className="spin" /> Writing…</> : <><Icon n="spark" s={16} /> Analyze</>}</button>
      </div>
      {err && <div className="card alert" role="alert">{err}</div>}
      {phase === "loading" && <div className="card"><Skeleton lines={5} /></div>}
      {out && (
        <div className="card answer">
          <div className="row between"><h3 className="eyebrow">{MODES.find((m) => m[0] === outMode)?.[1] || "Result"}{phase === "streaming" && " · writing…"}</h3>
            {phase === "idle" && <button className="btn sm ghost" onClick={() => navigator.clipboard.writeText(out).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); })}><Icon n={copied ? "check" : "copy"} s={14} /> {copied ? "Copied" : "Copy"}</button>}</div>
          <Rich text={out} />{phase === "streaming" && <span className="caret" />}
          {phase === "idle" && <AudioPlayer url={audio.url} b64={audio.b64} error={audio.error} loading={audio.loading} provider={audio.provider} autoPlay={autoPlay} />}
        </div>
      )}
    </div></div>
  );
}

/* ───────── root ───────── */
export default function App() {
  const [view, setView] = useState("tutor");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
  const [drawer, setDrawer] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [lang, setLang] = useState("english");
  const [vs, setVs] = useState({ voice_id: null, pitch: 0, rate: 0, emphasis: "none" });

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("theme", theme); }, [theme]);
  useEffect(() => { const k = (e) => e.key === "Escape" && setDrawer(false); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  const tuned = vs.pitch || vs.rate || vs.emphasis !== "none";

  return (
    <div className="app">
      <nav className="side">
        <div className="brand"><div className="logo"><Icon n="tutor" s={20} /></div><div><b>Personal AI</b><span className="muted sm">Voice tutor</span></div></div>
        <div className="navs">
          {[["tutor", "Tutor", "tutor"], ["analyzer", "Analyzer", "doc"]].map(([k, l, ic]) => <button key={k} className={"nav" + (view === k ? " on" : "")} onClick={() => setView(k)} aria-current={view === k}><Icon n={ic} />{l}</button>)}
        </div>
        <div className="tools">
          <button className="icon-btn" onClick={() => setDrawer(true)} aria-label="Voice settings" title="Voice settings"><Icon n="sliders" />{tuned && <i className="dot" />}</button>
          <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme" title="Toggle theme"><Icon n={theme === "dark" ? "sun" : "moon"} /></button>
        </div>
      </nav>
      <main>{view === "tutor" ? <Tutor vs={vs} autoPlay={autoPlay} lang={lang} setLang={setLang} /> : <Analyzer autoPlay={autoPlay} />}</main>
      <VoiceDrawer open={drawer} onClose={() => setDrawer(false)} vs={vs} setVs={setVs} lang={lang} autoPlay={autoPlay} setAutoPlay={setAutoPlay} />
    </div>
  );
}