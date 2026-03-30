import { device } from "../deviceInitialiser.js";
import { bindGroupManager, bufferManager, cameraManager, renderShaderManager, renderTargetManager } from "../managers.js";
import { vec3 } from "../vec3class.js";
const directions = [
    vec3.right,
    vec3.left,
    vec3.up,
    vec3.down,
    vec3.forward,
    vec3.backward
];
const upDirections = [
    vec3.up,
    vec3.up,
    vec3.backward,
    vec3.forward,
    vec3.up,
    vec3.up
];
const shaderModule = device.createShaderModule({
    code: `
struct cameraStruct {
    inverseViewMatrix: mat4x4f,
    inverseProjectionMatrix: mat4x4f
}

struct skyboxStruct {
    dayColour: vec4f,
    nightColour: vec4f,
    dayHorizonColour: vec4f,
    nightHorizonColour: vec4f,
    dayCloudColour: vec4f,
    nightCloudColour: vec4f,
    sunsetColour: vec4f,
    sunColour: vec4f,
    sunDirection: vec3f,
    windOffset: f32,
    windDirection: vec2f,
    cloudThickness: f32,
    cloudDistanceFade: f32,
    sunRadius: f32,
    sunGlowRadius: f32,
    sunGlowSunsetMultiplier: f32,
    sunsetBloom: f32,
    horizonThickness: f32,
    time: f32
}

struct vertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) clipSpacePos: vec3f,
    @location(1) @interpolate(flat) cubeFaceIndex: u32,
}

struct fragmentOutput {
    @location(0) colour: vec4f
}

@group(0) @binding(0) var<uniform> cameras: array<cameraStruct, 6>;
@group(0) @binding(1) var<uniform> skybox: skyboxStruct;

@group(1) @binding(0) var cloudNoiseTextureSampler: sampler;
@group(1) @binding(1) var cloudNoiseTexture: texture_2d<f32>;

@vertex fn vertexMain(
    @builtin(vertex_index) index: u32,
    @builtin(instance_index) faceIndex: u32
) -> vertexShaderOutput {
    var quad = array(
        vec2f(-1, -1),
        vec2f(-1, 1),
        vec2f(1, -1),
        vec2f(1, -1),
        vec2f(-1, 1),
        vec2f(1, 1)
    );

    var vertex = quad[index];

    var output: vertexShaderOutput;

    output.position = vec4f(vertex, 0.0, 1.0);
    output.clipSpacePos = vec3f(vertex.x, vertex.y, 0.0000001);
    output.cubeFaceIndex = faceIndex;
    return output;
}

@fragment fn fragmentMain(
    input: vertexShaderOutput
) -> fragmentOutput {
    var output: fragmentOutput;

    var camera = cameras[input.cubeFaceIndex];
    var viewSpacePos = camera.inverseProjectionMatrix * vec4f(input.clipSpacePos, 1.0);
    viewSpacePos /= viewSpacePos.w;

    var normal = normalize((camera.inverseViewMatrix * viewSpacePos).xyz);

    var sunDot = dot(skybox.sunDirection, normal);

    var sunToHorizon = 1.0 - abs(skybox.sunDirection.y);
    var toHorizon = 1.0 - abs(normal.y);
    var toSun = saturate(sunDot);
    var sunsetFactor = sunToHorizon * toHorizon * toSun;

    var horizonFactor = pow(abs(normal.y), skybox.horizonThickness);

    var nightFactor = (skybox.sunDirection.y + 1.0) / 2.0;

    var horizonColour = mix(skybox.nightHorizonColour, skybox.dayHorizonColour, nightFactor);
    horizonColour = mix(horizonColour, skybox.sunsetColour, sunsetFactor);
    
    var skyColour = mix(skybox.nightColour, skybox.dayColour, nightFactor);
    skyColour = mix(horizonColour, skyColour, horizonFactor);

    var sunRadius = 1.0 - skybox.sunRadius * skybox.sunRadius;
    var sunsetGlowFactor = mix(1.0, skybox.sunGlowSunsetMultiplier, sunsetFactor);
    var sunGlowRadius = skybox.sunGlowRadius * sunsetGlowFactor;
    sunGlowRadius = 1.0 - sunGlowRadius * sunGlowRadius;

    var sunFactor = step(sunRadius, sunDot);
    var sunGlowFactor = smoothstep(sunGlowRadius, sunRadius, sunDot);
    var sunBloomFactor = smoothstep(sunGlowRadius, 1.0, sunDot) * 1.0;
    sunFactor = max(sunFactor, sunGlowFactor);
    
    var sunColour = mix(skybox.sunColour, skybox.sunsetColour, sunsetFactor);
    sunColour = mix(sunColour, skybox.sunColour, sunFactor);

    sunFactor += sunBloomFactor + skybox.sunsetBloom * sunsetFactor;
    
    skyColour = mix(skyColour, sunColour, sunFactor);

    var skyUV = normal.xz/normal.y;

    skyUV += skybox.windDirection * skybox.windOffset;

    var packedCloudNoise = textureSample(cloudNoiseTexture, cloudNoiseTextureSampler, skyUV / 10.0);

    var cloudNoise = (packedCloudNoise.r + packedCloudNoise.g) - (packedCloudNoise.b + packedCloudNoise.a);
    cloudNoise = saturate(cloudNoise * skybox.cloudThickness) * smoothstep(0.0, skybox.cloudDistanceFade, normal.y);

    var cloudColour = mix(skybox.nightCloudColour, skybox.dayCloudColour, nightFactor);

    cloudColour = mix(cloudColour, skybox.sunColour, saturate(sunDot * nightFactor));
    cloudColour = mix(cloudColour, horizonColour, saturate(sunToHorizon * toHorizon));

    var finalColour = mix(skyColour, cloudColour, cloudNoise);

    output.colour = finalColour;
    return output;
}
`
});
const shaderName = "proceduralSkyboxRenderShader";
export const proceduralSkyboxRenderShaderInfo = {
    loadPipeline: () => {
        const shader = renderShaderManager.getShader(shaderName);
        const proceduralSkyboxRenderShaderBindGroupLayout = bindGroupManager.getLayout("proceduralSkyboxRenderShaderBindGroupLayout");
        const textureBindGroupLayout = bindGroupManager.getLayout("textureBindGroupLayout");
        shader.renderPipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [
                    proceduralSkyboxRenderShaderBindGroupLayout,
                    textureBindGroupLayout
                ]
            }),
            vertex: {
                module: shaderModule,
                entryPoint: "vertexMain",
                buffers: []
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fragmentMain",
                targets: [
                    {
                        format: "bgra8unorm",
                        blend: {
                            color: {
                                operation: "add",
                                srcFactor: "one",
                                dstFactor: "one-minus-src-alpha"
                            },
                            alpha: {
                                operation: "add",
                                srcFactor: "one",
                                dstFactor: "one-minus-src-alpha"
                            }
                        }
                    }
                ]
            },
            primitive: {
                topology: "triangle-list"
            }
        });
    },
    render: (commandEncoder, loadOp, properties) => {
        const shader = renderShaderManager.getShader(shaderName);
        const skyboxCamera = cameraManager.getCamera("skyboxCamera");
        const proceduralSkyboxRenderShaderCameraUniforms = bufferManager.getBuffer("proceduralSkyboxRenderShaderCameraUniforms");
        proceduralSkyboxRenderShaderCameraUniforms.reset();
        skyboxCamera.position.xyz = [0, 0, 0];
        for (var i = 0; i < 6; i++) {
            skyboxCamera.rotation.lookAt(skyboxCamera.position, directions[i], upDirections[i]);
            skyboxCamera.updateMatrices();
            proceduralSkyboxRenderShaderCameraUniforms.addToBuffer([...skyboxCamera.inverseViewMatrix.value, ...skyboxCamera.inverseProjectionMatrix.value]);
        }
        proceduralSkyboxRenderShaderCameraUniforms.write();
        const target = renderTargetManager.getRenderTarget("proceduralSkyboxRenderTarget");
        for (var i = 0; i < 6; i++) {
            target.colourAttachment = {
                view: target.texture.createView({
                    dimension: "2d",
                    baseMipLevel: 0,
                    mipLevelCount: 1,
                    baseArrayLayer: i,
                    arrayLayerCount: 1
                }),
                loadOp: "clear",
                storeOp: "store"
            };
            const renderPass = commandEncoder.beginRenderPass({
                label: `${shaderName} render pass`,
                colorAttachments: [target.colourAttachment]
            });
            renderPass.setPipeline(shader.renderPipeline);
            renderPass.setBindGroup(0, bindGroupManager.getGroup("proceduralSkyboxRenderShaderBindGroup"));
            renderPass.setBindGroup(1, bindGroupManager.getGroup(`${properties["cloudNoiseTexture"]}BindGroup`));
            renderPass.draw(6, 1, 0, i);
            renderPass.end();
        }
    }
};
