import React from 'react'

import HistoryContext from './history_context'

let timeStamp = null
let handled = false

export default class Navigate extends React.Component {
    constructor (props) {
        super(props)
        this.clickHandle = this.clickHandle.bind(this)
        this.passDown = this.passDown.bind(this)
        this.historyContext = null
    }
    clickHandle (event) {
        if ( event.timeStamp !== timeStamp || !handled ) {
            timeStamp = event.timeStamp
            handled = true
            if ( this.props.to !== null && this.props.to !== undefined ) {
                this.historyContext.navigate(this.props.to, this.props.replace ? 'replace' : undefined)
                if ( this.props.analytics ) {
                    window.userTrack({ level: 1, action: 'click', ...this.props.analytics })
                }
            }
        }
        this.props.onClick instanceof Function && this.props.onClick(event, this.historyContext.navigate)
    }
    passDown (context) {
        this.historyContext = context
        let { block, to, replace, onClick, analytics, ...rest } = this.props
        return block ? (
            <div {...rest} onClick={this.clickHandle}>
                { this.props.children || null }
            </div>
        ) : (
            <span {...rest} onClick={this.clickHandle}>
                { this.props.children || null }
            </span>
        )
    }
    render () {
        return (
            <HistoryContext.Consumer>
                {this.passDown}
            </HistoryContext.Consumer>
        )
    }
}