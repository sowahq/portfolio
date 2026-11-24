import { describe, expect, it } from "vitest";
import { paintDepot } from "../scene/depot.js";
import { paintCity, paintTrain } from "../scene/lille.js";
import { SoftwareCanvas } from "./canvas.js";
import { pixelAt } from "./raster.js";

describe("SoftwareCanvas", () => {
  it("is cleared when resized, like a canvas element", () => {
    const canvas = new SoftwareCanvas(0, 0);

    canvas.width = 2;
    canvas.height = 2;
    canvas.getContext().fillRect(0, 0, 2, 2);
    canvas.width = 3;

    expect([canvas.width, canvas.height]).toEqual([3, 2]);
    expect(pixelAt(canvas.raster, 0, 0)).toEqual([0, 0, 0, 0]);
  });

  const fills: { name: string; fillStyle: string; expected: [number, number, number, number] }[] = [
    { name: "an uppercase hex color", fillStyle: "#24123F", expected: [36, 18, 63, 255] },
    { name: "a short hex color", fillStyle: "#fff", expected: [255, 255, 255, 255] },
    { name: "the default black", fillStyle: "", expected: [0, 0, 0, 255] },
  ];

  for (const { name, fillStyle, expected } of fills) {
    it(`fills with ${name}`, () => {
      const canvas = new SoftwareCanvas(0, 0);
      const context = canvas.getContext();

      canvas.width = 1;
      canvas.height = 1;

      if (fillStyle) {
        context.fillStyle = fillStyle;
      }

      context.fillRect(0, 0, 1, 1);

      expect(pixelAt(canvas.raster, 0, 0)).toEqual(expected);
    });
  }

  it("refuses a color it cannot draw", () => {
    const canvas = new SoftwareCanvas(0, 0);
    const context = canvas.getContext();

    canvas.width = 1;
    canvas.height = 1;
    context.fillStyle = "rebeccapurple";

    expect(() => context.fillRect(0, 0, 1, 1)).toThrow();
  });

  it("puts image data as is", () => {
    const canvas = new SoftwareCanvas(0, 0);
    const context = canvas.getContext();

    canvas.width = 2;
    canvas.height = 1;

    const image = context.createImageData(1, 1);

    image.data.set([1, 2, 3, 4]);
    context.putImageData(image, 1, 0);

    expect(pixelAt(canvas.raster, 1, 0)).toEqual([1, 2, 3, 4]);
  });
});

describe("scene painters on the software canvas", () => {
  const cases: {
    name: string;
    paint: (canvas: SoftwareCanvas) => unknown;
    box: [number, number];
    size: [number, number];
  }[] = [
    { name: "the depot", paint: (canvas) => paintDepot(canvas), box: [1280, 430], size: [320, 108] },
    { name: "the city", paint: (canvas) => paintCity(canvas), box: [1200, 632], size: [300, 158] },
    { name: "the train", paint: (canvas) => paintTrain(canvas), box: [0, 0], size: [64, 11] },
  ];

  for (const { name, paint, box, size } of cases) {
    it(`paints ${name}`, () => {
      const canvas = new SoftwareCanvas(...box);

      paint(canvas);

      expect([canvas.width, canvas.height]).toEqual(size);
      expect(pixelAt(canvas.raster, 1, size[1] - 2)[3]).toBe(255);
    });
  }

  it("gives the depot the same layout as a browser canvas", () => {
    expect(paintDepot(new SoftwareCanvas(1280, 430))).toEqual({
      signX: 120,
      signY: 58,
      weld: { x: 191, y: 87 },
      trainTop: 90,
    });
  });
});
