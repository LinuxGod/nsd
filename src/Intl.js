import React, { Component } from 'react';
import { addLocaleData, IntlProvider } from 'react-intl';
import { connect } from 'react-redux';
import en from 'react-intl/locale-data/en';
import zh from 'react-intl/locale-data/zh';
import zh_CN from '@/assets/i18n/zh.json';
import en_US from '@/assets/i18n/en.json';

addLocaleData([...zh,...en]);

class Inter extends Component {
    render() {
        let { locale, localeMessage, children } = this.props
        return (
            <IntlProvider key={locale} locale={locale} messages={localeMessage}>
                {children}
            </IntlProvider>
        )
    }
};

const chooseLocale = (val) => {
    switch (val) {
        case 'en':
            return en_US;
        case 'zh':
            return zh_CN;
        default:
            return en_US;
    }
}

const mapStateToProps = (state, ownProps) => ({
    locale: state.setting.language,
    localeMessage: chooseLocale(state.setting.language)
})

let Intl = connect(mapStateToProps)(Inter);

export default Intl;
