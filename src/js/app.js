import Alpine from "alpinejs";
import resources from "./alpine/resources.js";

Alpine.data("resources", resources);

window.Alpine = Alpine;

window.Alpine.start();
