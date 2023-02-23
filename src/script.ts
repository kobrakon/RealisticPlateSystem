import { DependencyContainer } from "tsyringe";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { ILocaleBase } from "@spt-aki/models/spt/server/ILocaleBase";
import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";

let Logger: ILogger;
let database: IDatabaseTables;
let jsonUtil: JsonUtil;
let items: Record<string, ITemplateItem>;
let convertedCarriers = [] as string[];
let Plates = [] as string[];
let stomachPlates = [] as string[];
let armPlates = [] as string[];
let scavPlates = [] as string[];
let scavStomachPlates = [] as string[];
let scavArmPlates = [] as string[]; // shouldn't spawn with them but jic
let locales: ILocaleBase;

const config = require("../config.json") as IConfig;
const weightRetainPer = config.GenerationConfig.VestWeightRetainPercent / 100;

class plates implements IPostDBLoadMod
{
    public postDBLoad(container: DependencyContainer) : void
    {
        Logger = container.resolve<ILogger>("WinstonLogger");
        database = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        jsonUtil = container.resolve<JsonUtil>("JsonUtil");
        items = database.templates.items;
        locales = database.locales;

        Logger.info("[K-RPS] Generating stuffs");
        try
        {
            this.createHandbookCat();
            this.createPlates();
            this.tweakCarriers();
            this.createContainer();
            
        } catch(e)
        {
            Logger.error(`[K-RPS] Unable to generate, exception thrown => ${e}`);
        }
        finally
        {
            Logger.info("[K-RPS] Done Generating");
        }
    }

    public createHandbookCat() : void // meow
    {
        database.templates.handbook.Categories.push(
        {
            "Id": "plate_category",
            "ParentId": "5b47574386f77428ca22b33f",
            "Icon": "/files/handbook/icon_gear_components.png",
            "Color": "",
            "Order": "100"
        });

        locales.global["en"]["plate_category"] = "Armor Plates";
    }

    public createContainer() : void
    {
        let plateContainer = jsonUtil.clone(items["59fb042886f7746c5005a7b2"]);
        plateContainer._id = "plateContainer";
        plateContainer._props.Height = 3;
        plateContainer._props.Weight = 2.25;
        plateContainer._props.Prefab.path = "assets/content/items/spec/item_spec_armorrepair/item_spec_armorrepair.bundle";
        plateContainer._props.ItemSound = "spec_armorrep";
        plateContainer._props.Grids[0]._props.filters[0].Filter = Plates.concat(stomachPlates, armPlates);

        items["plateContainer"] = plateContainer
            
        locales.global["en"]["plateContainer Name"] = "Ballistic Plate Storage Bag";
        locales.global["en"]["plateContainer ShortName"] = "Plate Bag";
        locales.global["en"]["plateContainer Description"] = "A large, durable carry bag meant for easy storing and moving of multiple armor plates. Used commonly by military forces for rapid deployment and access of replacement ballistic plates for soldiers in combat zones.";

        database.templates.handbook.Items.push(
            {
                "Id": "plateContainer",
                "ParentId": "5b5f6fa186f77409407a7eb7",
                "Price": 350000,
            }
        );
    }
    
