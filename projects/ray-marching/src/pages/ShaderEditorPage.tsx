import React, { useState } from 'react';
import { Code, Play } from 'lucide-react';

const ShaderEditorPage: React.FC = () => {
  const [shaderCode, setShaderCode] = useState(`// Ray Marching Shader Template
float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float map(vec3 p) {
    return sdSphere(p, 0.5);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    
    vec3 ro = vec3(0, 0, -2);
    vec3 rd = normalize(vec3(uv, 1));
    
    float t = 0.0;
    for (int i = 0; i < 64; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if (d < 0.001) break;
        t += d;
        if (t > 10.0) break;
    }
    
    vec3 col = vec3(0.2, 0.7, 1.0) * (1.0 - t / 10.0);
    fragColor = vec4(col, 1.0);
}`);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Code size={32} />
          Interactive Shader Editor
        </h1>
        <p className="page-subtitle">Live GLSL editor with real-time ray marching preview.</p>
      </div>
      
      <div className="shader-editor">
        <div className="editor-panel">
          <div className="code-header">
            GLSL Fragment Shader
            <button className="control-button" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
              <Play size={14} />
              Compile
            </button>
          </div>
          <textarea
            className="editor-textarea"
            value={shaderCode}
            onChange={(e) => setShaderCode(e.target.value)}
            spellCheck={false}
          />
        </div>
        
        <div className="editor-panel">
          <div className="code-header">Live Preview</div>
          <canvas className="shader-canvas loading-shader" style={{ height: '400px', margin: 0 }}>
            Shader output would render here
          </canvas>
        </div>
      </div>
    </div>
  );
};

export default ShaderEditorPage;