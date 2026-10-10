import { useTranslation } from 'react-i18next'
import styles from './ConfirmModal.module.css'
import { Modal, ConfigProvider } from 'antd'

const THEME = {
    components: {
        Modal: {
            contentBg: 'var(--color-surface)',
            titleColor: 'var(--color-text-default)',
            contentOutline: 'none',
            colorIcon: 'var(--color-text-secondary)',
            colorIconHover: 'var(--color-text-default)'
        }
    }
}


const ConfirmModal = ({ isOpen, title, description, onCancel, onConfirm }) => {

    const { t } = useTranslation()

    const renderFooter = (
        <div className={styles['footer']}>
            <div
                onClick={onCancel}
                className={`${styles['btn']} ${styles['btn-cancel']}`}>
                <p>{t('confirm_modal.cancel')}</p>
            </div>
            <div
                onClick={onConfirm}
                className={`${styles['btn']} ${styles['btn-confirm']}`}>
                <p>OK</p>
            </div>
        </div>
    )

    return (
        <ConfigProvider
            theme={THEME}>
            <Modal
                open={isOpen}
                footer={renderFooter}
                closable={false}
                mask={{ closable: false }}
                onCancel={onCancel}
                centered
                styles={{
                    title: {
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontSize: '20px',
                        userSelect: 'none'
                    }
                }}>

                <div className={styles['container']}>
                    <p className={styles['title']}>{title}</p>
                    <p className={styles['description']}>{description}</p>
                </div>

            </Modal>

        </ConfigProvider>
    )
}

export default ConfirmModal
