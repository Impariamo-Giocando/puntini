import { useState } from "react";
import { createShapeId, Editor, Tldraw, TLDrawShape } from "tldraw";
import "tldraw/tldraw.css";
import "./index.css";

const w = 800;
const h = 600;
const circleD = 30;

const points = [
  { id: "1", x: 100, y: 100 },
  { id: "2", x: 250, y: 200 },
  { id: "3", x: 400, y: 100 },
  { id: "4", x: 550, y: 200 },
  { id: "5", x: 700, y: 100 },
];

// Funzione per verificare se un punto è dentro il cerchio
function isPointInCircle(
  point: { x: number; y: number },
  circle: { x: number; y: number }
) {
  return (
    (point.x - circle.x) ** 2 + (point.y - circle.y) ** 2 <= (circleD / 2) ** 2
  );
}

export default function ConnectTheDotsGame() {
  const [gameWon, setGameWon] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const handleMount = (editor: Editor) => {
    // Crea il rettangolo di sfondo
    editor.createShape({
      id: createShapeId("rect1"),
      type: "geo",
      x: 0,
      y: 0,
      isLocked: true,
      props: { geo: "rectangle", w, h, color: "black" },
    });

    // Crea i cerchi (i punti)
    points.forEach((point, index) => {
      editor.createShape({
        id: createShapeId(`circle${index}`), // Interpolazione corretta
        type: "geo",
        x: point.x - circleD / 2,
        y: point.y - circleD / 2,
        isLocked: true,
        props: {
          geo: "ellipse",
          h: circleD,
          w: circleD,
          color: "blue",
          fill: "fill",
        },
      });
    });
    const theHandler = (_: any, shape: any) => {
      if (gameWon) return;
      if (shape.type !== "draw") return;

      const drawShape = shape as TLDrawShape;
      const lineSegments = drawShape.props.segments.flatMap(
        (seg: { points: { x: number; y: number }[] }) => seg.points
      );

      const drawnPoints = lineSegments.map((p: { x: number; y: number }) => ({
        x: drawShape.x + p.x,
        y: drawShape.y + p.y,
      }));

      if (
        !drawnPoints.every((p) => p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h)
      ) {
        editor.deleteShape(drawShape.id);
        return;
      }

      let newConnections: string[] = [];

      points.forEach((point) => {
        if (drawnPoints.some((p) => isPointInCircle(p, point))) {
          newConnections.push(point.id);
        }
      });

      if (new Set(newConnections).size === points.length) {
        editor.updateShape({
          ...drawShape,
          props: { ...drawShape.props, color: "green", size: "m" },
        });
        setGameWon(true);
        editor.setCurrentTool("select"); // ✅ Blocco sicuro del disegno
        return;
      }

      if (!editor.inputs.isPointing) {
        editor.deleteShape(drawShape.id);
      }
    };

    editor.sideEffects.registerAfterChangeHandler(
      "shape",
      gameWon ? () => {} : theHandler
    );

    editor.zoomToFit();
    editor.setCurrentTool("draw");
    editor.setCameraOptions({ isLocked: true });
  };

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw key={gameKey} hideUi inferDarkMode onMount={handleMount} />
      {gameWon && (
        <button
          onClick={() => {
            setGameWon(false);
            setGameKey((prev) => prev + 1);
          }}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "white",
            color: "black",
            border: "2px solid black",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          Hai vinto!
          <br />
          Riprova?
        </button>
      )}
    </div>
  );
}
