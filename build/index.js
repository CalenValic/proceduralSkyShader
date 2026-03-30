import { bindGroupManager, bufferManager, cameraManager, canvasManager, entityManager, layerManager, meshManager, renderShaderManager, renderTargetManager, textureManager, windowManager } from "./managers.js";
import { user } from "./user.js";
import { levelEditorInit, levelEditorUpdate } from "./editors/levelEditor/index.js";
import { loadResources } from "./resources.js";
import { shadedEntityRenderShaderInfo } from "./shaders/shadedEntityRenderShaderInfo.js";
import { shadedTransparentEntityRenderShaderInfo } from "./shaders/shadedTransparentEntityRenderShaderInfo.js";
import { entityRenderShaderInfo } from "./shaders/entityRenderShaderInfo.js";
import { transparentEntityRenderShaderInfo } from "./shaders/transparentEntityRenderShaderInfo.js";
import { windowRenderShaderInfo } from "./shaders/windowRenderShaderInfo.js";
import { lines3dRenderShaderInfo } from "./shaders/lines3dRenderShaderInfo.js";
import { linesConstantSize3dRenderShaderInfo } from "./shaders/linesConstantSize3dRenderShaderInfo.js";
import { cubesConstantSizeRenderShaderInfo } from "./shaders/cubesConstantSizeRenderShaderInfo.js";
import { fogRenderShaderInfo } from "./shaders/fogRenderShaderInfo.js";
import { gridRenderShaderInfo } from "./shaders/gridRenderShaderInfo.js";
import { device, sampler } from "./deviceInitialiser.js";
import { skyboxRenderShaderInfo } from "./shaders/skyboxRenderShaderInfo.js";
import { generateMipMapsRenderShaderInfo } from "./shaders/generateMipsMapsRenderShaderInfo.js";
import { proceduralSkyboxRenderShaderInfo } from "./shaders/proceduralSkyboxRenderShaderInfo.js";
import { generateProceduralSkyboxMipMapsRenderShaderInfo } from "./shaders/generateProceduralSkyboxMipsMapsRenderShaderInfo.js";
import { vec3 } from "./vec3class.js";
import { quaternion } from "./quaternionclass.js";
import { UI } from "./ui.js";
import { modulo } from "./helperFunctions.js";
var previousElapsedTime = 0;
var elapsedTime = 0;
var timeSinceLastFrame = 0;
document.onvisibilitychange = e => {
    if (!document.hidden) {
        elapsedTime = previousElapsedTime = e.timeStamp;
    }
};
// const settings: {
//     currentEditor: "meshEditor" | "modelEditor"
// } = JSON.parse(await window.fs.readFile("../resources/settings/engineSettings.json", "utf8"))
const resolutionScale = 120;
export const resolution = [16 * resolutionScale, 9 * resolutionScale];
export const fog = {
    near: 10,
    far: 100,
    minHeight: 0,
    maxHeight: 10,
    fade: 5,
    colour: [0.2, 0.2, 0.2, 1]
};
export const skybox = {
    colour: [0.2, 0.2, 0.2, 1]
};
const sunDirection = new vec3(0, 1, 0).normalise();
const rotatedSunDirection = new vec3();
const sunRotation = new quaternion();
// [1.0, 0.97, 0.9, 1.0],
export const proceduralSkybox = {
    dayColour: [0.35, 0.55, 0.85, 1.0],
    nightColour: [0.05, 0.0, 0.06, 1.0],
    dayHorizonColour: [0.85, 0.95, 1, 1.0],
    nightHorizonColour: [0.227, 0.172, 0.267, 1.0],
    dayCloudColour: [0.9, 0.9, 0.9, 1.0],
    nightCloudColour: [0.1, 0.1, 0.15, 1.0],
    sunsetColour: [1.0, 0.34, 0.17, 1.0],
    sunColour: [1.0, 1.0, 1.0, 1.0],
    sunSpeed: 0,
    sunAngle: 45,
    windSpeed: 0.3,
    windOffset: 0,
    windDirection: new vec3(1, 0, 1),
    normalisedWindDirection: new vec3(),
    cloudThickness: 1.5,
    cloudDistanceFade: 0.1,
    sunRadius: 0.02,
    sunGlowRadius: 0.06,
    sunGlowSunsetMultiplier: 2,
    sunsetBloom: 2,
    horizonThickness: 0.2,
    time: 0
};
async function init() {
    const textureBindGroupLayout = bindGroupManager.addLayout("textureBindGroupLayout", device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} }
        ]
    }));
    bindGroupManager.addLayout("textureCubeBindGroupLayout", device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { viewDimension: "cube" } }
        ]
    }));
    bindGroupManager.addLayout("cameraBindGroupLayout", device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {} },
        ]
    }));
    bindGroupManager.addLayout("windowBindGroupLayout", device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {} },
        ]
    }));
    bindGroupManager.addLayout("uintTextureBindGroupLayout", device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: "uint" } }
        ]
    }));
    bindGroupManager.addLayout("fragBufferBindGroupLayout", device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: {} },
        ]
    }));
    bindGroupManager.addLayout("vertBufferBindGroupLayout", device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {} },
        ]
    }));
    bindGroupManager.addLayout("vertFragBufferBindGroupLayout", device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {} },
        ]
    }));
    await loadResources();
    const generateMipMapsRenderShader = renderShaderManager.addShader("generateMipMapsRenderShader", generateMipMapsRenderShaderInfo);
    const commandEncoder = device.createCommandEncoder();
    generateMipMapsRenderShader.render(commandEncoder, "clear", {});
    device.queue.submit([commandEncoder.finish()]);
    const mainCanvas = canvasManager.addCanvas("mainCanvas", [0.1, 0.1, 0.1, 1], 1920, 1080, true);
    mainCanvas.element.width = window.innerWidth;
    mainCanvas.element.height = window.innerHeight;
    const mainCamera = cameraManager.addCamera("mainCamera", [3, 3, 3], 90, 16 / 9, 0.01);
    cameraManager.addCamera("skyboxCamera", [3, 3, 3], 90, 1 / 1, 0.01);
    const mainWindow = windowManager.addWindow("mainWindow", [0, 0], 1, 1, 0, "mainCamera");
    const mainRenderTarget = renderTargetManager.addRenderTarget("mainRenderTarget", [...resolution, 1], [0, 0, 0, 0], "bgra8unorm", { create: true, layout: "textureBindGroupLayout" }, { depthEnabled: true, dimensions: "2d" });
    renderTargetManager.addRenderTarget("finalRenderTarget", [...resolution, 1], [1, 1, 1, 1], "bgra8unorm", { create: false }, { dimensions: "2d" });
    layerManager.addLayer("mainLayer", "mainRenderTarget", 0);
    mainWindow.addLayers(["mainLayer"]);
    var fogRenderShaderUniforms = bufferManager.addBuffer("fogRenderShaderUniforms", 48, 1, { type: "float32", usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    fogRenderShaderUniforms.addToBuffer([
        ...mainCamera.inverseViewMatrix.value,
        ...mainCamera.inverseProjectionMatrix.value,
        ...fog.colour,
        ...skybox.colour,
        ...mainCamera.position.xyz,
        fog.near,
        fog.far,
        fog.minHeight,
        fog.maxHeight,
        fog.fade
    ]);
    fogRenderShaderUniforms.write();
    bindGroupManager.addLayout("fogRenderShaderBindGroupLayout", device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
            { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: "depth" } },
            { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: {} }
        ]
    }));
    bindGroupManager.addGroup("fogRenderShaderBindGroup", device.createBindGroup({
        layout: bindGroupManager.getLayout("fogRenderShaderBindGroupLayout"),
        entries: [
            {
                binding: 0,
                resource: sampler
            },
            {
                binding: 1,
                resource: mainRenderTarget.textureView
            },
            {
                binding: 2,
                resource: mainRenderTarget.depthTextureView
            },
            {
                binding: 3,
                resource: { buffer: fogRenderShaderUniforms.buffer }
            }
        ]
    }));
    var fogUniforms = bufferManager.addBuffer("fogUniforms", 12, 1, { type: "float32", usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    fogUniforms.addToBuffer([...fog.colour, ...skybox.colour, fog.near, fog.far, fog.minHeight, fog.maxHeight]);
    fogUniforms.write();
    bindGroupManager.addGroup("fogUniformsBindGroup", device.createBindGroup({
        layout: bindGroupManager.getLayout("fragBufferBindGroupLayout"),
        entries: [
            {
                binding: 0,
                resource: { buffer: fogUniforms.buffer }
            }
        ]
    }));
    bindGroupManager.addLayout("skyboxRenderShaderBindGroupLayout", device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: {} }
        ]
    }));
    var skyboxRenderShaderUniforms = bufferManager.addBuffer("skyboxRenderShaderUniforms", 40, 1, { type: "float32", usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    skyboxRenderShaderUniforms.addToBuffer([
        ...mainCamera.inverseViewMatrix.value,
        ...mainCamera.inverseProjectionMatrix.value,
        ...skybox.colour,
        ...mainCamera.position.value
    ]);
    skyboxRenderShaderUniforms.write();
    bindGroupManager.addGroup("skyboxRenderShaderBindGroup", device.createBindGroup({
        layout: bindGroupManager.getLayout("skyboxRenderShaderBindGroupLayout"),
        entries: [
            {
                binding: 0,
                resource: { buffer: skyboxRenderShaderUniforms.buffer }
            }
        ]
    }));
    const proceduralSkyboxRenderTarget = renderTargetManager.addRenderTarget("proceduralSkyboxRenderTarget", [512, 512, 6], [1, 1, 1, 1], "bgra8unorm", { create: true, layout: "textureCubeBindGroupLayout" }, { mipsEnabled: true, dimensions: "cube" });
    for (var baseMipLevel = 1; baseMipLevel < proceduralSkyboxRenderTarget.texture.mipLevelCount; baseMipLevel++) {
        for (var layer = 0; layer < proceduralSkyboxRenderTarget.texture.depthOrArrayLayers; layer++) {
            bindGroupManager.addGroup(`proceduralSkyboxRenderTargetMip${baseMipLevel}Layer${layer}`, device.createBindGroup({
                layout: textureBindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: sampler
                    },
                    {
                        binding: 1,
                        resource: proceduralSkyboxRenderTarget.texture.createView({
                            dimension: "2d",
                            baseMipLevel: baseMipLevel - 1,
                            mipLevelCount: 1,
                            baseArrayLayer: layer,
                            arrayLayerCount: 1
                        })
                    }
                ]
            }));
        }
    }
    bindGroupManager.addLayout("proceduralSkyboxRenderShaderBindGroupLayout", device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: {} },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: {} }
        ]
    }));
    var proceduralSkyboxRenderShaderCameraUniforms = bufferManager.addBuffer("proceduralSkyboxRenderShaderCameraUniforms", 32, 6, { type: "float32", usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    var proceduralSkyboxRenderShaderUniforms = bufferManager.addBuffer("proceduralSkyboxRenderShaderUniforms", 48, 1, { type: "float32", usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    bindGroupManager.addGroup("proceduralSkyboxRenderShaderBindGroup", device.createBindGroup({
        layout: bindGroupManager.getLayout("proceduralSkyboxRenderShaderBindGroupLayout"),
        entries: [
            {
                binding: 0,
                resource: { buffer: proceduralSkyboxRenderShaderCameraUniforms.buffer }
            },
            {
                binding: 1,
                resource: { buffer: proceduralSkyboxRenderShaderUniforms.buffer }
            }
        ]
    }));
    renderShaderManager.addShader("shadedEntityRenderShader", shadedEntityRenderShaderInfo);
    renderShaderManager.addShader("shadedTransparentEntityRenderShader", shadedTransparentEntityRenderShaderInfo);
    renderShaderManager.addShader("entityRenderShader", entityRenderShaderInfo);
    renderShaderManager.addShader("transparentEntityRenderShader", transparentEntityRenderShaderInfo);
    renderShaderManager.addShader("windowRenderShader", windowRenderShaderInfo);
    renderShaderManager.addShader("lines3dRenderShader", lines3dRenderShaderInfo);
    renderShaderManager.addShader("linesConstantSize3dRenderShader", linesConstantSize3dRenderShaderInfo);
    renderShaderManager.addShader("cubesConstantSizeRenderShader", cubesConstantSizeRenderShaderInfo);
    renderShaderManager.addShader("fogRenderShader", fogRenderShaderInfo);
    renderShaderManager.addShader("gridRenderShader", gridRenderShaderInfo);
    renderShaderManager.addShader("skyboxRenderShader", skyboxRenderShaderInfo);
    renderShaderManager.addShader("proceduralSkyboxRenderShader", proceduralSkyboxRenderShaderInfo);
    renderShaderManager.addShader("generateProceduralSkyboxMipMapsRenderShader", generateProceduralSkyboxMipMapsRenderShaderInfo);
    // await meshEditorInit()
    await levelEditorInit();
    // switch (settings.currentEditor) {
    //     case "meshEditor":
    //         await meshEditorInit()
    //     break
    //     case "modelEditor":
    //         await modelEditorInit()
    //     break
    // }
}
function anim(timestamp) {
    previousElapsedTime = elapsedTime;
    elapsedTime = timestamp;
    timeSinceLastFrame = Math.max(0, elapsedTime - previousElapsedTime) / 1000;
    user.updateEvents();
    var mainCanvas = canvasManager.getCanvas("mainCanvas");
    if (mainCanvas.element.width != window.innerWidth) {
        mainCanvas.element.width = window.innerWidth;
    }
    if (mainCanvas.element.height != window.innerHeight) {
        mainCanvas.element.height = window.innerHeight;
    }
    mainCanvas.texture = mainCanvas.context.getCurrentTexture();
    mainCanvas.view = mainCanvas.texture.createView();
    mainCanvas.colourAttachment = {
        view: mainCanvas.view,
        loadOp: "clear",
        clearValue: mainCanvas.clearValue,
        storeOp: "store"
    };
    // if (user.checkEvents(["ShiftLeft", "KeyB"]) && !clock.timers.has("saveCanvas")) {
    //     mainCanvas.element.toBlob(async (blob) => {
    //         const buffer = await blob!.bytes()
    //         window.fs.writeFile("./textures/textExportTexture.png", buffer, "binary")
    //     }, "image/png", 1)
    //     pressedKey = false
    //     console.log("Canvas Saved")
    //     clock.addTimer("saveCanvas", 0.5)
    // }
    for (var cameraID in cameraManager.cameras) {
        var camera = cameraManager.cameras[cameraID];
        camera.updateMatrices();
    }
    for (var windowID in windowManager.windows) {
        var screenWindow = windowManager.windows[windowID];
        screenWindow.updateMouseRay();
    }
    for (var entityID in entityManager.entities) {
        var entity = entityManager.entities[entityID];
        entity.updateTransformNodes(0);
        entity.updateHitboxes();
        entity.renderHitboxes();
    }
    var totalMeshInstances = 0;
    for (var layerID in layerManager.layers) {
        var layer = layerManager.layers[layerID];
        totalMeshInstances += layer.updateMeshInstances(totalMeshInstances);
    }
    device.queue.writeBuffer(meshManager.meshesBuffer, 0, meshManager.meshesBufferData.buffer, 0, totalMeshInstances * meshManager.meshInstanceBufferSize * 4);
    user.updateHoveredEntity();
    const mainCamera = cameraManager.getCamera("mainCamera");
    var fogRenderShaderUniforms = bufferManager.getBuffer("fogRenderShaderUniforms");
    fogRenderShaderUniforms.reset();
    fogRenderShaderUniforms.addToBuffer([
        ...mainCamera.inverseViewMatrix.value,
        ...mainCamera.inverseProjectionMatrix.value,
        ...fog.colour,
        ...skybox.colour,
        ...mainCamera.position.xyz,
        fog.near,
        fog.far,
        fog.minHeight,
        fog.maxHeight,
        fog.fade
    ]);
    fogRenderShaderUniforms.write();
    var fogUniforms = bufferManager.getBuffer("fogUniforms");
    fogUniforms.reset();
    fogUniforms.addToBuffer([
        ...fog.colour,
        fog.near,
        fog.far,
        fog.minHeight,
        fog.maxHeight
    ]);
    fogUniforms.write();
    var skyboxRenderShaderUniforms = bufferManager.getBuffer("skyboxRenderShaderUniforms");
    skyboxRenderShaderUniforms.reset();
    skyboxRenderShaderUniforms.addToBuffer([
        ...mainCamera.inverseViewMatrix.value,
        ...mainCamera.inverseProjectionMatrix.value,
        ...skybox.colour,
        ...mainCamera.position.value
    ]);
    skyboxRenderShaderUniforms.write();
    if (proceduralSkybox.sunSpeed != 0) {
        proceduralSkybox.sunAngle += proceduralSkybox.sunSpeed * timeSinceLastFrame;
        proceduralSkybox.sunAngle = modulo(proceduralSkybox.sunAngle, 360);
    }
    sunRotation.setAxisAngle(vec3.backward, proceduralSkybox.sunAngle);
    sunRotation.vectorMultiply(sunDirection, rotatedSunDirection);
    proceduralSkybox.windOffset += proceduralSkybox.windSpeed * timeSinceLastFrame;
    vec3.normalise(proceduralSkybox.windDirection, proceduralSkybox.normalisedWindDirection);
    // mainCamera.position.xyz = [-10, 10, 0]
    // mainCamera.rotation.lookAt(vec3.zero, rotatedSunDirection, vec3.up)
    var proceduralSkyboxRenderShaderUniforms = bufferManager.getBuffer("proceduralSkyboxRenderShaderUniforms");
    proceduralSkyboxRenderShaderUniforms.reset();
    proceduralSkyboxRenderShaderUniforms.addToBuffer([
        ...proceduralSkybox.dayColour,
        ...proceduralSkybox.nightColour,
        ...proceduralSkybox.dayHorizonColour,
        ...proceduralSkybox.nightHorizonColour,
        ...proceduralSkybox.dayCloudColour,
        ...proceduralSkybox.nightCloudColour,
        ...proceduralSkybox.sunsetColour,
        ...proceduralSkybox.sunColour,
        ...rotatedSunDirection.xyz,
        proceduralSkybox.windOffset,
        ...[proceduralSkybox.normalisedWindDirection.x, proceduralSkybox.normalisedWindDirection.z],
        proceduralSkybox.cloudThickness,
        proceduralSkybox.cloudDistanceFade,
        proceduralSkybox.sunRadius,
        proceduralSkybox.sunGlowRadius,
        proceduralSkybox.sunGlowSunsetMultiplier,
        proceduralSkybox.sunsetBloom,
        proceduralSkybox.horizonThickness,
        elapsedTime
    ]);
    proceduralSkyboxRenderShaderUniforms.write();
    // meshEditorUpdate(timeSinceLastFrame)
    levelEditorUpdate(timeSinceLastFrame);
    // switch (settings.currentEditor) {
    //     case "meshEditor":
    //         meshEditorUpdate(timeSinceLastFrame)
    //     break
    //     case "modelEditor":
    //         modelEditorUpdate()
    //     break
    // }
    user.resetEvents();
    requestAnimationFrame(anim);
}
await init();
requestAnimationFrame(anim);
window.cameraManager = cameraManager;
