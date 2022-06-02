type VideoModel = {
    mainTitle: string;
    mainUrl: URL;
    backupTitle: string;
    backupUrl: URL;
    height: number;
    width: number;
};

type FormControls = {
    form: HTMLFormElement
    height: HTMLInputElement,
    width: HTMLInputElement,
    mainVideo: HTMLSelectElement,
    backupVideo: HTMLSelectElement
}

type Stringify<T> = {
    [K in keyof T]: string;
}

type FormControlsOptional = Partial<FormControls>;
type VideoSettings = Stringify<VideoModel>;
type VideoSettingsOptional = Partial<VideoSettings>;
type VideoBackupSettings = Pick<VideoSettings, "backupTitle" | "backupUrl">;
type VideoSelection = {
    title: string,
    url: `https://www.youtube.com/embed/${string}`
};

const videoDefaults: VideoSettings = {
    mainTitle: "GOTO Amsterdam 2019 Highlights",
    mainUrl: "https://www.youtube.com/embed/0sVzFzOXSPY",
    backupTitle: "GOTO Amsterdam 2018 Highlights",
    backupUrl: "https://www.youtube.com/embed/jXceAaIr6mA",
    height: "315",
    width: "560"
}

const videoSelection: VideoSelection[] = [
    {
        title: "Knowing Me, Knowing You",
        url: "https://www.youtube.com/embed/iUrzicaiRLU"
    },
    {
        title: "Mamma Mia",
        url: "https://www.youtube.com/embed/unfzfe8f9NI"
    },
    {
        title: "Money, Money, Money",
        url: "https://www.youtube.com/embed/ETxmCCsMoD0"
    },
    {
        title: "Super Trouper",
        url: "https://www.youtube.com/embed/BshxCIjNEjY"
    }
];

let backupVideo: VideoBackupSettings = {
    backupUrl: videoDefaults.backupUrl,
    backupTitle: videoDefaults.backupTitle
}

type PageElements = {
    videoSettingsForm: HTMLFormElement,
    videoHeight: HTMLInputElement,
    videoWidth: HTMLInputElement,
    mainVideoURL: HTMLSelectElement,
    backupVideoURL: HTMLSelectElement,
    videoTitle: HTMLHeadingElement,
    theVideo: HTMLIFrameElement,
    switchButton: HTMLButtonElement
}

type ResultElement<T extends string> =
    T extends keyof PageElements ? PageElements[T] : HTMLElement;

type FieldNames<T> = keyof T;

function findElementWithID<T extends FieldNames<PageElements>>(id: T): ResultElement<T> {
    const result = document.getElementById(id);
    if (result === null) {
        throw new Error(`Cannot find Element with id: ${id}`);
    }
    return result as ResultElement<T>;
}

type FetchOnDemand<T> = {
    [K in keyof T as `fetch${Capitalize<string & K>}`]: () => T[K]
};

type OnDemandControls = FetchOnDemand<FormControls>;

function loadFormControls(): OnDemandControls {

    const controls: FetchOnDemand<FormControlsOptional> = {};
    controls.fetchForm = () => findElementWithID("videoSettingsForm");
    controls.fetchHeight = () => findElementWithID("videoHeight");
    controls.fetchWidth = () => findElementWithID("videoWidth");
    controls.fetchMainVideo = () => findElementWithID("mainVideoURL");
    controls.fetchBackupVideo = () => findElementWithID("backupVideoURL");

    return controls as OnDemandControls;
}

function loadSettings(): VideoSettings {
    const controls = loadFormControls();
    const settings: VideoSettingsOptional = {};

    settings.height = controls.fetchHeight().value;
    settings.width = controls.fetchWidth().value;

    const mainVideoOption = controls.fetchMainVideo().selectedOptions[0];
    settings.mainUrl = mainVideoOption.value;
    const mainTitleText = mainVideoOption.textContent;
    if (mainTitleText !== null) {
        settings.mainTitle = mainTitleText;
    } else {
        settings.mainTitle = "No title for main selection";
    }

    const backupVideoOption = controls.fetchBackupVideo().selectedOptions[0];
    settings.backupUrl = backupVideoOption.value;
    const backupTitleText = backupVideoOption.textContent;
    if (backupTitleText !== null) {
        settings.backupTitle = backupTitleText;
    } else {
        settings.backupTitle = "No title for backup selection";
    }

    return settings as VideoSettings;
}

type NumericFields<T> = {
    [K in keyof T as T[K] extends number ? K : never]: T[K]
};

type VideoPrefix<T> = {
    [K in keyof T as `video${Capitalize<string & K>}`]: T[K]
}

type VideoDimensions = VideoPrefix<Stringify<NumericFields<VideoModel>>>;

function logSizeChange(size: VideoDimensions) {
    console.log(`Changing video size to ${size.videoHeight} by ${size.videoWidth}`);
}

function onFormSubmit(event: Event) {
    console.log("Settings form submitted");

    event.preventDefault();

    const videoTitle = findElementWithID("videoTitle");
    const video = findElementWithID("theVideo");

    const settings = loadSettings();

    video.height = settings.height;
    video.width = settings.width;

    logSizeChange({
        videoHeight: settings.height,
        videoWidth: settings.width
    });

    video.src = settings.mainUrl;
    videoTitle.textContent = settings.mainTitle;

    backupVideo.backupTitle = settings.backupTitle;
    backupVideo.backupUrl = settings.backupUrl;
}

function switchVideo(event: Event) {
    console.log("Switch video clicked")

    event.preventDefault();

    const videoTitle = findElementWithID("videoTitle");
    const video = findElementWithID("theVideo");

    videoTitle.textContent = backupVideo.backupTitle;
    video.src = backupVideo.backupUrl;
}

function populateSelectWithOptions(select: HTMLSelectElement) {
    videoSelection.forEach(item => {
        const option = document.createElement("option");
        option.setAttribute("value", item.url);
        option.textContent = item.title;
        select.appendChild(option);
    });
}

export function doSetupV7() {
    const controls = loadFormControls();

    const switchButton = findElementWithID("switchButton");
    const videoTitle = findElementWithID("videoTitle");
    const video = findElementWithID("theVideo");

    populateSelectWithOptions(controls.fetchMainVideo());
    populateSelectWithOptions(controls.fetchBackupVideo());

    controls.fetchForm().onsubmit = onFormSubmit;
    switchButton.onclick = switchVideo;

    controls.fetchWidth().value = videoDefaults.width;
    controls.fetchHeight().value = videoDefaults.height;

    video.src = videoDefaults.mainUrl;
    video.height = videoDefaults.height;
    video.width = videoDefaults.width;
    videoTitle.textContent = videoDefaults.mainTitle;
}