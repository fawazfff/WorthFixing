"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

type Result = {
  item: string;
  verdict: "FIX" | "MAYBE" | "REPLACE";
  confidence: number;
  headline: string;
  damage: string[];
  repair: {
    difficulty: "Easy" | "Moderate" | "Hard";
    time: string;
    costBand: "Low" | "Medium" | "High";
    approach: string;
  };
  why: string[];
  safety: string;
  nextStep: string;
};

const demoResult: Result = {
  item: "Wooden dining chair",
  verdict: "FIX",
  confidence: 91,
  headline: "This chair looks worth repairing before you replace it.",
  damage: [
    "One rear leg appears split near the lower joint.",
    "The seat and back look intact in the visible area.",
    "There is no obvious widespread frame damage in this photo.",
  ],
  repair: {
    difficulty: "Moderate",
    time: "45–90 minutes, plus glue curing time",
    costBand: "Low",
    approach: "Clamp and wood-glue the split, then reinforce the joint before putting weight on it.",
  },
  why: [
    "The damage appears localized rather than spread across the frame.",
    "A wooden joint repair usually needs basic materials, not a full rebuild.",
    "The chair can be tested after curing before you decide to replace it.",
  ],
  safety: "Do not sit on it until the split is repaired and the joint has fully cured.",
  nextStep: "Check whether the split closes cleanly when pressed together. If it does, clamp-and-glue is a sensible first repair.",
};

