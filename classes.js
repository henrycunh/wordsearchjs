/**
 * Armazena a posição dos caracteres e dispõe métodos para controle e render
 */
class Char{

    constructor(val, x, y){
        this.val = val
        this.x = x
        this.y = y
    }

    render(x, y, width, height){
        this.pos = {x: x, y: y}
        this.width = width
        this.height = height
        text(this.val, this.pos.x, this.pos.y, this.width, this.height)
    }

    getCenter(){
        return {
            x : this.pos.x - 2 + this.width / 2, 
            y : this.pos.y - 2 + this.height / 2, 
        }
    }

}

/**
 * Armazena os caracteres e diversas outras informações sobre a matriz de
 * caracteres
 */
class Matrix{

    constructor(charMatrix, x, y, width, height){
        this.lines   = charMatrix.length
        this.columns = charMatrix[0].length
        this.data    = charMatrix.map( (line, i) => line.map( (char, j) => new Char(char, j, i)))
        this.pos     = { x: x, y: y } 
        this.width   = width
        this.height  = height
        this.charWidth = width / this.columns
        this.charHeight = height / this.lines
    }

    charAtPos(x, y){
        let pos = {
            y: Math.floor((y - this.pos.y) / this.charHeight),
            x: Math.floor((x - this.pos.x) / this.charWidth),
        }
        if(this.data[pos.y] && this.data[pos.y][pos.x])
            return this.data[pos.y][pos.x];
    }
}
