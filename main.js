var matrix
var palavras
var width, height
var style

var font = fontBold = null
var charPressedPos  = null
var charReleasedPos = null
var highlightPos    = null
var lastPos         = null
var correctAngles   = null
var actualWord      = null
var sectionBounds   = null
var charWidth, charHeight

const urlMatriz = 'https://raw.githubusercontent.com/henrycunh/cacapalavrascap/standalone/samples/matriz.txt'
const urlPalavras = 'https://raw.githubusercontent.com/henrycunh/cacapalavrascap/standalone/samples/palavras.txt'


function setup() {
    // Definindo estilos
    font = loadFont('raleway.ttf')
    fontBold = loadFont('raleway-bold.ttf')
    color = getColors()
    style = getStyle(20, windowWidth, windowHeight)

    // Fetching the matrix
    fetch(urlMatriz)
    .then(data => data.text())
    .then(textData => {
        // Extraindo os caracteres a partir do texto
        let lines = textData.split('\n')
        let charMatrix = []
        for (let line of lines)
            charMatrix.push(line.split(' '))
        matrix = new Matrix(charMatrix, style.marginLeft, style.marginTop, style.width, style.height)
        charWidth = matrix.width / matrix.columns
        charHeight = matrix.height / matrix.lines
        correctAngles = getCorrectAngles(charHeight, charWidth)
        sectionBounds = getSection()
        // Setting up
        textSize(style.charSize)
        textFont(font)  
    })
    // Recuperando as palavras
    fetch(urlPalavras)
    .then(data => data.text())
    .then(textData => palavras = textData.split('\n').map( palavra => ({ val: palavra, found: false, pos: null })))
    createCanvas(windowWidth, windowHeight)
}


/**
 * É chamada a cada frame da execução, responsável por imprimir
 * na tela os componentes gráficos do jogo
 */
function draw() {
    background(color.background)
    /* Render das palavras */
    if(palavras)
        renderWords()
    /* Render da matriz */
    if(matrix)
        renderMatrix()
    /* Render do título */
    if(sectionBounds)
        renderTitle()
    /* Render de palavras encontradas */
    if(palavras)
        renderFoundWords()
}

function renderMatrix(){
    strokeWeight(0)
    fill(color.matrixBackground)
    rect(matrix.pos.x - style.padding, matrix.pos.y - style.padding, matrix.width + style.padding, matrix.height + style.padding)
    drawChars()
    if (highlightPos)
        makeSelection([highlightPos.x1, highlightPos.y1, highlightPos.x2, highlightPos.y2])
    else if(charPressedPos){
        let char =  matrix.charAtPos(mouseX, mouseY)
        if(char && inTable()){
            let { x, y } = char.getCenter()
            makeSelection([charPressedPos.x, charPressedPos.y, x, y])
        }
    }
    if(!charPressedPos){
        let char = matrix.charAtPos(mouseX, mouseY)
        if(char){
            let { x, y } = char.getCenter()
            stroke("rgba(137, 4, 23, 0.6)")
            fill("rgba(137, 4, 23, 0.3)")
            strokeWeight(2)
            ellipse(x, y, style.hoverRadius, style.hoverRadius)
        }
    }
    // Caso exista uma palavra selecionada
    if(actualWord){
        // Posições e tamanhos
        let textWidth = windowWidth - style.padding * 2 - style.marginLeft - style.marginRight - matrix.width   
        // Estilo
        textAlign(CENTER)
        strokeWeight(0)
        fill(color.text)
        textSize(14)
        textFont(font)
        // Renderização
        text("palavra selecionada", sectionBounds.x, sectionBounds.height * .12, textWidth, 20)
        textSize(16)
        textFont(fontBold)
        text(actualWord, sectionBounds.x, sectionBounds.height * .12 + 20, textWidth, 20)
    }
}

