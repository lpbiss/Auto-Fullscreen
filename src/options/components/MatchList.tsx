import * as React from "react"
import * as ReactDOM from "react-dom"

type MatchListProps = {
    list: MatchDetail[];
    handleDel: (index: number) => void;
    toggleEnableState: (index: number) => void;
}

export default function MatchList(props: MatchListProps) {
    return (
        <div id="match-list">
            {props.list.map((detail, index) => {
                return (
                    <div className="match-row">
                        <p className={`${detail.isEnabled ? 'enabled' : 'disabled'}`}>
                            <b>Match URL</b>: {detail.match}
                            <b>{detail.selector && `, CSS selector:`}</b> {detail.selector && `${detail.selector}`}
                        </p>
                        <button onClick={() => props.toggleEnableState(index)}>
                            {detail.isEnabled ? 'disable' : 'enable'}
                        </button>
                        <button onClick={() => props.handleDel(index)}> delete </button>
                    </div>
                )
            })}
        </div>
    )
}
