const bigToUint8Array = (big) => {
  const big0 = BigInt(0)
  const big1 = BigInt(1)
  const big8 = BigInt(8)
  if (big < big0) {
    const bits = (BigInt(big.toString(2).length) / big8 + big1) * big8
    const prefix1 = big1 << bits
    big += prefix1
  }
  let hex = big.toString(16)
  if (hex.length % 2) {
    hex = '0' + hex
  }
  const len = hex.length / 2
  const u8 = new Uint8Array(len)
  let i = 0
  let j = 0
  while (i < len) {
    u8[i] = parseInt(hex.slice(j, j + 2), 16)
    i += 1
    j += 2
  }
  return u8
}

const u8ToNumber = (array) => {
  let number = 0;
  let pow = 0;
  for (let i = array.length - 1; i >= 0; i--) {
    number += array[i] * (256 ** pow);
    pow += 1;
  }
  return number;
}

const getFileText = (path) => {
    let request = new XMLHttpRequest();
    // TODO (12 May 2022 sam): This is being deprecated... How can we do sync otherwise?
    request.open('GET', path, false);
    request.send(null);
    if (request.status !== 200) return false;
    return request.responseText;
}

const readWebFile = (path, ptr, len) => {
    path = wasmString(path);
    // read text from URL location
    const text = getFileText(path);
    if (text === false) return false;
    if (text.length != len) {
      console.log("file length does not match requested length", path, len);
      return false;
    }
    const fileContents = new Uint8Array(memory.buffer, ptr, len);
    for (let i=0; i<len; i++) {
      fileContents[i] = text.charCodeAt(i);
    }
    return true;    
}

const readWebFileSize = (path) => {
    path = wasmString(path);
    // read text from URL location
    const text = getFileText(path);
    if (text === false) return -1;
    return text.length;
}

const getStorageText = (path) => {
    const text = localStorage.getItem(path);
    if (text === null) return false;
    return text;
}

const readStorageFileSize = (path) => {
  path = wasmString(path);
  const text = getStorageText(path);
  if (text === false) return -1;
  return text.length;
}

const readStorageFile = (path, ptr, len) => {
    path = wasmString(path);
    // read text from URL location
    const text = getStorageText(path);
    if (text === false) return false;
    if (text.length != len) {
      console.log("file length does not match requested length", path, len);
      return false;
    }
    const fileContents = new Uint8Array(memory.buffer, ptr, len);
    for (let i=0; i<len; i++) {
      fileContents[i] = text.charCodeAt(i);
    }
    return true;    
}

const writeStorageFile = (path, text) => {
    path = wasmString(path);
    text = wasmString(text);
    localStorage.setItem(path, text);
}

const wasmString = (ptr) => {
  const bytes = new Uint8Array(memory.buffer, ptr, 1024);
  let str = '';
  for (let i = 0; ; i++) {
    const c = String.fromCharCode(bytes[i]);
    if (c == '\0') break;
    str += c;
  }
  return str;
}


const parseWebText = (webText) => {
  // webText is a struct. We get it in binary as a BigInt. However, since the system
  // is little endian, we cannot directly read and parse the BigInt as is. We need to
  // have a littleEndian aware converter. like the one above
  // webText struct -> { text: u32 (pointer), len: u32 }
  // after conversion -> { text: last 4 bytes, len: first 1-4 bytes }
  const bytes = bigToUint8Array(webText);
  // these are the reverse order of the struct because of the endianness.
  const start = bytes.length - 4;
  const len = bytes.slice(0, start);
  const text = bytes.slice(start, start+4);
  return {text: u8ToNumber(text), len: u8ToNumber(len)};
}

const getString = (webText) => {
  const str = parseWebText(webText);
  const bytes = new Uint8Array(memory.buffer, str.text, str.len);
  let s = ""
  for (let i = 0; i < str.len ; i++) {
    s += String.fromCharCode(bytes[i]);
  }
  return s;
}

const askitext = (text, len) => {
  const byte = new Uint8Array(memory.buffer, text, len);
  let s = ""
  for (let i = 0; i < len ; i++) {
    s += String.fromCharCode(byte[i]);
  }
  return s;
}

const console_log = (text, len) => {
  console.log('log:', askitext(text,len));
  // console.log('zig2:', getString(value));
};

// const console_log = (value) => {
//   const bytes = new Uint8Array(memory.buffer, value, 1024);
//   let str = '';
//   for (let i = 0; ; i++) {
//     const c = String.fromCharCode(bytes[i]);
//     if (c == '\0') break;
//     str += c;
//   }
//   console.log('zig2:', str);
// }

const milliTimestamp = () => {
  return BigInt(Date.now());
}

// we choose to always init the webgl context.
var canvas = document.getElementById("webgl_canvas");
var gl = canvas.getContext("webgl2");

const glShaders = [];
const glPrograms = [];
const glVertexArrays = [];
const glBuffers = [];
const glTextures = [];
const glUniformLocations = [];

