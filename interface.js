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
};

const milliTimestamp = () => {
  return BigInt(Date.now());
}

const canvas = document.getElementById("webgl_canvas");
const gl = canvas.getContext("webgl2");
let wasmInstance = null;
let memory = null;

const glShader = [null];
const glProgram = [null];
const glVertexArray = [null];
const glBuffer = [null];
const glFramebuffer = [null];
const glTexture = [null];
const glSampler = [null];
const glUniformLocation = [null];

const glClearColor = (r,g,b,a) => {
  gl.clearColor(r, g, b, a);
}

const glClear = (mask) => {
  gl.clear(mask);
} 

const glUseProgram = (program) => {
  gl.useProgram(glProgram[program]);
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

const glBlendFuncSeparate = (sfactor, dfactor, sfactorAlpha, dfactorAlpha) => {
  gl.blendFuncSeparate(sfactor, dfactor, sfactorAlpha, dfactorAlpha);
}

const glBlendEquation = (mode) => {
  gl.blendEquation(mode);
}

const glGetUniformLocation = (programId, name, namelen) => {
  glUniformLocation.push(gl.getUniformLocation(glProgram[programId], askitext(name, namelen)));
  return glUniformLocation.length - 1;
};

const glUniform1i = (uniform, v0) => {
  gl.uniform1i(glUniformLocation[uniform], v0);
}

const glUniform1f = (uniform, v0) => {
  gl.uniform1f(glUniformLocation[uniform], v0);
}

const glUniform2i = (uniform, v0, v1) => {
  gl.uniform2i(glUniformLocation[uniform], v0, v1);
}

const glUniform2f = (location, v0, v1) => {
  gl.uniform2f(glUniformLocation[location], v0, v1);
};

const glUniform3f = (location, v0, v1, v2) => {
  gl.uniform3f(glUniformLocation[location], v0, v1, v2);
};

const glUniform4f = (location, v0, v1, v2, v3) => {
  gl.uniform4f(glUniformLocation[location], v0, v1, v2, v3);
};

const glUniform4i = (location, v0, v1, v2, v3) => {
  gl.uniform4i(glUniformLocation[location], v0, v1, v2, v3);
};

const glUniform1iv = (location, count, value) => {
  const data = new Uint32Array(memory.buffer, value, count);
  gl.uniform1iv(glUniformLocation[location], data);
};

const glUniform3fv = (location, count, value) => {
  const data = new Float32Array(memory.buffer, value, count);
  gl.uniform3fv(glUniformLocation[location], data);
};

const glGenVertexArrays = (num, dataPtr) => {
  const z_mem = new Uint32Array(memory.buffer, dataPtr, num);
  for (let n = 0; n < num; n++) {
    z_mem[n] = glVertexArray.length;
    glVertexArray.push(gl.createVertexArray());
  }
}

const glActiveTexture = (texture) => {
  gl.activeTexture(texture);
}

const glBindVertexArray = (va) => {
  gl.bindVertexArray(glVertexArray[va]);
}

const glBindBuffer = (target, buffer) => {
  gl.bindBuffer(target, glBuffer[buffer]);
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

const glDrawArraysInstanced = (mode, first, count, instanceCount) => {
  gl.drawArraysInstanced(mode, first, count, instanceCount);
}

const glGenBuffers = (num, dataPtr) => {
  const z_mem = new Uint32Array(memory.buffer, dataPtr, num);
  for (let n = 0; n < num; n++) {
    z_mem[n] = glBuffer.length;
    glBuffer.push(gl.createBuffer());
  }
}

const glGenFramebuffers = (num, dataPtr) => {
  const z_mem = new Uint32Array(memory.buffer, dataPtr, num);
  for (let n = 0; n < num; n++) {
    z_mem[n] = glFramebuffer.length;
    glFramebuffer.push(gl.createFramebuffer());
  }
}

const glBindFramebuffer = (target, fb) => {
  gl.bindFramebuffer(target, glFramebuffer[fb])
}

const glFramebufferTexture2D = (target, attachment, textarget, textureId, level) => {
  const texture = glTexture[textureId];
  gl.framebufferTexture2D(target, attachment, textarget, texture, level);
}

const glVertexAttribPointer = (attribLocation, size, type, normalize, stride, offset) => {
  gl.vertexAttribPointer(attribLocation, size, type, normalize, stride, offset);
}

const glVertexAttribDivisor = (index, divisor) => {
  gl.vertexAttribDivisor(index, divisor);
};

const glEnableVertexAttribArray = (x) => {
  gl.enableVertexAttribArray(x);
}

const glGenTextures = (num, dataPtr) => {
  const z_mem = new Uint32Array(memory.buffer, dataPtr, num);
  for (let n = 0; n < num; n++) {
    z_mem[n] = glTexture.length;
    glTexture.push(gl.createTexture());
  }
}

const glGenSamplers = (num, dataPtr) => {
  const z_mem = new Uint32Array(memory.buffer, dataPtr, num);
  for (let n = 0; n < num; n++) {
    z_mem[n] = glSampler.length;
    glSampler.push(gl.createSampler());
  }
}

const glBindSampler = (unit, sampler) => {
  gl.bindSampler(unit, glSampler[sampler]);
}

const glSamplerParameteri = (sampler, pname, param) => {
  gl.samplerParameteri(glSampler[sampler], pname, param);
}

const glCreateShader = (type) => {
  let shader = gl.createShader(type);
  glShader.push(shader);
  return glShader.length - 1;
}

const glShaderSource = (shader, count, data, len) => {
  if (count != 1) console.log("glShaderSource != 1");
  gl.shaderSource(glShader[shader], askitext(data,len));
}

const glCompileShader = (shader) => {
  gl.compileShader(glShader[shader]);
}

const glCreateProgram = () => {
  let program = gl.createProgram();
  glProgram.push(program);
  return glProgram.length - 1;
}

const glAttachShader = (program, shader) => {
  gl.attachShader(glProgram[program], glShader[shader]);
}

const glLinkProgram = (program) => {
  gl.linkProgram(glProgram[program]);
}

const glDeleteShader = (shader) => {
  gl.deleteShader(glShader[shader]);
}

const glBindTexture = (target, textureId) => {
  gl.bindTexture(target, glTexture[textureId]);
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
      console.error(`unsupported format: ${format}`);
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
      console.error(`unsupported type: ${type}`);
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
  return gl.getUniformBlockIndex(glProgram[program], askitext(uniformBlockName, namelen));
};

const glUniformBlockBinding = (program, uniformBlockIndex, uniformBlockBinding) => {
  gl.uniformBlockBinding(glProgram[program], uniformBlockIndex, uniformBlockBinding);
};

const glBindBufferBase = (target, index, buffer) => {
  gl.bindBufferBase(target, index, glBuffer[buffer]);
};

var glapi = {
  console_log,
  milliTimestamp,
  glClearColor,
  glClear,
  glUseProgram,
  glViewport,
  glEnable,
  glBlendFunc,
  glBlendEquation,
  glBlendFuncSeparate,
  glGetUniformLocation,
  glUniform1i,
  glUniform1f,
  glUniform2i,
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
  glDrawArraysInstanced,
  glGenBuffers,
  glGenFramebuffers,
  glBindFramebuffer,
  glFramebufferTexture2D,
  glGenVertexArrays,
  glVertexAttribPointer,
  glVertexAttribDivisor,
  glEnableVertexAttribArray,
  glGenTextures,
  glGenSamplers,
  glCreateShader,
  glShaderSource,
  glCompileShader,
  glCreateProgram,
  glAttachShader,
  glLinkProgram,
  glDeleteShader,
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
  glBindSampler,
  glSamplerParameteri,
}