function verdictClass(verdict: Result["verdict"]) {
  return verdict === "FIX" ? "fix" : verdict === "REPLACE" ? "replace" : "maybe";
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function loadFile(file?: File) {
    if (!file) return;
    setError("");
    setResult(null);

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("That image is over 5 MB. Try a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(String(reader.result));
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    loadFile(event.target.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    loadFile(event.dataTransfer.files?.[0]);
  }

  async function analyze() {
    if (!preview) {
      setError("Add a photo first.");
      return;
    }

    if (preview === "/chair.svg") {
      runDemo();
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview, note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
      window.setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function runDemo() {
    setPreview("/chair.svg");
    setFileName("broken-chair-demo.jpg");
    setNote("The chair leg cracked after it tipped over. Is it worth fixing?");
    setError("");
    setResult(null);
    setLoading(true);

    window.setTimeout(() => {
      setResult(demoResult);
      setLoading(false);
      window.setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }, 850);
  }

  function reset() {
    setPreview("");
    setFileName("");
    setNote("");
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#top" aria-label="WorthFixing home">
          <span className="brandMark">W</span>
          <span>WorthFixing</span>
        </a>
        <div className="navLinks">
          <a href="#how">How it works</a>
          <a href="#why">Why it helps</a>
          <button className="navCta" onClick={() => document.getElementById("try")?.scrollIntoView({ behavior: "smooth" })}>Check an item</button>
        </div>
      </nav>

      <section id="top" className="hero shell">
        <div className="heroCopy reveal">
          <div className="eyebrow"><span /> A second opinion before the bin</div>
          <h1>Before you replace it,<br /><em>see if it’s worth fixing.</em></h1>
          <p className="heroSub">Upload a photo of something broken. WorthFixing looks at the damage and gives you a simple repair-or-replace decision, with the reasoning behind it.</p>
          <div className="heroActions">
            <button className="button dark" onClick={() => document.getElementById("try")?.scrollIntoView({ behavior: "smooth" })}>Check something broken <span>↗</span></button>
            <button className="button light" onClick={runDemo}>Try the chair demo</button>
          </div>
          <p className="smallNote">No sign-up. Your API key stays on the server.</p>
        </div>

        <div className="heroVisual reveal delay">
          <div className="visualCard">
            <div className="visualPhoto">
              <img src="/chair.svg" alt="Illustration of a chair with a broken leg" />
              <span className="photoLabel">PHOTO 01</span>
            </div>
            <div className="visualResult">
              <div className="visualResultTop"><span>WORTHFIXING SAYS</span><span>91% sure</span></div>
              <div className="heroVerdict">Fix it.</div>
              <p>Localized damage. Low material cost. The frame still looks usable.</p>
              <div className="meter"><span /></div>
              <div className="meterLabels"><span>repair</span><span>replace</span></div>
            </div>
          </div>
          <div className="floatingTag tagOne">Low repair cost</div>
          <div className="floatingTag tagTwo">≈ 1 hour</div>
        </div>
      </section>

      <div className="tickerWrap">
        <div className="ticker">
          <span>LESS GUESSING</span><b>•</b><span>LESS WASTE</span><b>•</b><span>MORE THINGS KEPT IN USE</span><b>•</b><span>PLAIN-ENGLISH DECISIONS</span><b>•</b><span>LESS GUESSING</span>
        </div>
      </div>

      <section id="try" className="trySection shell">
        <div className="sectionHeading">
          <span className="index">01</span>
          <div><p className="kicker">THE CHECK</p><h2>Show us what broke.</h2></div>
          <p className="sectionNote">One clear photo is enough to start. Add a note if there’s something the camera can’t show.</p>
        </div>

        <div className="checkerGrid">
          <div className="uploadPanel">
            <div
              className={`dropzone ${dragging ? "dragging" : ""} ${preview ? "hasImage" : ""}`}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => !preview && inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept="image/*" onChange={onFile} hidden />
              {preview ? (
                <>
                  <img className="previewImage" src={preview} alt="Uploaded broken item" />
                  <div className="imageOverlay">
                    <span>{fileName}</span>
                    <button onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>Change photo</button>
                  </div>
                </>
              ) : (
                <div className="dropContent">
                  <div className="uploadIcon">↥</div>
                  <h3>Drop a photo here</h3>
                  <p>or click to choose one</p>
                  <span>JPG, PNG or WEBP · max 5 MB</span>
                </div>
              )}
            </div>
            <button className="demoLink" onClick={runDemo}>No photo handy? <strong>Use the broken-chair demo →</strong></button>
          </div>

          <div className="detailsPanel">
            <div>
              <p className="fieldLabel">Anything we should know? <span>optional</span></p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Example: It wobbles when I sit on it, but the rest feels solid."
                maxLength={300}
              />
              <div className="charCount">{note.length}/300</div>
            </div>

            <div className="privacyRow">
              <span className="privacyIcon">◎</span>
              <p><strong>Photo in, decision out.</strong><br />Your image is sent only for the analysis request. The OpenAI key stays server-side.</p>
            </div>

            <button className="button dark full" disabled={loading || !preview} onClick={analyze}>
              {loading ? <><span className="spinner" /> Looking at the damage...</> : <>Is it worth fixing? <span>↗</span></>}
            </button>
            {error && <div className="errorBox">{error}</div>}
          </div>
        </div>
      </section>

      {(loading || result) && (
        <section id="result" className="resultSection shell">
          {loading && !result ? (
            <div className="analysisLoading">
              <div className="scanCard">
                <div className="scanLine" />
                {preview && <img src={preview} alt="Item being analyzed" />}
              </div>
              <div className="loadingCopy">
                <p className="kicker">LOOKING CLOSELY</p>
                <h2>Checking what’s damaged,<br />what it may take to fix,<br />and whether it’s worth it.</h2>
                <div className="thinkingLines"><span /><span /><span /></div>
              </div>
            </div>
          ) : result ? (
            <div className="resultCard">
              <div className="resultHead">
                <div>
                  <p className="kicker">THE VERDICT · {result.item.toUpperCase()}</p>
                  <h2>{result.headline}</h2>
                </div>
                <div className={`verdict ${verdictClass(result.verdict)}`}>
                  {result.verdict === "FIX" ? "Fix it" : result.verdict === "REPLACE" ? "Replace it" : "Maybe"}
                </div>
              </div>

              <div className="confidenceRow">
                <span>Confidence</span>
                <div className="confidenceTrack"><i style={{ width: `${Math.max(5, Math.min(result.confidence, 100))}%` }} /></div>
                <strong>{result.confidence}%</strong>
              </div>

              <div className="resultGrid">
                <div className="resultBlock">
                  <p className="blockNumber">01 / WHAT I SEE</p>
                  <ul>{result.damage.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>

                <div className="resultBlock">
                  <p className="blockNumber">02 / THE REPAIR</p>
                  <div className="stats">
                    <div><span>Difficulty</span><strong>{result.repair.difficulty}</strong></div>
                    <div><span>Cost</span><strong>{result.repair.costBand}</strong></div>
                    <div><span>Time</span><strong>{result.repair.time}</strong></div>
                  </div>
                  <p className="approach">{result.repair.approach}</p>
                </div>

                <div className="resultBlock">
                  <p className="blockNumber">03 / WHY</p>
                  <ul>{result.why.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>

                <div className="resultBlock">
                  <p className="blockNumber">04 / NEXT STEP</p>
                  <p className="nextCopy">{result.nextStep}</p>
                  <div className="safety"><strong>Safety check</strong><span>{result.safety}</span></div>
                </div>
              </div>

              <div className="resultFooter">
                <p>WorthFixing is a visual second opinion, not a substitute for a professional inspection when safety is uncertain.</p>
                <button className="button light" onClick={reset}>Check another item</button>
              </div>
            </div>
          ) : null}
        </section>
      )}

      <section id="how" className="howSection shell">
        <div className="sectionHeading compact">
          <span className="index">02</span>
          <div><p className="kicker">HOW IT WORKS</p><h2>Three steps. No repair jargon.</h2></div>
        </div>

        <div className="stepsGrid">
          <article><span>1</span><div className="stepGraphic photoStep"><i /></div><h3>Take a photo</h3><p>Show the broken area as clearly as you can.</p></article>
          <article><span>2</span><div className="stepGraphic inspectStep"><i /><i /><i /></div><h3>We inspect the clues</h3><p>AI looks for visible damage, repair complexity, and safety concerns.</p></article>
          <article><span>3</span><div className="stepGraphic decideStep"><b>FIX</b></div><h3>Get a useful decision</h3><p>See the verdict, the reasoning, and what to do next.</p></article>
        </div>
      </section>

      <section id="why" className="whySection">
        <div className="shell whyInner">
          <div>
            <p className="kicker">WHY WORTHFIXING</p>
            <h2>Not everything broken<br />belongs in the bin.</h2>
          </div>
          <div className="whyCopy">
            <p>Most people are not repair experts. A cracked leg, loose hinge, torn seam, or damaged casing can look worse than it is.</p>
            <p>WorthFixing does not promise magic. It gives you a fast, understandable second opinion so you can make the next decision with more context.</p>
          </div>
          <div className="bigStat"><strong>1 photo</strong><span>to get a practical starting point</span></div>
        </div>
      </section>

      <footer className="footer shell">
        <div className="brand"><span className="brandMark">W</span><span>WorthFixing</span></div>
        <p>Keep useful things useful.</p>
        <button onClick={() => document.getElementById("try")?.scrollIntoView({ behavior: "smooth" })}>Check an item ↑</button>
      </footer>
    </main>
  );
}
