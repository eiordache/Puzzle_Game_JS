//total number of pieces = 5 * 5
const difficulty = 5;
const hoverTint = '#008499';
 
//reference to the canvas and the drawing context
var canvas;
var ctx;
 
//reference to the image
var image;

//total number of pieces
var pieces;

//reference to the x and y position of the cursor
var cursor;

//dimensions of the entire puzzle
var widthP;
var heightP;

//dimensions of each individual piece
var widthPiece;
var heightPiece;

//piece currently dragged
var pieceCurrent;
//piece currently in position to be dropped on (highlighted in blue)
var pieceDrop;
 
//Loading the image for the puzzle
function begin(){
    image = new Image();
    image.addEventListener('load',onImage,false);
    image.src = "puppy2.jpg";
}

//Setting the canvas
function initCanvas(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    //Setting the canvas dimensions to the dimensions of the puzzle
    canvas.width = widthP;
    canvas.height = heightP;
}

//Setting the puzzle
function setPuzzle(){
    //Setting the number of pieces to an empty array
    pieces = [];
    cursor = {x:0,y:0};
    pieceCurrent = null;
    pieceDrop = null;

    ctx.drawImage(image, 0, 0, widthP, heightP, 0, 0, widthP, heightP);
    startGameTitle("Press to begin!");
    initPuzzlePieces();
}

function onImage(e){
    //Calculating the size of each puzzle piece
    widthPiece = Math.floor(image.width / difficulty);
    heightPiece = Math.floor(image.height / difficulty);

    //Calculating the total size of the puzzle
    widthP = widthPiece * difficulty;
    heightP = heightPiece * difficulty;

    initCanvas();
    setPuzzle();
}

//Setting the Start Game Message
function startGameTitle(message){
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(200, heightP - 50, widthP - 400, 100);
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "30px Sans Serif";
    ctx.fillText(message, widthP / 2, heightP - 20);
}

//Building the puzzle
function initPuzzlePieces(){
    var piece;
    var x = 0;
    var y = 0;

    //We build an object for each piece
    //The loop iterates through the number of puzzle pieces that we need
    for(var i = 0; i < difficulty * difficulty; i++){
        //We create an empty piece object
        piece = {};
        //These initial values are 0 - they represent where we start the drawing from
        piece.x = x;
        piece.y = y;
        //Add piece to the pieces array
        pieces.push(piece);

        //Determine if we need to go down to the next row of piece or not
        x += widthPiece;
        if(x >= widthP){
            x = 0;
            y += heightPiece;
        }
    }
    //On click, we shuffle the puzzle pieces based on the pieces array
    document.onmousedown = shuffle;
}

