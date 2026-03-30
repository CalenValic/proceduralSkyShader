import { hexToRGB } from "../../../helperFunctions.js";
import { fog, proceduralSkybox } from "../../../index.js";
import { UI } from "../../../ui.js";
export const addUIElements = async () => {
    UI.createElement("div", "document", "fileDiv", "container", {
        styles: {
            top: "0.1%",
            left: "0.1%",
            height: "4%",
            width: "99.8%",
            "background-color": "rgb(76, 76, 76)",
            "flex-direction": "row",
            "font-size": "12px",
            "z-index": "1"
        }
    });
    UI.createElement("div", "document", "levelEditDiv", "container", {
        styles: {
            "padding-top": "0.5%",
            "padding-left": "0.5%",
            top: "4.2%",
            right: "0.1%",
            height: "95.7%",
            width: "20%",
            "background-color": "rgb(76, 76, 76)",
            "flex-direction": "column",
            "row-gap": "2.5px",
            "z-index": "0",
        }
    });
    UI.createNumberInput("levelEditDiv", "fogNearInput", "defaultText singleLineText numberContainer labelBefore", "Fog Near:", 1, undefined, 1, (e) => {
        var input = e.target;
        fog.near = Number(input.value);
        if (fog.near >= fog.far) {
            fog.near = fog.far;
            input.value = String(fog.near);
        }
        UI.editText(`fogNearInputValue`, String(fog.near));
    });
    UI.createNumberInput("levelEditDiv", "fogFarInput", "defaultText singleLineText numberContainer labelBefore", "Fog Far:", 1, undefined, 1, (e) => {
        var input = e.target;
        fog.far = Number(input.value);
        if (fog.far <= fog.near) {
            fog.far = fog.near;
            input.value = String(fog.far);
        }
        UI.editText(`fogFarInputValue`, String(fog.far));
    });
    UI.createNumberInput("levelEditDiv", "fogMinHeightInput", "defaultText singleLineText numberContainer labelBefore", "Fog Min Height:", 1, undefined, 1, (e) => {
        var input = e.target;
        fog.minHeight = Number(input.value);
        if (fog.minHeight >= fog.maxHeight) {
            fog.minHeight = fog.maxHeight;
            input.value = String(fog.minHeight);
        }
        UI.editText(`fogMinHeightInputValue`, String(fog.minHeight));
    });
    UI.createNumberInput("levelEditDiv", "fogMaxHeightInput", "defaultText singleLineText numberContainer labelBefore", "Fog Max Height:", 1, undefined, 1, (e) => {
        var input = e.target;
        fog.maxHeight = Number(input.value);
        if (fog.maxHeight <= fog.minHeight) {
            fog.maxHeight = fog.minHeight;
            input.value = String(fog.maxHeight);
        }
        UI.editText(`fogMaxHeightInputValue`, String(fog.maxHeight));
    });
    UI.createRangeSlider("levelEditDiv", "fogFadeRange", "defaultText singleLineText rangeContainer labelBefore", "Fog Fade Strength:", 1, 10, 0.1, (e) => {
        var input = e.target;
        fog.fade = Number(input.value);
        UI.editText(`fogFadeRangeValue`, String(fog.fade));
    });
    UI.createColourPicker("levelEditDiv", "skyboxDayColour", "defaultText singleLineText colourContainer labelBefore", "Day:", (e) => {
        var input = e.target;
        var colour = hexToRGB(input.value);
        if (colour != null) {
            proceduralSkybox.dayColour = [colour.r / 255, colour.g / 255, colour.b / 255, 1.0];
        }
    });
    UI.createColourPicker("levelEditDiv", "skyboxNightColour", "defaultText singleLineText colourContainer labelBefore", "Night:", (e) => {
        var input = e.target;
        var colour = hexToRGB(input.value);
        if (colour != null) {
            proceduralSkybox.nightColour = [colour.r / 255, colour.g / 255, colour.b / 255, 1.0];
        }
    });
    UI.createColourPicker("levelEditDiv", "skyboxHorizonDayColour", "defaultText singleLineText colourContainer labelBefore", "Horizon Day:", (e) => {
        var input = e.target;
        var colour = hexToRGB(input.value);
        if (colour != null) {
            proceduralSkybox.dayHorizonColour = [colour.r / 255, colour.g / 255, colour.b / 255, 1.0];
        }
    });
    UI.createColourPicker("levelEditDiv", "skyboxHorizonNightColour", "defaultText singleLineText colourContainer labelBefore", "Horizon Night:", (e) => {
        var input = e.target;
        var colour = hexToRGB(input.value);
        if (colour != null) {
            proceduralSkybox.nightHorizonColour = [colour.r / 255, colour.g / 255, colour.b / 255, 1.0];
        }
    });
    UI.createRangeSlider("levelEditDiv", "horizonThicknessInput", "defaultText singleLineText rangeContainer labelBefore", "Horizon Size:", 0, 1, 0.01, (e) => {
        var input = e.target;
        proceduralSkybox.horizonThickness = Number(input.value);
        UI.editText(`horizonThicknessInputValue`, String(proceduralSkybox.horizonThickness));
    });
    UI.createColourPicker("levelEditDiv", "skyboxSunColour", "defaultText singleLineText colourContainer labelBefore", "Sun:", (e) => {
        var input = e.target;
        var colour = hexToRGB(input.value);
        if (colour != null) {
            proceduralSkybox.sunColour = [colour.r / 255, colour.g / 255, colour.b / 255, 1.0];
        }
    });
    UI.createNumberInput("levelEditDiv", "sunSpeedInput", "defaultText singleLineText numberContainer labelBefore", "Sun Speed:", undefined, undefined, 1, (e) => {
        var input = e.target;
        proceduralSkybox.sunSpeed = Number(input.value);
        UI.editText(`sunSpeedInputValue`, String(proceduralSkybox.sunSpeed));
    });
    UI.createRangeSlider("levelEditDiv", "sunAngleRange", "defaultText singleLineText rangeContainer labelBefore", "Sun Angle:", 0, 360, 1, (e) => {
        if (proceduralSkybox.sunSpeed == 0) {
            var input = e.target;
            proceduralSkybox.sunAngle = Number(input.value);
            UI.editText(`sunAngleRangeValue`, String(proceduralSkybox.sunAngle));
        }
    });
    UI.createRangeSlider("levelEditDiv", "sunRadiusRange", "defaultText singleLineText rangeContainer labelBefore", "Sun Radius:", 0, 1, 0.005, (e) => {
        var input = e.target;
        proceduralSkybox.sunRadius = Number(input.value);
        if (proceduralSkybox.sunRadius >= proceduralSkybox.sunGlowRadius) {
            proceduralSkybox.sunRadius = proceduralSkybox.sunGlowRadius;
            input.value = String(proceduralSkybox.sunRadius);
        }
        UI.editText(`sunRadiusRangeValue`, String(proceduralSkybox.sunRadius));
    });
    UI.createRangeSlider("levelEditDiv", "sunGlowRadiusRange", "defaultText singleLineText rangeContainer labelBefore", "Sun Glow Radius:", 0, 1, 0.005, (e) => {
        var input = e.target;
        proceduralSkybox.sunGlowRadius = Number(input.value);
        if (proceduralSkybox.sunGlowRadius <= proceduralSkybox.sunRadius) {
            proceduralSkybox.sunGlowRadius = proceduralSkybox.sunRadius;
            input.value = String(proceduralSkybox.sunGlowRadius);
        }
        UI.editText(`sunGlowRadiusRangeValue`, String(proceduralSkybox.sunGlowRadius));
    });
    UI.createNumberInput("levelEditDiv", "sunGlowSunsetMultiplier", "defaultText singleLineText numberContainer labelBefore", "Sunset Sun Glow:", 1, undefined, 0.1, (e) => {
        var input = e.target;
        proceduralSkybox.sunGlowSunsetMultiplier = Number(input.value);
        UI.editText(`sunGlowSunsetMultiplierValue`, String(proceduralSkybox.sunGlowSunsetMultiplier));
    });
    UI.createColourPicker("levelEditDiv", "skyboxSunsetColour", "defaultText singleLineText colourContainer labelBefore", "Sunset:", (e) => {
        var input = e.target;
        var colour = hexToRGB(input.value);
        if (colour != null) {
            proceduralSkybox.sunsetColour = [colour.r / 255, colour.g / 255, colour.b / 255, 1.0];
        }
    });
    UI.createNumberInput("levelEditDiv", "sunsetBloomInput", "defaultText singleLineText numberContainer labelBefore", "Sunset Bloom:", 0, undefined, 0.1, (e) => {
        var input = e.target;
        proceduralSkybox.sunsetBloom = Number(input.value);
        UI.editText(`sunsetBloomInputValue`, String(proceduralSkybox.sunsetBloom));
    });
    UI.createNumberInput("levelEditDiv", "windSpeedInput", "defaultText singleLineText numberContainer labelBefore", "Wind Speed:", undefined, undefined, 0.1, (e) => {
        var input = e.target;
        proceduralSkybox.windSpeed = Number(input.value);
        UI.editText(`windSpeedInputValue`, String(proceduralSkybox.windSpeed));
    });
    UI.createElement("div", "levelEditDiv", "windDirectionDiv", "defaultText singleLineText", {
        text: "Wind Direction:",
        styles: {
            display: "flex",
            "flex-direction": "row",
            "font-size": "12px",
            "align-items": "center",
            "justify-content": "end",
            "column-gap": "1.0vw",
            "outline": "none"
        }
    });
    UI.createElement("div", "windDirectionDiv", "windDirectionInputDiv", "defaultText singleLineText", {
        styles: {
            display: "flex",
            "flex-direction": "row",
            "min-width": "calc(55% + 4px)",
            "max-width": "calc(55% + 4px)",
            "justify-content": "space-between"
        }
    });
    UI.createNumberInput("windDirectionInputDiv", "windDirectionX", "defaultText singleLineText numberContainer labelBefore", "X:", undefined, undefined, 0.1, (e) => {
        var input = e.target;
        proceduralSkybox.windDirection.x = Number(input.value);
        UI.editText(`windDirectionXValue`, String(proceduralSkybox.windDirection.x));
    });
    UI.updateStyles("windDirectionXLabel", [["column-gap", "5px"], ["padding-left", "0px"], ["padding-right", "0px"], ["justify-content", "start"]]);
    UI.createNumberInput("windDirectionInputDiv", "windDirectionZ", "defaultText singleLineText numberContainer labelBefore", "Z:", undefined, undefined, 0.1, (e) => {
        var input = e.target;
        proceduralSkybox.windDirection.z = Number(input.value);
        UI.editText(`windDirectionZValue`, String(proceduralSkybox.windDirection.z));
    });
    UI.updateStyles("windDirectionZLabel", [["column-gap", "5px"], ["padding-left", "0px"]]);
    UI.createColourPicker("levelEditDiv", "cloudDayColour", "defaultText singleLineText colourContainer labelBefore", "Cloud Day:", (e) => {
        var input = e.target;
        var colour = hexToRGB(input.value);
        if (colour != null) {
            proceduralSkybox.dayCloudColour = [colour.r / 255, colour.g / 255, colour.b / 255, 1.0];
        }
    });
    UI.createColourPicker("levelEditDiv", "cloudNightColour", "defaultText singleLineText colourContainer labelBefore", "Cloud Night:", (e) => {
        var input = e.target;
        var colour = hexToRGB(input.value);
        if (colour != null) {
            proceduralSkybox.nightCloudColour = [colour.r / 255, colour.g / 255, colour.b / 255, 1.0];
        }
    });
    UI.createNumberInput("levelEditDiv", "cloudThicknessInput", "defaultText singleLineText numberContainer labelBefore", "Cloud Thickness:", 0, undefined, 0.1, (e) => {
        var input = e.target;
        proceduralSkybox.cloudThickness = Number(input.value);
        UI.editText(`cloudThicknessInputValue`, String(proceduralSkybox.cloudThickness));
    });
    UI.createRangeSlider("levelEditDiv", "cloudDistanceFadeRange", "defaultText singleLineText rangeContainer labelBefore", "Cloud Fade:", 0, 1, 0.1, (e) => {
        var input = e.target;
        proceduralSkybox.cloudDistanceFade = Number(input.value);
        UI.editText(`cloudDistanceFadeRangeValue`, String(proceduralSkybox.cloudDistanceFade));
    });
};
