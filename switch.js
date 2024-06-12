import React, { createContext } from 'react';

let SwitchContext = createContext({
    matched: { value: false },
    matchedReport: () => { }
})

export default class Switch extends React.Component {
    constructor(props) {
        super(props)
        this.matchedReport = this.matchedReport.bind(this)
        this.toggle = {
            matched: { value: false },
            matchedReport: this.matchedReport
        }
    }
    matchedReport(matched) {
        this.toggle.matched.value = matched
    }
    render() {
        this.toggle.matched.value = false
        return (
            <SwitchContext.Provider value={this.toggle}>
                {this.props.children}
            </SwitchContext.Provider>
        )
    }
}

export function withSwitch(Component) {
    return class Switchable extends React.Component {
        constructor(props) {
            super(props)
            this.passDown = this.passDown.bind(this)
        }
        passDown(context) {
            return context.matched && context.matched.value ? null : <Component matchedReport={context.matchedReport} {...this.props} />
        }
        render() {
            return (
                <SwitchContext.Consumer>
                    {this.passDown}
                </SwitchContext.Consumer>
            )
        }
    }
}