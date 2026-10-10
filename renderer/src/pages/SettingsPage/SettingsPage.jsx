import { useState } from 'react'
import styles from './SettingsPage.module.css'
import { useTranslation } from 'react-i18next'
import KSwitch from '../../components/KSwitch/KSwitch'
import { InputNumber, ConfigProvider } from 'antd'

const INPUT_NUMBER_THEME = {
    components: {
        InputNumber: {
            controlHeight: 35,
            borderRadius: 10,
            colorBgContainer: 'var(--color-track-hover)',
            colorBorder: 'var(--color-stroke)',
            colorText: 'var(--color-text-default)',
            colorTextDisabled: 'var(--color-stroke)',

            colorPrimary: 'var(--color-primary)',
            colorPrimaryHover: 'var(--color-primary)',
        },
    },
}


const SettingsPage = ({ userSettings, onUpdateUserSettings }) => {

    const selectedLanguage = userSettings?.find(s => s.key === 'language')?.value || 'en'
    const selectedTheme = userSettings?.find(s => s.key === 'theme')?.value || 'dark'
    const showDislikedSongsPlaylist = userSettings?.find(s => s.key === 'showDislikedSongsPlaylist')?.value || 'true'
    const isDeleteDislikedTracksFromSystemEnabled = userSettings?.find(s => s.key === 'isDeleteDislikedTracksFromSystemEnabled')?.value || 'false'
    const playlistCountInDropDown = userSettings?.find(s => s.key === 'playlistCountInDropDown')?.value || '10'

    const [lang, setLang] = useState(selectedLanguage)
    const [theme, setTheme] = useState(selectedTheme)

    const { t, i18n } = useTranslation()

    const handleChangeLanguage = async (lang) => {
        setLang(lang)
        i18n.changeLanguage(lang)
        localStorage.setItem('app_language', lang)

        try {
            await onUpdateUserSettings({ key: 'language', value: lang })
        } catch (error) {
            console.error('[Render process] SettingsPage.jsx: onUpdateUserSettings', error)
        }
    }

    const handleChangeTheme = async (theme) => {
        setTheme(theme)
        document.documentElement.dataset.theme = theme

        try {
            await onUpdateUserSettings({ key: 'theme', value: theme })
        } catch (error) {
            console.error('[Render process] SettingsPage.jsx: onUpdateUserSettings', error)
        }
    }

    const handleToggleSwitch = async (key, checked) => {
        try {
            await onUpdateUserSettings({ key, value: String(checked) })
        } catch (error) {
            console.error(`[Render process] SettingsPage.jsx: handleToggleSwitch`, error)
        }
    }

    const onChange = async (value) => {
        if (!value) {
            return
        }
        await onUpdateUserSettings({ key: 'playlistCountInDropDown', value: String(value) })
    }

    const inputNumberProps = {
        mode: 'spinner',
        min: 1,
        max: 99,
        defaultValue: parseInt(playlistCountInDropDown, 10),
        onChange,
        style: { width: 120 },
    };

    return (
        <>
            <div className={styles['container']}>
                <div className={styles['card-container']}>
                    <div>
                        <p className={styles['card-header']}>{t('settings_page.language')}</p>
                    </div>
                    <div className={styles['card-wrapper']}>
                        <div
                            className={`${styles['card']} ${lang === 'en' ? styles['card-active'] : ''}`}
                            onClick={() => handleChangeLanguage('en')}>
                            <div className={styles['card-content']}>
                                <span className={`material-symbols-outlined ${styles['card-content-icon']}`}>
                                    language
                                </span>
                                <p className={styles['card-content-text']}>English</p>
                            </div>
                        </div>
                        <div
                            className={`${styles['card']} ${lang === 'ru' ? styles['card-active'] : ''}`}
                            onClick={() => handleChangeLanguage('ru')}>
                            <div className={styles['card-content']}>
                                <span className={`material-symbols-outlined ${styles['card-content-icon']}`}>
                                    language
                                </span>
                                <p className={styles['card-content-text']}>Русский</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles['card-container']}>
                    <div>
                        <p className={styles['card-header']}>{t('settings_page.theme')}</p>
                    </div>
                    <div className={styles['card-wrapper']}>
                        <div
                            onClick={() => handleChangeTheme('dark')}
                            className={`${styles.card} ${theme === 'dark' ? styles['card-active'] : ''}`}>
                            <div className={styles['card-content']}>
                                <span className={`material-symbols-outlined ${styles['card-content-icon']}`}>
                                    dark_mode
                                </span>
                                <p className={styles['card-content-text']}>{t('settings_page.dark')}</p>
                            </div>
                        </div>
                        <div
                            onClick={() => handleChangeTheme('light')}
                            className={`${styles.card} ${theme === 'light' ? styles['card-active'] : ''}`}>
                            <div className={styles['card-content']}>
                                <span className={`material-symbols-outlined ${styles['card-content-icon']}`}>
                                    light_mode
                                </span>
                                <p className={styles['card-content-text']}>{t('settings_page.light')}</p>
                            </div>
                        </div>
                        {/* <div
                            onClick={() => handleChangeTheme('system')}
                            className={`${styles.card} ${theme === 'system' ? styles['card-active'] : ''}`}>
                            <div className={styles['card-content']}>
                                <span className={`material-symbols-outlined ${styles['card-content-icon']}`}>
                                    settings_suggest
                                </span>
                                <p className={styles['card-content-text']}>{t('settings_page.system')}</p>
                            </div>
                        </div> */}
                    </div>
                </div>

                <div className={styles['card-container']}>
                    <div>
                        <p className={styles['card-header']}>{t('settings_page.playlists')}</p>
                    </div>

                    <div className={styles['card-wrapper-with-swithes']}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '60%' }}>
                            <p>{t('settings_page.showDislikedSongsPlaylist')}</p>

                            <KSwitch
                                onChange={(checked) => handleToggleSwitch('showDislikedSongsPlaylist', checked)}
                                checked={showDislikedSongsPlaylist === 'true'}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '60%' }}>
                            <p>{t('settings_page.isDeleteDislikedTracksFromSystemEnabled')}</p>
                            <KSwitch
                                checked={isDeleteDislikedTracksFromSystemEnabled === 'true'}
                                onChange={(checked) => handleToggleSwitch('isDeleteDislikedTracksFromSystemEnabled', checked)}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '60%' }}>
                            <p>{t('settings_page.playlistCountInDropDown')}</p>
                            <ConfigProvider
                                theme={INPUT_NUMBER_THEME}
                            ><InputNumber {...inputNumberProps} placeholder="Outlined" />
                            </ConfigProvider>

                        </div>

                    </div>
                </div>

            </div>
        </>
    )
}

export default SettingsPage