    public createPlates() : void
    {
        for (let material in database.globals.config.ArmorMaterials)
        {
            if (material == "Glass") continue; // glass plate? lel
            for (let i = 1; i != (config.GenerationConfig.MaxClass + 1); i++)
            {
                let loyalLevel = i < 4 ? 0 : i == 4 ? 1 : i == 5 ? 2 : 3; // yo heard you love ternary conditional operators
                let materialMult = material == "UHMWPE" || material == "Aramid" ? 1 : material == "Ceramic" || material == "Aluminum" || material == "Titan" || material == "Combined" ? 1.15 : 1.3;
                let materialPenaltyMult = material == "UHMWPE" || material == "Aramid" ? 1 : material == "Ceramic" || material == "Aluminum" || material == "Titan" || material == "Combined" ? 2 : 3;
                let bluntMat = material == "Aramid" ? 0.4 : 0.2; // soft armor does body ouchies
                let materialNoise = material == "Aramid" ? "gear_armor" : material == "UHMWPE" || material == "Combined" ? "gear_helmet" : "container_metal";
                if (armPlates.length != config.GenerationConfig.MaxClass)
                {
                    let armPlate = jsonUtil.clone(items["5648a7494bdc2d9d488b4583"]);
                    armPlate._id = `plate${i}Arms`;
                    armPlate._parent = "57bef4c42459772e8d35a53b";
                    armPlate._props.Prefab.path = "assets/item_equipment_armorplate_arm.bundle";
                    armPlate._props.ItemSound = "gear_armor";
                    armPlate._props.Width = 2;
                    armPlate._props.Height = 2;
                    armPlate._props.Weight *= i * 0.2;
                    armPlate._props.armorClass = i;
                    armPlate._props.armorZone = [ "LeftArm", "RightArm" ];
                    armPlate._props.Durability = 35;
                    armPlate._props.MaxDurability = 35;
                    armPlate._props.ArmorMaterial = "Aramid";
                    armPlate._props.speedPenaltyPercent = i * -0.5;
                    armPlate._props.mousePenalty = i * -0.25;
                    armPlate._props.weaponErgonomicPenalty = i * -0.5;
                    armPlate._props.ArmorType = i > 4 ? "Heavy" : "Light";
                    items[`plate${i}Arms`] = armPlate
                
                    locales.global["en"][`plate${i}Arms Name`] = `Class ${i} Ballistic Arm Inserts`;
                    locales.global["en"][`plate${i}Arms ShortName`] = `L${i} Inserts`;
                    locales.global["en"][`plate${i}Arms Description`] = `Multi-hit Kevlar inserts of level ${i} protection designed to protect the upper arms / shoulders of the wearer.`;

                    database.templates.handbook.Items.push(
                        {
                            "Id": `plate${i}Arms`,
                            "ParentId": "plate_category",
                            "Price": 10548 * i
                        }
                    );

                    database.traders["5ac3b934156ae10c4430e83c"].assort.items.push(
                        {
                            "_id": `plate${i}Arms`,
                            "_tpl": `plate${i}Arms`,
                            "parentId": "hideout",
                            "slotId": "hideout",
                            "upd": {
                                "StackObjectsCount": 99999999,
                                "UnlimitedCount": true
                            }
                        }
                    );

                    database.traders["5ac3b934156ae10c4430e83c"].assort.barter_scheme[`plate${i}Arms`] =
                    [
                        [{
                            _tpl: "5449016a4bdc2d6f028b456f",
                            count: 10548 * i
                        }]
                    ];

                    database.traders["5ac3b934156ae10c4430e83c"].assort.loyal_level_items[armPlate._id] = loyalLevel;

                    if (i <= config.BotGenConfig.MaxScavPlateLevel) scavArmPlates.push(armPlate._id);
                    armPlates.push(armPlate._id);
                }

                let armorPlate = jsonUtil.clone(items["5648a7494bdc2d9d488b4583"]);
                armorPlate._id = `plate${i}Chest${material == "ArmoredSteel" ? "" : material}`; // put nothing for steel so legacy plates are still compatable
                armorPlate._parent = "57bef4c42459772e8d35a53b";
                armorPlate._props.Prefab.path = "assets/item_equipment_armorplate_chest.bundle";
                armorPlate._props.ItemSound = materialNoise;
                armorPlate._props.Height = 3;
                armorPlate._props.Width = 3;
                armorPlate._props.Weight *= i * materialMult * 0.35;
                armorPlate._props.armorClass = i;
                armorPlate._props.armorZone = [ "Chest" ];
                armorPlate._props.Durability = 65;
                armorPlate._props.MaxDurability = 65;
                armorPlate._props.ArmorMaterial = material;
                armorPlate._props.speedPenaltyPercent = i * -0.5 * materialPenaltyMult;
                armorPlate._props.mousePenalty = i * -0.25 * materialPenaltyMult;
                armorPlate._props.weaponErgonomicPenalty = i * -0.5 * materialPenaltyMult;
                armorPlate._props.BluntThroughput = bluntMat;
                armorPlate._props.ArmorType = i > 4 ? "Heavy" : "Light";
                items[armorPlate._id] = armorPlate

                locales.global["en"][`${armorPlate._id} Name`] = `Class ${i} ${material == "ArmoredSteel" ? "Steel" : material} Ballistic Plate`;
                locales.global["en"][`${armorPlate._id} ShortName`] = `L${i} Plate`;
                locales.global["en"][`${armorPlate._id} Description`] = `${material == "ArmoredSteel" ? "Steel" : material} multi-hit ballistic plate of level ${i} protection designed for use in a plate carrier to protect the vitals.`;

                database.templates.handbook.Items.push(
                    {
                        "Id": armorPlate._id,
                        "ParentId": "plate_category",
                        "Price": 15500 * i
                    }
                );

                database.traders["5ac3b934156ae10c4430e83c"].assort.items.push(
                    {
                        "_id": armorPlate._id,
                        "_tpl": armorPlate._id,
                        "parentId": "hideout",
                        "slotId": "hideout",
                        "upd": {
                            "StackObjectsCount": 99999999,
                            "UnlimitedCount": true
                        }
                    }
                );

                database.traders["5ac3b934156ae10c4430e83c"].assort.barter_scheme[armorPlate._id] =
                [
                    [{
                        _tpl: "5449016a4bdc2d6f028b456f",
                        count: 15500 * i
                    }]
                ];

                database.traders["5ac3b934156ae10c4430e83c"].assort.loyal_level_items[armorPlate._id] = loyalLevel;

                if (i <= config.BotGenConfig.MaxScavPlateLevel) scavPlates.push(armorPlate._id);
                Plates.push(armorPlate._id);

                let stomachPlate = jsonUtil.clone(items["5648a7494bdc2d9d488b4583"]);
                stomachPlate._id = `plate${i}Stomach${material == "ArmoredSteel" ? "" : material}`;
                stomachPlate._parent = "57bef4c42459772e8d35a53b";
                stomachPlate._props.Prefab.path = "assets/item_equipment_armorplate_stomach.bundle";
                stomachPlate._props.ItemSound = materialNoise;
                stomachPlate._props.Height = 2;
                stomachPlate._props.Width = 3;
                stomachPlate._props.Weight *= i * materialMult * 0.35;
                stomachPlate._props.armorClass = i;
                stomachPlate._props.armorZone = [ "Stomach" ];
                stomachPlate._props.Durability = 35;
                stomachPlate._props.MaxDurability = 35;
                stomachPlate._props.ArmorMaterial = material;
                stomachPlate._props.speedPenaltyPercent = i * -0.3 * materialPenaltyMult;
                stomachPlate._props.mousePenalty = i * -0.12 * materialPenaltyMult;
                stomachPlate._props.weaponErgonomicPenalty = i * -0.25 * materialPenaltyMult;
                stomachPlate._props.BluntThroughput = bluntMat;
                stomachPlate._props.ArmorType = i > 4 ? "Heavy" : "Light";
                items[stomachPlate._id] = stomachPlate

                locales.global["en"][`${stomachPlate._id} Name`] = `Class ${i} ${material == "ArmoredSteel" ? "Steel" : material} Stomach Plate`;
                locales.global["en"][`${stomachPlate._id} ShortName`] = `L${i} S. Plate`;
                locales.global["en"][`${stomachPlate._id} Description`] = `${material == "ArmoredSteel" ? "Steel" : material} multi-hit ballistic plate of level ${i} protection designed as an additive for plate carriers to also protect the stomach, that is, if the carrier is large enough to fit it.`;

                database.templates.handbook.Items.push(
                    {
                        "Id": stomachPlate._id,
                        "ParentId": "plate_category",
                        "Price": 12400 * i
                    }
                );

                database.traders["5ac3b934156ae10c4430e83c"].assort.items.push(
                    {
                        "_id": stomachPlate._id,
                        "_tpl": stomachPlate._id,
                        "parentId": "hideout",
                        "slotId": "hideout",
                        "upd": {
                            "StackObjectsCount": 99999999,
                            "UnlimitedCount": true
                        }
                    }
                );

                database.traders["5ac3b934156ae10c4430e83c"].assort.barter_scheme[stomachPlate._id] = 
                [
                    [{
                        _tpl: "5449016a4bdc2d6f028b456f",
                        count: 12400 * i
                    }]
                ]

                database.traders["5ac3b934156ae10c4430e83c"].assort.loyal_level_items[stomachPlate._id] = loyalLevel;

                if (i <= config.BotGenConfig.MaxScavPlateLevel) scavStomachPlates.push(stomachPlate._id);
                stomachPlates.push(stomachPlate._id);
            }
        }
    }

