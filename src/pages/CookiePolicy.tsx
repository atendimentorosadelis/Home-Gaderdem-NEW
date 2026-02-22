import { Layout } from "@/components/layout/Layout";
import { useTranslation } from "react-i18next";

export default function CookiePolicy() {
  const { t, i18n } = useTranslation();

  return (
    <Layout>
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <h1 className="text-4xl font-display font-bold text-foreground mb-8">
          {t('cookiePolicy.title')}
        </h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
          <p className="text-lg">
            {t('cookiePolicy.lastUpdate')} {new Date().toLocaleDateString(i18n.language)}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('cookiePolicy.section1Title')}</h2>
            <p>{t('cookiePolicy.section1Text')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('cookiePolicy.section2Title')}</h2>
            <p>{t('cookiePolicy.section2Text')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('cookiePolicy.section2Item1')}</li>
              <li>{t('cookiePolicy.section2Item2')}</li>
              <li>{t('cookiePolicy.section2Item3')}</li>
              <li>{t('cookiePolicy.section2Item4')}</li>
              <li>{t('cookiePolicy.section2Item5')}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('cookiePolicy.section3Title')}</h2>
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-display font-semibold text-foreground mb-2">{t('cookiePolicy.essentialCookies')}</h3>
                <p className="text-sm">{t('cookiePolicy.essentialCookiesDesc')}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-display font-semibold text-foreground mb-2">{t('cookiePolicy.performanceCookies')}</h3>
                <p className="text-sm">{t('cookiePolicy.performanceCookiesDesc')}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-display font-semibold text-foreground mb-2">{t('cookiePolicy.functionalCookies')}</h3>
                <p className="text-sm">{t('cookiePolicy.functionalCookiesDesc')}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-display font-semibold text-foreground mb-2">{t('cookiePolicy.advertisingCookies')}</h3>
                <p className="text-sm">{t('cookiePolicy.advertisingCookiesDesc')}</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('cookiePolicy.section4Title')}</h2>
            <p>{t('cookiePolicy.section4Text')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('cookiePolicy.section4Item1')}</strong> {t('cookiePolicy.section4Item1Desc')}</li>
              <li><strong>{t('cookiePolicy.section4Item2')}</strong> {t('cookiePolicy.section4Item2Desc')}</li>
              <li><strong>{t('cookiePolicy.section4Item3')}</strong> {t('cookiePolicy.section4Item3Desc')}</li>
            </ul>
            <p>{t('cookiePolicy.section4Text2')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('cookiePolicy.section5Title')}</h2>
            <p>{t('cookiePolicy.section5Text')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('cookiePolicy.section5Item1')}</strong> {t('cookiePolicy.section5Item1Desc')}</li>
              <li><strong>{t('cookiePolicy.section5Item2')}</strong> {t('cookiePolicy.section5Item2Desc')}{" "}
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t('cookiePolicy.section5Item2Link')}</a>
              </li>
              <li><strong>{t('cookiePolicy.section5Item3')}</strong> {t('cookiePolicy.section5Item3Desc')}{" "}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t('cookiePolicy.section5Item3Link')}</a>
              </li>
            </ul>
            <p className="text-sm bg-muted/30 p-4 rounded-lg">
              <strong>{t('cookiePolicy.section5Note')}</strong> {t('cookiePolicy.section5NoteText')}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('cookiePolicy.section6Title')}</h2>
            <p>{t('cookiePolicy.section6Text')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('cookiePolicy.section7Title')}</h2>
            <p>{t('cookiePolicy.section7Text')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('cookiePolicy.section8Title')}</h2>
            <p>
              {t('cookiePolicy.section8Text')}{" "}
              <a href="/about" className="text-primary hover:underline">{t('about.label')}</a>.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
