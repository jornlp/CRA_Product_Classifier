import rules from "../../../packages/rules/classification.json";
import type { LawStatus } from "../../../packages/engine/src/index.js";

const app = document.getElementById("app")!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

async function lawStatus(): Promise<LawStatus | null> {
  try {
    const r = await fetch("./law-status.json", { cache: "no-store" });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

(async () => {
  const st = await lawStatus();
  const encoded = rules.categories.length, total = rules.categories_total;
  app.innerHTML = `
    ${st?.status === "CHANGES_FOUND" ? `<div class="box warn" role="alert">A change in EU law was detected on ${esc(st.checked_at)}
      affecting ${esc(st.affected_sources.join(", "))}. It has not yet been reviewed; results relying on it are marked.</div>` : ""}
    <div class="box">
      <p><strong>Rules reflect the law as of ${esc(rules.law_as_of)}.</strong>
      ${st ? `Last checked against EUR-Lex: ${esc(st.checked_at)}.` : "Law check status unavailable."}</p>
      <p class="muted">Rule set ${esc(rules.rule_set_version)}. ${encoded} of ${total} categories encoded so far;
      until all ${total} are, the tool will not state DEFAULT.</p>
    </div>
    <div class="box">
      <p>This tool reports what the official texts say and where they are undetermined. It is not legal advice,
      a conformity assessment or a guarantee of compliance. Obtain your own legal advice on material questions.</p>
      <p class="muted">Everything runs in your browser. Nothing you enter is sent anywhere.</p>
    </div>`;
})();
