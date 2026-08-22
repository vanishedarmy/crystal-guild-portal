import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader.jsx";

const RIGHTS = [
  ["Access", "Request access to personal information we hold about you and information about how it is processed."],
  ["Rectification", "Ask us to correct personal information that is inaccurate or incomplete."],
  ["Erasure", "Request deletion of personal information where applicable, including when it is no longer needed for the purpose for which it was collected."],
  ["Restriction", "Request that we restrict processing of your personal information under applicable conditions."],
  ["Portability", "Receive applicable personal information in a structured, commonly used, machine-readable format and transmit it to another controller."],
  ["Object", "Object to certain processing of your personal information, including direct marketing where applicable."],
  ["Withdraw consent", "Withdraw consent at any time where processing is based on consent, without affecting processing that was lawful before withdrawal."],
  ["Complaint", "Lodge a complaint with an appropriate supervisory authority if you believe applicable data-protection law has been violated."],
];

const US_RIGHTS = [
  ["Know", "Request the categories and specific pieces of personal information collected, the sources of that information, the purposes for its use, and the categories of third parties with whom it is disclosed."],
  ["Delete", "Request deletion of personal information we have collected about you, subject to applicable exceptions."],
  ["Correct", "Ask us to correct inaccurate personal information."],
  ["Limit", "Request limits on the use of sensitive personal information where applicable."],
  ["Opt out", "Crystal Guild does not sell or share personal information for cross-context behavioral advertising. If that practice changes, appropriate opt-out controls will be provided."],
  ["Non-discrimination", "Exercise applicable privacy rights without unlawful discrimination."],
];

