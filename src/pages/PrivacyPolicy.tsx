import { Layout } from "@/components/layout/Layout";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation();

  return (
    <Layout>
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <h1 className="text-4xl font-display font-bold text-foreground mb-8">
          {t('privacy.title')}
        </h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
          <p className="text-lg">
            {t('privacy.lastUpdate')} {new Date().toLocaleDateString(i18n.language)}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('privacy.section1Title')}</h2>
            <p>{t('privacy.section1Text')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('privacy.section2Title')}</h2>
            <p>{t('privacy.section2Text')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('privacy.section2Item1')}</li>
              <li>{t('privacy.section2Item2')}</li>
              <li>{t('privacy.section2Item3')}</li>
              <li>{t('privacy.section2Item4')}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('privacy.section3Title')}</h2>
            <p>{t('privacy.section3Text')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('privacy.section4Title')}</h2>
            <p>{t('privacy.section4Text1')}</p>
            <p>
              {t('privacy.section4Text2')}{" "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {t('privacy.section4Link')}
              </a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('privacy.section5Title')}</h2>
            <p>{t('privacy.section5Text')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('privacy.section6Title')}</h2>
            <p>{t('privacy.section6Text')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('privacy.section6Item1')}</li>
              <li>{t('privacy.section6Item2')}</li>
              <li>{t('privacy.section6Item3')}</li>
              <li>{t('privacy.section6Item4')}</li>
              <li>{t('privacy.section6Item5')}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('privacy.section7Title')}</h2>
            <p>{t('privacy.section7Text')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('privacy.section8Title')}</h2>
            <p>
              {t('privacy.section8Text')}{" "}
              <a href="/about" className="text-primary hover:underline">{t('about.label')}</a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('privacy.section9Title')}</h2>
            <p>{t('privacy.section9Text')}</p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
