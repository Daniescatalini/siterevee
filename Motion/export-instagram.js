const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const previewButton = document.getElementById("preview");
const exportButton = document.getElementById("export");

const W = canvas.width;
const H = canvas.height;
const DURATION = 7200;
const BG = "#65695a";
const WHITE = "#ffffff";
const SYMBOL_WIDTH = 500;
const WORDMARK_WIDTH = 900;
const LOGO_Y = 960;

const symbolPaths = [
  "M537.93,516.73L264.52,157.04l281.69.04-11.41-15.26-459.47-.23C152.37,35.16,285.55-7.46,409.98,32.72c72.5,24.19,132.83,75.02,169.04,142.41l13.62-9.01c-40.83-77.31-114.82-134.59-199.23-156.3-97.34-25.07-200.79-1.45-277.95,62.77-33.05,27.47-60.33,61.47-80.1,99.52-50.71,97.61-46.63,214.41,10.49,308.4,22.48,37.01,52.51,69.22,87.77,94.71,73.11,52.81,165.57,70.94,253.37,50.22,80.55-19,150.42-68.42,195.64-138.33l-14.04-9.69-30.68,39.3ZM127.07,547.86c-57.62-46.82-95.44-114.25-105.97-188.09-10.53-70.82,5.11-142.71,44.07-202.62h179.84l66.05,85.55-39.11,51.02-155.46,210.87,11.26,10.91,192.36-260.32,206.82,272.84c-108.98,108.37-280.54,119.13-399.87,19.84Z",
  "M617.91,334.1c-10.76.76-20.61-7.94-20.03-19.23.57-11.83,9.88-20.07,21.45-18.93,8.74.88,15.3,7.06,16.37,16.41,1.3,11.64-6.98,20.99-17.78,21.75Z",
].map((d) => new Path2D(d));

const wordmarkPaths = [
  "M857.86,158.6h-7.3c-5.2,13.37-13.62,25.13-29.1,26.12-12.5.87-21.04-5.57-30.82-11.76l-15.85-9.78c-4.58-2.6-9.04-4.7-14.24-6.56.86-.37,1.61-.74,2.35-1.24.87-.37,1.61-.74,2.48-1.24,2.35-1.24,4.58-2.6,6.81-4.08,2.1-1.49,4.33-3.1,6.32-4.71,1.98-1.73,3.96-3.47,5.82-5.32,1.86-1.86,3.59-3.84,5.33-5.82,1.61-1.98,3.1-3.96,4.33-5.94,2.85-3.96,5.2-8.3,7.18-12.75.62-1.49,1.24-2.97,1.73-4.46.62-1.86,1.24-3.71,1.86-5.45,2.36-7.43,3.59-15.35,3.59-23.53,0-45.31-36.77-82.08-82.08-82.08s-82.08,36.77-82.08,82.08c0,1.24.25,2.48.25,3.71.12,1.49.25,2.97.37,4.58.25,1.98.37,3.96.74,5.94.62,3.47,1.36,6.81,2.35,10.03.74,2.6,1.73,5.2,2.73,7.67,8.41,19.69,24.14,35.41,43.7,43.58,2.48,1.12,4.95,1.98,7.56,2.85,3.96,1.36,8.05,2.23,12.13,2.72.62.12,1.12.25,1.73.25-3.46,2.6-6.31,5.32-9.04,8.67l4.7,4.09c5.08-5.94,11.27-9.91,17.95-12.13,4.83-1.61,9.9-2.35,15.23-1.98,4.46.12,9.04,1.11,13.62,2.72,5.69,2.1,11.14,4.58,16.22,7.92l14.85,9.29,10.9,6.44c7.55,3.84,15.84,5.32,24.27,4.09,12.63-1.86,22.03-10.03,28.23-20.92,2.23-3.96,3.97-8.05,5.57-12.38l.12-.5c0-.12-.37-.12-.5-.12ZM726.25,154.39c-39.49,0-71.68-32.44-71.68-72.3,0-32.44,21.3-60.04,50.39-69.21,1.73-.5,3.46-.99,5.32-1.36.25-.12.5-.12.74-.12,1.36-.37,2.73-.62,4.21-.74.13-.12.37-.12.5-.12h.25c3.34-.62,6.81-.87,10.28-.87,2.23,0,4.33.12,6.44.37,2.1.12,4.21.37,6.32.86,2.1.25,4.08.74,6.06,1.36,1.49.37,2.97.74,4.46,1.36,1.49.49,3.1,1.11,4.58,1.73,25.75,11.02,43.83,36.77,43.83,66.73,0,39.87-32.19,72.3-71.68,72.3Z",
  "M355.85,4.46L431.65,158.17L422.69,162.44L406.95,130.61L402.11,121.11L353.18,20.62L352.22,20.62L303.29,121.11L298.45,130.61L282.71,162.44L273.75,158.17L349.55,4.46Z",
  "M622.02,68.23c0-34.56-28.09-63.78-62.73-63.78h-93v157.74h10.17v-27.66h-.01v-17.83h.01V14.19h83.07c28.58,0,52.07,24.83,52.07,54.04s-23.49,53.31-52.32,53.31h-59.03v9.73h59.27c2.67,0,5.33-.24,7.99-.49l34.92,32.29,6.5-6.73-30.03-28.23c24.95-8.03,43.11-31.89,43.11-59.89Z",
  "M82.11,156.15c-39.48,0-71.69-32.45-71.69-72.41S42.63,11.33,82.11,11.33c29.07,0,54.14,17.62,65.37,42.85h11.14C146.72,23.48,116.96,1.63,82.11,1.63,36.82,1.63,0,38.45,0,83.74s36.82,82.09,82.11,82.09c34.26,0,63.64-21.09,75.93-50.96h-11.31c-11.56,24.38-36.17,41.28-64.62,41.28Z",
  "M171.27,144.19c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9s-4.03-9-9-9Z",
].map((d) => new Path2D(d));

