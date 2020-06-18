type VisibleInfo = {
    widthVisible: number;
    heightVisible: number;
    areaVisible: number;
}

type CandidateElement = HTMLImageElement | HTMLVideoElement

type FullScreenCandidate = {
    target: CandidateElement;
    areaVisible: number;
}

type matchDetail = {
    match: string;
    selector?: string;
    isEnabled: boolean;
}

declare module "*.svg" {
    const content: string
    export default content
}

// ref: https://stackoverflow.com/questions/41285211/
type Modify<T, R> = Omit<T, keyof R> & R

type FullScreenVideo = Modify<HTMLMediaElement, {
    play: (source: 'fullscreen') => void;
    pause: (source: 'fullscreen') => void;
}>

type contentScriptMessage = {
    action: 'fullscreen';
}

type Config = {
    widthLowerBound: number;
    heightLowerBound: number;
    areaIgnorePercentage: number;
    hotkeyCtrl: boolean;
    hotkeyAlt: boolean;
    hotKey: string;
    hotkeyEnable: boolean;
    matchList: matchDetail[];
}
