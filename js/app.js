const canvasBody = document.querySelector(".canvas-body");
const canvas = canvasBody.querySelector("#tag-game-body");
const ctx = canvas.getContext("2d");

const blocks = [];

const pd = 10;
const row = 4;
const col = 4;
// coordinates of an empty cell
const emptyRow = 3;
const emptyCol = 3;
const blockSize = 100;
const colorBlock = "rgb(63, 79, 129)";
const colorCorrectBlock = "rgb(209, 129, 24)";
const colorEmptyBlock = "rgb(32, 32, 54)";

function randNum(min, max) {
	return Math.floor(min + Math.random() * (max + 1 - min));
}

function isSolution(lst) {
	let sumPairs = 0;
	const numberEmptyCell = emptyRow;
	for (let i = 0; i < lst.length; i += row) {
		for (let j = i; j < i + row - 1; j++) {
			for (let k = j; k < i + row - 1; k++) {
				if (lst[j] > lst[k]) {
					sumPairs += 1;
				}
			}
		}
	}

	return (sumPairs + numberEmptyCell) % 2 === 0;
}

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = randNum(0, i + 1);

		[array[i], array[j]] = [array[j], array[i]];
	}

	if (!isSolution(array)) {
		[array[0], array[1]] = [array[1], array[0]];
	}
}

function createBlocks() {
	const randValLst = [];
	for (let i = 1; i < row * col; i++) {
		randValLst.push(i);
	}

	shuffle(randValLst);

	let number = 0;
	for (let i = 0; i < row; i++) {
		for (let j = 0; j < col; j++) {
			const shiftX = pd + j * (blockSize + pd);
			const shiftY = pd + i * (blockSize + pd);
			const val = randValLst[number];

			number += 1;
			if (i === emptyRow && j === emptyCol) {
				blocks.push({
					value: "empty",
					width: blockSize,
					height: blockSize,
					x: shiftX,
					y: shiftY,
					index: number - 1,
					color: colorEmptyBlock,
				});
				number -= 1;
			} else {
				blocks.push({
					value: val,
					width: blockSize,
					height: blockSize,
					x: shiftX,
					y: shiftY,
					index: number - 1,
					color: colorBlock,
				});
			}
		}
	}
}

createBlocks();

const emptyBlock = blocks[(emptyRow + 1) * row - (col - emptyCol)];

canvas.width = pd * 5 + blockSize * 4;
canvas.height = pd * 5 + blockSize * 4;

const canvasLeft = Math.ceil((canvasBody.getClientRects()[0].width - canvas.width) / 2);
const canvasTop = Math.ceil((canvasBody.getClientRects()[0].height - canvas.height) / 2);

let currentBlockFirstX;
let currentBlockFirstY;
let currentIndexBlock;
let currentBlock;

function draw() {
	ctx.fillStyle = "rgb(51, 51, 51)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	blocks.forEach((block) => {
		ctx.fillStyle = block.color;
		ctx.fillRect(block.x, block.y, block.width, block.height);

		if (block.value !== "empty") {
			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.font = "44px helvetica";
			ctx.textBaseline = "hanging";

			const text = ctx.measureText(`${block.value}`);
			ctx.fillText(
				`${block.value}`,
				block.x + blockSize / 2 - text.width / 2,
				block.y + blockSize / 2 - 14
			);
		}
	});
}
draw();

let isClick = false;
let lastMouseX;
let lastMouseY;
let mouseShiftX = 0;
let mouseShiftY = 0;
canvas.addEventListener("mousedown", (e) => {
	const x = e.pageX - canvasLeft;
	const y = e.pageY - canvasTop;

	// let indexBlock;
	currentBlock = blocks.find((block, index) => {
		const diffIndex = Math.abs(block.index - emptyBlock.index);
		const diffRow = Math.abs(Math.floor(block.index / 4) - Math.floor(emptyBlock.index / 4));
		const diffCol = Math.abs((block.index % 4) - (emptyBlock.index % 4));

		if (
			((diffRow === 1 && diffCol === 0) || (diffRow === 0 && diffCol === 1)) &&
			(diffIndex === 1 || diffIndex === 4) &&
			x >= block.x &&
			x <= block.x + block.width &&
			y >= block.y &&
			y <= block.y + block.height
		) {
			isClick = true;

			lastMouseX = x;
			lastMouseY = y;

			currentBlockFirstX = block.x;
			currentBlockFirstY = block.y;
			currentIndexBlock = index;

			return true;
		}

		return false;
	});

	if (currentBlock !== undefined) {
		[blocks[blocks.length - 1], blocks[currentBlock.index]] = [
			blocks[currentBlock.index],
			blocks[blocks.length - 1],
		];
	}
});

function paintCorrectBlock() {
	for (let i = 0; i < blocks.length; i++) {
		if (blocks[i].value === i + 1) {
			blocks[i].color = colorCorrectBlock;
		} else if (blocks[i].value !== "empty") {
			blocks[i].color = colorBlock;
		}
	}
}

function isWin() {
	let flag = true;
	for (let i = 0; i < blocks.length; i++) {
		if (blocks[i].value !== i + 1 && blocks[i].value !== "empty") {
			flag = false;
			break;
		}
	}

	return flag;
}

canvas.addEventListener("mouseup", () => {
	// debugger;

	isClick = false;

	if (currentBlock !== undefined) {
		[blocks[blocks.length - 1], blocks[currentBlock.index]] = [
			blocks[currentBlock.index],
			blocks[blocks.length - 1],
		];

		if (
			Math.abs(currentBlock.x - emptyBlock.x) <= 50 &&
			Math.abs(currentBlock.y - emptyBlock.y) <= 50
		) {
			currentBlock.x = emptyBlock.x;
			currentBlock.y = emptyBlock.y;
			currentBlock.index = emptyBlock.index;

			emptyBlock.x = currentBlockFirstX;
			emptyBlock.y = currentBlockFirstY;
			emptyBlock.index = currentIndexBlock;

			[blocks[emptyBlock.index], blocks[currentBlock.index]] = [
				blocks[currentBlock.index],
				blocks[emptyBlock.index],
			];

			// paintCorrentBlock();
		} else {
			currentBlock.x = currentBlockFirstX;
			currentBlock.y = currentBlockFirstY;
		}
	}

	paintCorrectBlock();

	draw();
	if (isWin()) {
		ctx.fillStyle = "white";
		ctx.strokeStyle = "black";
		ctx.font = "120px helvetica";
		ctx.textBaseline = "middle";
		const text = ctx.measureText("You win");
		ctx.fillText("You win", canvas.width / 2 - text.width / 2, canvas.height / 2);
		ctx.lineWidth = 4;
		ctx.strokeText("You win", canvas.width / 2 - text.width / 2, canvas.height / 2);
	}
});

canvas.addEventListener("mousemove", (e) => {
	if (isClick) {
		const x = e.pageX - canvasLeft;
		const y = e.pageY - canvasTop;

		mouseShiftX = x - lastMouseX;
		mouseShiftY = y - lastMouseY;

		currentBlock.x += mouseShiftX;
		currentBlock.y += mouseShiftY;

		lastMouseX = x;
		lastMouseY = y;

		draw();
	}
});
