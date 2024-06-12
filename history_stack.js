import React from 'react'

import HistoryBUS from './history_bus'
import HistoryContext from './history_context'
import Url from './url_parser'
import Query from './query_parser'

const HISTORY_EVENT_BUS = new HistoryBUS()

export default class HistoryStack extends React.Component {
    constructor (props) {
        super(props)
        this.navigateHandle = this.navigateHandle.bind(this)
        this.popstateHandle = this.popstateHandle.bind(this)
        let location = window.location
        this.basePath = location.pathname
        this.basePathPattern = new RegExp(`^${this.basePath}`)
        this.historyListener = HISTORY_EVENT_BUS.register({
            basePath: this.basePath
        })
        this.historyListener.set(this.popstateHandle)
        this.history = {
            length: window.history.length,
            push: HISTORY_EVENT_BUS.push,
            replace: HISTORY_EVENT_BUS.replace,
            go: HISTORY_EVENT_BUS.go,
            back: HISTORY_EVENT_BUS.back,
            forward: HISTORY_EVENT_BUS.forward
        }
        this.state = {
            path: location.pathname.replace(this.basePathPattern, ''),
            query: new Query(location.search),
            frag: location.hash,
            data: null,
            navigate: this.navigateHandle,
            history: this.history
        }
    }
    componentWillUnmount () {
        this.historyListener.destroy()
    }
    updateHistoryStatus () {
        this.history.length = window.history.length
    }
    navigateHandle (navigate, type, callback) {
        let location = window.location
        let path = this.basePath
        let query = this.state.query
        let _navigate = null
        if ( typeof navigate === 'string' ) {
            let url = new Url(navigate)
            _navigate = {
                path: url.path,
                query: url.query,
                frag: url.frag
            }
        } else {
            _navigate = navigate
        }
        if ( _navigate.path ) {
            path += _navigate.path.replace(new RegExp(`^${path}`), '')
            query = _navigate.query ? _navigate.query : {}
        }
        if ( _navigate.query ) {
            query = _navigate.query
        }
        let frag = _navigate.frag ? _navigate.frag.replace(/^(?!#)/, '#') : ''
        let data = _navigate.data ? _navigate.data : null
        let url = `${path}${Query.prototype.toString.call(query)}${frag}`
        let setState = () => {
            this.updateHistoryStatus()
            this.setState({
                path,
                query,
                frag,
                data
            })
            callback instanceof Function && callback()
        }
        if ( type === 'replace' || url === `${location.pathname}${location.search}${location.hash}` ) {
            HISTORY_EVENT_BUS.navigate(data, '', url, true, setState)
        } else {
            HISTORY_EVENT_BUS.navigate(data, '', url, false, setState)
        }
    }
    popstateHandle (event) {
        let location = window.location
        let data = event ? event.state : null
        this.updateHistoryStatus()
        this.setState({
            path: location.pathname.replace(this.basePathPattern, ''),
            query: new Query(location.search),
            frag: location.hash,
            data: data
        })
    }
    render () {
        return (
            <HistoryContext.Provider value={this.state}>
                {this.props.children}
            </HistoryContext.Provider>
        )
    }
}