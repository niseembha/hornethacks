"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import styles from "./PortalForm.module.css";

type PortalMode = "login" | "register";

type PortalFormProps = {
  mode: PortalMode;
};

const portalCopy = {
  login: {
    eyebrow: "Account access",
    title: "The portal is getting ready",
    description:
      "Sign-in is not live yet. See what account access will include without entering an email or password.",
    button: "Preview the dashboard",
    confirmation:
      "No credentials were requested or sent. This is where your private dashboard will open once accounts are live.",
  },
  register: {
    eyebrow: "Registration preview",
    title: "See how joining will work",
    description:
      "Registration is not open yet. Review the planned steps without sharing any personal information.",
    button: "Preview the registration steps",
    confirmation:
      "No account was created and no information was requested or saved. Real registration will replace this preview when the event policies are ready.",
  },
} satisfies Record<
  PortalMode,
  {
    eyebrow: string;
    title: string;
    description: string;
    button: string;
    confirmation: string;
  }
>;

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect height="11" rx="2" width="16" x="4" y="10" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function SchoolIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m3 10 9-5 9 5-9 5-9-5Z" />
      <path d="M7 13v4c3 2 7 2 10 0v-4M21 10v6" />
    </svg>
  );
}

export default function PortalForm({ mode }: PortalFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const isLogin = mode === "login";
  const copy = portalCopy[mode];
  const previewItems = isLogin
    ? [
        {
          icon: <MailIcon />,
          title: "Verified account email",
          copy: "Your approved account address will be shown here.",
        },
        {
          icon: <LockIcon />,
          title: "Secure sign-in",
          copy: "The final authentication method will appear when accounts launch.",
        },
      ]
    : [
        {
          icon: <UserIcon />,
          title: "Student details",
          copy: "Only fields required for event operations will be requested.",
        },
        {
          icon: <SchoolIcon />,
          title: "Eligibility + consent",
          copy: "Final requirements will be shown before you share information.",
        },
        {
          icon: <MailIcon />,
          title: "Event preferences",
          copy: "Team and update options will follow confirmed event policies.",
        },
      ];

  return (
    <main className={styles.page}>
      <div aria-hidden="true" className={styles.glow} />
      <section
        aria-label={`${isLogin ? "Sign in" : "Registration"} portal preview`}
        className={styles.shell}
      >
        <aside className={styles.brandPanel}>
          <div aria-hidden="true" className={styles.honeycomb}>
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className={styles.brandTop}>
            <Link className={styles.backLink} href="/">
              <span aria-hidden="true">←</span>
              Back to event
            </Link>
            <span className={styles.previewPill}>Portal preview</span>
          </div>

          <div className={styles.brandContent}>
            <Link
              aria-label="hornetHacks home"
              className={styles.wordmark}
              href="/"
            >
              <span className={styles.logoMark}>
                <Image
                  alt=""
                  height={76}
                  priority
                  src="/assets/hornet-mascot.png"
                  width={76}
                />
              </span>
              <span className={styles.wordmarkText}>
                <span>HORNET</span>
                <span>HACKS</span>
              </span>
            </Link>

            <p className={styles.brandEyebrow}>Your hack starts here</p>
            <p className={styles.brandHeadline}>One place for your whole hack.</p>
            <p className={styles.brandDescription}>
              When the portal launches, you&apos;ll be able to manage team
              details, follow event updates, and submit your project without
              missing a beat.
            </p>

            <ul className={styles.featureList}>
              <li>
                <span className={styles.check}>
                  <CheckIcon />
                </span>
                See your team details
              </li>
              <li>
                <span className={styles.check}>
                  <CheckIcon />
                </span>
                Keep your event checklist handy
              </li>
              <li>
                <span className={styles.check}>
                  <CheckIcon />
                </span>
                Submit when judging opens
              </li>
            </ul>
          </div>

          <p className={styles.brandFooter}>
            <span>{"//"}</span> Build. Learn. Innovate.
          </p>
        </aside>

        <div className={styles.formPanel}>
          <div className={styles.formContainer}>
            <div className={styles.safetyNote}>
              <span aria-hidden="true" className={styles.statusDot} />
              Preview mode — no data is requested
            </div>

            <div className={styles.heading}>
              <p>{copy.eyebrow}</p>
              <h1>{copy.title}</h1>
              <span>{copy.description}</span>
            </div>

            <div className={styles.previewList} aria-label="Planned portal steps">
              {previewItems.map((item, index) => (
                <div className={styles.previewItem} key={item.title}>
                  <span className={styles.previewNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.previewIcon}>{item.icon}</span>
                  <span className={styles.previewCopy}>
                    <strong>{item.title}</strong>
                    <span>{item.copy}</span>
                  </span>
                </div>
              ))}

              <button
                className={styles.submitButton}
                type="button"
                onClick={() => setSubmitted(true)}
              >
                {copy.button}
                <ArrowIcon />
              </button>
            </div>

            {submitted ? (
              <div
                aria-live="polite"
                className={`${styles.confirmation} ${styles.confirmationVisible}`}
                role="status"
              >
                <span className={styles.confirmationIcon}>
                  <CheckIcon />
                </span>
                <div>
                  <strong>Preview complete</strong>
                  <p>{copy.confirmation}</p>
                </div>
              </div>
            ) : null}

            <p className={styles.switchMode}>
              {isLogin
                ? "Want to see the registration preview?"
                : "Want to see the account-access preview?"}{" "}
              <Link href={isLogin ? "/register" : "/login"}>
                {isLogin ? "View registration" : "View account access"}
              </Link>
            </p>

            <p className={styles.finePrint}>
              This preview does not ask for personal information. The real flow
              will show the final privacy, consent, and eligibility details before
              anything is submitted.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