function ease(t) {
  t = Math.max(0, Math.min(1, t));
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function phase(ms, start, end) {
  return ease((ms - start) / (end - start));
}

function alpha(ms, start, inEnd, outStart, outEnd, max = 1) {
  if (ms < start || ms > outEnd) return 0;
  if (ms < inEnd) return phase(ms, start, inEnd) * max;
  if (ms > outStart) return (1 - phase(ms, outStart, outEnd)) * max;
  return max;
}

function clear() {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
}

function withLogoBox(viewW, viewH, width, y, draw) {
  const scale = width / viewW;
  const height = viewH * scale;
  ctx.save();
  ctx.translate((W - width) / 2, y - height / 2);
  ctx.scale(scale, scale);
  draw(scale);
  ctx.restore();
}

function drawPaths(paths, options) {
  ctx.save();
  ctx.globalAlpha = options.opacity ?? 1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = WHITE;
  ctx.fillStyle = WHITE;
  ctx.lineWidth = options.lineWidth ?? 2.2;
  if (options.fill) {
    paths.forEach((path) => ctx.fill(path, "evenodd"));
  }
  if (options.stroke) {
    paths.forEach((path) => ctx.stroke(path));
  }
  ctx.restore();
}

function drawGuideLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawGuides(ms, kind, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = WHITE;
  ctx.fillStyle = WHITE;
  ctx.lineWidth = 1.1;
  ctx.setLineDash([9, 10]);
  if (kind === "symbol") {
    withLogoBox(635.83, 633.81, SYMBOL_WIDTH, LOGO_Y, () => {
      drawGuideLine(20, 316.9, 615, 316.9);
      drawGuideLine(317.9, 18, 317.9, 615);
      drawGuideLine(75.33, 141.59, 546.21, 141.59);
      drawGuideLine(116.49, 504.59, 537.93, 504.59);
      ctx.beginPath();
      ctx.arc(317.9, 316.9, 308, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      drawGuideLine(264.52, 157.04, 537.93, 516.73);
      drawGuideLine(116.49, 504.59, 311.06, 242.7);
      [[75.33, 141.59], [264.52, 157.04], [311.06, 242.7], [537.93, 516.73], [617.91, 334.1]].forEach(([x, y]) => ctx.fillRect(x - 5, y - 5, 10, 10));
    });
  } else {
    withLogoBox(914.14, 192.95, WORDMARK_WIDTH, LOGO_Y, () => {
      [4.46, 83.74, 121.11, 158.17, 188.7].forEach((y) => drawGuideLine(0, y, 914.14, y));
      [0, 82.11, 171.27, 273.75, 352.7, 431.65, 466.29, 622.02, 644.17, 808.33, 857.86].forEach((x) => drawGuideLine(x, 0, x, 192.95));
      ctx.beginPath();
      ctx.arc(82.11, 83.74, 76.6, 0, Math.PI * 2);
      ctx.arc(726.25, 82.09, 77.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      drawGuideLine(273.75, 158.17, 352.7, 4.46);
      drawGuideLine(352.7, 4.46, 431.65, 158.17);
      [[82.11, 83.74], [171.27, 153.19], [352.7, 4.46], [466.29, 121.54], [622.02, 68.23], [726.25, 82.09], [857.86, 158.6]].forEach(([x, y]) => ctx.fillRect(x - 5, y - 5, 10, 10));
    });
  }
  ctx.restore();
}

function drawFrame(ms) {
  clear();

  const dot = alpha(ms, 0, 520, 1180, 1750);
  ctx.globalAlpha = dot;
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  drawGuides(ms, "symbol", alpha(ms, 250, 1100, 2600, 3300, 0.55));

  const symbolStroke = alpha(ms, 700, 2300, 3600, 4550, 0.9);
  const symbolFill = alpha(ms, 2300, 3000, 3250, 4050, 1);
  withLogoBox(635.83, 633.81, SYMBOL_WIDTH, LOGO_Y, () => {
    drawPaths(symbolPaths, { stroke: true, opacity: symbolStroke, lineWidth: 3.8 });
    drawPaths(symbolPaths, { fill: true, opacity: symbolFill });
  });

  drawGuides(ms, "wordmark", alpha(ms, 4400, 5200, 6320, 6900, 0.5));

  const reveal = phase(ms, 4560, 6200);
  const wordFill = phase(ms, 5850, 6800);
  const wordStrokeOpacity = alpha(ms, 4520, 5200, 6200, 6900, 0.9);
  withLogoBox(914.14, 192.95, WORDMARK_WIDTH, LOGO_Y, () => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 914.14 * reveal, 192.95);
    ctx.clip();
    drawPaths(wordmarkPaths, { stroke: true, opacity: wordStrokeOpacity, lineWidth: 2.2 });
    drawPaths(wordmarkPaths, { fill: true, opacity: wordFill });
    ctx.restore();
  });
}

let previewId = null;

function preview() {
  cancelAnimationFrame(previewId);
  const start = performance.now();
  function tick(now) {
    const elapsed = (now - start) % DURATION;
    drawFrame(elapsed);
    previewId = requestAnimationFrame(tick);
  }
  tick(start);
}

function supportedMime() {
  const types = [
    "video/mp4;codecs=h264",
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

async function exportMediaRecorderVideo() {
  const mimeType = supportedMime();
  if (!mimeType) {
    statusEl.textContent = "Este navegador nao suporta gravacao de video por MediaRecorder.";
    throw new Error("MediaRecorder indisponivel.");
  }

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 12_000_000,
  });
  const chunks = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };

  const ext = mimeType.includes("mp4") ? "mp4" : "webm";
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mimeType });
    downloadBlob(blob, `carq-instagram.${ext}`);
    statusEl.textContent = `Arquivo gerado: carq-instagram.${ext}`;
    preview();
  };

  statusEl.textContent = `Gravando ${ext.toUpperCase()}...`;
  recorder.start();
  const start = performance.now();
  function tick(now) {
    const elapsed = Math.min(now - start, DURATION);
    drawFrame(elapsed);
    if (elapsed < DURATION) {
      requestAnimationFrame(tick);
    } else {
      drawFrame(DURATION);
      recorder.stop();
    }
  }
  requestAnimationFrame(tick);
}

