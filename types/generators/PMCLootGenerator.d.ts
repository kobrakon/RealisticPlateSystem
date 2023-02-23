import { ItemHelper } from "../helpers/ItemHelper";
import { ITemplateItem } from "../models/eft/common/tables/ITemplateItem";
import { IBotConfig } from "../models/spt/config/IBotConfig";
import { ConfigServer } from "../servers/ConfigServer";
import { DatabaseServer } from "../servers/DatabaseServer";
import { ItemFilterService } from "../services/ItemFilterService";
import { SeasonalEventService } from "../services/SeasonalEventService";
/**
 * Handle the generation of dynamic PMC loot in pockets and backpacks
 * and the removal of blacklisted items
 */
export declare class PMCLootGenerator {
    protected itemHelper: ItemHelper;
    protected databaseServer: DatabaseServer;
    protected configServer: ConfigServer;
    protected itemFilterService: ItemFilterService;
    protected seasonalEventService: SeasonalEventService;
    protected pocketLootPool: string[];
    protected vestLootPool: string[];
    protected backpackLootPool: string[];
    protected botConfig: IBotConfig;
    constructor(itemHelper: ItemHelper, databaseServer: DatabaseServer, configServer: ConfigServer, itemFilterService: ItemFilterService, seasonalEventService: SeasonalEventService);
    /**
     * Create an array of loot items a PMC can have in their pockets
     * @returns string array of tpls
     */
    generatePMCPocketLootPool(): string[];
    /**
     * Create an array of loot items a PMC can have in their vests
     * @returns string array of tpls
     */
    generatePMCVestLootPool(): string[];
    /**
     * Check if item has a width/hide that lets it fit into a 1x2 slot
     * 1x1 / 1x2 / 2x1
     * @param item Item to check size of
     * @returns true if it fits
     */
    protected itemFitsInto1By2Slot(item: ITemplateItem): boolean;
    /**
     * Create an array of loot items a PMC can have in their backpack
     * @returns string array of tpls
     */
    generatePMCBackpackLootPool(): string[];
}
