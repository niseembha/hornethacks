import Image from "next/image";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icons";
import { Brand, SiteHeader } from "@/components/SiteHeader";

const facts: Array<{
  icon: IconName;
  label: string;
  value: string;
  detail: string;
}> = [
  {
    icon: "graduation",
    label: "Who",
    value: "High-school students",
    detail: "Final eligibility coming soon"
  },
  {
    icon: "calendar",
    label: "When",
    value: "Date announcement soon",
    detail: "One focused build sprint"
  },
  {
    icon: "map",
    label: "Where",
    value: "Location coming soon",
    detail: "Venue and access guide to follow"
  },
  {
    icon: "ticket",
    label: "Cost",
    value: "Details coming soon",
    detail: "Published before registration opens"
  }
];

const steps: Array<{
  number: string;
  icon: IconName;
  title: string;
  copy: string;
}> = [
  {
    number: "01",
    icon: "lightbulb",
    title: "Find a problem",
    copy: "Start with one person, one frustration, and one useful change you could make."
  },
  {
    number: "02",
    icon: "users",
    title: "Form your crew",
    copy: "Bring friends or meet teammates. Coders, designers, researchers, and storytellers all belong."
  },
  {
    number: "03",
    icon: "code",
    title: "Build with support",
    copy: "Turn the smallest version of your idea into something you can show, with mentors nearby."
  },
  {
    number: "04",
    icon: "presentation",
    title: "Tell the story",
    copy: "Demo what works, explain what you learned, and leave with a project worth sharing."
  }
];

const resources: Array<{
  icon: IconName;
  tag: string;
  title: string;
  copy: string;
  href: string;
  cta: string;
  download?: boolean;
}> = [
  {
    icon: "code",
    tag: "Build",
    title: "Make your first website",
    copy: "Learn the web from the ground up—no coding experience or special setup required.",
    href: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started",
    cta: "Start with MDN"
  },
  {
    icon: "github",
    tag: "Collaborate",
    title: "Share code with GitHub",
    copy: "Practice repositories, branches, commits, and pull requests in a guided mini-course.",
    href: "https://github.com/skills/introduction-to-github",
    cta: "Try GitHub Skills"
  },
  {
    icon: "palette",
    tag: "Design",
    title: "Prototype before you code",
    copy: "Turn a rough idea into a clear, clickable experience with Figma’s beginner course.",
    href: "https://help.figma.com/hc/en-us/articles/30848209492887-Course-overview-Figma-Design-for-beginners-2025",
    cta: "Learn Figma"
  },
  {
    icon: "flag",
    tag: "Plan",
    title: "Use the project canvas",
    copy: "Define your user, must-have feature, team roles, risks, credits, and demo plan on one page.",
    href: "/hornet-hacks-project-canvas.txt",
    cta: "Download the canvas",
    download: true
  }
];

const firstHour = [
  {
    time: "0–10",
    title: "Choose one user",
    copy: "Pick a real person and one specific problem they face."
  },
  {
    time: "10–20",
    title: "Write the demo promise",
    copy: "Finish: “Our demo will show that a user can…”"
  },
  {
    time: "20–35",
    title: "Cut the scope",
    copy: "Choose one must-have feature. Move everything else to later."
  },
  {
    time: "35–45",
    title: "Share the work",
    copy: "Assign flexible build, design, research, and demo roles."
  },
  {
    time: "45–60",
    title: "Make it real",
    copy: "Create the repo or design file and build the roughest working version."
  }
];

const schedule = [
  {
    number: "01",
    title: "Check-in + welcome",
    copy: "Arrive, get settled, meet the organizers, and learn how the event will work."
  },
  {
    number: "02",
    title: "Opening + team formation",
    copy: "Hear the challenge, pitch early ideas, and connect with teammates if you need them."
  },
  {
    number: "03",
    title: "Workshops + build time",
    copy: "Learn, prototype, test, ask mentors for help, and turn your plan into a demo."
  },
  {
    number: "04",
    title: "Project submission",
    copy: "Package the project story, links, credits, and demo before the submission window closes."
  },
  {
    number: "05",
    title: "Demos + judging",
    copy: "Show what you made, what you learned, and why the idea matters."
  },
  {
    number: "06",
    title: "Awards + closing",
    copy: "Celebrate every team, recognize standout work, and wrap the event together."
  }
];

