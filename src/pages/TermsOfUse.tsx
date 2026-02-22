import { Layout } from "@/components/layout/Layout";
import { useTranslation } from "react-i18next";

export default function TermsOfUse() {
  const { t, i18n } = useTranslation();

  return (
    <Layout>
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <h1 className="text-4xl font-display font-bold text-foreground mb-8">
          {t('terms.title')}
        </h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
          <p className="text-lg">
            {t('terms.lastUpdate')} {new Date().toLocaleDateString(i18n.language)}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('terms.section1Title')}</h2>
            <p>{t('terms.section1Text')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('terms.section2Title')}</h2>
            <p>{t('terms.section2Text')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('terms.section3Title')}</h2>
            <p>{t('terms.section3Text1')}</p>
            <p>{t('terms.section3YouCan')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('terms.section3Item1')}</li>
              <li>{t('terms.section3Item2')}</li>
            </ul>
            <p>{t('terms.section3YouCannot')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('terms.section3Item3')}</li>
              <li>{t('terms.section3Item4')}</li>
              <li>{t('terms.section3Item5')}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('terms.section4Title')}</h2>
            <p>{t('terms.section4Text')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('terms.section4Item1')}</li>
              <li>{t('terms.section4Item2')}</li>
              <li>{t('terms.section4Item3')}</li>
              <li>{t('terms.section4Item4')}</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('terms.section5Title')}</h2>
            <p>{t('terms.section5Text1')}</p>
            <p>{t('terms.section5Text2')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('terms.section6Title')}</h2>
            <p>{t('terms.section6Text')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('terms.section7Title')}</h2>
            <p>
              {t('terms.section7Text')}{" "}
              <a href="/privacy-policy" className="text-primary hover:underline">{t('terms.section7Link')}</a>{" "}
              {t('terms.section7Text2')}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('terms.section8Title')}</h2>
            <p>{t('terms.section8Text')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('terms.section9Title')}</h2>
            <p>{t('terms.section9Text')}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('terms.section10Title')}</h2>
            <p>
              {t('terms.section10Text')}{" "}
              <a href="/about" className="text-primary hover:underline">{t('about.label')}</a>.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
