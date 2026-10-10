import styles from './AboutPage.module.css'
import { useTranslation, Trans } from 'react-i18next'
import { openExternalLink } from '../../api/api'

const AboutPage = () => {

    const { t } = useTranslation()

    const handleOpenLink = (e, url) => {
        e.preventDefault()

        openExternalLink(url)
    }

    const GITHUB_URL = 'https://github.com/kanzas-progger/K-Player'
    const APP_VERSION = '1.0.0'
    return (
        <>
            <div className={`${styles['container']}`}>
                <div className={styles['header-container']}>
                    <p className={styles['header-text']}>{t('navigation.about')}</p>
                </div>

                <div className={styles['description-container']}>
                    <p className={styles['description-text']}>
                        {t('about_page.description')}
                    </p>
                    <br />

                    <h2 className={styles['section-text']}>
                        {t('about_page.futurePlansSection')}
                    </h2>
                    <p className={styles['description-text']}>
                        {t('about_page.futurePlansSectionText')}
                    </p>
                    <br />

                    <h2 className={styles['section-text']}>
                        {t('about_page.feedbackSection')}
                    </h2>
                    <p className={styles['description-text']}>
                        <Trans
                            i18nKey="about_page.feedbackSectionText"
                            components={{
                                githubLink: (
                                    <a
                                        href={GITHUB_URL}
                                        onClick={(e) => handleOpenLink(e, GITHUB_URL)}
                                        className={styles['external-link']}
                                        rel="noopener noreferrer"
                                    />
                                )
                            }}
                        />
                    </p>
                    <br />

                    <p className={styles['version-text']}>
                        {t('about_page.version', { version: APP_VERSION })}
                    </p>
                </div>
            </div>
        </>
    )
}

export default AboutPage