function renderWords(){
    if(!sectionBounds) return
    fill(color.sectionBackground)
    strokeWeight(0)
    rect(sectionBounds.x, sectionBounds.y, sectionBounds.width, sectionBounds.height)
    strokeWeight(2)
    stroke(color.text)
    line(
        sectionBounds.x + 20,
        sectionBounds.y + 50,
        sectionBounds.x + sectionBounds.width - 20,
        sectionBounds.y + 50
    )
    line(
        sectionBounds.x + 20,
        sectionBounds.y + 130,
        sectionBounds.x + sectionBounds.width - 20,
        sectionBounds.y + 130
    )
    // line(
    //     sectionBounds.x + 20,
    //     sectionBounds.y + 260,
    //     sectionBounds.x + sectionBounds.width - 20,
    //     sectionBounds.y + 260
    // )
    strokeWeight(0)
    textSize(32)
    fill(color.text)
    textFont(font)
    // text("PALAVRAS", sectionBounds.x, sectionBounds.height * .35, sectionBounds.width, 60)
    textAlign(LEFT)
    textSize(13)
    let wordsHeight = .25
    palavras.forEach( (palavra, i) => {
        fill(palavra.found ? "#777" : color.text)
        strokeWeight(0)
        let columnMax = Math.ceil((sectionBounds.height * (1 - wordsHeight) - style.padding) / 20) + 1
        let {x, y} = { 
            x: style.padding * 2 + sectionBounds.x + (i >= columnMax ? sectionBounds.width / 2 : 0) , 
            y: sectionBounds.height * wordsHeight + ( (i - (i >= columnMax ? columnMax : 0)) * 20)
        }
        text(palavra.val, x, y)
    })
}

function renderFoundWords(){
    palavras.forEach( palavra => {
        if(palavra.found && palavra.pos)
            highlight(...[[...Object.values(palavra.pos)], 8])
    })
}

function renderTitle(){
    textSize(20)
    strokeWeight(0)
    textAlign(CENTER)
    textFont(font)
    fill(color.text)
    text("wordsearch.js", sectionBounds.x, sectionBounds.y + 20, sectionBounds.width, 30)
}

const getSection = () => ({
    x       : style.marginLeft + matrix.width + style.padding * 2,
    y       : style.marginTop - style.padding,
    width   : windowWidth - (style.marginLeft + matrix.width + style.padding * 2 + style.marginRight),
    height  : windowHeight - (style.marginTop * 2) + style.padding
})


/**
 * Retorna uma lista com todos os possíveis angulos de seleção
 * de palavras
 * 
 * @param {number} charH Altura dos caracteres
 * @param {number} charW Largura dos caracteres
 */
const getCorrectAngles = (charH, charW) => [ 0, Math.PI / 2, Math.PI, -Math.PI / 2, atan2(charH, charW), atan2(charH, -charW), atan2(-charH, charW), atan2(-charH, -charW) ]

/**
 * Verifica se um ângulo é válido
 * @param {number} angle Ângulo a ser checado
 */
const checkAngle = (angle) => correctAngles.reduce((prev, curr) => prev || angle.toFixed(4) == curr.toFixed(4), false)

/**
 * Retorna os pontos já espaçados que determinam duas linhas ao
 * redor da seleção
 * @param {Array} pos Array contendo as posições dos caracteres
 * @param {number} angle Angulo da seleção
 * @param {number} pad Espaçamento interno da seleção
 */
const parallelLines = (pos, angle, pad) => {
    const pt = {
        x1: pos[0],
        y1: pos[1],
        x2: pos[2],
        y2: pos[3]
    }
    pad = pad || style.padding / 2
    const offset = {
        x: matrix.charWidth / 3,
        y: matrix.charHeight / 3
    }
    var trig = {
        s: sin(angle),
        c: cos(angle)
    }
    var transf = [{
        x1: pt.x1 - (pad * trig.s + offset.x * trig.c),
        y1: pt.y1 - (pad * trig.c + offset.y * trig.s),
        x2: pt.x2 - (pad * trig.s - offset.x * trig.c),
        y2: pt.y2 - (pad * trig.c - offset.y * trig.s)
    }, {
        x1: pt.x1 + (pad * trig.s - offset.x * trig.c),
        y1: pt.y1 + (pad * trig.c - offset.y * trig.s),
        x2: pt.x2 + (pad * trig.s + offset.x * trig.c),
        y2: pt.y2 + (pad * trig.c + offset.y * trig.s)
    }]
    return transf;
}

function makeSelection(pos) {
    let angle = atan2(pos[3] - pos[1], pos[2] - pos[0])
    let rightAngle = checkAngle(angle)
    let [x1, y1, x2, y2 ] = rightAngle ? pos : lastPos
    if (rightAngle) {
        highlight(pos, 15)
        firstChar = matrix.charAtPos(pos[0], pos[1])
        lastChar = matrix.charAtPos(pos[2], pos[3])
        actualWord = getWord({x1: firstChar.x, y1: firstChar.y, x2: lastChar.x, y2: lastChar.y})
        checkWord(actualWord)
    }
    if (rightAngle)
        lastPos = [x1, y1, x2, y2]
        strokeWeight(0)
}

