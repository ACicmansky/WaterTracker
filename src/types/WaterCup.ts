import { WaterCupIcons } from "@/constants/enums/WaterCupIcons.enum";

export class WaterCup {
    size: number = 0;
    icon: WaterCupIcons = WaterCupIcons.Glass;
    date: Date = new Date();

    constructor(size: number, icon: WaterCupIcons, date: Date) {
        this.size = size;
        this.icon = icon;
        this.date = date;
    }

    compareWithoutDate(other: WaterCup): boolean {
        return this.size === other.size && this.icon === other.icon;
    }

    compare(other: WaterCup): boolean {
        return this.compareWithoutDate(other) && this.date.getTime() === other.date.getTime();
    }
}