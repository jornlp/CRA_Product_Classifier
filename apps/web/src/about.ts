/** The About page: what the tool is and is not, how it works, sources, validity, open questions. */
import { CONFIG, validUntil } from "./config.js";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function aboutHtml(o: { lawAsOf: string; ruleSet: string; sources: Record<string, { id: string }>; lastCheck?: string | null }): string {
  const src: Record<string, string> = {
    B1c: "Regulation (EU) 2024/2847 (Cyber Resilience Act), consolidated text",
    B2: "Implementing Regulation (EU) 2025/2392, technical descriptions of important and critical products",
    B11c: "Regulation (EU) 2024/1689 (AI Act), consolidated text",
    B18: "Regulation (EU) 2025/327 (European Health Data Space)",
  };
  return `<section class="box about">
  <h2>About this tool</h2>
  <h3>What it does</h3>
  <p>It helps you work out three things about a product under the EU Cyber Resilience Act (CRA): whether the CRA applies,
  which class the product is in (default, important Class I or II, or critical), and when the obligations apply. Every
  conclusion shows the condition it rests on, quoted from the official text.</p>
  <h3>What it does not do</h3>
  <ul>
    <li>It is not legal advice, and it does not give a binding interpretation.</li>
    <li>It is not a conformity assessment or a certificate, and it does not check the CRA's security requirements (Annex I).</li>
    <li>It does not assess other laws that may also apply, such as the AI Act, the Machinery Regulation or data protection law, beyond pointing them out where they change the CRA answer.</li>
  </ul>
  <h3>How it works</h3>
  <p>The tool asks about facts, not about legal categories. It asks only what can still change the outcome, and it says
  "not determined" instead of guessing: when an answer is missing, when answers conflict, or when the law itself does not
  settle the question. It states "Default" only when every one of the 26 listed categories has been ruled out.</p>
  <h3>Sources</h3>
  <ul>${Object.entries(o.sources).map(([code, s]) => `<li>${esc(src[code] ?? code)} <span class="muted small">(${esc(s.id)})</span></li>`).join("")}
    <li>Delegated Regulations (EU) 2025/1535 (L-category vehicles) and 2022/30 (radio equipment)</li>
    <li>European Commission, Frequently Asked Questions on the CRA, version 14 (non-binding)</li></ul>
  <p class="muted small">Every condition and quote is checked word for word against these texts before each release.</p>
  <h3>Validity</h3>
  <p>The rules reflect the law as of <strong>${esc(o.lawAsOf)}</strong> (rule set ${esc(o.ruleSet)}). This version is valid
  until <strong>${esc(validUntil(o.lawAsOf))}</strong>. After that date it keeps working, but every result is marked as possibly
  outdated. EUR-Lex is checked weekly for changes${o.lastCheck ? `; the last check was on ${esc(o.lastCheck)}` : ""}. When a
  change affects a rule, results that rely on it are marked until the change has been reviewed.</p>
  <h3>Questions the law does not settle</h3>
  <p>Where these come up, the tool says so and recommends expert advice:</p>
  <ul>
    <li>The critical category "other devices for advanced security purposes, including for secure cryptoprocessing", which has no technical description, and with it gateways for water metering.</li>
    <li>Whether a smart home security device controlled only from a phone standing next to it counts as "controlled remotely from other systems".</li>
    <li>Whether software that only schedules containers across machines is a "container runtime system".</li>
    <li>The conformity route for AI-enabled machinery, and for certain high-risk AI products placed on the market between 11 December 2027 and 2 August 2028, after the 2026 amendment of the AI Act.</li>
    <li>Whether a product with a medical purpose that is not certified as a medical device falls under the medical device rules.</li>
  </ul>
  <h3>Your data</h3>
  <p>Everything runs in your browser. Nothing you enter is sent anywhere. No cookies, no tracking, no accounts. Only your colour scheme choice is remembered, in this browser.</p>${CONFIG.COUNTER_URL
    ? `<p>To see whether the tool is used, page views and a few steps (a check started, a result reached, a report saved) are counted anonymously with GoatCounter, which is hosted in the EU and uses no cookies. Your answers and results are never sent. Nothing is counted if your browser asks not to be tracked (Do Not Track or Global Privacy Control).</p>`
    : ""}
  <h3>Licence and errors</h3>
  <p>Code under Apache-2.0; rules and test cases under CC BY 4.0. If you find an error, please report it${CONFIG.REPO_URL
    ? ` as an issue at <a href="${esc(CONFIG.REPO_URL)}/issues">${esc(CONFIG.REPO_URL.replace(/^https?:\/\//, ""))}</a>`
    : " through the project repository"}.</p>
  <h3>Disclaimer</h3>
  <p class="small">${esc(CONFIG.disclaimer)}</p>
  <div class="nav"><button type="button" id="about-close">Back to the tool</button></div>
</section>`;
}