const glClearColor = (r,g,b,a) => {
  gl.clearColor(r, g, b, a);
}

const glClear = (mask) => {
  gl.clear(mask);
} 

const glBindFramebuffer = (target, framebuffer) => {
  let fb = null;
  if (framebuffer != 0) fb = framebuffer;
  gl.bindFramebuffer(target, fb)
}

const glUseProgram = (program) => {
  gl.useProgram(glPrograms[program]);
}

const glViewport = (x, y, width, height) => {
  gl.viewport(x, y, width, height)
}

const glEnable = (cap) => {
  gl.enable(cap);
}

const glBlendFunc = (sfactor, dfactor) => {
  gl.blendFunc(sfactor, dfactor);
}

const glGetUniformLocation = (programId, name, namelen) => {
  glUniformLocations.push(gl.getUniformLocation(glPrograms[programId], askitext(name, namelen)));
  return glUniformLocations.length - 1;
};

const glUniform1i = (uniform, v0) => {
  gl.uniform1i(glUniformLocations[uniform], v0);
}

const glUniform2f = (location, v0, v1) => {
  gl.uniform2f(glUniformLocations[location], v0, v1);
};

const glUniform3f = (location, v0, v1, v2) => {
  gl.uniform3f(glUniformLocations[location], v0, v1, v2);
};

const glUniform4f = (location, v0, v1, v2, v3) => {
  gl.uniform4f(glUniformLocations[location], v0, v1, v2, v3);
};

const glUniform4i = (location, v0, v1, v2, v3) => {
  gl.uniform4i(glUniformLocations[location], v0, v1, v2, v3);
};

const glUniform1iv = (location, count, value) => {
  const data = new Uint32Array(memory.buffer, value, count);
  gl.uniform1iv(glUniformLocations[location], data);
};

const glUniform3fv = (location, count, value) => {
  const data = new Float32Array(memory.buffer, value, count);
  gl.uniform3fv(glUniformLocations[location], data);
};

const glCreateVertexArray = () => {
  glVertexArrays.push(gl.createVertexArray());
  return glVertexArrays.length - 1;
};

const glGenVertexArrays = (num, dataPtr) => {
  const vaos = new Uint32Array(memory.buffer, dataPtr, num);
  for (let n = 0; n < num; n++) {
    const b = glCreateVertexArray();
    vaos[n] = b;
  }
}

const glActiveTexture = (texture) => {
  gl.activeTexture(texture);
}

const glBindVertexArray = (va) => {
  gl.bindVertexArray(glVertexArrays[va]);
}

const glBindBuffer = (target, buffer) => {
  gl.bindBuffer(target, glBuffers[buffer]);
}

const glBufferData = (target, size, data, usage) => {
    size = Number(size);
  if (target == 34962) { // GL_ARRAY_BUFFER
    const buffer = new Float32Array(memory.buffer, data, size);
    gl.bufferData(target, buffer, usage);
  } else if (target == 0x8893 ) { // GL_ELEMENT_ARRAY_BUFFER
    const buffer = new Uint32Array(memory.buffer, data, size);
    gl.bufferData(target, buffer, usage);
  } else if (target === 0x8A11) { // GL_UNIFORM_BUFFER
    const buffer = new Uint8Array(memory.buffer, data, size);
    gl.bufferData(target, buffer, usage);
  } else {
    console.log("! buff:", target);
  }
}

const glDrawElements = (mode, count, type, offset) => {
  gl.drawElements(mode, count, type, offset);
}

const glGenBuffers = (num, dataPtr) => {
  const buffers = new Uint32Array(memory.buffer, dataPtr, num);
  for (let n = 0; n < num; n++) {
    const b = glCreateBuffer();
    buffers[n] = b;
  }
}

const glVertexAttribPointer = (attribLocation, size, type, normalize, stride, offset) => {
  gl.vertexAttribPointer(attribLocation, size, type, normalize, stride, offset);
}

const glEnableVertexAttribArray = (x) => {
  gl.enableVertexAttribArray(x);
}

const glGenTextures = (num, dataPtr) => {
  const textures = new Uint32Array(memory.buffer, dataPtr, num);
  for (let n = 0; n < num; n++) {
    const b = glCreateTexture();
    textures[n] = b;
  }
}

// const glTexImage2D = (target, level, internalFormat, width, height, border, format, type, dataPtr) => {
//   let data;

//   gl.texImage2D(target, level, internalFormat, width, height, border, format, type, data);
// };

const glTexParameteri = (target, pname, param) => {
  gl.texParameteri(target, pname, param);
}

const glCreateShader = (type) => {
  let shader = gl.createShader(type);
  glShaders.push(shader);
  return glShaders.length - 1;
}

const glShaderSource = (shader, count, data, len) => {
  if (count != 1) console.log("we only support count = 1 for glShaderSource");
  gl.shaderSource(glShaders[shader], askitext(data,len));
}

