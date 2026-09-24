// mock-canvas-controller.ts

import type {
    CanvasController,
    CanvasExportFormat,
    CanvasSaveType,
} from "../types";

export const mockCanvasController: CanvasController = {
    create() {
        console.log("[Mock] create");
    },

    save(type: CanvasSaveType) {
        console.log(`[Mock] save: ${type}`);
    },

    load() {
        console.log("[Mock] load");
    },

    undo() {
        console.log("[Mock] undo");
    },

    redo() {
        console.log("[Mock] redo");
    },

    export(format: CanvasExportFormat) {
        console.log(`[Mock] export: ${format}`);
    },

    createPage() {
        console.log("[Mock] create page");
    },

    deletePage() {
        console.log("[Mock] delete page");
    },

    switchPage(pageId: string) {
        console.log(`[Mock] switch page: ${pageId}`);
    },
    copy: function (): void {
        throw new Error("Function not implemented.");
    },
    cut: function (): void {
        throw new Error("Function not implemented.");
    },
    paste: function (): void {
        throw new Error("Function not implemented.");
    },
    zoomIn: function (): void {
        throw new Error("Function not implemented.");
    },
    zoomOut: function (): void {
        throw new Error("Function not implemented.");
    },
    zoomToFit: function (): void {
        throw new Error("Function not implemented.");
    },
    renamePage: function (name: string): void {
        throw new Error("Function not implemented.");
    },
    bringForward: function (): void {
        throw new Error("Function not implemented.");
    },
    sendBackward: function (): void {
        throw new Error("Function not implemented.");
    },
    bringToFront: function (): void {
        throw new Error("Function not implemented.");
    },
    sendToBack: function (): void {
        throw new Error("Function not implemented.");
    },
    connect: function (): void {
        throw new Error("Function not implemented.");
    },
    disconnect: function (): void {
        throw new Error("Function not implemented.");
    }
};