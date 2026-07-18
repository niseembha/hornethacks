import type { Metadata } from "next";

import {
  PolicyPage,
  policyStyles as styles,
  type PolicySection,
} from "../_components/PolicyPage";

export const metadata: Metadata = {
  title: "Code of Conduct",
  description:
    "The preliminary behavior expectations for the Hornet Hacks community.",
};

const sections: PolicySection[] = [
  {
    id: "commitment",
    label: "Our commitment",
    title: "A space where students can build confidently",
    content: (
      <>
        <p>
          Hornet Hacks is intended to be welcoming, collaborative, and safe for
          students with every level of experience. Participants, organizers,
          volunteers, mentors, judges, sponsors, and guests are expected to
          help create that environment in event spaces and community channels.
        </p>
        <div className={styles.callout}>
          <p>
            <strong>Being new is not a weakness here.</strong> Ask questions,
            share what you know, and give people room to learn without
            embarrassment.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "expected",
    label: "Expected behavior",
    title: "Help everyone belong",
    content: (
      <>
        <p>Community members are expected to:</p>
        <ul className={styles.checkList}>
          <li>
            Treat people with respect across differences in identity,
            background, ability, experience, and perspective.
          </li>
          <li>
            Communicate constructively; critique ideas and work without
            attacking or humiliating the person behind them.
          </li>
          <li>
            Respect personal boundaries, names, pronouns, privacy, and a clear
            “no.”
          </li>
          <li>
            Ask before photographing, recording, posting about, or sharing
            another person&apos;s information.
          </li>
          <li>
            Use shared spaces, tools, networks, and accounts safely and only as
            authorized.
          </li>
          <li>
            Give credit, collaborate honestly, and speak up or get help when
            something feels unsafe.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "unacceptable",
    label: "Not acceptable",
    title: "Harassment and harmful conduct do not belong here",
    content: (
      <>
        <p>Unacceptable behavior includes, but is not limited to:</p>
        <ul className={styles.plainList}>
          <li>
            Harassment, discrimination, bullying, intimidation, threats, or
            deliberately demeaning language.
          </li>
          <li>
            Unwanted sexual attention, sexualized comments or imagery, or
            inappropriate physical contact.
          </li>
          <li>
            Repeatedly disrupting talks, teamwork, judging, or another
            person&apos;s participation.
          </li>
          <li>
            Sharing private information, images, messages, or identifying
            details without permission.
          </li>
          <li>
            Sabotaging projects, accounts, devices, networks, submissions, or
            event operations.
          </li>
          <li>
            Retaliating against someone for raising a concern or helping with a
            report.
          </li>
        </ul>
        <p>
          Adults and students should maintain appropriate, professional
          boundaries. Anyone asked to stop harmful or unwelcome behavior is
          expected to stop immediately.
        </p>
      </>
    ),
  },
  {
    id: "reporting",
    label: "Getting help",
    title: "Report a concern",
    content: (
      <>
        <p>
          You can raise a concern about something that happened to you,
          something you witnessed, or a pattern that may put someone at risk.
          You do not need to confront the person involved first.
        </p>
        <div className={styles.placeholder}>
          <p className={styles.placeholderLabel}>
            Reporting contact · coming soon
          </p>
          <p>
            The organizers will publish a monitored reporting channel and an
            in-person reporting option here before registration opens. No
            report should be sent through this placeholder.
          </p>
        </div>
        <p>
          If someone may be in immediate danger, seek help from local emergency
          services or a trusted adult nearby. Do not wait for the event
          reporting channel.
        </p>
      </>
    ),
  },
  {
    id: "response",
    label: "Process in development",
    title: "What happens after a report",
    content: (
      <>
        <p>
          The detailed response and enforcement process is still being
          finalized. The final version will explain who receives reports, how
          information is handled, possible actions, how conflicts of interest
          are managed, and whether review or appeal is available.
        </p>
        <div className={styles.callout}>
          <p>
            The intended priorities are immediate safety, a respectful
            response, limited sharing of sensitive information, and protection
            from retaliation. The final policy will describe the actual process
            before anyone registers.
          </p>
        </div>
      </>
    ),
  },
];

export default function CodeOfConductPage() {
  return (
    <PolicyPage
      eyebrow="Preliminary community standard"
      title="Build boldly. Treat people well."
      summary="Great projects come from teams who feel safe asking questions and sharing ideas. These expectations are usable now; reporting and enforcement details are still being finalized."
      noticeTitle="Preliminary policy"
      notice={
        <p>
          Behavior expectations are listed below. The official reporting and
          enforcement process will be published before registration opens.
        </p>
      }
      sections={sections}
      footerNote="Preliminary page · reporting details coming before registration"
    />
  );
}
