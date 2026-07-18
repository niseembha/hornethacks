import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./PolicyPage.module.css";

export type PolicySection = {
  id: string;
  label: string;
  title: string;
  content: ReactNode;
};

type PolicyPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  noticeTitle: string;
  notice: ReactNode;
  sections: PolicySection[];
  footerNote: string;
};

export function PolicyPage({
  eyebrow,
  title,
  summary,
  noticeTitle,
  notice,
  sections,
  footerNote,
}: PolicyPageProps) {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#policy-content">
        Skip to content
      </a>

      <div className={styles.backdrop} aria-hidden="true">
        <span className={styles.glowOne} />
        <span className={styles.glowTwo} />
        <span className={styles.grid} />
      </div>

      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Hornet Hacks home">
          <span className={styles.brandMark} aria-hidden="true">
            <Image
              src="/assets/hornet-mascot.png"
              alt=""
              width={34}
              height={34}
            />
          </span>
          <span className={styles.brandName}>
            <span>Hornet</span> Hacks
          </span>
        </Link>

        <Link className={styles.homeLink} href="/">
          <span aria-hidden="true">←</span>
          Back home
        </Link>
      </header>

      <main className={styles.main} id="policy-content">
        <section className={styles.hero} aria-labelledby="policy-title">
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="policy-title">{title}</h1>
          <p className={styles.summary}>{summary}</p>

          <div className={styles.notice} role="note">
            <span className={styles.noticeIcon} aria-hidden="true">
              i
            </span>
            <div>
              <p className={styles.noticeTitle}>{noticeTitle}</p>
              <div className={styles.noticeBody}>{notice}</div>
            </div>
          </div>
        </section>

        <div className={styles.contentLayout}>
          <aside className={styles.tableOfContents}>
            <p className={styles.tocLabel}>On this page</p>
            <nav aria-label={`${title} contents`}>
              <ol>
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>
                      <span aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className={styles.sections}>
            {sections.map((section, index) => (
              <section
                className={styles.section}
                id={section.id}
                key={section.id}
                aria-labelledby={`${section.id}-title`}
              >
                <div className={styles.sectionHeading}>
                  <span className={styles.sectionNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className={styles.sectionLabel}>{section.label}</p>
                    <h2 id={`${section.id}-title`}>{section.title}</h2>
                  </div>
                </div>
                <div className={styles.sectionContent}>{section.content}</div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          <span className={styles.footerDot} aria-hidden="true" />
          {footerNote}
        </p>
        <Link href="/">Hornet Hacks home</Link>
      </footer>
    </div>
  );
}

export { styles as policyStyles };
