import { device } from "./deviceInitialiser.js";
import { numMipLevels } from "./helperFunctions.js";
export class texture {
    async #copyExternalTextures() {
        var firstImage = await this.#loadImageBitmap(this.urls[0]);
        var imageTexture = device.createTexture({
            label: `${this.name} Texture`,
            format: this.format,
            size: [firstImage.width, firstImage.height, this.urls.length],
            mipLevelCount: numMipLevels(firstImage.width, firstImage.height),
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        });
        for (var i = 0; i < this.urls.length; i++) {
            var imageBitmap = await this.#loadImageBitmap(this.urls[i]);
            device.queue.copyExternalImageToTexture({ source: imageBitmap, flipY: false }, { texture: imageTexture, origin: [0, 0, i], premultipliedAlpha: this.premultiplied }, { width: imageBitmap.width, height: imageBitmap.height });
        }
        this.texture = imageTexture;
        this.view = imageTexture.createView({ dimension: this.dimension });
    }
    async #loadImageBitmap(url) {
        const res = await fetch(url);
        const blob = await res.blob();
        return await createImageBitmap(blob, { colorSpaceConversion: 'none' });
    }
    name;
    urls;
    format;
    dimension;
    premultiplied;
    texture;
    view;
    constructor(name, urls, format, dimension, premultiply) {
        this.name = name;
        this.urls = urls;
        this.format = format;
        this.dimension = dimension;
        this.premultiplied = premultiply;
    }
    async load() {
        await this.#copyExternalTextures();
    }
}
