import CallbackBUS from './callback_bus'

const HISTORY = window.history

let WINDOW_LOADED = document.readyState === 'complete'
if ( !WINDOW_LOADED ) {
    let markdown = () => {
        WINDOW_LOADED = true
        window.removeEventListener('load', markdown)
    }
    window.addEventListener('load', markdown)
}

export function getLocation () {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

let landedLocation = getLocation()

export default class HistoryBUS extends CallbackBUS {
    constructor (options) {
        super(options)
        this.navigate = this.navigate.bind(this)
        this.push = this.push.bind(this)
        this.replace = this.replace.bind(this)
        this.go = this.go.bind(this)
        this.back = this.back.bind(this)
        this.forward = this.forward.bind(this)
        this.popHandle = this.popHandle.bind(this)
        this.popTimeoutHandle = this.popTimeoutHandle.bind(this)
        this.popTimeout = null
        this.going = 0
        this.heldNavigate = []
        this.onBusy = () => {
            window.addEventListener('popstate', this.popHandle)
        }
        this.onIdle = () => {
            window.removeEventListener('popstate', this.popHandle)
        }
        this.navigate(null, null, getLocation(), 'replace')
    }
    navigate (data, title, url, replace, callback) {
        let behave = null
        if ( replace ) {
            behave = () => {
                if ( getLocation() === landedLocation ) {
                    landedLocation = url
                }
                HISTORY.replaceState(data, title, url)
                callback instanceof Function && callback()
            }
        } else {
            behave = () => {
                this.options.onPushed instanceof Function && this.options.onPushed(this.back)
                HISTORY.pushState(data, title, url)
                callback instanceof Function && callback()
            }
        }
        if ( this.going > 0 ) {
            this.heldNavigate.push(behave)
        } else {
            behave()
        }
    }
    push (data, title, url, callback) {
        this.navigate(data, title, url, false, callback)
    }
    replace (data, title, url, callback) {
        this.navigate(data, title, url, true, callback)
    }
    go (n) {
        if ( !this.going ) {
            this.going++
            HISTORY.go(n)
            if ( n < 0 && getLocation() === landedLocation ) {
                this.options.backOnOrigin instanceof Function && this.options.backOnOrigin()
            }
            if ( !WINDOW_LOADED ) {
                if ( this.popTimeout !== null ) {
                    clearTimeout(this.popTimeout)
                }
                this.popTimeout = setTimeout(this.popTimeoutHandle, 200)
            }
        }
    }
    back () {
        this.go(-1)
    }
    forward () {
        this.go(1)
    }
    popHandle (...args) {
        if ( this.going > 0 ) {
            this.going--
        }
        if ( this.going === 0 ) {
            if ( this.popTimeout !== null ) {
                clearTimeout(this.popTimeout)
                this.popTimeout = null
            }
            if ( this.heldNavigate.length > 0 ) {
                for ( let i = 0; i < this.heldNavigate.length; i++ ) {
                    this.heldNavigate[i]()
                }
                this.heldNavigate = []
            }
            if ( getLocation() === landedLocation ) {
                this.options.onOrigin instanceof Function && this.options.onOrigin()
            }
        }
        this.invoke(...args)
    }
    popTimeoutHandle () {
        this.going = 0
        this.popHandle()
    }
}

export let getLandedLocation = () => {
    return landedLocation
}