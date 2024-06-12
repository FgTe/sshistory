import React from 'react'

import HistoryContext from './history_context'
import { withSwitch } from './switch'
import Url from './url_parser'
import { getLocation, getLandedLocation } from './history_bus'

let referrer
try {
    referrer = document.referrer && Url(document.referrer)
} catch (err) {
    referrer = ''
}

class Frag extends React.Component {
    constructor(props) {
        super(props)
        this.passDown = this.passDown.bind(this)
        this.back = this.back.bind(this)
        this.context = null
    }
    componentDidMount () {
        let id = this.props.frag.replace(/^#/, '')
        let matched = new RegExp(id).test(window.location.hash)
        if ( matched && this.props.dataRequired && !this.props.data ) {
            this.back('replace')
        }
    }
    back(replace) {
        if ( this.props.frag ) {
            let id = this.props.frag.replace(/^#/, '')
            let matched = new RegExp(id).test(window.location.hash)
            let exactly = matched && window.location.hash.length === this.props.frag.length
            if ( replace === 'replace' || getLandedLocation() === getLocation() && ( !referrer || referrer.path !== window.location.pathname ) ) {
                let frag = ''
                if ( matched && !exactly ) {
                    frag = window.location.hash.replace(new RegExp(`-${id}|([#-])${id}-?`), '$1')
                }
                this.context.navigate({
                    frag
                }, 'replace')
            } else if ( matched ) {
                this.context.history.back()
            }
        }
    }
    passDown(context) {
        this.context = context
        let { matchedReport, frag, ...rest } = this.props
        let matched = this.props.frag && new RegExp(`${this.props.frag.replace('#', '')}`).test(context.frag)
        matched && matchedReport instanceof Function && matchedReport(matched)
        if (this.props.component) {
            if (matched) {
                return <this.props.component back={this.back} {...context} {...rest} />
            } else {
                return null
            }
        } else {
            return this.props.children instanceof Function && this.props.children({ ...context, matched, back: this.back }) || null
        }
    }
    render() {
        return (
            <HistoryContext.Consumer>
                {this.passDown}
            </HistoryContext.Consumer>
        )
    }
}

export default withSwitch(Frag)