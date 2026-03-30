import { device } from "../deviceInitialiser.js";
import { bindGroupManager, renderShaderManager, renderTargetManager } from "../managers.js";
const shaderModule = device.createShaderModule({
    code: `
struct uniformsStruct {
    cameraInverseViewMatrix: mat4x4f,
    cameraInverseProjectionMatrix: mat4x4f,
    colour: vec4f,
    cameraPosition: vec3f
}

struct vertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) clipSpacePos: vec3f
}

struct fragmentOutput {
    @location(0) colour: vec4f
}

@group(0) @binding(0) var<uniform> skybox: uniformsStruct;

@group(1) @binding(0) var textureSampler: sampler;
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

    var output: vertexShaderOutput;

    output.position = vec4f(vertex, 0.0, 1.0);
    output.clipSpacePos = vec3f(vertex.x, vertex.y, 0.0000001);
    return output;
}

@fragment fn fragmentMain(
    input: vertexShaderOutput
) -> fragmentOutput {
    var output: fragmentOutput;

    var viewSpacePos = skybox.cameraInverseProjectionMatrix * vec4f(input.clipSpacePos, 1.0);
    viewSpacePos /= viewSpacePos.w;

    var worldSpacePos = (skybox.cameraInverseViewMatrix * viewSpacePos).xyz;

    var worldSpaceNormal = normalize(worldSpacePos - skybox.cameraPosition);

    var skyboxSample = textureSample(skyboxTexture, textureSampler, worldSpaceNormal);

    var colour = skyboxSample + (skybox.colour * (1 - skyboxSample.a));

    output.colour = colour;
    return output;
}
`
});
const shaderName = "skyboxRenderShader";
export const skyboxRenderShaderInfo = {
    loadPipeline: () => {
        const shader = renderShaderManager.getShader(shaderName);
        if (shader == undefined) {
            console.log(`Failed to get ${shaderName} in load bind groups`);
            return;
        }
        const skyboxRenderShaderBindGroupLayout = bindGroupManager.getLayout("skyboxRenderShaderBindGroupLayout");
        const textureCubeBindGroupLayout = bindGroupManager.getLayout("textureCubeBindGroupLayout");
        shader.renderPipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [
                    skyboxRenderShaderBindGroupLayout,
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
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: "greater-equal",
                format: "depth24plus"
            },
        });
    },
    render: (commandEncoder, loadOp, properties) => {
        const shader = renderShaderManager.getShader(shaderName);
        const target = renderTargetManager.getRenderTarget(properties["target"]);
        target.colourAttachment.loadOp = loadOp;
        if (target.depthStencilAttachment == undefined) {
            return;
        }
        const renderPass = commandEncoder.beginRenderPass({
            label: `${shaderName} render pass`,
            colorAttachments: [target.colourAttachment],
            depthStencilAttachment: target.depthStencilAttachment
        });
        renderPass.setPipeline(shader.renderPipeline);
        renderPass.setBindGroup(0, bindGroupManager.getGroup("skyboxRenderShaderBindGroup"));
        renderPass.setBindGroup(1, bindGroupManager.getGroup(`${properties["skyboxTexture"]}BindGroup`));
        renderPass.draw(6);
        renderPass.end();
    }
};
