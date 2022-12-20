import {savePath} from "../../../variable.js";


export function startOther() {
    setSavePath()
}

function setSavePath() {
    const interval = setInterval(()=> {
        $('#path').text(savePath.folderPath)
        if($('#path').length === 1) clearInterval(interval)
    },1000)
}