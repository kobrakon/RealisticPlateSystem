# Realistic Plate System
## A plate system for SPT

This is a mod that takes all of the carriers and vests in the game and turns them into proper plate carriers and generates armor plates for them to use. Now, instead of each vest having its own armor stats, they all are similar and act only as bare vests or carriers until you put an armor plate inside, where then the vest/carrier will be able to protect you. Bots also spawn with armor plates as well, with scavs using lower tier plates while PMCs and Bosses can use much higher tier plates. You can also configure how things are generated, such as what level the plates will be generated to (default is level 7, so you get plates from class 1 to 7), whether armors with integrated armor (i.e. PACA) should be ignored or not when configuring vests, what spawn chances are for plates and bosses, and how much weight of the carrier is retained after tweaking (default is 25%). 

## Plate generation

All plates are generated programmatically for each material up to the max level designated in the configuration file. There are 3 types of plates that are generated with the first being chest Plates, stomach plates, and then arm plates. Each level and material have certain pros and cons for each of them with higher tier plates being heaver than lower tier plates and hard materials being more protective but cumbersome while softer materials are easier to move around in but deal more blunt damage on impact. Bots loadouts are also modified so that they can spawn with plates. Lastly, since a lot plates are generated when finished, there is a custom tab that gets created for armor plates on the flea market as to not bloat other categories and make them easier to find.

## Carrier and Vest tweaking

Each carrier and vest is modified to be able to fit the custom armor plates, with the only exception being armors that have material woven in when the configuration option "IgnoreIntegratedArmors" is true. During tweaking, each carrier is stripped of their armor and armor class so that they offer no protection on their own like real life, then, custom slots for the vest are created and assigned to the carrier, each carrier has a slot for chest plates while only bigger carriers get a slot for stomach plates and even fewer get slots for arm plates. Each carrier also gets it's weight reduced and only retain the percent set in the "VestWeightRetainPercent" configuration option, which is 0.25 (25%) by default meaning carriers will only retain 25% of their base weight. Finally, carriers then have their prices cut by 80% to account for the fact that they no longer provide protection on their own.

## Plate container

Along with plates, a plate container is also generated to allow you to store your plates in a dedicated container. It has an 8x8 cell container and lets you hold all types of plates. It is purchased from the flea market and has the appearance of an armor repair kit.