function highlight(pos, pad){
    let angle = atan2(pos[3] - pos[1], pos[2] - pos[0])
    let lines = parallelLines(pos, angle, pad)
    stroke("rgba(137, 4, 23, 0.6)")
    fill("rgba(137, 4, 23, 0.3)")
    strokeWeight(2)
    // console.log(pad)
    beginShape()
    vertex(lines[0].x1, lines[0].y1)
    vertex(lines[0].x2, lines[0].y2)
    vertex(lines[1].x2, lines[1].y2)
    vertex(lines[1].x1, lines[1].y1)
    vertex(lines[0].x1, lines[0].y1)
    endShape()
}

function checkWord(palavraSelecionada){
    palavras = palavras.map( palavra => { 
        if(palavra.val == palavraSelecionada){
            palavra.pos = Object.assign({}, highlightPos)
            palavra.found = true
            return palavra
        } 
        else
            return palavra 
    })
    highlightPos = null
}

function mousePressed() {
    if(matrix){
        highlightPos = null
        charPressedPos = matrix.charAtPos(mouseX, mouseY).getCenter()
    }
}

function mouseReleased() {
    if (inTable()) {
        charReleasedPos = matrix.charAtPos(mouseX, mouseY).getCenter()
        highlightPos = {
            x1: charPressedPos.x,
            y1: charPressedPos.y,
            x2: charReleasedPos.x,
            y2: charReleasedPos.y
        }
        charPressedPos = charReleasedPos = null
    }
}

function hoverChar() {
    if (inTable()) {
        let { c, l } = sizes.grid
        let { x, y } = getCharCenterPos()
        fill("rgba(0,0,0,0.5)")
        stroke("#aaa")
        strokeWeight(1)
        ellipse(x, y, 25, 25);
        strokeWeight(0)
    }
}

function drawTitle() {
    textAlign(LEFT)
    stroke("#000")
    fill(color.text)
    textSize(30)
    text('word search', 30 + width - style.marginRight, style.marginTop + 20)
    fill("#fff")
    textSize(style.charSize)
}

function debug(...txt) {
    fill("#fff")
    textSize(20)
    textAlign(LEFT)
    text(txt.join("      "), style.marginLeft, matrix.height - 10)
}

function drawChars() {
    // Definindo estilo de render
    textSize(style.charSize)
    textAlign(CENTER)
    textFont(fontBold)
    fill(color.text)

    // Imprimindo os caracteres
    matrix.data.forEach( (line, i) => 
        line.forEach( (char, j) => 
            char.render(style.marginLeft + j * charWidth, style.marginTop + i * charHeight, charWidth, charHeight) 
    ))
}

const inTable = () =>
     mouseX >= style.marginLeft && mouseX <= style.marginLeft + matrix.width &&
     mouseY >= style.marginTop && mouseY <= style.marginTop + matrix.height

function getWord(pos) {
    let word = ""
    // Horizontal
    if (pos.y1 == pos.y2) {
        // to right
        if (pos.x1 < pos.x2)
            for (let i = pos.x1; i <= pos.x2; i++)
                word += matrix.data[pos.y1][i].val
        // to left
        else
            for (let i = pos.x2; i <= pos.x1; i++)
                word = matrix.data[pos.y1][i].val + word
    }
    // Vertical
    else if (pos.x1 == pos.x2) {
        // to bottom
        if (pos.y1 < pos.y2)
            for (let i = pos.y1; i <= pos.y2; i++)
                word += matrix.data[i][pos.x1].val
        // to top
        else
            for (let i = pos.y2; i <= pos.y1; i++)
                word = matrix.data[i][pos.x1].val + word
    }
    // Diagonal
    else {
        // to top right
        if (pos.x1 < pos.x2 && pos.y1 > pos.y2)
            for (let i = pos.x1, j = pos.y1; i <= pos.x2; i++, j--)
                word += matrix.data[j][i].val
        // to top left
        else if (pos.x1 > pos.x2 && pos.y1 > pos.y2)
            for (let i = pos.x1, j = pos.y1; i >= pos.x2; i--, j--)
                word += matrix.data[j][i].val
        // to bottom right
        else if (pos.x1 > pos.x2 && pos.y1 < pos.y2)
            for (let i = pos.x1, j = pos.y1; i >= pos.x2; i--, j++)
                word += matrix.data[j][i].val
        // to bottom left
        else
            for (let i = pos.x1, j = pos.y1; i <= pos.x2; i++, j++)
                word += matrix.data[j][i].val
    }
    return word
}
