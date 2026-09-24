"use client";

import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  () =>
    import("@excalidraw/excalidraw").then(
      (module) => module.Excalidraw
    ),
  {
    ssr: false,
  }
);

export default function Page3() {
  return (
    <div style={{ height: "100vh" }}>
     
    </div>
  );
}