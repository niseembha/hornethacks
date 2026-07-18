import type { Metadata } from "next";

import {
  PolicyPage,
  policyStyles as styles,
  type PolicySection,
} from "../_components/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Hornet Hacks' preliminary privacy commitments for a student-focused event.",
};

const sections: PolicySection[] = [
  {
    id: "current-status",
    label: "Read this first",
    title: "This is a design commitment, not the final notice",
    content: (
      <>
        <p>
          Registration and event systems are still being selected, so we cannot
          accurately list every data field, service provider, retention period,
          or consent flow yet. A complete privacy notice will be posted before
          registration opens and before participants are asked for personal
          information.
        </p>
        <div className={styles.callout}>
          <p>
            <strong>Please do not enter personal information into a placeholder
            form or link on this preview site.</strong>
          </p>
        </div>
      </>
    ),
  },
  {
    id: "principles",
    label: "Our direction",
    title: "Collect less, explain more",
    content: (
      <>
        <p>
          Because Hornet Hacks is designed for high-school students, the
          registration experience is being built around data minimization and
          plain-language choices.
        </p>
        <ul className={styles.checkList}>
          <li>
            Ask only for information needed to operate the event or meet a
            clearly explained requirement.
          </li>
          <li>
            Mark optional questions clearly and avoid making sensitive
            information a default request.
          </li>
          <li>
            Explain why information is requested before a student submits it.
          </li>
          <li>
            Limit access to people and services that need the information for a
            defined event purpose.
          </li>
          <li>
            Avoid selling participant information or using it for personalized
            advertising.
          </li>
          <li>
            Provide a clear way to ask privacy questions or request help with
            participant information.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "final-notice",
    label: "Details to come",
    title: "What the final privacy notice will explain",
    content: (
      <>
        <p>
          The final notice will replace uncertainty with specific, checkable
          information in these areas:
        </p>
        <div className={styles.cardGrid}>
          <article className={styles.card}>
            <span className={styles.tag}>Pending system choices</span>
            <h3>Information collected</h3>
            <p>
              Every required and optional category of participant, account, and
              event information.
            </p>
          </article>
          <article className={styles.card}>
            <span className={styles.tag}>Pending system choices</span>
            <h3>Why it is used</h3>
            <p>
              The purpose for each category, including registration,
              communication, safety, accessibility, and event operations.
            </p>
          </article>
          <article className={styles.card}>
            <span className={styles.tag}>Pending system choices</span>
            <h3>Who receives it</h3>
            <p>
              Service providers and any event partners that process
              information, with their role explained.
            </p>
          </article>
          <article className={styles.card}>
            <span className={styles.tag}>Pending system choices</span>
            <h3>How long it is kept</h3>
            <p>
              Retention periods or the criteria used to decide when
              information is deleted.
            </p>
          </article>
          <article className={styles.card}>
            <span className={styles.tag}>Pending organizer review</span>
            <h3>Student and family choices</h3>
            <p>
              Applicable consent steps and ways to access, correct, or request
              deletion of information.
            </p>
          </article>
          <article className={styles.card}>
            <span className={styles.tag}>Pending technical review</span>
            <h3>Website technology</h3>
            <p>
              Cookies, analytics, logs, security measures, and any linked
              services used by the website.
            </p>
          </article>
        </div>
      </>
    ),
  },
  {
    id: "minors",
    label: "Student-centered design",
    title: "Extra care with information about minors",
    content: (
      <>
        <p>
          The organizer team is still determining the registration and consent
          process. The final notice will clearly state what information is
          requested from students, what involvement is required from a parent
          or guardian, and who can help with a request.
        </p>
        <p>
          Until that process is published, no assumptions should be made about
          age thresholds, consent requirements, or eligibility from this
          preliminary page.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    label: "Questions and requests",
    title: "Privacy contact",
    content: (
      <>
        <p>
          A monitored privacy contact and request instructions will be listed
          here in the final notice.
        </p>
        <div className={styles.placeholder}>
          <p className={styles.placeholderLabel}>
            Privacy contact · coming soon
          </p>
          <p>
            Contact details are not yet available. Please do not send sensitive
            or personal information to an unverified account.
          </p>
        </div>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Preliminary privacy approach"
      title="Student data deserves a light footprint."
      summary="Hornet Hacks is being designed to ask for as little personal information as possible and to explain every request in plain language."
      noticeTitle="Final notice coming before registration"
      notice={
        <p>
          This page describes the current privacy direction. It is not a final
          privacy notice or a list of current data practices.
        </p>
      }
      sections={sections}
      footerNote="Preliminary page · final notice coming before registration"
    />
  );
}
