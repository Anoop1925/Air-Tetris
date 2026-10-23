export const BLOCK_SIZE = 66;
export const GRID_COLS = 18;
export const GRID_ROWS = 12;

const PIECE_TEMPLATES = [
  {
    name: "I",
    shape: [[1, 1, 1, 1]],
    color: "#00f5ff",
    glowColor: "rgba(0, 245, 255, 0.75)"
  },
  {
    name: "O",
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: "#ffee00",
    glowColor: "rgba(255, 238, 0, 0.7)"
  },
  {
    name: "T",
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: "#bf00ff",
    glowColor: "rgba(191, 0, 255, 0.75)"
  },
  {
    name: "S",
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: "#00ff88",
    glowColor: "rgba(0, 255, 136, 0.75)"
  },
  {
    name: "Z",
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: "#ff003c",
    glowColor: "rgba(255, 0, 60, 0.75)"
  },
  {
    name: "L",
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: "#ff6600",
    glowColor: "rgba(255, 102, 0, 0.75)"
  },
  {
    name: "J",
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: "#0066ff",
    glowColor: "rgba(0, 102, 255, 0.75)"
  }
];

function cloneShape(shape) {
  return shape.map((row) => row.slice());
}

function buildAllOrientationVariants(template) {
  const variants = [];
  let current = cloneShape(template.shape);

  for (let i = 0; i < 4; i += 1) {
    variants.push({
      name: template.name,
      variant: i,
      shape: cloneShape(current),
      color: template.color,
      glowColor: template.glowColor
    });

    current = rotatePiece(current);
  }

  return variants;
}

export const PIECES = PIECE_TEMPLATES.flatMap((template) => buildAllOrientationVariants(template));

export function rotatePiece(shape) {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      rotated[col][rows - row - 1] = shape[row][col];
    }
  }

  return rotated;
}

export function getRandomPiece() {
  const source = PIECES[Math.floor(Math.random() * PIECES.length)];
  const shape = source.shape.map((row) => row.slice());
  const maxStart = Math.max(0, GRID_COLS - shape[0].length);
  const startX = Math.floor(Math.random() * (maxStart + 1));

  return {
    name: source.name,
    variant: source.variant,
    shape,
    color: source.color,
    glowColor: source.glowColor,
    startX
  };
}
