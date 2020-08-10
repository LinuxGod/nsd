const electron = window.electron

/**
 * 写入粘贴板
 * @param {string} text 
 */
const writeText = (text) => {
    electron.clipboard.writeText(text)
}

/**
 * 读取粘贴板的内容
 */
const readText = () => {
    return electron.clipboard.readText()
}

export {
    writeText,
    readText
}