function PolicySection({ id, eyebrow, title, children }) {
  return (
    <section className="privacy-section" id={id}>
      <div className="privacy-section-heading">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <div className="privacy-section-body">{children}</div>
    </section>
  );
}

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy — Crystal Guild";
  }, []);

  return (
    <>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader />
      <main id="main-content" className="shell privacy-shell" tabIndex="-1">
        <section className="privacy-hero">
          <div>
            <p className="eyebrow">Legal &amp; Privacy</p>
            <h1>Privacy Policy</h1>
            <p className="lede">
              This policy explains how Crystal Guild handles personal information connected with the Adventurer Portal,
              its public player profiles, and related interactions.
            </p>
            <div className="privacy-effective"><span>Effective</span><strong>August 19, 2026</strong></div>
          </div>
          <aside className="privacy-summary" aria-label="Privacy summary">
            <div><span>Website</span><strong>crystal-guild-web.onrender.com</strong></div>
            <div><span>Primary hosting</span><strong>United States</strong></div>
            <div><span>Sale of personal data</span><strong>No</strong></div>
            <div><span>Privacy contact</span><strong>vanishedarmy@gmail.com</strong></div>
          </aside>
        </section>

        <div className="privacy-layout">
          <nav className="privacy-toc" aria-label="Privacy policy sections">
            <span>On this page</span>
            <a href="#overview">Overview</a>
            <a href="#scope">Scope &amp; information</a>
            <a href="#storage">Storage &amp; protection</a>
            <a href="#providers">Service providers</a>
            <a href="#rights">Your rights</a>
            <a href="#tracking">Cookies &amp; tracking</a>
            <a href="#transfers">International transfers</a>
            <a href="#us-rights">United States rights</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="privacy-content">
            <PolicySection id="overview" eyebrow="01" title="Introduction">
              <p>
                Crystal Guild is committed to responsible management of personal information used in connection with this
                website and related interactions. We use information to operate and improve the Adventurer Portal, provide
                support, maintain the service, and protect the integrity of the platform.
              </p>
              <p>
                We aim to process personal information transparently and to protect it against unauthorized access,
                disclosure, alteration, or destruction. Crystal Guild does not have a designated Data Protection Officer.
              </p>
            </PolicySection>

            <PolicySection id="scope" eyebrow="02" title="Scope and information used">
              <p>
                This policy applies to visitors to the Crystal Guild website and to Crystal Guild players whose public game
                profile information is displayed through the Adventurer Portal.
              </p>
              <div className="privacy-detail-grid">
                <article>
                  <h3>Public Guild identity</h3>
                  <p>Twitch username, Twitch display name, equipped title, Job, level, and current Guild status.</p>
                </article>
                <article>
                  <h3>Gameplay profile data</h3>
                  <p>Progression, equipment, inventory, achievements, records, Hunts, Relics, battle statistics, and other Crystal Guild game state intentionally published to the Portal.</p>
                </article>
                <article>
                  <h3>Support information</h3>
                  <p>Information you voluntarily provide when contacting Crystal Guild about support, privacy, or service requests.</p>
                </article>
                <article>
                  <h3>Portal sign-in identity</h3>
                  <p>When you choose Sign in with Twitch, Crystal Guild receives your Twitch numeric user ID, login name, and display name to link the session to your existing adventurer. Twitch access tokens are used only during sign-in and are not stored by the Portal.</p>
                </article>
                <article>
                  <h3>Website action records</h3>
                  <p>When you use signed-in Portal features, Crystal Guild records the linked player, action type, status, timestamps, and non-secret result information so requests can be handled safely and duplicate submissions can be prevented.</p>
                </article>
                <article>
                  <h3>Technical operation</h3>
                  <p>Hosting and network providers may process ordinary request and security information needed to deliver and protect the website.</p>
                </article>
              </div>
              <div className="privacy-note">
                The hosted Portal receives only the public Guild data needed to run the website. Secret credentials, OAuth tokens,
                passwords, email addresses, IP-address fields, API keys, and connection secrets are not included in that public data.
              </div>
            </PolicySection>

            <PolicySection id="storage" eyebrow="03" title="Data storage and protection">
              <p>
                Personal information associated with the hosted Crystal Guild service is stored on servers located in the
                United States. Where information must be transferred internationally, Crystal Guild seeks to handle those
                transfers in accordance with applicable data-protection requirements.
              </p>
              <div className="privacy-detail-grid privacy-detail-grid-two">
                <article>
                  <h3>Encryption</h3>
                  <p>We use encryption technologies intended to protect data in transit and, where provided by the hosting or storage service, at rest.</p>
                </article>
                <article>
                  <h3>Access control</h3>
                  <p>Access to non-public personal information is limited to people or service providers that have a legitimate need to handle it.</p>
                </article>
              </div>
            </PolicySection>

            <PolicySection id="providers" eyebrow="04" title="Service providers and disclosure">
              <p>
                Crystal Guild may rely on third-party providers for hosting, infrastructure, communications, or other services
                needed to operate the website. When a provider processes personal information on our behalf, we expect it to
                use appropriate technical and organizational safeguards and to handle the information only for legitimate service purposes.
              </p>
              <p>
                Crystal Guild does not sell personal information. We also do not disclose personal information except as
                described in this policy, as needed to provide the service, or where disclosure is required or permitted by law.
              </p>
            </PolicySection>

            <PolicySection id="rights" eyebrow="05" title="Your privacy rights and choices">
              <p>
                Depending on where you live and the law that applies, you may have some or all of the following rights.
                Requests can be submitted using the contact information at the end of this policy. We may need to verify your
                identity before completing a request.
              </p>
              <div className="privacy-rights-list">
                {RIGHTS.map(([title, description]) => (
                  <article key={title}><strong>{title}</strong><p>{description}</p></article>
                ))}
              </div>
            </PolicySection>

            <PolicySection id="tracking" eyebrow="06" title="Cookies and tracking technologies">
              <p>
                Crystal Guild does not intentionally use advertising or targeting cookies and does not include a third-party
                advertising tracker. If you choose Sign in with Twitch, the Portal uses strictly necessary first-party cookies
                for the short-lived OAuth state check and the authenticated Portal session. These cookies are used for account
                security and player ownership, not advertising or cross-site profiling.
              </p>
              <p>
                The Player Guide uses browser session storage to remember certain interface state, such as whether supported
                guide sections are open or closed, for the current browsing session.
              </p>
              <p>
                If Crystal Guild later introduces non-essential analytics, advertising, or other tracking technologies, this
                policy will be updated and appropriate notice or consent controls will be provided where required.
              </p>
            </PolicySection>

            <PolicySection id="transfers" eyebrow="07" title="International data transfers">
              <p>
                Crystal Guild may use service providers located outside your country of residence. Where personal information
                is transferred across borders, we seek to use safeguards appropriate to the information and applicable privacy law,
                including GDPR requirements where they apply.
              </p>
            </PolicySection>

            <PolicySection id="us-rights" eyebrow="08" title="United States privacy rights">
              <p>
                Residents of certain U.S. states, including California, may have additional rights regarding their personal
                information. The exact rights available depend on the law that applies to you.
              </p>
              <div className="privacy-rights-list">
                {US_RIGHTS.map(([title, description]) => (
                  <article key={title}><strong>{title}</strong><p>{description}</p></article>
                ))}
              </div>
              <p>
                If we deny a request and applicable law gives you a right to appeal, you may appeal within 60 days of our
                response. Include the original request, the date of our response, and a brief explanation of why you believe
                the decision was incorrect.
              </p>
            </PolicySection>

            <PolicySection id="contact" eyebrow="09" title="Contact Crystal Guild">
              <p>
                To ask a privacy question or exercise an applicable privacy right, contact Crystal Guild using the method below.
              </p>
              <div className="privacy-contact-card">
                <div><span>Email</span><a href="mailto:vanishedarmy@gmail.com">vanishedarmy@gmail.com</a></div>
              </div>
              <p className="privacy-smallprint">
                We will respond in accordance with applicable law and may request information necessary to verify your identity
                and protect the account or information involved in the request.
              </p>
              <Link className="primary-link privacy-return" to="/players">Return to Guild Heroes</Link>
            </PolicySection>
          </div>
        </div>
      </main>
      <footer className="site-footer">
        <span>Crystal Guild</span>
        <span><Link to="/guide">Player Guide</Link> · <Link to="/privacy">Privacy Policy</Link></span>
      </footer>
    </>
  );
}
