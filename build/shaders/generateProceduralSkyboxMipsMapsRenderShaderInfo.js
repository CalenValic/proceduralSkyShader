import { device, sampler } from "../deviceInitialiser.js";
import { bindGroupManager, renderShaderManager, renderTargetManager, textureManager } from "../managers.js";
const shaderModule = device.createShaderModule({
    code: `
struct vertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) texcoord: vec2f
}

struct fragmentOutput {
    @location(0) colour: vec4f
}

@group(0) @binding(0) var textureSampler: sampler;
@group(0) @binding(1) var texture: texture_2d<f32>;

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
    output.texcoord = vec2f((vertex.x + 1)/2, 1 - (vertex.y + 1)/2);
    return output;
}

@fragment fn fragmentMain(
    input: vertexShaderOutput
) -> fragmentOutput {
    var output: fragmentOutput;

    output.colour = textureSample(texture, textureSampler, input.texcoord);
    return output;
}
`
});
const shaderName = "generateProceduralSkyboxMipMapsRenderShader";
export const generateProceduralSkyboxMipMapsRenderShaderInfo = {
    loadPipeline: () => {
        const shader = renderShaderManager.getShader(shaderName);
        if (shader == undefined) {
            console.log(`Failed to get ${shaderName} in load bind groups`);
            return;
        }
        const textureBindGroupLayout = bindGroupManager.getLayout("textureBindGroupLayout");
        shader.renderPipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [
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
                        format: "bgra8unorm"
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
        // const textureBindGroupLayout = bindGroupManager.getLayout("textureBindGroupLayout")
        var texture = renderTargetManager.getRenderTarget("proceduralSkyboxRenderTarget").texture;
        for (var baseMipLevel = 1; baseMipLevel < texture.mipLevelCount; baseMipLevel++) {
            for (var layer = 0; layer < texture.depthOrArrayLayers; layer++) {
                const bindGroup = bindGroupManager.getGroup(`proceduralSkyboxRenderTargetMip${baseMipLevel}Layer${layer}`);
                const renderPass = commandEncoder.beginRenderPass({
                    colorAttachments: [
                        {
                            view: texture.createView({
                                dimension: "2d",
                                baseMipLevel: baseMipLevel,
                                mipLevelCount: 1,
                                baseArrayLayer: layer,
                                arrayLayerCount: 1
                            }),
                            loadOp: "clear",
                            storeOp: "store"
                        }
                    ],
                });
                renderPass.setPipeline(shader.renderPipeline);
                renderPass.setBindGroup(0, bindGroup);
                renderPass.draw(6);
                renderPass.end();
            }
        }
    }
};
