import { useState } from "react";
import { createShapeId, Editor, Tldraw, TLDrawShapeProps } from "tldraw";
import "tldraw/tldraw.css";

/**
 * Width of the rectangle
 */
const w = 800;
/**
 * Height of the rectangle
 */
const h = 600;
/**
 * Diameter of the circles
 */
const circleD = 50;
/**
 * Blank margin around the circles
 */
const circleM = 10;

/**
 * Check if the `point` is in a circle which has `start` as its upper-left corner.
 * The diameter of the circle is `circleD`
 */
function isPointInCircle(
  point: { x: number; y: number },
  start: { x: number; y: number }
) {
  return (
    (point.x - start.x - circleD / 2) ** 2 +
      (point.y - start.y - circleD / 2) ** 2 <=
    (circleD / 2) ** 2
  );
}

export default function App() {
  const [gameWon, setGameWon] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const handleMount = (editor: Editor) => {
    editor.createShape({
      id: createShapeId("rect1"),
      type: "geo",
      x: 0,
      y: 0,
      isLocked: true,
      props: {
        geo: "rectangle",
        w,
        h,
        color: "black",
      },
    });

    /**
     * Coordinates of the top-left corner of the starting circle
     */
    const circleS = {
      x: Math.random() * (w - circleD - 2 * circleM) + circleM,
      y: Math.random() * (h - circleD - 2 * circleM) + circleM,
    };
    /**
     * Coordinates of the top-left corner of the ending circle
     */
    const circleE = {
      x: Math.random() * (w - circleD - 2 * circleM) + circleM,
      y: Math.random() * (h - circleD - 2 * circleM) + circleM,
    };

    editor.createShapes([
      {
        id: createShapeId("circle1"),
        type: "geo",
        x: circleS.x,
        y: circleS.y,
        isLocked: true,
        props: {
          geo: "ellipse",
          h: circleD,
          w: circleD,
          color: "light-green",
        },
      },
      {
        id: createShapeId("circle2"),
        type: "geo",
        x: circleE.x,
        y: circleE.y,
        isLocked: true,
        props: {
          geo: "ellipse",
          h: circleD,
          w: circleD,
          color: "light-red",
          fill: "fill",
        },
      },
    ]);

    editor.sideEffects.registerAfterChangeHandler("shape", (_, shape) => {
      if (shape.type !== "draw") return;

      const lineS = { x: shape.x, y: shape.y };
      const _lastSegment = (shape.props as TLDrawShapeProps).segments.slice(
        -1
      )[0];
      const lineE = {
        x: shape.x + _lastSegment.points.slice(-1)[0].x,
        y: shape.y + _lastSegment.points.slice(-1)[0].y,
      };

      if (isPointInCircle(lineS, circleS) && isPointInCircle(lineE, circleE)) {
        editor.updateShape({
          ...shape,
          props: {
            ...shape.props,
            color: "violet",
            size: "m",
          },
        });
        setGameWon(true);
      }
    });

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
            border: "2px solid black",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          Play Again?
        </button>
      )}
    </div>
  );
}
