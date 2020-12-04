import * as React from "react"
import * as ReactDOM from "react-dom"
import './options.scss'

import { defaultConfig } from "./global";

// TODO: reset


type ConfigFormState = {
    matchList: MatchDetail[];
}

class ConfigForm extends React.Component<Config, ConfigFormState> {

    widthLowerBoundInput: React.RefObject<HTMLInputElement>
    heightLowerBoundInput: React.RefObject<HTMLInputElement>
    areaIgnorePercentageInput: React.RefObject<HTMLInputElement>
    hotKeyInput: React.RefObject<HTMLInputElement>
    hotkeyCtrlInput: React.RefObject<HTMLInputElement>
    hotkeyAltInput: React.RefObject<HTMLInputElement>
    matchRef: React.RefObject<HTMLInputElement>
    selectorRef: React.RefObject<HTMLInputElement>

    constructor(props: Config) {
        super(props)

        this.widthLowerBoundInput = React.createRef()
        this.heightLowerBoundInput = React.createRef()
        this.areaIgnorePercentageInput = React.createRef()
        this.hotKeyInput = React.createRef()
        this.hotkeyCtrlInput = React.createRef()
        this.hotkeyAltInput = React.createRef()
        this.matchRef = React.createRef()
        this.selectorRef = React.createRef()

        this.state = {
            matchList: props.matchList
        }
    }

    handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault()
        
        chrome.storage.local.set({
            widthLowerBound: this.widthLowerBoundInput.current!.valueAsNumber,
            heightLowerBound: this.heightLowerBoundInput.current!.valueAsNumber,
            areaIgnorePercentage: this.areaIgnorePercentageInput.current!.valueAsNumber,
            hotKey: this.hotKeyInput.current!.value,
            hotkeyCtrl: this.hotkeyCtrlInput.current!.checked,
            hotkeyAlt: this.hotkeyAltInput.current!.checked,
        })
    }

    handleAddMatch = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault()

        const match = this.matchRef.current!.value
        const selector = this.selectorRef.current!.value
        let newMatch: MatchDetail

        if (selector !== '') {
            newMatch = { match, selector, isEnabled: true }
        } else {
            newMatch = { match, isEnabled: true }
        }

        this.setState({
            matchList: [...this.state.matchList, newMatch]
        }, this.syncMatchList)
    }

    handleDel = (index: number): void => {
        const newMatchList = [...this.state.matchList]
        newMatchList.splice(index, 1)
        this.setState({ matchList: newMatchList }, this.syncMatchList)
    }

    toggleEnableState = (index: number): void => {
        const newMatchList = [...this.state.matchList]
        newMatchList[index].isEnabled = !newMatchList[index].isEnabled
        this.setState({ matchList: newMatchList }, this.syncMatchList)
    }

    syncMatchList = (): void => {
        chrome.storage.local.set({ matchList: this.state.matchList })
    }


    render(): JSX.Element {
        return (
            <>
                <Title text='Basic settings' />
                <form onSubmit={this.handleSubmit}>
                    <div className="config-row config-lower-bound">
                        <label>
                            Ignore elements smaller than:
                            <input
                                name="widthLowerBound"
                                type="number"
                                required
                                min={0}
                                ref={this.widthLowerBoundInput}
                                defaultValue={this.props.widthLowerBound}
                            />
                            px width, or
                            <input
                                name="heightLowerBound"
                                type="number"
                                required
                                min={0}
                                ref={this.heightLowerBoundInput}
                                defaultValue={this.props.heightLowerBound}
                            />
                            px height.
                        </label>
                    </div>

                    <div className="config-row config-ignore-percentage">
                        <label>
                            Ignore elements smaller than:
                            <input
                                name="areaIgnorePercentage"
                                type='number'
                                required
                                min={0}
                                max={1}
                                step="0.01"
                                ref={this.areaIgnorePercentageInput}
                                defaultValue={this.props.areaIgnorePercentage}
                            />
                            &times; (the visible area of largest element in the viewport).
                        </label>
                    </div>

                    <div className="config-row config-hotkey">
                        <label>
                            HotKey:
                            <input
                                name="hotKey"
                                type="text"
                                required
                                maxLength={1}
                                ref={this.hotKeyInput}
                                defaultValue={this.props.hotKey}
                            />
                            Ctrl:
                            <input
                                name="hotkeyCtrl"
                                type="checkbox"
                                ref={this.hotkeyCtrlInput}
                                defaultChecked={this.props.hotkeyCtrl}
                            />
                            Alt:
                            <input
                                name="hotkeyAlt"
                                type="checkbox"
                                ref={this.hotkeyAltInput}
                                defaultChecked={this.props.hotkeyAlt}
                            />
                        </label>
                    </div>

                    <div className="submit">
                        <button type="submit" > submit </button>
                        <button type="reset" > reset </button>
                    </div>

                </form>

                <Title text="Automation" />

                <MatchList
                    list={this.state.matchList}
                    handleDel={this.handleDel}
                    toggleEnableState={this.toggleEnableState}
                />

                <form onSubmit={this.handleAddMatch}>
                    <div className="config-row config-automation">
                        <label>
                            Match URL:
                            <input ref={this.matchRef} placeholder="regular expression" type="text" required />
                            CSS selector (optional):
                            <input ref={this.selectorRef} type="text" />
                            <button type="submit"> add </button>
                        </label>
                    </div>
                </form>
            </>
        )
    }
}


function Title({ text }: { text: string }): JSX.Element {
    return <div className="title"> {text} </div>
}

type MatchListProps = {
    list: MatchDetail[];
    handleDel: (index: number) => void;
    toggleEnableState: (index: number) => void;
}

function MatchList(props: MatchListProps): JSX.Element {
    return (
        <div id="match-list">
            {props.list.map((detail, index) => {
                return (
                    <div className="match-row">
                        <p className={`${detail.isEnabled ? 'enabled' : 'disabled'}`}>
                            <b>Match URL</b>: {detail.match}
                            <b>{detail.selector && `, CSS selector:`}</b> {detail.selector && `${detail.selector}`}
                        </p>
                        <button onClick={(): void => props.toggleEnableState(index)}>
                            {detail.isEnabled ? 'disable' : 'enable'}
                        </button>
                        <button onClick={(): void => props.handleDel(index)}> delete </button>
                    </div>
                )
            })}
        </div>
    )
}


chrome.storage.local.get(Object.keys(defaultConfig), function (result) {
    ReactDOM.render(
        <ConfigForm {...(result as Config)} />,
        document.getElementById("root")
    )
})
