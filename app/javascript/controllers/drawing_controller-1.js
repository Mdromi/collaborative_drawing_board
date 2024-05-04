import { Controller } from "@hotwired/stimulus";
import consumer from "channels/consumer";

export default class extends Controller {
  static targets = [
    "canvas",
    "toolBtn",
    "fillColor",
    "sizeSlider",
    "colorBtn",
    "colorPicker",
    "clearCanvas",
    "saveImg",
    "undoRedoBtn",
  ];

  connect() {
    this.canvas = this.canvasTarget;
    this.canvas.width = 800; // Example width
    this.canvas.height = 600; // Example height
    this.ctx = this.canvas.getContext("2d");
    this.remoteCtx = this.canvas.getContext("2d");
    this.isDrawing = false;
    this.selectedTool = "brush";
    this.brushWidth = 5;
    this.selectedColor = "#000";
    this.objects = [];

    this.setCanvasBackground();
    this.setupActionCable();
  }

  setupActionCable() {
    this.drawingChannel = consumer.subscriptions.create("DrawChannel", {
      connected: () => {
        console.log("Connected to DrawingChannel");
        this.addEventListeners();
      },
      received: (data) => {
        console.log("data", data);
        this.handleActionCableMessage(data);
      },
    });
  }

  setCanvasBackground() {
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.selectedColor;
  }

  addEventListeners() {
    this.canvas.addEventListener("mousedown", this.startDraw.bind(this));
    this.canvas.addEventListener("mousemove", this.drawing.bind(this));
    this.canvas.addEventListener("mouseup", () => (this.isDrawing = false));

    this.toolBtnTargets.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.toolBtnTargets.forEach((btn) => btn.classList.remove("active"));
        btn.classList.add("active");
        this.selectedTool = btn.dataset.tool;
      });
    });

    this.undoRedoBtnTargets.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.undoRedoBtnTargets.forEach((btn) => {
          btn.addEventListener("click", () => {
            if (btn.dataset.tool === "undo") {
              this.undo();
            } else if (btn.dataset.tool === "redo") {
              // Implement redo functionality if needed
            }
          });
        });
      });
    });

    this.sizeSliderTarget.addEventListener(
      "input",
      () => (this.brushWidth = this.sizeSliderTarget.value)
    );

    this.colorBtnTargets.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.colorBtnTargets.forEach((btn) => btn.classList.remove("selected"));
        btn.classList.add("selected");
        this.selectedColor = window
          .getComputedStyle(btn)
          .getPropertyValue("background-color");
      });
    });

    this.colorPickerTarget.addEventListener("change", () => {
      this.colorPickerTarget.parentElement.style.background =
        this.colorPickerTarget.value;
      this.colorPickerTarget.parentElement.click();
    });

    this.clearCanvasTarget.addEventListener("click", () => {
      this.clearCanvas();
    });

    this.saveImgTarget.addEventListener("click", () => this.saveImage());
  }

  startDraw(e) {
    this.isDrawing = true;
    this.prevMouseX = e.offsetX;
    this.prevMouseY = e.offsetY;
    this.ctx.beginPath();
    this.ctx.lineWidth = this.brushWidth;
    this.ctx.strokeStyle = this.selectedColor;
    this.ctx.fillStyle = this.selectedColor;
    this.lastSent = Date.now();
    this.snapshot = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    // Send drawing action over Action Cable
    this.drawingChannel.perform("draw", {
      tool: this.selectedTool,
      start: { x: this.prevMouseX, y: this.prevMouseY },
      color: this.selectedColor,
      brushWidth: this.brushWidth,
    });
  }

  drawing(e) {
    if (!this.isDrawing) return;
    this.ctx.putImageData(this.snapshot, 0, 0);

    switch (this.selectedTool) {
      case "brush":
      case "eraser":
        this.ctx.strokeStyle =
          this.selectedTool === "eraser" ? "#fff" : this.selectedColor;
        this.ctx.lineTo(e.offsetX, e.offsetY);
        this.ctx.stroke();
        break;
      case "rectangle":
        this.drawRect(e);
        break;
      case "circle":
        this.drawCircle(e);
        break;
      case "triangle":
        this.drawTriangle(e);
        break;
    }
  }

  drawRect(e) {
    const rectData = {
      type: "rectangle",
      x: e.offsetX,
      y: e.offsetY,
      width: this.prevMouseX - e.offsetX,
      height: this.prevMouseY - e.offsetY,
      color: this.selectedColor,
    };

    this.objects.push(rectData); // Push rectangle data into the objects array

    if (!this.fillColorTarget.checked) {
      this.ctx.strokeRect(
        rectData.x,
        rectData.y,
        rectData.width,
        rectData.height
      );
    } else {
      this.ctx.fillRect(
        rectData.x,
        rectData.y,
        rectData.width,
        rectData.height
      );
    }

    // Send drawing action over Action Cable
    this.drawingChannel.perform("draw", {
      tool: this.selectedTool,
      start: { x: rectData.x, y: rectData.y },
      color: this.selectedColor,
      brushWidth: this.brushWidth,
      width: rectData.width,
      height: rectData.height,
      fillColorTarget: this.fillColorTarget.checked,
    });
  }

  drawCircle(e) {
    this.ctx.beginPath();
    let radius = Math.sqrt(
      Math.pow(this.prevMouseX - e.offsetX, 2) +
        Math.pow(this.prevMouseY - e.offsetY, 2)
    );
    this.ctx.arc(this.prevMouseX, this.prevMouseY, radius, 0, 2 * Math.PI);
    if (!this.fillColorTarget.checked) {
      this.ctx.stroke();
    } else {
      this.ctx.fill();
    }
  }

  drawTriangle(e) {
    this.ctx.beginPath();
    this.ctx.moveTo(this.prevMouseX, this.prevMouseY);
    this.ctx.lineTo(e.offsetX, e.offsetY);
    this.ctx.lineTo(this.prevMouseX * 2 - e.offsetX, e.offsetY);
    this.ctx.closePath();
    if (!this.fillColorTarget.checked) {
      this.ctx.stroke();
    } else {
      this.ctx.fill();
    }
  }

  undo() {
    if (this.objects.length > 0) {
      this.objects.pop(); // Remove the last drawn object
      // this.clearCanvas(); // Clear the canvas
      this.objects.forEach((obj) => {
        // Redraw all remaining objects
        switch (obj.type) {
          case "rectangle":
            this.drawRect(obj);
            break;
          // Add cases for other types of objects if needed
        }
      });
    }
  }

  handleActionCableMessage(data) {
    this.remoteCtx.lineWidth = data.brushWidth
      ? data.brushWidth
      : this.brushWidth;
    switch (data.tool) {
      case "brush":
      case "eraser":
        this.remoteCtx.strokeStyle =
          data.tool === "eraser" ? "#fff" : data.color;
        this.remoteCtx.lineTo(data.start.x, data.start.y);
        this.remoteCtx.stroke();
        break;
      case "rectangle":
        if (!data.fillColorTarget.checked) {
          this.remoteCtx.strokeRect(data.start.x, data.start.y, data.width, data.height);
        } else {
          this.remoteCtx.fillRect(data.start.x, data.start.y, data.width, data.height);
        }
        break;
      case "circle":
        break;
      case "triangle":
        break;
      case "clearCanvas":
        this.remoteCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.setCanvasBackground();
        break;
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.setCanvasBackground();
    this.drawingChannel.perform("draw", {
      tool: "clearCanvas",
    });
  }

  saveImage() {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = this.canvas.toDataURL();
    link.click();
  }
}
