import { textureManager, meshManager, modelManager } from "./managers.js";
export const loadResources = async () => {
    // const meshes = await window.fs.readDir("../resources/meshes");
    // const models = await window.fs.readDir("../resources/models");
    await textureManager.addTexture("transparentTexture", ["../resources/textures/transparentTexture.png"], "bgra8unorm", "2d", true, true);
    await textureManager.addTexture("defaultTexture", ["../resources/textures/defaultTexture.png"], "bgra8unorm", "2d", true, true);
    await textureManager.addTexture("boneTexture", ["../resources/textures/boneTexture.png"], "bgra8unorm", "2d", true, true);
    await textureManager.addTexture("testImportTexture", ["../resources/textures/testImportTexture.png"], "bgra8unorm", "2d", true, true);
    await textureManager.addTexture("textExportTexture", ["../resources/textures/textExportTexture.png"], "bgra8unorm", "2d", true, true);
    await textureManager.addTexture("rockTexture", ["../resources/textures/rockTexture.png"], "bgra8unorm", "2d", true, true);
    await textureManager.addTexture("rock1Texture", ["../resources/textures/rock1Texture.png"], "bgra8unorm", "2d", true, true);
    await textureManager.addTexture("cloudNoiseTexture", ["../resources/textures/cloudNoiseTexture.png"], "bgra8unorm", "2d", false, true);
    await textureManager.addTexture("skyboxTexture", [
        "../resources/textures/skybox_px.png",
        "../resources/textures/skybox_nx.png",
        "../resources/textures/skybox_py.png",
        "../resources/textures/skybox_ny.png",
        "../resources/textures/skybox_pz.png",
        "../resources/textures/skybox_nz.png"
    ], "bgra8unorm", "cube", true, true);
    await textureManager.addTexture("skyboxDuskTexture", [
        "../resources/textures/skyboxdusk_px.png",
        "../resources/textures/skyboxdusk_nx.png",
        "../resources/textures/skyboxdusk_py.png",
        "../resources/textures/skyboxdusk_ny.png",
        "../resources/textures/skyboxdusk_pz.png",
        "../resources/textures/skyboxdusk_nz.png"
    ], "bgra8unorm", "cube", true, true);
    await textureManager.addTexture("skyboxNightTexture", [
        "../resources/textures/skyboxnight_px.png",
        "../resources/textures/skyboxnight_nx.png",
        "../resources/textures/skyboxnight_py.png",
        "../resources/textures/skyboxnight_ny.png",
        "../resources/textures/skyboxnight_pz.png",
        "../resources/textures/skyboxnight_nz.png"
    ], "bgra8unorm", "cube", true, true);
    await textureManager.addTexture("transparentSkyboxTexture", [
        "../resources/textures/transparentTexture.png",
        "../resources/textures/transparentTexture.png",
        "../resources/textures/transparentTexture.png",
        "../resources/textures/transparentTexture.png",
        "../resources/textures/transparentTexture.png",
        "../resources/textures/transparentTexture.png"
    ], "bgra8unorm", "cube", true, true);
    await meshManager.addMesh("arrowMesh", "../resources/meshes/arrowMesh.msh");
    await meshManager.addMesh("cubeMesh", "../resources/meshes/cubeMesh.msh");
    await meshManager.addMesh("doubleSidedQuadMesh", "../resources/meshes/doubleSidedQuadMesh.msh");
    await meshManager.addMesh("offsetCubeMesh", "../resources/meshes/offsetCubeMesh.msh");
    await meshManager.addMesh("quadMesh", "../resources/meshes/quadMesh.msh");
    await meshManager.addMesh("rotatorMesh", "../resources/meshes/rotatorMesh.msh");
    await modelManager.addModel("arrowModel", "../resources/models/arrowModel.mdl");
    await modelManager.addModel("cubeModel", "../resources/models/cubeModel.mdl");
    await modelManager.addModel("doubleSidedQuadModel", "../resources/models/doubleSidedQuadModel.mdl");
    await modelManager.addModel("quadModel", "../resources/models/quadModel.mdl");
    await modelManager.addModel("rotatorModel", "../resources/models/rotatorModel.mdl");
    await modelManager.addModel("shadedCubeModel", "../resources/models/shadedCubeModel.mdl");
    await modelManager.addModel("shadedTransparentCubeModel", "../resources/models/shadedTransparentCubeModel.mdl");
    await modelManager.addModel("transparentCubeModel", "../resources/models/transparentCubeModel.mdl");
    // for (var meshName of meshes) {
    //     if (meshName == ".DS_Store") {continue}
    //     await meshManager.addMesh(meshName.split(".")[0], `../resources/meshes/${meshName}`)
    // }
    // for (var modelName of models) {
    //     if (modelName == ".DS_Store") {continue}
    //     await modelManager.addModel(modelName.split(".")[0], `../resources/models/${modelName}`)
    // }
};
