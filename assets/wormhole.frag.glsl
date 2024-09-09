#define rotation(angle) mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

float PI = 3.14159256;
float TAU = 2.*3.14159256;

uniform vec2 iResolution;
uniform float iTime;
uniform vec4 vParticleColor;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
    vec3 col = vec3(0);
    float t = fract(iTime / 100000.0);  
    uv += vec2(-0.2, -0.825); // TODO: uniform
    uv *= rotation(PI/3.*cos(PI/3.*length(uv)));
    float n = 256.;
    float i = atan(uv.y, uv.x) + PI;
    float cellID = floor(n * i / TAU);  
    float ang = cellID * (TAU/n) + PI/n;
    float tOff = fract(324.6*sin(46.7*cellID));  
    float rad = 0.1 + 1.5*fract(t + tOff);    
    float c = length(uv) * length(uv + vec2(rad *cos(ang),rad * sin(ang))) - .01;
    float w = 12.0/iResolution.y;
    col += length(uv)*smoothstep(w,-w, c);
    float alpha = dot(col, col);
    gl_FragColor = vec4(col,alpha) * vParticleColor;
}
