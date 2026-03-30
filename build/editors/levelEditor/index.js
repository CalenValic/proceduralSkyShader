import { loadStylesheet } from "../../helperFunctions.js";
import { fog, proceduralSkybox, resolution } from "../../index.js";
import { bufferManager, cameraManager, entityManager, layerManager, renderTargetManager, windowManager } from "../../managers.js";
import { UI } from "../../ui.js";
import { vec3 } from "../../vec3class.js";
import { addUIElements } from "./scripts/addUIElements.js";
import { cameraController } from "./scripts/cameraController.js";
import { loadLevelEditor } from "./scripts/loadLevelEditor.js";
import { render } from "./scripts/render.js";
export const levelEditorInit = async () => {
    fog.near = 1;
    fog.far = 5000;
    fog.minHeight = 1;
    fog.maxHeight = 10000;
    await addUIElements();
    loadStylesheet("../resources/styles/editorStyles.css");
    var mainWindow = windowManager.getWindow("mainWindow");
    mainWindow.setWindow([0.0015, 0.042], 0.797, 0.957, 0);
    var mainCamera = cameraManager.getCamera("mainCamera");
    mainCamera.position.xyz = [0, 100, 0];
    mainCamera.rotation.lookAt(mainCamera.position, new vec3(1000, 0, 0), vec3.up);
    var axisCamera = cameraManager.addCamera("axisCamera", [1, 1, 1], 90, 16 / 9, 0.01);
    var v = mainCamera.rotation.vectorMultiply(new vec3(0, 0, -1));
    axisCamera.position.xyz = v.multiply(10000).xyz;
    axisCamera.fov = 0.1;
    axisCamera.rotation.lookAt(axisCamera.position, vec3.zero, vec3.up);
    axisCamera.updateMatrices();
    var axisWindow = windowManager.addWindow("axisWindow", [0.73, 0.05], 0.07, 0.11, 1, "axisCamera");
    renderTargetManager.addRenderTarget("axisRenderTarget", [...resolution, 1], [0, 0, 0, 0], "bgra8unorm", { create: true, layout: "textureBindGroupLayout" }, { depthEnabled: true, dimensions: "2d" });
    layerManager.addLayer("axisLayer", "axisRenderTarget", 0);
    axisWindow.addLayers(["axisLayer"]);
    var axisLinesBuffer = bufferManager.addBuffer("axisLinesBuffer", 10, 3, {
        type: "float32",
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    const xAxis = [
        0, 0, 0,
        0.75, 0, 0,
        1, 0, 0,
        0.05
    ];
    const yAxis = [
        0, 0, 0,
        0, 0.75, 0,
        0, 1, 0,
        0.05
    ];
    const zAxis = [
        0, 0, 0,
        0, 0, 0.75,
        0, 0, 1,
        0.05
    ];
    axisLinesBuffer.addToBuffer(xAxis);
    axisLinesBuffer.addToBuffer(yAxis);
    axisLinesBuffer.addToBuffer(zAxis);
    axisLinesBuffer.write();
    var ground = entityManager.addEntity("ground", "mainLayer", "quadModel", [[0.6, 0.4, 0.3, 1]], [0]);
    ground.transformNodes[0].local.translation.xyz = [0, 0, 0];
    ground.transformNodes[0].local.rotation.lookAt(vec3.zero, vec3.up, vec3.forward);
    ground.transformNodes[0].local.scale.xyz = [10000, 10000, 1];
    // var cube = entityManager.addEntity("cube", "mainLayer", "cubeModel", [[1, 1, 1, 1]], [0])
    // cube.transformNodes[0].local.translation.xyz = [0, 5, 0]
    // cube.transformNodes[0].local.rotation.lookAt(vec3.zero, vec3.up, vec3.forward)
    // cube.transformNodes[0].local.scale.xyz = [1, 1, 10]
    // var cube1 = entityManager.addEntity("cube1", "mainLayer", "cubeModel", [[0.3, 0.4, 0.6, 1]], [0])
    // cube1.transformNodes[0].local.translation.xyz = [5000, 0, 0]
    // cube1.transformNodes[0].local.rotation.lookAt(vec3.zero, new vec3(0, 0, 1), vec3.up)
    // cube1.transformNodes[0].local.scale.xyz = [10, 1000, 2000]
    var cube2 = entityManager.addEntity("cube2", "mainLayer", "cubeModel", [[0.6, 0.4, 0.2, 1]], [0]);
    cube2.transformNodes[0].local.translation.xyz = [5000, 0, 3000];
    cube2.transformNodes[0].local.rotation.lookAt(vec3.zero, new vec3(1, 0, -1), vec3.up);
    cube2.transformNodes[0].local.scale.xyz = [10, 1500, 2000];
    var cube3 = entityManager.addEntity("cube3", "mainLayer", "cubeModel", [[0.2, 0.6, 0.3, 1]], [0]);
    cube3.transformNodes[0].local.translation.xyz = [5000, 0, -3000];
    cube3.transformNodes[0].local.rotation.lookAt(vec3.zero, new vec3(1, 0, 1), vec3.up);
    cube3.transformNodes[0].local.scale.xyz = [10, 3000, 2500];
    // var cube4 = entityManager.addEntity("cube4", "mainLayer", "cubeModel", [[0.2, 0.2, 0.2, 1]], [0])
    // cube4.transformNodes[0].local.translation.xyz = [10000, 0, 0]
    // cube4.transformNodes[0].local.rotation.lookAt(vec3.zero, new vec3(0, 0, 1), vec3.up)
    // cube4.transformNodes[0].local.scale.xyz = [10, 7000, 15000]
    loadLevelEditor();
};
export const levelEditorUpdate = (dt) => {
    cameraController();
    render();
    var sunAngleRangeInput = document.getElementById("sunAngleRange");
    if (sunAngleRangeInput != undefined && proceduralSkybox.sunSpeed != 0) {
        sunAngleRangeInput.value = String(proceduralSkybox.sunAngle);
        UI.editText("sunAngleRangeValue", String(Math.round(proceduralSkybox.sunAngle)));
    }
};