const criteria: Array<{ icon: IconName; title: string; copy: string }> = [
  {
    icon: "lightbulb",
    title: "Problem + impact",
    copy: "Is the problem clear, and could the idea help its intended user?"
  },
  {
    icon: "spark",
    title: "Creativity",
    copy: "Does the team bring a thoughtful or surprising approach?"
  },
  {
    icon: "code",
    title: "Execution",
    copy: "What did the team build, test, and get working during the event?"
  },
  {
    icon: "presentation",
    title: "Demo + story",
    copy: "Can the team clearly show the project and explain what they learned?"
  }
];

const faqs = [
  {
    question: "What exactly is a hackathon?",
    answer:
      "A hackathon is a creative build sprint where teams turn an idea into a prototype and share it. It is not about hacking into computers. Projects can be websites, apps, games, hardware, data stories, designs, or something completely new."
  },
  {
    question: "Do I need to know how to code?",
    answer:
      "No. Great teams also need design, research, writing, testing, organizing, and presentation skills. We are designing Hornet Hacks for first-timers, and the beginner launchpad above is a good place to start."
  },
  {
    question: "Who can attend?",
    answer:
      "Hornet Hacks is made for high-school students. Exact grade, age, enrollment, location, capacity, and guardian-consent requirements will be posted before registration opens."
  },
  {
    question: "Can I register without a team?",
    answer:
      "Team formation details are still being finalized. The final registration guide will say whether you can register solo and explain any team-matching process."
  },
  {
    question: "What should I bring?",
    answer:
      "A complete packing list is coming soon. Participants should generally expect to bring a laptop, charger, required forms or identification, and any personal medications. Do not rely on that list until the official logistics guide is published."
  },
  {
    question: "Will food be provided? Is it overnight?",
    answer:
      "Meals, allergy support, event hours, drop-off, pickup, and overnight policies are still being finalized. We will publish them before registration closes so students and families can plan with confidence."
  },
  {
    question: "Can teams use AI tools?",
    answer:
      "The final AI policy is coming soon. Teams should expect to disclose meaningful AI assistance, verify what they submit, credit sources, and never put private participant information into an AI tool."
  },
  {
    question: "How will projects be submitted?",
    answer:
      "The judging platform, required fields, presentation format, and final rubric will appear here and in the participant portal before the submission deadline."
  }
];