const glCompileShader = (shader) => {
  gl.compileShader(glShaders[shader]);
}

const glCreateProgram = () => {
  let program = gl.createProgram();
  glPrograms.push(program);
  return glPrograms.length - 1;
}

const glAttachShader = (program, shader) => {
  gl.attachShader(glPrograms[program], glShaders[shader]);
}

const glLinkProgram = (program) => {
  gl.linkProgram(glPrograms[program]);
}

const glDeleteShader = (shader) => {
  // eh who will delete and all
}

const glCreateBuffer = () => {
  glBuffers.push(gl.createBuffer());
  return glBuffers.length - 1;
}

const glCreateTexture = () => {
  glTextures.push(gl.createTexture());
  return glTextures.length - 1;
};

const glBindTexture = (target, textureId) => {
  gl.bindTexture(target, glTextures[textureId]);
}

const glTexStorage2D = (target, levels, internalformat, width, height) => {
  gl.texStorage2D(target, levels, internalformat, width, height);
};

const glTexStorage3D = (target, levels, internalformat, width, height, depth) => {
  gl.texStorage3D(target, levels, internalformat, width, height, depth);
};

const getTexData = (dataPtr, width, height, format, type) => {
  let components;

  switch (format) {
    case 0x1903: components = 1; break;// GL_RED
    case 0x8227: components = 2; break;// GL_RG
    case 0x1907: components = 3; break;// GL_RGB
    case 0x1908: components = 4; break;// GL_RGBA
    default:
      console.error(`Unsupported format: ${format}`);
  }

  const size = width * height *  components;

  switch (type) {
    case 0x1401: // GL_UNSIGNED_BYTE
      return new Uint8Array(memory.buffer, dataPtr, size);
    case 0x1406: // GL_FLOAT
      return new Float32Array(memory.buffer, dataPtr, size);
    case 0x8D61: // GL_HALF_FLOAT (WebGL 2)
    case 0x140B: // GL_HALF_FLOAT_OES (WebGL 1)
      return new Uint16Array(memory.buffer, dataPtr, size);
    default:
      console.error(`Unsupported type: ${type}`);
  }
};

const glTexSubImage2D = (target, level, xoffset, yoffset, width, height, format, type, dataPtr) => {
  const data = getTexData( dataPtr, width, height, format, type);

  gl.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, data);
};

const glTexSubImage3D = (target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, dataPtr) => {
  const data = getTexData( dataPtr, width, height, format, type);
  
  gl.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, data);
};

const glDrawArrays = (mode, first, count) => {
  gl.drawArrays(mode, first, count);
};

const glScissor = (x, y, width, height) => {
  gl.scissor(x, y, width, height);
};

const glDisable = (cap) => {
  gl.disable(cap);
};

const glVertexAttribIPointer = (index, size, type, stride, pointer) => {
  gl.vertexAttribIPointer(index, size, type, stride, pointer);
};


const glGetUniformBlockIndex = (program, uniformBlockName, namelen) => {
  return gl.getUniformBlockIndex(glPrograms[program], askitext(uniformBlockName, namelen));
};

const glUniformBlockBinding = (program, uniformBlockIndex, uniformBlockBinding) => {
  gl.uniformBlockBinding(glPrograms[program], uniformBlockIndex, uniformBlockBinding);
};

const glBindBufferBase = (target, index, buffer) => {
  gl.bindBufferBase(target, index, glBuffers[buffer]);
};

var api = {
  // consoleLogS: consoleLog,
  console_log,
  readWebFile,
  readWebFileSize,
  readStorageFileSize,
  readStorageFile,
  writeStorageFile,
  milliTimestamp,
  glClearColor,
  glClear,
  glBindFramebuffer,
  glUseProgram,
  glViewport,
  glEnable,
  glBlendFunc,
  glGetUniformLocation,
  glUniform1i,
  glUniform1iv,
  glUniform2f,
  glUniform3f,
  glUniform4f,
  glUniform4i,
  glUniform3fv,
  glActiveTexture,
  glBindTexture,
  glBindVertexArray,
  glBindBuffer,
  glBufferData,
  glDrawElements,
  glDrawArrays,
  glGenBuffers,
  glGenVertexArrays,
  glVertexAttribPointer,
  glEnableVertexAttribArray,
  glGenTextures,
  // glTexImage2D,
  glTexParameteri,
  glCreateShader,
  glShaderSource,
  glCompileShader,
  glCreateProgram,
  glAttachShader,
  glLinkProgram,
  glDeleteShader,
  glCreateVertexArray,
  glCreateBuffer,
  glCreateTexture,
  glTexSubImage2D,
  glScissor,
  glDisable,
  glTexStorage2D,
  glTexStorage3D,
  glTexSubImage3D,
  glVertexAttribIPointer,
  glGetUniformBlockIndex,
  glUniformBlockBinding,
  glBindBufferBase,
}
