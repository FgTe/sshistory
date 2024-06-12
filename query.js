import React from 'react'

import HistoryContext from './history_context'
import { withSwitch } from './switch'

class Query extends React.Component {
    constructor (props) {
        super(props)
        this.passDown = this.passDown.bind(this)
    }
    passDown (context) {
        let { matchedReport, query, ...rest } = this.props
        let matched = true
        if ( this.props.query instanceof Array ) {
            for ( let i = 0; i < Object.keys(this.props.query).length; i++ ) {
                if ( context.query[this.props.query[i]] === undefined ) {
                    matched = false
                    break
                }
            }
        } else {
            matched = this.props.query && ( context.query[this.props.query] !== undefined || this.props.query === '*' )
        }
        matched && matchedReport instanceof Function && matchedReport(matched)
        if ( this.props.component ) {
            if ( matched ) {
                let component = <this.props.component {...context} {...rest}/>
                return component
            } else {
                return null
            }
        } else {
            return this.props.children instanceof Function && this.props.children({ ...context, matched }) || null
        }
    }
    render () {
        return (
            <HistoryContext.Consumer>
                {this.passDown}
            </HistoryContext.Consumer>
        )
    }
}

export default withSwitch(Query)