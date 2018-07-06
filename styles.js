const getStyle = (marginH, windowWidth, windowHeight) => ({
    padding     : 10,
    marginLeft  : 40,
    marginRight : 40,
    marginTop   : marginH,
    hoverRadius : 32,
    charSize    : 13,
    width       : windowWidth * .675,
    height      : windowHeight - marginH * 2
})

const getColors = () => ({
    background          : "#eeeeee",
    matrixBackground    : "#dddddd",
    sectionBackground   : "#dddddd",
    text                : "#890417"
})