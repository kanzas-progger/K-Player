import { Switch, ConfigProvider } from 'antd'

const THEME = {
    components: {
        Switch: {
            colorPrimary: 'var(--color-primary)',
            colorPrimaryHover: 'var(--color-primary)'
        },
    },
}

const KSwitch = ({ checked, onChange }) => {
    return (
        <ConfigProvider
            theme={THEME}
        >
            <Switch checked={checked} onChange={onChange} />
        </ConfigProvider>
    )
}

export default KSwitch
