import { WaterCup } from "@/types/WaterCup";
import { WaterCupIcons } from "@/constants/enums/WaterCupIcons.enum";

const DEFAULT_INTAKE_TARGET = 2500;
const DEFAULT_CUP = new WaterCup(200, WaterCupIcons.WineGlass, new Date());
const DEFAULT_CUP_SIZES = [
    new WaterCup(100, WaterCupIcons.Coffee, new Date()),
    DEFAULT_CUP,
    new WaterCup(300, WaterCupIcons.WineGlassAlt, new Date()),
    new WaterCup(400, WaterCupIcons.Flask, new Date()),
    new WaterCup(650, WaterCupIcons.Water, new Date())
  ];

export { DEFAULT_INTAKE_TARGET, DEFAULT_CUP, DEFAULT_CUP_SIZES };