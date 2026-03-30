import { resolution } from "../../../index.js";
import { device } from "../../../deviceInitialiser.js";
import { renderShaderManager, renderTargetManager } from "../../../managers.js";
var proceduralSkyboxCommandEncoders = [];
export const render = () => {
    const entityRenderShader = renderShaderManager.getShader("entityRenderShader");
    const transparentEntityRenderShader = renderShaderManager.getShader("transparentEntityRenderShader");
    const shadedEntityRenderShader = renderShaderManager.getShader("shadedEntityRenderShader");
    const shadedTransparentEntityRenderShader = renderShaderManager.getShader("shadedTransparentEntityRenderShader");
    const windowRenderShader = renderShaderManager.getShader("windowRenderShader");
    const lines3dRenderShader = renderShaderManager.getShader("lines3dRenderShader");
    const linesConstantSize3dRenderShader = renderShaderManager.getShader("linesConstantSize3dRenderShader");
    const cubesConstantSizeRenderShader = renderShaderManager.getShader("cubesConstantSizeRenderShader");
    const fogRenderShader = renderShaderManager.getShader("fogRenderShader");
    const skyboxRenderShader = renderShaderManager.getShader("skyboxRenderShader");
    const proceduralSkyboxRenderShader = renderShaderManager.getShader("proceduralSkyboxRenderShader");
    const generateProceduralSkyboxMipMapsRenderShader = renderShaderManager.getShader("generateProceduralSkyboxMipMapsRenderShader");
    const commandEncoder = device.createCommandEncoder();
    entityRenderShader.render(commandEncoder, "clear", {
        camera: "mainCamera",
        layer: "mainLayer"
    });
    shadedEntityRenderShader.render(commandEncoder, "load", {
        camera: "mainCamera",
        layer: "mainLayer"
    });
    lines3dRenderShader.render(commandEncoder, "clear", {
        camera: "axisCamera",
        target: "axisRenderTarget",
        buffer: "axisLinesBuffer"
    });
    proceduralSkyboxRenderShader.render(commandEncoder, "clear", {
        cloudNoiseTexture: "cloudNoiseTexture"
    });
    generateProceduralSkyboxMipMapsRenderShader.render(commandEncoder, "clear", {});
    var skyboxTexture = "proceduralSkyboxRenderTarget";
    skyboxRenderShader.render(commandEncoder, "load", {
        target: "mainRenderTarget",
        skyboxTexture: skyboxTexture
    });
    fogRenderShader.render(commandEncoder, "clear", {
        target: "finalRenderTarget",
        skyboxTexture: skyboxTexture
    });
    var mainRenderTarget = renderTargetManager.getRenderTarget("mainRenderTarget");
    var finalRenderTarget = renderTargetManager.getRenderTarget("finalRenderTarget");
    commandEncoder.copyTextureToTexture({
        texture: finalRenderTarget.texture
    }, {
        texture: mainRenderTarget.texture
    }, resolution);
    transparentEntityRenderShader.render(commandEncoder, "load", {
        camera: "mainCamera",
        layer: "mainLayer"
    });
    shadedTransparentEntityRenderShader.render(commandEncoder, "load", {
        camera: "mainCamera",
        layer: "mainLayer"
    });
    windowRenderShader.render(commandEncoder, "clear", {});
    device.queue.submit([commandEncoder.finish()]);
};
