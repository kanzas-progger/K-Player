import React, { useState, useEffect } from 'react'
import { Modal, ConfigProvider, Progress } from 'antd'
import styles from './ProcessingModal.module.css'
import { useTranslation } from 'react-i18next'

const ProcessingModal = ({ isVisible, setIsVisible, type = 'load' }) => {
  const { t } = useTranslation()
  const [progress, setProgress] = useState({ loaded: 0, total: 0 })

  useEffect(() => {
    const unsubscribe = window.electronAPI.main.onLoadProgress((data) => {
      setProgress(data)
      if (data.total > 0 && data.loaded < data.total) {
        setIsVisible(true)
      } else if (data.total > 0 && data.loaded >= data.total) {
        setTimeout(() => {
          setIsVisible(false)
        }, 500)
      }
    })

    return () => unsubscribe()
  }, [setIsVisible])

  const percent = progress.total > 0
    ? Math.round((progress.loaded / progress.total) * 100)
    : 0

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: 'var(--color-track-active)',
            titleColor: 'var(--color-text-default)',
            contentOutline: 'none',
          },
        },
      }}
    >
      <Modal
        title={t(`processing_modal.title_${type}`)}
        open={isVisible}
        footer={null}
        closable={false}
        mask={{ closable: false }}
        keyboard={false}
        centered
        styles={{
          title: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '20px',
          },
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div className={styles['text-container']}>
            <p className={styles['text']}>
              {t(`processing_modal.${type}_progress`, {
                loaded: progress.loaded,
                count: progress.total,
              })}
            </p>
            <p className={styles['text']}>{percent}%</p>
          </div>

          <Progress
            showInfo={false}
            percent={percent}
            strokeColor="var(--color-primary)"
            railColor="var(--color-stroke)"
          />
        </div>
      </Modal>
    </ConfigProvider>
  )
}

export default React.memo(ProcessingModal)