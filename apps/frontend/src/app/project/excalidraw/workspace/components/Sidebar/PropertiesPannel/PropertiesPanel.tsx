"use client";


import { CanvasController, CanvasState } from "@/app/project/excalidraw/workspace/types";

import "./PropertiesPanel.css";

type PropertiesPanelProps = {
  controller: CanvasController;
  state: CanvasState;
};

export function PropertiesPanel({
  controller,
  state,
}: PropertiesPanelProps) {
  return (
    <div className="properties-panel">
      {/* Stroke */}
      <section className="properties-section">
        <div className="properties-section__title">
          Stroke
        </div>

        <div className="properties-color-row">
          <label className="properties-color">
            <span>Color</span>

            <input
              type="color"
              value={state.strokeColor}
              onChange={(event) => {
                controller.setStrokeColor(
                  event.target.value,
                );
              }}
            />
          </label>

          <input
            className="properties-color-input"
            value={state.strokeColor}
            onChange={(event) => {
              controller.setStrokeColor(
                event.target.value,
              );
            }}
          />
        </div>

        <label className="properties-field">
          <span>Width</span>

          <input
            type="number"
            min={1}
            max={100}
            step={1}
            value={state.strokeWidth}
            onChange={(event) => {
              controller.setStrokeWidth(
                Number(event.target.value),
              );
            }}
          />
        </label>

        <label className="properties-field">
          <span>Style</span>

          <select
            value={state.strokeStyle}
            onChange={(event) => {
              controller.setStrokeStyle(
                event.target.value as typeof state.strokeStyle,
              );
            }}
          >
            <option value="solid">
              Solid
            </option>

            <option value="dashed">
              Dashed
            </option>

            <option value="dotted">
              Dotted
            </option>
          </select>
        </label>
      </section>

      {/* Background / Fill */}
      <section className="properties-section">
        <div className="properties-section__title">
          Background
        </div>

        <div className="properties-color-row">
          <label className="properties-color">
            <span>Color</span>

            <input
              type="color"
              value={state.backgroundColor}
              onChange={(event) => {
                controller.setBackgroundColor(
                  event.target.value,
                );
              }}
            />
          </label>

          <input
            className="properties-color-input"
            value={state.backgroundColor}
            onChange={(event) => {
              controller.setBackgroundColor(
                event.target.value,
              );
            }}
          />
        </div>

        <label className="properties-field">
          <span>Fill</span>

          <select
            value={state.fillStyle}
            onChange={(event) => {
              controller.setFillStyle(
                event.target.value as typeof state.fillStyle,
              );
            }}
          >
            <option value="solid">
              Solid
            </option>

            <option value="hachure">
              Hachure
            </option>

            <option value="cross-hatch">
              Cross-hatch
            </option>

            <option value="zigzag">
              Zigzag
            </option>

            <option value="dots">
              Dots
            </option>

            
          </select>
        </label>
      </section>

      {/* Appearance */}
      <section className="properties-section">
        <div className="properties-section__title">
          Appearance
        </div>

        <label className="properties-slider">
          <div>
            <span>Sloppiness</span>

            <strong>
              {state.sloppiness}
            </strong>
          </div>

          <input
            type="range"
            min={0}
            max={2}
            step={1}
            value={state.sloppiness}
            onChange={(event) => {
              controller.setSloppiness(
                Number(event.target.value),
              );
            }}
          />
        </label>

        <label className="properties-slider">
          <div>
            <span>Opacity</span>

            <strong>
              {state.opacity}%
            </strong>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={state.opacity}
            onChange={(event) => {
              controller.setOpacity(
                Number(event.target.value),
              );
            }}
          />
        </label>
      </section>

      {/* Layer */}
      <section className="properties-section">
        <div className="properties-section__title">
          Layer
        </div>

        <div className="properties-layer-grid">
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