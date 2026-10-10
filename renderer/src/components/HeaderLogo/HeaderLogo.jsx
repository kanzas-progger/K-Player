import styles from './HeaderLogo.module.css'
import logo from '../../assets/png/logo.png'

const HeaderLogo = () => {
    return (
        <>
            <div className={styles['container']}>
                <div className={styles['container-content']}>
                    <img src={logo} alt='logo' />
                    <p style={{
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        color: 'var(--color-text-default)',
                        fontSize: '28px',
                        fontWeight: 700,
                        userSelect: 'none'
                    }}>K-Player</p>
                </div>
            </div>
        </>
    )
}

export default HeaderLogo