import type { Metadata } from "next";

import {
  PolicyPage,
  policyStyles as styles,
  type PolicySection,
} from "../_components/PolicyPage";

export const metadata: Metadata = {
  title: "Rules",
  description:
    "A preliminary look at the topics the official Hornet Hacks rules will cover.",
};

const sections: PolicySection[] = [
  {
    id: "status",
    label: "The short version",
    title: "What is decided right now?",
    content: (
      <>
        <p>
          The official competition rules are still being written. Until they are
          published, this page is a guide to the decisions the organizer team
          still needs to make—not a promise about eligibility, event logistics,
          prizes, judging, or participation requirements.
        </p>
        <div className={styles.callout}>
          <p>
            <strong>You will not be asked to agree to unfinished rules.</strong>
          </p>
          <p>
            The complete version will be available for review before
            registration opens.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "coverage",
    label: "In progress",
    title: "What the final rules will cover",
    content: (
      <>
        <p>
          These are the major topics under review. Each item is intentionally
          marked as pending so students, families, educators, and mentors can
          see where details are still needed.
        </p>
        <div className={styles.cardGrid}>
          <article className={styles.card}>
            <span className={styles.tag}>To be confirmed</span>
            <h3>Who can participate</h3>
            <p>
              Eligibility, any consent requirements, team sizes, and how teams
              are formed.
            </p>
          </article>
          <article className={styles.card}>
            <span className={styles.tag}>To be confirmed</span>
            <h3>What teams can build</h3>
            <p>
              Project scope, when work may begin, starter code, outside assets,
              hardware, and acceptable use of AI tools.
            </p>
          </article>
          <article className={styles.card}>
            <span className={styles.tag}>To be confirmed</span>
            <h3>How to submit</h3>
            <p>
              Required materials, submission steps, the judging platform, and
              what happens if a technical issue occurs.
            </p>
          </article>
          <article className={styles.card}>
            <span className={styles.tag}>To be confirmed</span>
            <h3>How judging works</h3>
            <p>
              Criteria, judging format, prize categories, tie handling, and
              conflict-of-interest procedures.
            </p>
          </article>
          <article className={styles.card}>
            <span className={styles.tag}>To be confirmed</span>
            <h3>Participation logistics</h3>
            <p>
              Event access, attendance expectations, equipment, meals,
              accessibility requests, and venue-specific guidance.
            </p>
          </article>
          <article className={styles.card}>
            <span className={styles.tag}>To be confirmed</span>
            <h3>Fairness and safety</h3>
            <p>
              Academic honesty, intellectual property, conduct, content
              standards, enforcement, and appeals.
            </p>
          </article>
        </div>
      </>
    ),
  },
  {
    id: "working-guidance",
    label: "Working guidance",
    title: "How to prepare in the meantime",
    content: (
      <>
        <p>
          These are sensible preparation habits, not the final competition
          rules. They should help teams start learning without relying on an
          undecided event detail.
        </p>
        <ul className={styles.checkList}>
          <li>
            Practice explaining which parts of a project your team created and
            which tools, libraries, tutorials, data, or assets you used.
          </li>
          <li>
            Keep notes about sources and licenses so you can credit other
            people&apos;s work clearly.
          </li>
          <li>
            Choose sample data that does not expose anyone&apos;s private or
            sensitive information.
          </li>
          <li>
            Build with teammates respectfully and follow the preliminary{" "}
            <a href="/code-of-conduct">Code of Conduct</a>.
          </li>
          <li>
            Revisit this page before registering rather than assuming another
            hackathon&apos;s rules apply here.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "publication",
    label: "Next update",
    title: "When will the official version arrive?",
    content: (
      <>
        <p>
          The organizer team will publish a complete, clearly dated rules page
          before registration opens. It will identify what changed and which
          version participants are being asked to follow.
        </p>
        <div className={styles.placeholder}>
          <p className={styles.placeholderLabel}>Organizer placeholder</p>
          <p>
            Publication timing, revision history, and a rules-question contact
            will be added here once confirmed.
          </p>
        </div>
      </>
    ),
  },
];

export default function RulesPage() {
  return (
    <PolicyPage
      eyebrow="Preliminary competition guide"
      title="Rules, without the fine-print fog."
      summary="We want every student to understand the competition before committing. Here is what the final rulebook will cover—and what is still genuinely undecided."
      noticeTitle="Draft status"
      notice={
        <p>
          This is not the official rulebook. Final rules will appear before
          registration opens.
        </p>
      }
      sections={sections}
      footerNote="Preliminary page · official rules coming before registration"
    />
  );
}