async function exportVideo() {
  cancelAnimationFrame(previewId);
  exportButton.disabled = true;

  try {
    if ("VideoEncoder" in window && "VideoFrame" in window) {
      await exportMp4Video();
    } else {
      await exportMediaRecorderVideo();
    }
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Nao consegui gerar MP4 neste navegador. Tente abrir no Chrome atualizado.";
  } finally {
    exportButton.disabled = false;
  }
}

async function exportMp4Video() {
  const fps = 30;
  const frameCount = Math.round((DURATION / 1000) * fps);
  const frameDuration = Math.round(1_000_000 / fps);
  const samples = [];
  let avcDescription = null;

  const support = await VideoEncoder.isConfigSupported({
    codec: "avc1.42E01E",
    width: W,
    height: H,
    bitrate: 12_000_000,
    framerate: fps,
    avc: { format: "avc" },
  });

  if (!support.supported) {
    throw new Error("H.264 MP4 nao suportado neste navegador.");
  }

  const encoder = new VideoEncoder({
    output: (chunk, metadata) => {
      const data = new Uint8Array(chunk.byteLength);
      chunk.copyTo(data);
      if (!avcDescription && metadata?.decoderConfig?.description) {
        avcDescription = new Uint8Array(metadata.decoderConfig.description);
      }
      samples.push({
        data,
        duration: 1000,
        isKey: chunk.type === "key",
      });
    },
    error: (error) => {
      throw error;
    },
  });

  encoder.configure(support.config);
  statusEl.textContent = "Gerando MP4 H.264...";

  for (let i = 0; i < frameCount; i += 1) {
    const ms = (i / (frameCount - 1)) * DURATION;
    drawFrame(ms);
    const frame = new VideoFrame(canvas, {
      timestamp: i * frameDuration,
      duration: frameDuration,
    });
    encoder.encode(frame, { keyFrame: i % fps === 0 });
    frame.close();
    if (i % 12 === 0) {
      statusEl.textContent = `Gerando MP4 H.264... ${Math.round((i / frameCount) * 100)}%`;
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  await encoder.flush();
  encoder.close();

  if (!avcDescription) {
    throw new Error("Configuracao AVC ausente.");
  }

  const mp4 = buildMp4(samples, avcDescription, {
    width: W,
    height: H,
    timescale: 30000,
    sampleDelta: 1000,
  });

  downloadBlob(new Blob([mp4], { type: "video/mp4" }), "carq-instagram.mp4");
  statusEl.textContent = "Arquivo gerado: carq-instagram.mp4";
  preview();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildMp4(samples, avcDescription, info) {
  const ftyp = box("ftyp", str("isom"), u32(0x00000200), str("isom"), str("iso2"), str("avc1"), str("mp41"));
  const mdatPayload = concat(samples.map((sample) => sample.data));
  const mdatSize = 8 + mdatPayload.length;
  let offsets = new Array(samples.length).fill(0);
  let moov = makeMoov(samples, avcDescription, info, offsets);
  let cursor = ftyp.length + moov.length + 8;
  offsets = samples.map((sample) => {
    const offset = cursor;
    cursor += sample.data.length;
    return offset;
  });
  moov = makeMoov(samples, avcDescription, info, offsets);

  return concat([
    ftyp,
    moov,
    u32(mdatSize),
    str("mdat"),
    mdatPayload,
  ]);
}

function makeMoov(samples, avcDescription, info, offsets) {
  const duration = samples.length * info.sampleDelta;
  return box("moov",
    makeMvhd(info.timescale, duration),
    box("trak",
      makeTkhd(1, duration, info.width, info.height),
      box("mdia",
        makeMdhd(info.timescale, duration),
        makeHdlr(),
        box("minf",
          makeVmhd(),
          makeDinf(),
          makeStbl(samples, avcDescription, info, offsets),
        ),
      ),
    ),
  );
}

function makeMvhd(timescale, duration) {
  return fullBox("mvhd", 0, 0,
    u32(0), u32(0), u32(timescale), u32(duration),
    u32(0x00010000), u16(0x0100), u16(0),
    u32(0), u32(0),
    matrix(),
    u32(0), u32(0), u32(0), u32(0), u32(0), u32(0),
    u32(2),
  );
}

function makeTkhd(trackId, duration, width, height) {
  return fullBox("tkhd", 0, 0x000007,
    u32(0), u32(0), u32(trackId), u32(0), u32(duration),
    u32(0), u32(0), u16(0), u16(0), u16(0), u16(0),
    matrix(),
    u32(width << 16), u32(height << 16),
  );
}

function makeMdhd(timescale, duration) {
  return fullBox("mdhd", 0, 0,
    u32(0), u32(0), u32(timescale), u32(duration),
    u16(0x55c4), u16(0),
  );
}

function makeHdlr() {
  return fullBox("hdlr", 0, 0,
    u32(0), str("vide"), u32(0), u32(0), u32(0), str("VideoHandler\0"),
  );
}

function makeVmhd() {
  return fullBox("vmhd", 0, 1, u16(0), u16(0), u16(0), u16(0));
}

function makeDinf() {
  return box("dinf",
    fullBox("dref", 0, 0,
      u32(1),
      fullBox("url ", 0, 1),
    ),
  );
}

function makeStbl(samples, avcDescription, info, offsets) {
  return box("stbl",
    makeStsd(avcDescription, info.width, info.height),
    fullBox("stts", 0, 0, u32(1), u32(samples.length), u32(info.sampleDelta)),
    makeStss(samples),
    fullBox("stsc", 0, 0, u32(1), u32(1), u32(1), u32(1)),
    fullBox("stsz", 0, 0, u32(0), u32(samples.length), ...samples.map((sample) => u32(sample.data.length))),
    fullBox("stco", 0, 0, u32(offsets.length), ...offsets.map((offset) => u32(offset))),
  );
}

function makeStsd(avcDescription, width, height) {
  const compressor = new Uint8Array(32);
  const name = str("C.ARQ");
  compressor[0] = name.length;
  compressor.set(name, 1);

  const avc1 = box("avc1",
    zeros(6), u16(1),
    u16(0), u16(0), u32(0), u32(0), u32(0),
    u16(width), u16(height),
    u32(0x00480000), u32(0x00480000),
    u32(0), u16(1), compressor, u16(0x0018), u16(0xffff),
    box("avcC", avcDescription),
  );

  return fullBox("stsd", 0, 0, u32(1), avc1);
}

function makeStss(samples) {
  const keys = samples
    .map((sample, index) => sample.isKey ? index + 1 : 0)
    .filter(Boolean);
  return fullBox("stss", 0, 0, u32(keys.length), ...keys.map((index) => u32(index)));
}

function matrix() {
  return concat([
    u32(0x00010000), u32(0), u32(0),
    u32(0), u32(0x00010000), u32(0),
    u32(0), u32(0), u32(0x40000000),
  ]);
}

function box(type, ...payloads) {
  const payload = concat(payloads);
  return concat([u32(8 + payload.length), str(type), payload]);
}

function fullBox(type, version, flags, ...payloads) {
  return box(type, u8(version), u24(flags), ...payloads);
}

function concat(parts) {
  const normalized = parts.flat().filter(Boolean);
  const total = normalized.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  normalized.forEach((part) => {
    out.set(part, offset);
    offset += part.length;
  });
  return out;
}

function str(value) {
  const out = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) {
    out[i] = value.charCodeAt(i);
  }
  return out;
}

function zeros(length) {
  return new Uint8Array(length);
}

function u8(value) {
  return new Uint8Array([value & 0xff]);
}

function u16(value) {
  return new Uint8Array([(value >> 8) & 0xff, value & 0xff]);
}

function u24(value) {
  return new Uint8Array([(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]);
}

function u32(value) {
  return new Uint8Array([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ]);
}

previewButton.addEventListener("click", preview);
exportButton.addEventListener("click", exportVideo);
preview();
