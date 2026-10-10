import React from 'react'
import styles from './KCheckbox.module.css'

const KCheckbox = ({ checked, containerHoverClassName = '' }) => {
    return (
        <>
            <div className={`${styles['container']} ${containerHoverClassName} ${checked ? styles['container-checked'] : ''}`}>
                <span className={`material-symbols-outlined ${styles['check-icon']} ${checked ? styles['check-icon-checked'] : ''}`}>check_small</span>
            </div>
        </>
    )
}

export default KCheckbox
