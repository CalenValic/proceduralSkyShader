import { device } from "../deviceInitialiser.js";
import { bindGroupManager, renderShaderManager, renderTargetManager } from "../managers.js";
//mip fog inspired by this talk https://advances.realtimerendering.com/other/2016/naughty_dog/NaughtyDog_TechArt_Final.pdf
const shaderModule = device.createShaderModule({
    code: `
struct uniformsStruct {
    cameraInverseViewMatrix: mat4x4f,
    cameraInverseProjectionMatrix: mat4x4f,
    fogColour: vec4f,
    skyboxColour: vec4f,
    cameraPosition: vec3f,
    fogNear: f32,
    fogFar: f32,
    fogMinHeight: f32,
    fogMaxHeight: f32,
    fogFade: f32
}

struct vertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) texcoord: vec2f,
    @location(1) skyboxClipSpacePos: vec3f
}

struct fragmentOutput {
    @location(0) colour: vec4f
}

@group(0) @binding(0) var textureSampler: sampler;
@group(0) @binding(1) var texture: texture_2d<f32>;
@group(0) @binding(2) var depthTexture: texture_depth_2d;
@group(0) @binding(3) var<uniform> uniforms: uniformsStruct;

@group(1) @binding(0) var skyboxTextureSampler: sampler;
@group(1) @binding(1) var skyboxTexture: texture_cube<f32>;

@vertex fn vertexMain(
    @builtin(vertex_index) index: u32
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
    var texcoord = vec2f((vertex.x + 1)/2, 1 - (vertex.y + 1)/2);

    var output: vertexShaderOutput;

    output.position = vec4f(vertex, 0.0, 1.0);
    output.texcoord = texcoord;
    output.skyboxClipSpacePos = vec3f(vertex.x, vertex.y, 0.0000001);
    return output;
}

@fragment fn fragmentMain(
    input: vertexShaderOutput
) -> fragmentOutput {
    var output: fragmentOutput;

    var textureDims = vec2f(textureDimensions(depthTexture));
    var depthTexcoord = vec2i(input.texcoord * textureDims);

    var colour = textureSample(texture, textureSampler, input.texcoord);
    var depth = textureLoad(depthTexture, depthTexcoord, 0);

    var z = depth;
    var clipTexcoord = input.texcoord * 2.0 - 1.0;
    clipTexcoord.y *= -1;

    var clipSpacePos = vec4f(clipTexcoord, z, 1.0);

    var viewSpacePos = uniforms.cameraInverseProjectionMatrix * clipSpacePos;
    viewSpacePos /= viewSpacePos.w;

    var worldSpacePos = (uniforms.cameraInverseViewMatrix * viewSpacePos).xyz;

    var distanceToPoint = length(worldSpacePos - uniforms.cameraPosition);

    var fogAmount = smoothstep(uniforms.fogNear, uniforms.fogFar, distanceToPoint);
    var heightAmount = 1.0 - smoothstep(uniforms.fogMinHeight, uniforms.fogMaxHeight, worldSpacePos.y);
    fogAmount *= heightAmount;

    var skyboxViewSpacePos = uniforms.cameraInverseProjectionMatrix * vec4f(input.skyboxClipSpacePos, 1.0);
    skyboxViewSpacePos /= skyboxViewSpacePos.w;

    var skyboxWorldSpacePos = (uniforms.cameraInverseViewMatrix * skyboxViewSpacePos).xyz;
    var worldSpaceNormal = skyboxWorldSpacePos - uniforms.cameraPosition;
    var skyboxDistance = length(worldSpaceNormal);
    worldSpaceNormal = normalize(worldSpaceNormal);

    var numMips = f32(textureNumLevels(skyboxTexture));

    var mipLevel = (distanceToPoint * uniforms.fogFade/skyboxDistance) * numMips;

    var skyboxSample = textureSampleLevel(skyboxTexture, skyboxTextureSampler, worldSpaceNormal, numMips - mipLevel);
    var skyboxColour = skyboxSample + (uniforms.skyboxColour * (1 - skyboxSample.a));

    var finalColour = mix(colour, skyboxColour, fogAmount);

    output.colour = finalColour;
    return output;
}
`
});
const shaderName = "fogRenderShader";
export const fogRenderShaderInfo = {
    loadPipeline: () => {
        const shader = renderShaderManager.getShader(shaderName);
        if (shader == undefined) {
            console.log(`Failed to get ${shaderName} in load bind groups`);
            return;
        }
        const fogRenderShaderBindGroupLayout = bindGroupManager.getLayout("fogRenderShaderBindGroupLayout");
        const textureCubeBindGroupLayout = bindGroupManager.getLayout("textureCubeBindGroupLayout");
        shader.renderPipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [
                    fogRenderShaderBindGroupLayout,
                    textureCubeBindGroupLayout
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
        const target = renderTargetManager.getRenderTarget(properties["target"]);
        target.colourAttachment.loadOp = loadOp;
        const renderPass = commandEncoder.beginRenderPass({
            label: `${shaderName} render pass`,
            colorAttachments: [target.colourAttachment]
        });
        renderPass.setPipeline(shader.renderPipeline);
        renderPass.setBindGroup(0, bindGroupManager.getGroup("fogRenderShaderBindGroup"));
        renderPass.setBindGroup(1, bindGroupManager.getGroup(`${properties["skyboxTexture"]}BindGroup`));
        renderPass.draw(6);
        renderPass.end();
    }
};