function SectionHeading({
  eyebrow,
  title,
  copy,
  dark = false
}: {
  eyebrow: string;
  title: React.ReactNode;
  copy?: string;
  dark?: boolean;
}) {
  return (
    <div className={`sectionHeading ${dark ? "sectionHeadingDark" : ""}`}>
      <p className="eyebrow">
        <span aria-hidden="true">{"//"}</span> {eyebrow}
      </p>
      <h2>{title}</h2>
      {copy ? <p className="sectionLead">{copy}</p> : null}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <a className="skipLink" href="#main-content">
        Skip to main content
      </a>

      <div className="announcement">
        <div className="announcementInner">
          <span className="announcementDot" aria-hidden="true" />
          <p>
            Registration details are coming soon.{" "}
            <Link href="/register">
              Preview registration <Icon name="arrow" size={16} />
            </Link>
          </p>
        </div>
      </div>

      <SiteHeader />

      <main id="main-content">
        <section className="hero">
          <div className="heroCircuit heroCircuitOne" aria-hidden="true" />
          <div className="heroCircuit heroCircuitTwo" aria-hidden="true" />
          <div className="container heroGrid">
            <div className="heroCopy">
              <p className="heroEyebrow">
                <span>A hackathon built for high-school students</span>
              </p>
              <h1>
                Build something worth <em>buzzing</em> about.
              </h1>
              <p className="heroLead">
                Team up, learn by making, and turn an idea into a working project. Bring
                your curiosity—no prior hackathon experience required.
              </p>
              <div className="heroActions">
                <Link className="button buttonPrimary" href="/register">
                  Preview registration
                  <Icon name="arrow" size={19} />
                </Link>
                <Link className="button buttonGhost" href="#resources">
                  Beginner guide
                </Link>
              </div>
              <ul className="heroChecks" aria-label="Event highlights">
                <li>
                  <Icon name="check" size={16} /> Beginner-friendly
                </li>
                <li>
                  <Icon name="check" size={16} /> All skill sets welcome
                </li>
                <li>
                  <Icon name="check" size={16} /> Student-powered
                </li>
              </ul>
            </div>

            <div className="heroVisual" aria-label="Hornet Hacks mascot illustration">
              <div className="hexField" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="mascotGlow" aria-hidden="true" />
              <Image
                className="heroMascot"
                src="/assets/hornet-mascot.png"
                alt="Illustrated green Hornet Hacks mascot in flight"
                width={1254}
                height={1254}
                priority
                sizes="(max-width: 800px) 82vw, 45vw"
              />
              <div className="heroNote heroNoteTop">
                <span>01</span>
                <p>
                  First time?
                  <strong>Perfect.</strong>
                </p>
              </div>
              <div className="heroNote heroNoteBottom">
                <Icon name="code" size={21} />
                <p>
                  Build <span>+</span> learn
                </p>
              </div>
            </div>
          </div>
          <div className="heroTicker" aria-hidden="true">
            <div>
              <span>Build</span>
              <i />
              <span>Learn</span>
              <i />
              <span>Design</span>
              <i />
              <span>Collaborate</span>
              <i />
              <span>Innovate</span>
              <i />
              <span>Build</span>
              <i />
              <span>Learn</span>
              <i />
              <span>Design</span>
              <i />
              <span>Collaborate</span>
            </div>
          </div>
        </section>

        <section className="factsSection" aria-labelledby="event-facts-title">
          <div className="container">
            <div className="factsIntro">
              <h2 className="eyebrow" id="event-facts-title">
                Event snapshot
              </h2>
              <span>Logistics are being finalized</span>
            </div>
            <div className="factsGrid">
              {facts.map((fact) => (
                <article className="factCard" key={fact.label}>
                  <div className="factIcon">
                    <Icon name={fact.icon} />
                  </div>
                  <div>
                    <p>{fact.label}</p>
                    <h3>{fact.value}</h3>
                    <span>{fact.detail}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about section" id="about">
          <div className="container">
            <div className="aboutIntro">
              <SectionHeading
                eyebrow="What happens here?"
                title={
                  <>
                    Your idea. One build sprint.{" "}
                    <span className="highlightText">A lot of learning.</span>
                  </>
                }
              />
              <div className="aboutCopy">
                <p className="largeCopy">
                  A hackathon is a timed creative event—not a cybersecurity competition.
                </p>
                <p>
                  You will choose a problem, make the smallest version of a solution, and
                  show what you learned. The goal is progress, not perfection.
                </p>
              </div>
            </div>

            <div className="stepsGrid">
              {steps.map((step) => (
                <article className="stepCard" key={step.number}>
                  <div className="stepTop">
                    <span>{step.number}</span>
                    <Icon name={step.icon} size={30} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              ))}
            </div>

            <div className="belongBanner">
              <div className="belongIcon" aria-hidden="true">
                <Icon name="users" size={30} />
              </div>
              <p>
                <strong>There is more than one way to be a hacker.</strong>
                Designers, researchers, writers, testers, presenters, and first-time
                coders all make teams stronger.
              </p>
            </div>
          </div>
        </section>

        <section className="resources section sectionDark" id="resources">
          <div className="resourceDots" aria-hidden="true" />
          <div className="container">
            <div className="resourceHeadingRow">
              <SectionHeading
                eyebrow="Beginner launchpad"
                title={
                  <>
                    New to hackathons?{" "}
                    <span className="highlightTextLight">Start here.</span>
                  </>
                }
                copy="You do not need to master a framework before Hornet Hacks. Start small, divide the work, and decide what you want to demo before you build."
                dark
              />
              <div className="resourceStamp" aria-hidden="true">
                <Icon name="rocket" size={28} />
                <span>Zero experience required</span>
              </div>
            </div>

            <div className="firstHour">
              <div className="firstHourTitle">
                <div>
                  <p className="eyebrow">A practical playbook</p>
                  <h3>Your first 60 minutes</h3>
                </div>
                <span className="statusChip statusChipLight">
                  <Icon name="clock" size={15} /> Save this
                </span>
              </div>
              <ol className="hourSteps">
                {firstHour.map((item, index) => (
                  <li key={item.time}>
                    <div className="hourTime">
                      <span>{item.time}</span>
                      <small>MIN</small>
                    </div>
                    <div className="hourLine" aria-hidden="true">
                      <i />
                      {index < firstHour.length - 1 ? <span /> : null}
                    </div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.copy}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="resourceGrid">
              {resources.map((resource) => (
                <article className="resourceCard" key={resource.title}>
                  <div className="resourceCardTop">
                    <span className="resourceIcon">
                      <Icon name={resource.icon} size={25} />
                    </span>
                    <span className="resourceTag">{resource.tag}</span>
                  </div>
                  <h3>{resource.title}</h3>
                  <p>{resource.copy}</p>
                  <a
                    href={resource.href}
                    target={resource.download ? undefined : "_blank"}
                    rel={resource.download ? undefined : "noreferrer"}
                    download={resource.download ? true : undefined}
                  >
                    {resource.cta}
                    <Icon name={resource.download ? "arrow" : "external"} size={17} />
                  </a>
                </article>
              ))}
            </div>

            <details className="pitchGuide">
              <summary>
                <span>
                  <Icon name="presentation" size={22} />
                  Need help with the final pitch?
                </span>
                <strong>Open the 5-slide outline</strong>
              </summary>
              <div className="pitchSlides">
                {[
                  ["01", "Problem", "What is happening, and who does it affect?"],
                  ["02", "User", "Who did you design for, and what did you learn?"],
                  ["03", "Solution", "What did your team decide to make—and why?"],
                  ["04", "Live demo", "Show the one experience that matters most."],
                  ["05", "Build + next", "What did you create, learn, and want to improve?"]
                ].map(([number, title, copy]) => (
                  <div key={number}>
                    <span>{number}</span>
                    <h4>{title}</h4>
                    <p>{copy}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </section>

        <section className="schedule section" id="schedule">
          <div className="container scheduleGrid">
            <div className="scheduleIntro">
              <div className="stickyHeading">
                <SectionHeading
                  eyebrow="Run of show"
                  title={
                    <>
                      A full day of making{" "}
                      <span className="highlightText">things happen.</span>
                    </>
                  }
                  copy="The event flow is taking shape. Exact times, time zone, meals, pickup, and venue access will be posted here and emailed to registered participants."
                />
                <div className="scheduleNotice">
                  <Icon name="calendar" size={24} />
                  <div>
                    <strong>Times coming soon</strong>
                    <span>Calendar download unlocks when the schedule is final.</span>
                  </div>
                </div>
              </div>
            </div>

            <ol className="scheduleTimeline">
              {schedule.map((item, index) => (
                <li key={item.number}>
                  <div className="timelineRail" aria-hidden="true">
                    <span>{item.number}</span>
                    {index < schedule.length - 1 ? <i /> : null}
                  </div>
                  <div className="timelineContent">
                    <p>Phase {item.number}</p>
                    <h3>{item.title}</h3>
                    <span>{item.copy}</span>
                  </div>
                  <div className="timePlaceholder">
                    <Icon name="clock" size={16} />
                    Time soon
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="judging section sectionDark" id="judging">
          <div className="judgingHexes" aria-hidden="true" />
          <div className="container">
            <div className="judgingTop">
              <SectionHeading
                eyebrow="Judging"
                title={
                  <>
                    Show what you made—and{" "}
                    <span className="highlightTextLight">what you learned.</span>
                  </>
                }
                copy="The submission platform, presentation format, rubric weights, and final checklist will be announced before judging. A polished product is not required."
                dark
              />
              <div className="platformCard">
                <div className="platformStatus">
                  <span className="statusDot" />
                  Platform connection pending
                </div>
                <Icon name="presentation" size={36} />
                <h3>Submission portal</h3>
                <p>
                  The judging link and complete instructions will appear here before the
                  deadline.
                </p>
                <span className="disabledAction" aria-disabled="true">
                  Open platform <span>Coming soon</span>
                </span>
              </div>
            </div>

            <div className="criteriaWrap">
              <div className="criteriaLabel">
                <p>Draft judging signals</p>
                <span>Final criteria and weights coming soon</span>
              </div>
              <div className="criteriaGrid">
                {criteria.map((item) => (
                  <article key={item.title}>
                    <Icon name={item.icon} size={26} />
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rules section" id="rules">
          <div className="container">
            <div className="rulesTop">
              <SectionHeading
                eyebrow="Rules + safety"
                title={
                  <>
                    Build fair.{" "}
                    <span className="highlightText">Build safely.</span>
                  </>
                }
                copy="The complete event rules are being reviewed. These preliminary principles show what teams can expect; the final published rules will control."
              />
              <Link className="textLink" href="/rules">
                Read the preliminary rules <Icon name="arrow" size={18} />
              </Link>
            </div>

            <div className="rulesGrid">
              <article className="ruleCard ruleCardFeature">
                <div className="ruleIcon">
                  <Icon name="scale" size={29} />
                </div>
                <p className="eyebrow">Fair play</p>
                <h3>Make new work. Credit outside help.</h3>
                <p>
                  Build during the event, disclose previous work, and credit outside
                  code, data, media, assets, tutorials, and meaningful AI assistance.
                </p>
                <Link href="/rules">
                  Rule summary <Icon name="arrow" size={16} />
                </Link>
              </article>
              <article className="ruleCard">
                <div className="ruleIcon">
                  <Icon name="shield" size={29} />
                </div>
                <p className="eyebrow">Community</p>
                <h3>Respect people, boundaries, work, and equipment.</h3>
                <p>
                  Harassment, discrimination, intimidation, retaliation, and unsafe
                  behavior do not belong at Hornet Hacks.
                </p>
                <Link href="/code-of-conduct">
                  Code of conduct <Icon name="arrow" size={16} />
                </Link>
              </article>
              <article className="ruleCard ruleCardFamily">
                <div className="ruleIcon">
                  <Icon name="users" size={29} />
                </div>
                <p className="eyebrow">For students + families</p>
                <h3>Know the plan before registration closes.</h3>
                <p>
                  Supervision, consent, drop-off, pickup, emergency, food, photo,
                  accessibility, and overnight policies will be published clearly.
                </p>
                <Link href="/privacy">
                  Privacy approach <Icon name="arrow" size={16} />
                </Link>
              </article>
            </div>

            <div className="policyStrip">
              <div>
                <Icon name="shield" size={24} />
                <span>
                  <strong>Need an accommodation?</strong>
                  A private request channel will be published before registration.
                </span>
              </div>
              <div>
                <Icon name="mail" size={24} />
                <span>
                  <strong>Need to report a concern?</strong>
                  Safety contact and help-desk details are coming soon.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="faq section" id="faq">
          <div className="container faqGrid">
            <div className="faqIntro">
              <div className="stickyHeading">
                <SectionHeading
                  eyebrow="FAQ"
                  title={
                    <>
                      Questions are{" "}
                      <span className="highlightText">part of building.</span>
                    </>
                  }
                  copy="Here are the answers we can share now. We will replace every “coming soon” answer as event logistics are confirmed."
                />
                <div className="faqAsk">
                  <Icon name="mail" size={23} />
                  <p>
                    Still wondering?
                    <span>Organizer contact coming soon</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="faqList">
              {faqs.map((faq, index) => (
                <details key={faq.question}>
                  <summary>
                    <span>0{index + 1}</span>
                    <strong>{faq.question}</strong>
                    <i aria-hidden="true" />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="community section">
          <div className="container">
            <div className="communityPanel">
              <div className="communityCopy">
                <p className="eyebrow">
                  <span aria-hidden="true">{"//"}</span> Follow the build
                </p>
                <h2>Stay in the loop.</h2>
                <p>
                  Get registration news, workshop announcements, project tips, and
                  deadline reminders as the event takes shape.
                </p>
              </div>
              <div className="socialGrid">
                <div className="socialCard">
                  <Icon name="instagram" size={24} />
                  <span>
                    <strong>Instagram</strong>
                    Handle coming soon
                  </span>
                  <i>Updates</i>
                </div>
                <div className="socialCard">
                  <Icon name="discord" size={24} />
                  <span>
                    <strong>Discord</strong>
                    Invite policy coming soon
                  </span>
                  <i>Community</i>
                </div>
                <div className="socialCard">
                  <Icon name="github" size={24} />
                  <span>
                    <strong>GitHub</strong>
                    Starter kits coming soon
                  </span>
                  <i>Projects</i>
                </div>
              </div>
            </div>

            <div className="sponsorRow">
              <div>
                <p className="eyebrow">Partners</p>
                <h3>Help the next generation build.</h3>
              </div>
              <p>
                Sponsor packages and organizer contact details are being prepared. No
                partner logos will appear until participation is confirmed.
              </p>
              <span className="statusChip">
                <Icon name="spark" size={16} /> Sponsor information coming soon
              </span>
            </div>
          </div>
        </section>

        <section className="finalCta">
          <div className="finalCtaPattern" aria-hidden="true" />
          <div className="container finalCtaInner">
            <div>
              <p className="eyebrow">
                <span aria-hidden="true">{"//"}</span> Your first step
              </p>
              <h2>
                Ready to build something worth <span>buzzing about?</span>
              </h2>
            </div>
            <div className="finalCtaActions">
              <p>
                Preview the planned account flow now. Real registration will replace it
                when event policies and logistics are ready.
              </p>
              <div>
                <Link className="button buttonPrimary" href="/register">
                  Registration preview <Icon name="arrow" size={18} />
                </Link>
                <Link className="button buttonGhost" href="/login">
                  Account preview
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="siteFooter">
        <div className="container">
          <div className="footerTop">
            <div className="footerBrand">
              <Brand footer />
              <p>
                A student-powered hackathon where ideas take flight and innovation
                creates impact.
              </p>
            </div>
            <div className="footerLinks">
              <div>
                <p>Explore</p>
                <Link href="/#about">About</Link>
                <Link href="/#resources">Beginner resources</Link>
                <Link href="/#schedule">Schedule</Link>
                <Link href="/#faq">FAQ</Link>
              </div>
              <div>
                <p>Trust</p>
                <Link href="/rules">Rules</Link>
                <Link href="/code-of-conduct">Code of conduct</Link>
                <Link href="/privacy">Privacy</Link>
                <span>Accessibility details soon</span>
              </div>
              <div>
                <p>Participate</p>
                <Link href="/register">Registration preview</Link>
                <Link href="/login">Account access preview</Link>
                <span>Sponsor details soon</span>
                <span>Contact coming soon</span>
              </div>
            </div>
          </div>
          <div className="footerBottom">
            <p>© 2026 Hornet Hacks. Student-built with care.</p>
            <p className="footerCode">{"<build />"} · {"<learn />"} · {"<innovate />"}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