    public tweakCarriers() : void
    {
        Object.values(items).forEach(item => 
        {
            if (item._parent == "5448e5284bdc2dcb718b4567" && item._props.armorClass > 0 || item._parent == "5448e54d4bdc2dcc718b4568" && item._props.armorClass > 0)
            {
                if (config.GenerationConfig.IgnoreIntegratedArmors && item._props.ArmorMaterial == "Aramid")
                    return;

                Logger.info(`[K-RPS] Tweaked ${item._id}`);
                let hasArms = item._props.armorZone.includes("LeftArm");
                let isSmallBoi = !item._props.armorZone.includes("Stomach");
                item._props.armorZone = [];
                item._props.Weight *= weightRetainPer;
                item._props.Durability = 1;
                item._props.MaxDurability = 1;
                item._props.armorClass = 0;
                item._props.speedPenaltyPercent = 0;
                item._props.mousePenalty = 0;
                item._props.weaponErgonomicPenalty = 0;
                item._props.BluntThroughput = 0;
                item._props.MergesWithChildren = false;
                item._props.Slots = [
                {
                    "_name": "mod_equipment",
                    "_id":`${item._id}_mainPlateSlot`,
                    "_parent": item._id,
                    "_props": 
                    {
                        "filters": 
                        [
                            {
                                "Filter": Plates
                            }
                        ]
                    },
                    "_required": false,
                    "_mergeSlotWithChildren": true,
                    _proto: "55d30c4c4bdc2db4468b457e"
                }];
                
                if (!isSmallBoi) item._props.Slots.push(
                {
                    "_name": "mod_equipment_000",
                    "_id": `${item._id}_mainStomachPlateSlot`,
                    "_parent": item._id,
                    "_props": {
                        "filters": [
                            {
                                "Filter": stomachPlates
                            }
                        ]
                    },
                    "_required": false,
                    "_mergeSlotWithChildren": true,
                    _proto: "55d30c4c4bdc2db4468b457e"
                });

                if (hasArms) item._props.Slots.push(
                {
                    "_name": "mod_equipment_001",
                    "_id": `${item._id}_mainArmPlateSlot`,
                    "_parent": item._id,
                    "_props": 
                    {
                        "filters":
                        [
                            {
                                "Filter": armPlates
                            }
                        ]
                    },
                    "_required": false,
                    "_mergeSlotWithChildren": true,
                    _proto: "55d30c4c4bdc2db4468b457e"
                });

                let price = database.templates.prices[item._id];
                price ??= Object.values(database.templates.handbook.Items).find(a => a.Id == item._id).Price;

                price = ((price * 0.2).toString().split(".")[0]) as unknown as number;

                convertedCarriers.push(item._id); 

                Object.values(database.templates.handbook.Items).find(a => a.Id == item._id).Price = price;

                Logger.debug(`[DEBUG] ${item._id} price is ${database.templates.prices[item._id]} in prices.json and ${Object.values(database.templates.handbook.Items).find(a => a.Id == item._id).Price} in handbook`)
                for (let trader in database.traders) 
                {
                    if (database.traders[trader].assort == undefined)
                        continue;

                    let index = database.traders[trader].assort.items.findIndex(entry => entry._tpl == item._id);

                    if (trader != "ragfair" && index != -1)
                    {
                        let id = database.traders[trader].assort.items[index]._id;
                        database.traders[trader].assort.barter_scheme[id][0][0].count *= 0.2;
                    }
                }
                
                Object.values(database.bots.types).forEach(bot =>
                {
                    let isScav = bot.appearance.body["5cc2e59214c02e000f16684e"] != null;
                    let isBoss = bot.lastName.length == 0; // bosses don't have last names
                    bot.chances.mods.mod_equipment = isBoss ? config.BotGenConfig.BossChestPlateChance : config.BotGenConfig.BaseChestPlateChance;
                    bot.chances.mods.mod_equipment_000 = isBoss ? config.BotGenConfig.BossStomachPlateChance : config.BotGenConfig.BaseStomachPlateChance;
                    bot.chances.mods.mod_equipment_001 = isBoss ? config.BotGenConfig.BossArmPlateChance : config.BotGenConfig.BaseArmPlateChance;
                    bot.inventory.mods[item._id] = { "mod_equipment": isScav ? scavPlates : Plates };
                    if (!isSmallBoi) bot.inventory.mods[item._id] = { "mod_equipment": isScav ? scavPlates : Plates, "mod_equipment_000": isScav ? scavStomachPlates : stomachPlates };
                    if (hasArms) bot.inventory.mods[item._id] = { "mod_equipment": isScav ? scavPlates : Plates, "mod_equipment_000": isScav ? scavStomachPlates : stomachPlates, "mod_equipment_001": isScav ? scavArmPlates : armPlates };
                    // cuz osprey is a little bitch
                    if (hasArms && isSmallBoi) bot.inventory.mods[item._id] = { "mod_equipment": isScav ? scavPlates : Plates, "mod_equipment_001": isScav ? scavArmPlates : armPlates };
                });
            }
        });
    }
}

interface IConfig
{
    GenerationConfig: IGenerationConfig
    BotGenConfig: IBotGenerationConfig
}

interface IGenerationConfig
{
    MaxClass: number,
    IgnoreIntegratedArmors: boolean,
    VestWeightRetainPercent: number
}

interface IBotGenerationConfig
{
    MaxScavPlateLevel: number,
    BaseChestPlateChance: number,
    BaseStomachPlateChance: number,
    BaseArmPlateChance: number,
    BossChestPlateChance: number,
    BossStomachPlateChance: number,
    BossArmPlateChance: number
}

module.exports = { mod: new plates() };