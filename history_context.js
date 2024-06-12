import { createContext } from 'react'

let HistoryContext = createContext({
    path: null,
    query: null,
    frag: null,
    data: null,
    navigate: () => {},
    history: null
})

export default HistoryContext