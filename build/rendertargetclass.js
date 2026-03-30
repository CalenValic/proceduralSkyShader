import { device } from "./deviceInitialiser.js";
import { numMipLevels } from "./helperFunctions.js";
export class renderTarget {
    name;
    size;
    clearValue;
    depthEnabled;
    mipsEnabled;
    dimension;
    texture;
    textureView;
    colourAttachment;
    depthTexture;
    depthTextureView;
    depthStencilAttachment;
    constructor(name, size, clearValue, format, options) {
        this.name = name;
        this.size = size;
        this.clearValue = clearValue;
        this.depthEnabled = options?.depthEnabled;
        this.mipsEnabled = options?.mipsEnabled;
        this.dimension = options?.dimensions ? options?.dimensions : "2d";
        this.texture = device.createTexture({
            label: `${this.name} render target texture`,
            format: format,
            size: this.size,
            mipLevelCount: this.mipsEnabled ? numMipLevels(size[0], size[1]) : 1,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.textureView = this.texture.createView({ dimension: this.dimension });
        this.colourAttachment = {
            view: this.textureView,
            loadOp: "clear",
            clearValue: this.clearValue,
            storeOp: "store"
        };
        if (this.depthEnabled) {
            this.depthTexture = device.createTexture({
                label: `${this.name} render target depth texture`,
                format: "depth24plus",
                size: this.size,
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
            });
            this.depthTextureView = this.depthTexture.createView({ dimension: this.dimension });
            this.depthStencilAttachment = {
                view: this.depthTextureView,
                depthClearValue: 0.0,
                depthLoadOp: "clear",
                depthStoreOp: "store"
            };
        }
    }
}
