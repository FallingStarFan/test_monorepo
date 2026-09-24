"use client";

import { useState } from "react";

import { CanvasController, CanvasState } from "@/app/project/excalidraw/workspace/types";
import "./DevPanel.css";

type DevPanelProps = {
  controller: CanvasController;
  state: CanvasState;
};

export function DevPanel({
  controller,
  state,
}: DevPanelProps) {
  const [showState, setShowState] = useState(true);

  return (
    <div className="dev-panel">
      {/* Canvas State */}
      <section className="dev-panel__section">
        <button
          type="button"
          className="dev-panel__section-title"
          onClick={() => {
            setShowState((current) => !current);
          }}
        >
          <span>Canvas State</span>

          <span>
            {showState ? "−" : "+"}
          </span>
        </button>

        {showState && (
          <pre className="dev-panel__code">
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </section>

      {/* Stroke */}
      <section className="dev-panel__section">
        <div className="dev-panel__section-title">
          Stroke
        </div>

        <div className="dev-panel__row">
          <span>Color</span>

          <span className="dev-panel__value">
            {state.strokeColor}
          </span>
        </div>

        <div className="dev-panel__row">
          <span>Width</span>

          <span className="dev-panel__value">
            {state.strokeWidth}
          </span>
        </div>

        <div className="dev-panel__row">
          <span>Style</span>

          <span className="dev-panel__value">
            {state.strokeStyle}
          </span>
        </div>
      </section>

      {/* Background */}
      <section className="dev-panel__section">
        <div className="dev-panel__section-title">
          Background
        </div>

        <div className="dev-panel__row">
          <span>Color</span>

          <span className="dev-panel__value">
            {state.backgroundColor}
          </span>
        </div>

        <div className="dev-panel__row">
          <span>Fill</span>

          <span className="dev-panel__value">
            {state.fillStyle}
          </span>
        </div>
      </section>

      {/* Appearance */}
      <section className="dev-panel__section">
        <div className="dev-panel__section-title">
          Appearance
        </div>

        <div className="dev-panel__row">
          <span>Sloppiness</span>

          <span className="dev-panel__value">
            {state.sloppiness}
          </span>
        </div>

        <div className="dev-panel__row">
          <span>Opacity</span>

          <span className="dev-panel__value">
            {state.opacity}%
          </span>
        </div>
      </section>

      {/* Layer */}
      <section className="dev-panel__section">
        <div className="dev-panel__section-title">
          Layer
        </div>

        <div className="dev-panel__actions">
          <button
            type="button"
            onClick={() => {
              controller.moveLayerToTop();
            }}
          >
            Front
          </button>

          <button
            type="button"
            onClick={() => {
              controller.moveLayerUp();
            }}
          >
            Forward
          </button>

          <button
            type="button"
            onClick={() => {
              controller.moveLayerDown();
            }}
          >
            Backward
          </button>

          <button
            type="button"
            onClick={() => {
              controller.moveLayerToBottom();
            }}
          >
            Back
          </button>
        </div>
      </section>
    </div>
  );
}