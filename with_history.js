import React from 'react'

import HistoryContext from './history_context'

export default function (Component) {
    return class extends React.Component {
        constructor (props) {
            super(props)
            this.passDown = this.passDown.bind(this)
        }
        passDown (context) {
            return <Component {...context} {...this.props}/>
        }
        render () {
            return (
                <HistoryContext.Consumer>
                    {this.passDown}
                </HistoryContext.Consumer>
            )
        }
    }
}