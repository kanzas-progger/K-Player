import styles from './PlaylistFormModal.module.css'
import { Modal, ConfigProvider } from 'antd'
import { getAbsolutePath } from '../../api/api'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const THEME = {
    components: {
        Modal: {
            contentBg: 'var(--color-track-active)',
            titleColor: 'var(--color-text-default)',
            contentOutline: 'none',
        }
    }
}

const PlaylistFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    onImport,
    playlist = null,
    type = 'create' }) => {

    const { t } = useTranslation()

    const [name, setName] = useState('')
    const [imagePreview, setImagePreview] = useState(null)
    const [imageAbsolutePath, setImageAbsolutePath] = useState(null)


    const fileInputRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            if (playlist) {
                setName(playlist.name || '')
                if (playlist.image) {
                    
                    setImagePreview(`k-image://playlist/${playlist.image}`)
                    setImageAbsolutePath(null)
                }
            } else {
                setName('')
                setImagePreview(null)
                setImageAbsolutePath(null)
            }
        }
    }, [isOpen, playlist])

    const handleClose = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview)
        }
        setImagePreview(null)
        setImageAbsolutePath(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }

        setName('')

        onClose()
    }

    const handleSubmit = () => {
        onSubmit({
            name,
            imageAbsolutePath
        })
        handleClose()
    }

    const handleImport = () => {
        handleClose()
        if (onImport) {
            onImport()
        }
    }

    const handleFileClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (!file) return

        const previewUrl = URL.createObjectURL(file)
        setImagePreview(previewUrl)

        const absolutePath = getAbsolutePath(file)
        if (absolutePath) {
            setImageAbsolutePath(absolutePath)
        }
    }

    return (
        <ConfigProvider
            theme={THEME}>
            <Modal
                title={type === 'create' ? t('playlist_modal.title_create') : t('playlist_modal.title_edit')}
                open={isOpen}
                footer={null}
                closable={false}
                centered
                destroyOnHidden
                styles={{
                    title: {
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontSize: '20px',
                        userSelect: 'none'
                    }
                }}>
                <div className={styles['modal-container']}>
                    <div className={styles['modal-input-wrapper']}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <div
                            onClick={handleFileClick}
                            className={styles['modal-image-container']}>
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <span className='material-symbols-outlined'>
                                    add_photo_alternate
                                </span>
                            )}
                        </div>

                        <div className={styles['modal-input-container']}>
                            <p>{t('playlist_modal.input_name')}</p>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={styles['modal-input']}
                                type='text' />
                        </div>
                    </div>
                    {type === 'create' && (
                        <div className={styles['modal-import-container']}>
                            <p>{t('playlist_modal.quick_import')}</p>
                            <div
                                onClick={handleImport}
                                className={`${styles['modal-btn']} ${styles['modal-import-btn']}`}>
                                <span className={`material-symbols-outlined ${styles['import-icon']}`}>
                                    download
                                </span>
                            </div>
                        </div>
                    )}


                    <div className={styles['modal-footer-container']}>
                        <div
                            onClick={handleClose}
                            className={`${styles['modal-btn']} ${styles['modal-footer-btn']}`}>
                            <p className={`${styles['modal-btn-text']} ${styles['modal-footer-btn-text']}`}>{t('playlist_modal.cancel')}</p>
                        </div>
                        <div
                            onClick={handleSubmit}
                            className={`${styles['modal-btn']} ${styles['modal-footer-btn']}`}>
                            <p className={`${styles['modal-btn-text']} ${styles['modal-footer-btn-text']}`}>{type === 'create' ? 'OK' : t('playlist_modal.save')}</p>

                        </div>
                    </div>

                </div>
            </Modal>

        </ConfigProvider>
    )
}

export default PlaylistFormModal
