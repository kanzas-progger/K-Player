import './LeftMenu.css';
import { NAV_LINKS } from '../../constants/nav_links';
import { useTranslation } from 'react-i18next';

const LeftMenu = ({ currentPath, onNavigate }) => {

    const { t } = useTranslation();

    return (
        <>
            <div className='container'>
                <nav style={{ display: 'flex', flexDirection: 'column', padding: '20px 20px 0px 20px', gap: '16px' }}>

                    {NAV_LINKS.map((link) => {
                        const isActive = currentPath === link.path

                        return (
                            <div
                                key={link.path}
                                className={`menu-item ${isActive ? 'menu-item-active' : ''}`}
                                onClick={() => onNavigate(link.path)}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}>
                                    <div className='menu-item-icon-hidden'>
                                        <span className={`material-symbols-outlined menu-item-icon ${isActive ? 'menu-item-icon-active' : ''}`}>
                                            {link.icon}
                                        </span>
                                    </div>
                                    <p className={`menu-item-text ${isActive ? 'menu-item-text-active' : ''}`}>{t(link.label)}</p>
                                </div>
                            </div>
                        )
                    })}
                </nav>

            </div>
        </>
    )
}

export default LeftMenu