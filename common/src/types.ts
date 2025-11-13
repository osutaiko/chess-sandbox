export type MoveProperties = {
  canNonCapture: boolean;
  canCapture: boolean;
  isInitialOnly: boolean;
}

export type MoveType = "slide" | "leap" | "hop" | "castle";

export type SingleMove = {
  type: "slide" | "leap" | "hop";                // Type of move
  offset: [number, number];                      // Offset for the move: [x, y] => x Right, y forward
  range: {
    from: number;                                // Minimum range
    to: number;                                  // Maximum range
  };
  canForward: boolean;                           // Can move forward
  canBackward: boolean;                          // Can move backward
  canSideways: boolean;                          // Can move sideways
  canNonCapture: boolean;                        // Can move without capturing
  canCapture: boolean;                           // Can capture
  isInitialOnly: boolean;                        // Can only be used as an initial move
}

export type CastleMove = {
  type: "castle";
  targetPieces: string[];
  canNonCapture: boolean;                        // Can move without capturing
  canCapture: boolean;                           // Can capture
  isInitialOnly: boolean;                        // Can only be used as an initial move
}

export type PieceMove = SingleMove | CastleMove;

export type PiecePromotion = {
  squares: [number, number][];
  becomes: string[];
}

export type Piece = {
  id: string;
  name: string;
  description: string;
  sprite: string;
  moves: PieceMove[];
  promotions: PiecePromotion[];
  /* isEnPassantTarget: boolean;
  isEnPassantCapturer: boolean; */
}

export type Cell = {
  isValid: boolean;
  pieceId: string | null; // The piece identifier that is currently on the cell
  color: number | null;   // The piece color that is currently on the cell
}

export type VariantGridType = "square" | "hexagonal" | "circular";

export type Variant = {
  name: string;                                   // Variant name
  description: string;                            // Variant description
  width: number;                                  // Board width (number of files)
  height: number;                                 // Board height (number of ranks)
  gridType: VariantGridType;                      // Grid layout
  playerCount: number;                            // Player count
  initialBoard: Cell[][];                         // A 2D array representing the initial board setup
  pieces: Piece[];                                // Array of Piece objects
  royals: string[];                               // Array of royal piece identifiers (e.g., ['K'])
  isWinOnCheckmate: boolean;                      // True if the game is won on checkmate
  mustCheckmateAllRoyals: boolean;                // True if the last remaining royal must be checkmated (all except one should be captured first) to qualify as checkmate
  isWinOnStalemate: boolean;                      // True if stalemate is a winning condition, false if drawing condition
  isWinOnOpponentWipe: boolean;                   // True if wiping out all opponent pieces is a win
  nMoveRuleCount: number;                         // The number of moves required for n-move draw
  nMoveRulePieces: string[];                      // Array of piece identifiers that reset the n-move counter on move
}

export type VariantErrors = {
  [K in keyof Variant]?: string;
};

export type PieceErrors = {
  [K in keyof Piece]?: string;
};

export type Move = {
  from: { row: number; col: number };
  to: { row: number; col: number };
};

export type Game = Variant & {
  currentBoard: Cell[][];
  history: Move[];
  turn: number;
};

export type GameEndResult = {
  winners: number[];
  reason: string;
}