//Utility funcion that will shuffle the indices of the array
function arrayShuffle(o){
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function shuffle(){
    //Shuffling the pieces of the pieces array through the utility function
    pieces = arrayShuffle(pieces);
    
    //Clearing the elements of the canvas
    ctx.clearRect(0,0,widthP,heightP);

    var piece;
    var px = 0;
    var py = 0;

    for(var i = 0;i < pieces.length;i++){
        //Reference the current piece in the object loop
        piece = pieces[i];
        //Populate the x and y properties - will be 0 in the first iteration
        piece.xPos = px;
        piece.yPos = py;

        //Assign the source of the image we want to draw from
        //Declare the area of the image in which to draw
        //Set the area of the canvas where we want to draw
        ctx.drawImage(image, piece.x, piece.y, widthPiece, heightPiece, px, py, widthPiece, heightPiece);
        //Draw a stroke to separate the pieces
        ctx.strokeRect(px, py, widthPiece,heightPiece);

        //Check if we need to go down to the next row or not
        px += widthPiece;
        if(px >= widthP){
            px = 0;
            py += heightPiece;
        }
    }

    //Wait for the user to grab a piece
    document.onmousedown = onPieceClick;
}

//Function to determine which piece was clicked
function pieceClick(){
    var piece;
    //Loop through all puzzle pieces 
    for(var i = 0;i < pieces.length;i++){
        piece = pieces[i];
        //Determine if the click was within the bounds of any of our objects
        if(cursor.x < piece.xPos || cursor.x > (piece.xPos + widthPiece) || cursor.y < piece.yPos || cursor.y > (piece.yPos + heightPiece)){
            //PIECE NOT HIT
        }
        else{
            return piece;
        }
    }
    return null;
}

//Piece click function
function onPieceClick(e){
    //This condition updates the cursor object - x & y will hold the current cursor position
    if(e.layerX || e.layerX == 0){
        cursor.x = e.layerX - canvas.offsetLeft;
        cursor.y = e.layerY - canvas.offsetTop;
    }
    else if(e.offsetX || e.offsetX == 0){
        cursor.x = e.offsetX - canvas.offsetLeft;
        cursor.y = e.offsetY - canvas.offsetTop;
    }

    //Set the value of current piece to the returned value of piece click
    pieceCurrent = pieceClick();

    //Attach current puzzle piece to the cursor 
    if(pieceCurrent != null){
        //Clear the canvas area where the piece was clicked
        ctx.clearRect(pieceCurrent.xPos,pieceCurrent.yPos,widthPiece,heightPiece);
        //Save the context of the canvas 
        //ctx.save();
        //ctx.globalAlpha = .9;

        ctx.drawImage(image, pieceCurrent.sx, pieceCurrent.sy, widthPiece, heightPiece, cursor.x - (widthPiece / 2), cursor.y - (heightPiece / 2), widthPiece, heightPiece);
        ctx.restore();

        document.onmousemove = update;
        document.onmouseup = drop;
    }
}

//Calling the update function when the user moves the mouse
function update(e){
    //Set to null because piece can be dragged back home
    pieceDrop = null;

    //This condition updates the cursor object - x & y will hold the current cursor position
    if(e.layerX || e.layerX == 0){  
        cursor.x = e.layerX - canvas.offsetLeft;
        cursor.y = e.layerY - canvas.offsetTop;
    }
    else if(e.offsetX || e.offsetX == 0){
        cursor.x = e.offsetX - canvas.offsetLeft;
        cursor.y = e.offsetY - canvas.offsetTop;
    }

    //Without this we would see some very strage results following the path of the puzzle piece
    ctx.clearRect(0,0,widthP,heightP);

    var piece;
    for(var i = 0;i < pieces.length;i++){
        piece = pieces[i];
        
        //Check is the piece we are referencing is the piece we are dragging
        if(piece == pieceCurrent){
            continue;
        }

        //Redraw the puzzle piece
        ctx.drawImage(image, piece.x, piece.y, widthPiece, heightPiece, piece.xPos, piece.yPos, widthPiece, heightPiece);
        ctx.strokeRect(piece.xPos, piece.yPos, widthPiece,heightPiece);

        //We need to determine what other piece our mouse is over
        if(pieceDrop == null){
            if(cursor.x < piece.xPos || cursor.x > (piece.xPos + widthPiece) || cursor.y < piece.yPos || cursor.y > (piece.yPos + heightPiece)){
                //NOT OVER
            }
            else{
                pieceDrop = piece;
                ctx.save();
                ctx.globalAlpha = .4;
                ctx.fillStyle = hoverTint;
                ctx.fillRect(pieceDrop.xPos,pieceDrop.yPos,widthPiece, heightPiece);
                ctx.restore();
            }
        }
    }


    ctx.save();
    ctx.drawImage(image, pieceCurrent.sx, pieceCurrent.sy, widthPiece, heightPiece, cursor.x - (widthPiece / 2), cursor.y - (heightPiece / 2), widthPiece, heightPiece);
    ctx.restore();
    ctx.strokeRect( cursor.x - (widthPiece / 2), cursor.y - (heightPiece / 2), widthPiece,heightPiece);
}

//Function to drop the piece
function drop(e){
    //Remove the listneres since nothing is being dragged
    document.onmousemove = null;
    document.onmouseup = null;

    //If we are not dragging the piece to the home area
    if(pieceDrop != null){
        //Swapping the x and y of each variable 
        var tmp = {xPos:pieceCurrent.xPos,yPos:pieceCurrent.yPos};
        pieceCurrent.xPos = pieceDrop.xPos;
        pieceCurrent.yPos = pieceDrop.yPos;
        pieceDrop.xPos = tmp.xPos;
        pieceDrop.yPos = tmp.yPos;
    }
    //Simultaneously, we check if the game has been won
    reset();
}

function reset(){
    ctx.clearRect(0,0,widthP,heightP);
    var gameWin = true;
    var piece;
    for(var i = 0;i < pieces.length;i++){
        piece = pieces[i];
        //Check if each piece is being drawn to its winning position
        ctx.drawImage(image, piece.x, piece.y, widthPiece, heightPiece, piece.xPos, piece.yPos, widthPiece, heightPiece);
        ctx.strokeRect(piece.xPos, piece.yPos, widthPiece,heightPiece);

        if(piece.xPos != piece.x || piece.yPos != piece.y){
            gameWin = false;
        }
    }
    if(gameWin){
        //Set a timer so that the screen doesn't change so drastically upon moving the last piece
        setTimeout(gameOver,500);
    }
}

function gameOver(){
    document.onmousedown = null;
    document.onmousemove = null;
    document.onmouseup = null;
    setPuzzle();
}