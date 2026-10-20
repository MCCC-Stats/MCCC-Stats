
/* ==========================================
   MCCC STATS - EVENT DATA
   ========================================== */

const MCCC_GAMES = [
    {
        id: "sky_battle",
        name: "Sky Battle",
        shortName: "SB",
        icon: "assets/games/sky_battle.webp"
    },
    {
        id: "rocket_spleef_rush",
        name: "Rocket Spleef Rush",
        shortName: "RSR",
        icon: "assets/games/rocket_spleef_rush.webp"
    },
    {
        id: "tgttos",
        name: "TGTTOS",
        shortName: "TGTTOS",
        icon: "assets/games/tgttos.webp"
    },
    {
        id: "hole_in_the_wall",
        name: "Hole in the Wall",
        shortName: "HITW",
        icon: "assets/games/hole_in_the_wall.webp"
    },
    {
        id: "parkour_warrior",
        name: "Parkour Warrior",
        shortName: "PKW",
        icon: "assets/games/parkour_warrior.webp"
    },
    {
        id: "battle_box",
        name: "Battle Box",
        shortName: "BB",
        icon: "assets/games/battle_box.webp"
    }
];

const MCCC_EVENTS = [
    {
        id: 1,
        name: "MCCC 1",
        date: null,
        season: 1,
        noncanon: false,
        banner: "assets/backgrounds/main-lobby.webp",

        dodgebolt: {
        finalists: ["blue","yellow"],
        winner: "blue"
},

        games: [
            "sky_battle",
            "rocket_spleef_rush",
            "tgttos",
            "hole_in_the_wall",
            "parkour_warrior",
            "battle_box"
        ],

        multipliers: [1, 1.5, 2, 2, 2.5, 3],

        teams: [
            {
                id: "red",
                name: "Red Rabbits",
                color: "#ff4444",
                players: [
                    "5hys",
                    "DelphinXD",
                    "arfgon",
                    "NotAGoodIGN"
                ]
            },
            {
                id: "yellow",
                name: "Yellow Yaks",
                color: "#ffcc33",
                players: [
                    "Frogo62",
                    "Sacred_Bean",
                    "MrLukieCookie",
                    "Duckling2468"
                ]
            },
            {
                id: "blue",
                name: "Blue Bats",
                color: "#4488ff",
                players: [
                    "Creep1et",
                    "vazzavv",
                    "xLucasterx",
                    "PineTreant"
                ]
            },
            {
                id: "green",
                name: "Green Geckos",
                color: "#33cc66",
                players: [
                    "FennecFox1247",
                    "ItsMrChick3nMan",
                    "Jazzieeeeeee",
                    "Haze7895"
                ]
            }
        ],

        // Individual unmultiplied game scores.
        // Score order matches the games array above.
        scores: {
            "Frogo62": [
                722, 825, 988, 725, 844, 592.5
            ],
            "vazzavv": [
                466, 775, 1156, 1335, 766, 375
            ],
            "MrLukieCookie": [
                312, 300, 752, 590, 476, 390
            ],
            "xLucasterx": [
                254, 575, 361, 935, 206, 285
            ],
            "FennecFox1247": [
                242, 1175, 1057, 710, 990, 292.5
            ],
            "Creep1et": [
                238, 1550, 1374, 1500, 1044, 600
            ],
            "Duckling2468": [
                216, 200, 533, 505, 360, 435
            ],
            "Sacred_Bean": [
                148, 700, 1196, 795, 782, 435
            ],
            "ItsMrChick3nMan": [
                94, 775, 680, 385, 858, 225
            ],
            "Jazzieeeeeee": [
                40, 75, 297, 715, 628, 180
            ],
            "Haze7895": [
                38, 200, 87, 870, 182, 180
            ],
            "5hys": [
                32, 875, 351, 1070, 504, 255
            ],
            "PineTreant": [
                32, 300, 0, 265, 30, 262.5
            ],
            "NotAGoodIGN": [
                26, 650, 946, 560, 566, 277.5
            ],
            "DelphinXD": [
                20, 725, 386, 485, 260, 187.5
            ],
            "arfgon": [
                14, 150, 468, 510, 344, 210
            ]
        }
    },
    {
        id: 2,
        name: "MCCC 2",
        date: null,
        season: 1,
        noncanon: false,
        banner: "assets/backgrounds/main-lobby.webp",

        dodgebolt: {
            finalists: ["orange", "pink"],
            winner: "pink"
        },

        games: [
            "sky_battle",
            "rocket_spleef_rush",
            "battle_box",
            "tgttos",
            "parkour_warrior",
            "hole_in_the_wall"
        ],

        multipliers: [1, 1.5, 2, 2, 2.5, 3],

        teams: [
            {
                id: "purple",
                name: "Purple Penguins",
                color: "#aa44ff",
                icon: "assets/teams/christmas/purple.webp",
                players: [
                    "Sacred_Bean",
                    "RAHplaysMC24",
                    "Jazzieeeeeee",
                    "Frogo62"
                ]
            },
            {
                id: "orange",
                name: "Ginger Breadmen",
                color: "#ff9900",
                icon: "assets/teams/christmas/orange.webp",
                players: [
                    "DelphinXD",
                    "ItsMrChick3nMan",
                    "Creep1et",
                    "Haze7895"
                ]
            },
            {
                id: "aqua",
                name: "Cerulean Candy Canes",
                color: "#00FFFF",
                icon: "assets/teams/christmas/aqua.webp",
                players: [
                    "MrLukieCookie",
                    "Wailed_Burrito61",
                    "vazzavv",
                    "Duckling2468"
                ]
            },
            {
                id: "pink",
                name: "Pink Presents",
                color: "#ff55cc",
                icon: "assets/teams/christmas/pink.webp",
                players: [
                    "FennecFox1247",
                    "xLucasterx",
                    "5hys",
                    "NotAGoodIGN"
                ]
            }
        ],

        // Scores follow the game order above.
        // All individual scores are unmultiplied.
        scores: {
            "Sacred_Bean": [824, 575, 292.5, 560, 812, 870],
            "RAHplaysMC24": [124, 175, 202.5, 329, 122, 150],
            "Jazzieeeeeee": [104, 25, 202.5, 481, 634, 655],
            "Frogo62": [272, 725, 247.5, 372, 766, 895],

            "DelphinXD": [64, 375, 142.5, 658, 236, 820],
            "ItsMrChick3nMan": [76, 875, 187.5, 1047, 766, 1180],
            "Creep1et": [1608, 1400, 322.5, 1506, 1190, 1355],
            "Haze7895": [180, 250, 120, 609, 320, 475],

            "MrLukieCookie": [64, 1000, 517.5, 646, 480, 420],
            "Wailed_Burrito61": [36, 750, 405, 318, 282, 510],
            "vazzavv": [140, 675, 652.5, 873, 850, 1180],
            "Duckling2468": [176, 425, 495, 350, 504, 1120],

            "FennecFox1247": [648, 1200, 667.5, 983, 860, 1410],
            "xLucasterx": [312, 250, 465, 251, 98, 150],
            "5hys": [480, 650, 555, 819, 634, 755],
            "NotAGoodIGN": [604, 825, 645, 905, 736, 810]
        }
    },
    
{
    id: 3,
    name: "MCCC 3",
    date: null,
    season: 1,
    noncanon: false,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["cyan", "blue"],
        winner: "blue"
    },

    games: [
        "tgttos",
        "battle_box",
        "rocket_spleef_rush",
        "parkour_warrior",
        "sky_battle",
        "hole_in_the_wall"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "blue",
            name: "Blue Bats",
            color: "#4488ff",
            players: [
                "MrLukieCookie",
                "DelphinXD",
                "FennecFox1247",
                "Duckling2468"
            ]
        },
        {
            id: "aqua",
            name: "Aqua Axolotls",
            color: "#55dddd",
            players: [
                "Jazzieeeeeee",
                "NotAGoodIGN",
                "Hoin",
                "Haze7895"
            ]
        },
        {
            id: "cyan",
            name: "Cyan Coyotes",
            color: "#33cccc",
            players: [
                "Creep1et",
                "Sacred_Bean",
                "RAHplaysMC24",
                "xLucasterx"
            ]
        },
        {
            id: "green",
            name: "Green Geckos",
            color: "#33cc66",
            players: [
                "Fxshywoowoo",
                "5hys",
                "Wailed_Burrito61",
                "ItsMrChick3nMan"
            ]
        }
    ],

    scores: {
        "MrLukieCookie":   [355, 525, 950, 704, 396, 1085],
        "DelphinXD":       [326, 322.5, 700, 228, 84, 375],
        "FennecFox1247":  [1046, 502.5, 1100, 874, 1108, 1090],
        "Duckling2468":   [841, 435, 800, 458, 256, 715],

        "Jazzieeeeeee":   [543, 262.5, 400, 712, 256, 120],
        "NotAGoodIGN":    [957, 397.5, 1025, 844, 284, 1555],
        "Hoin":           [799, 375, 775, 536, 324, 685],
        "Haze7895":       [412, 240, 300, 382, 156, 755],

        "Creep1et": [1383, 1080, 1050, 1290, 1668, 1715],
        "Sacred_Bean":    [1094, 607.5, 350, 820, 304, 1205],
        "RAHplaysMC24":   [259, 607.5, 325, 220, 184, 515],
        "xLucasterx":     [425, 675, 375, 244, 292, 630],

        "Fxshywoowoo":    [298, 0, 125, 260, 68, 240],
        "5hys":           [636, 22.5, 600, 534, 44, 720],
        "Wailed_Burrito61": [451, 45, 975, 466, 212, 510],
        "ItsMrChick3nMan": [870, 45, 800, 912, 290, 475]
    }
},
{
    id: 4,
    name: "MCCC 4",
    date: null,
    season: 1,
    noncanon: false,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["green", "pink"],
        winner: "green"
    },

    games: [
        "rocket_spleef_rush",
        "tgttos",
        "sky_battle",
        "parkour_warrior",
        "battle_box",
        "hole_in_the_wall"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "red",
            name: "Red Rabbits",
            color: "#ff4444",
            players: [
                "vazzavv",
                "Hoin",
                "Duckling2468",
                "Fxshywoowoo"
            ]
        },
        {
            id: "orange",
            name: "Orange Ocelots",
            color: "#ff9900",
            players: [
                "Frogo62",
                "5hys",
                "Wailed_Burrito61",
                "Iadide"
            ]
        },
        {
            id: "green",
            name: "Green Geckos",
            color: "#33cc66",
            players: [
                "Creep1et",
                "xLucasterx",
                "DelphinXD",
                "Jazzieeeeeee"
            ]
        },
        {
            id: "purple",
            name: "Purple Pandas",
            color: "#aa44ff",
            players: [
                "NotAGoodIGN",
                "FroopyLoopidy",
                "Haze7895",
                "MrLukieCookie"
            ]
        },
        {
            id: "pink",
            name: "Pink Parrots",
            color: "#ff55cc",
            players: [
                "FennecFox1247",
                "RAHplaysMC24",
                "Sacred_Bean",
                "shadowrapter67"
            ]
        }
    ],

    // Individual unmultiplied scores.
    // RSR, TGTTOS, SB, PKW, BB, HITW
    scores: {
        "vazzavv":          [650, 453, 664, 800, 960, 640],
        "Hoin":             [825, 476, 140, 522, 1005, 385],
        "Duckling2468":     [1250, 738, 296, 714, 825, 1005],
        "Fxshywoowoo":     [100, 54, 72, 114, 780, 520],

        "Frogo62":          [1050, 1202, 1140, 900, 225, 1025],
        "5hys":             [1050, 961, 72, 614, 225, 695],
        "Wailed_Burrito61": [550, 470, 324, 328, 300, 325],
        "Iadide":           [25, 289, 132, 198, 210, 150],

        "Creep1et":         [1825, 1650, 1156, 1240, 1815, 1580],
        "xLucasterx":       [850, 707, 152, 360, 1275, 290],
        "DelphinXD":        [550, 415, 324, 398, 1140, 565],
        "Jazzieeeeeee":     [175, 567, 84, 736, 1050, 720],

        "NotAGoodIGN":      [1475, 1153, 308, 1078, 750, 1480],
        "FroopyLoopidy":    [325, 662, 408, 352, 615, 845],
        "Haze7895":         [475, 237, 112, 644, 570, 465],
        "MrLukieCookie":    [1150, 870, 208, 900, 705, 540],

        "FennecFox1247":    [1600, 1140, 892, 978, 555, 1545],
        "RAHplaysMC24":     [450, 404, 424, 268, 420, 440],
        "Sacred_Bean":      [900, 1201, 360, 946, 375, 1080],
        "shadowrapter67":   [875, 334, 544, 300, 510, 465]
    }
},
{
    id: 5,
    name: "MCCC 5",
    date: null,
    season: 1,
    noncanon: false,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["yellow", "lime"],
        winner: "yellow"
    },

    games: [
        "rocket_spleef_rush",
        "parkour_warrior",
        "battle_box",
        "hole_in_the_wall",
        "tgttos",
        "sky_battle"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "red",
            name: "Red Rabbits",
            color: "#ff4444",
            players: [
                "Jazzieeeeeee",
                "Frogo62",
                "Haze7895",
                "vazzavv"
            ]
        },
        {
            id: "yellow",
            name: "Yellow Yaks",
            color: "#ffdd33",
            players: [
                "RAHplaysMC24",
                "Creep1et",
                "shadowrapter67",
                "Wailed_Burrito61"
            ]
        },
        {
            id: "lime",
            name: "Lime Llamas",
            color: "#55ee33",
            players: [
                "FroopyLoopidy",
                "ItsMrChick3nMan",
                "NotAGoodIGN",
                "xLucasterx"
            ]
        },
        {
            id: "aqua",
            name: "Aqua Axolotls",
            color: "#55dddd",
            players: [
                "ieditdoors",
                "Ricedbyme",
                "MrLukieCookie",
                "DelphinXD",
                "Sacred_Bean"
            ]
        },
        {
            id: "purple",
            name: "Purple Pandas",
            color: "#aa44ff",
            players: [
                "5hys",
                "FennecFox1247",
                "Fxshywoowoo",
                "Paddyproo"
            ]
        }
    ],

    participation: {
    "ieditdoors": [true, true, true, false, false, false],
    "Ricedbyme": [false, false, false, true, true, true]
},

    // RSR, PKW, BB, HITW, TGTTOS, SB
    // Individual scores are unmultiplied.
    scores: {
        "Jazzieeeeeee":     [200, 790, 225, 395, 603, 220],
        "Frogo62":          [950, 1070, 337.5, 675, 884, 988],
        "Haze7895":         [475, 674, 225, 540, 450, 604],
        "vazzavv":          [1025, 822, 382.5, 835, 515, 292],

        "RAHplaysMC24":     [425, 274, 600, 360, 498, 176],
        "Creep1et":         [1450, 1278, 847.5, 1455, 1639, 1340],
        "shadowrapter67":   [675, 374, 555, 750, 432, 328],
        "Wailed_Burrito61": [1125, 390, 487.5, 805, 1009, 180],

        "FroopyLoopidy":    [725, 558, 592.5, 490, 307, 188],
        "ItsMrChick3nMan":  [1025, 978, 480, 950, 1006, 300],
        "NotAGoodIGN":      [1375, 876, 412.5, 1105, 1271, 408],
        "xLucasterx":       [675, 198, 390, 505, 664, 84],

        // Aqua Axolotls substitute slot:
        // ieditdoors played games 1–3.
        // Ricedbyme played games 4–6.
        "ieditdoors":       [25, 290, 150, 0, 0, 0],
        "Ricedbyme":        [0, 0, 0, 420, 768, 168],
        "MrLukieCookie":    [1225, 676, 217.5, 1015, 204, 232],
        "DelphinXD":        [900, 458, 127.5, 275, 69, 268],
        "Sacred_Bean":      [1175, 806, 217.5, 760, 612, 124],

        "5hys":             [1175, 792, 307.5, 855, 892, 336],
        "FennecFox1247":    [600, 970, 532.5, 1140, 1622, 664],
        "Fxshywoowoo":     [150, 174, 307.5, 565, 209, 40],
        "Paddyproo":        [475, 512, 442.5, 865, 227, 236]
    }
},
{
    id: 6,
    name: "MCCC 6",
    date: null,
    season: 1,
    noncanon: false,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["cyan", "red"],
        winner: "red"
    },

    games: [
        "battle_box",
        "rocket_spleef_rush",
        "parkour_warrior",
        "sky_battle",
        "tgttos",
        "hole_in_the_wall"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "red",
            name: "Red Rabbits",
            color: "#ff4444",
            players: [
                "ItsMrChick3nMan",
                "Paddyproo",
                "vazzavv",
                "Wizzler_"
            ]
        },
        {
            id: "lime",
            name: "Lime Llamas",
            color: "#55ee33",
            players: [
                "FennecFox1247",
                "Jazzieeeeeee",
                "Wailed_Burrito61",
                "xLucasterx"
            ]
        },
        {
            id: "cyan",
            name: "Cyan Coyotes",
            color: "#33cccc",
            players: [
                "Sacred_Bean",
                "NotAGoodIGN",
                "HGod",
                "Haze7895"
            ]
        },
        {
            id: "purple",
            name: "Purple Pandas",
            color: "#aa44ff",
            players: [
                "Creep1et",
                "Fxshywoowoo",
                "DelphinXD",
                "RAHplaysMC24"
            ]
        },
        {
            id: "pink",
            name: "Pink Parrots",
            color: "#ff55cc",
            players: [
                "arfgon",
                "Frogo62",
                "FroopyLoopidy"
            ]
        }
    ],

    participation: {
    "Wizzler_": [false, false, true, true, true, true]
},

    // BB, RSR, PKW, SB, TGTTOS, HITW
    // Original individual scores, before event multipliers.
    scores: {
        "ItsMrChick3nMan":  [202.5, 900, 992, 540, 932, 1080],
        "Paddyproo":        [247.5, 475, 728, 104, 445, 1075],
        "vazzavv":          [225, 850, 820, 648, 936, 1155],
        "Wizzler_":         [0, 0, 146, 120, 527, 460],

        "FennecFox1247":    [397.5, 1450, 1100, 424, 1508, 1060],
        "Jazzieeeeeee":     [285, 600, 552, 172, 394, 445],
        "Wailed_Burrito61": [352.5, 775, 390, 20, 546, 1055],
        "xLucasterx":       [262.5, 300, 136, 176, 406, 725],

        "Sacred_Bean":      [472.5, 625, 774, 196, 1070, 1060],
        "NotAGoodIGN":      [585, 1100, 1046, 456, 708, 865],
        "HGod":             [517.5, 1000, 814, 968, 1227, 1130],
        "Haze7895":         [382.5, 325, 612, 248, 377, 835],

        "Creep1et":         [735, 1650, 1022, 2096, 1592, 1860],
        "Fxshywoowoo":     [622.5, 100, 152, 184, 289, 595],
        "DelphinXD":        [487.5, 950, 520, 116, 516, 290],
        "RAHplaysMC24":     [442.5, 675, 268, 76, 197, 230],

        "arfgon":           [327.5, 0, 176, 36, 295, 295],
        "Frogo62":          [350, 650, 830, 424, 627, 165],
                "FroopyLoopidy": [260, 800, 322, 148, 593, 680]
    },

    ghostScores: {
        red: [
            225,
            2225 / 3,
            0, 0, 0, 0
        ],

        pink: [
            937.5 / 3,
            1450 / 3,
            1328 / 3,
            608 / 3,
            1515 / 3,
            1140 / 3
        ]
    }
},

{
    id: 7,
    name: "MCCC 7",
    date: null,
    season: 1,
    noncanon: false,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["pink", "red"],
        winner: "pink"
    },

    games: [
        "rocket_spleef_rush",
        "parkour_warrior",
        "sky_battle",
        "battle_box",
        "hole_in_the_wall",
        "tgttos"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "red",
            name: "Red Rabbits",
            color: "#ff4444",
            players: [
                "Theactualone__",
                "Raptor797797",
                "Creep1et",
                "Awsomeants"
            ]
        },
        {
            id: "orange",
            name: "Orange Ocelots",
            color: "#ff9900",
            players: [
                "NotAGoodIGN",
                "vazzavv",
                "RAHplaysMC24",
                "5hys"
            ]
        },
        {
            id: "cyan",
            name: "Cyan Coyotes",
            color: "#33cccc",
            players: [
                "Sacred_Bean",
                "Rainbow_Rare",
                "Frogo62",
                "zxOni"
            ]
        },
        {
            id: "pink",
            name: "Pink Parrots",
            color: "#ff55cc",
            players: [
                "DelphinXD",
                "Wailed_Burrito61",
                "MrLukieCookie",
                "FennecFox1247"
            ]
        }
    ],

    scores: {
        "Theactualone__":   [325, 274, 48, 427.5, 590, 593],
        "Raptor797797":     [575, 122, 272, 540, 445, 577],
        "Creep1et":         [1050, 1058, 2276, 742.5, 1510, 1418],
        "Awsomeants":       [275, 174, 4, 450, 305, 638],

        "NotAGoodIGN":      [1000, 874, 316, 412.5, 1565, 1020],
        "vazzavv":          [1125, 766, 208, 435, 475, 574],
        "RAHplaysMC24":     [225, 404, 204, 345, 590, 362],
        "5hys":             [700, 696, 220, 435, 990, 407],

        "Sacred_Bean":      [1075, 866, 188, 292.5, 280, 839],
        "Rainbow_Rare":     [25, 114, 68, 202.5, 570, 180],
        "Frogo62":          [850, 720, 164, 270, 380, 298],
        "zxOni":            [200, 436, 352, 292.5, 860, 696],

        "DelphinXD":        [625, 542, 508, 405, 1120, 735],
        "Wailed_Burrito61":[725, 596, 404, 270, 465, 719],
        "MrLukieCookie":    [1000, 720, 716, 225, 1030, 608],
        "FennecFox1247":   [875, 1028, 192, 315, 1395, 1118]
    }
},

{
    id: 8,
    name: "MCCC 8",
    date: null,
    season: 1,
    noncanon: false,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["purple", "aqua"],
        winner: "purple"
    },

    games: [
        "tgttos",
        "battle_box",
        "parkour_warrior",
        "sky_battle",
        "hole_in_the_wall",
        "rocket_spleef_rush"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "red",
            name: "Red Rabbits",
            color: "#ff4444",
            players: [
                "Awsomeants",
                "vazzavv",
                "FennecFox1247",
                "Jazzieeeeeee"
            ]
        },
        {
            id: "green",
            name: "Green Geckos",
            color: "#22cc22",
            players: [
                "5hys",
                "Wailed_Burrito61",
                "NotAGoodIGN",
                "arfgon"
            ]
        },
        {
            id: "aqua",
            name: "Aqua Axolotls",
            color: "#55ddff",
            players: [
                "Rainbow_Rare",
                "RAHplaysMC24",
                "Theactualone__",
                "Creep1et"
            ]
        },
        {
            id: "blue",
            name: "Blue Bats",
            color: "#4477ff",
            players: [
                "Paddyproo",
                "zxOni",
                "voidvvy",
                "ItsMrChick3nMan"
            ]
        },
        {
            id: "purple",
            name: "Purple Pandas",
            color: "#aa44ff",
            players: [
                "Frogo62",
                "MrLukieCookie",
                "DelphinXD",
                "FroopyLoopidy"
            ]
        }
    ],

    scores: {
        "Awsomeants":       [280, 307.5, 206, 68, 245, 250],
        "vazzavv":          [600, 330, 908, 408, 325, 1250],
        "FennecFox1247":   [1059, 420, 970, 736, 1210, 1750],
        "Jazzieeeeeee":    [397, 352.5, 628, 100, 310, 200],

        "5hys":             [866, 202.5, 604, 136, 335, 1025],
        "Wailed_Burrito61":[558, 247.5, 636, 180, 720, 1000],
        "NotAGoodIGN":      [1455, 382.5, 970, 720, 1620, 1125],
        "arfgon":           [555, 270, 190, 44, 365, 775],

        "Rainbow_Rare":     [300, 427.5, 282, 548, 785, 125],
        "RAHplaysMC24":     [370, 472.5, 498, 256, 790, 350],
        "Theactualone__":  [293, 382.5, 314, 448, 405, 725],
        "Creep1et":         [1770, 675, 1386, 1368, 1825, 1675],

        "Paddyproo":        [450, 142.5, 738, 52, 855, 575],
        "zxOni":            [558, 255, 452, 28, 800, 450],
        "voidvvy":          [268, 232.5, 390, 56, 580, 200],
        "ItsMrChick3nMan":  [1026, 187.5, 846, 60, 500, 925],

        "Frogo62":          [1338, 367.5, 938, 868, 820, 1025],
        "MrLukieCookie":    [1135, 547.5, 892, 1100, 1225, 925],
        "DelphinXD":        [502, 435, 544, 584, 300, 1150],
        "FroopyLoopidy":    [254, 345, 298, 316, 745, 450]
    }
},
{
    id: 9,
    name: "MCCC 9",
    date: null,
    season: 1,
    noncanon: false,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["lime", "red"],
        winner: "red"
    },

    games: [
        "parkour_warrior",
        "rocket_spleef_rush",
        "sky_battle",
        "battle_box",
        "hole_in_the_wall",
        "tgttos"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "yellow",
            name: "Yellow Yaks",
            color: "#ffff55",
            players: [
                "FennecFox1247",
                "Conn",
                "5hys",
                "Theactualone__"
            ]
        },
        {
            id: "lime",
            name: "Lime Llamas",
            color: "#55ee33",
            players: [
                "Haze7895",
                "zxOni",
                "Creep1et",
                "Jazzieeeeeee"
            ]
        },
        {
            id: "blue",
            name: "Blue Bats",
            color: "#4477ff",
            players: [
                "ItsMrChick3nMan",
                "Rainbow_Rare",
                "DelphinXD",
                "NotAGoodIGN"
            ]
        },
        {
            id: "red",
            name: "Red Rabbits",
            color: "#ff4444",
            players: [
                "HGod",
                "Sacred_Bean",
                "RAHplaysMC24",
                "MrLukieCookie"
            ]
        }
    ],

    scores: {
        "FennecFox1247": [
            1074, 1025, 280, 307.5, 1330, 1011
        ],
        "Conn": [
            144, 450, 24, 262.5, 275, 242
        ],
        "5hys": [
            626, 475, 128, 465, 475, 857
        ],
        "Theactualone__": [
            214, 425, 40, 307.5, 300, 99
        ],

        "Haze7895": [
            374, 175, 448, 470.5, 990, 226
        ],
        "zxOni": [
            398, 525, 420, 606, 720, 468
        ],
        "Creep1et": [
            1182, 1200, 1108, 740.5, 1520, 1366
        ],
        "Jazzieeeeeee": [
            422, 125, 440, 493, 605, 455
        ],

        "ItsMrChick3nMan": [
            758, 775, 288, 193, 350, 1165
        ],
        "Rainbow_Rare": [
            128, 500, 356, 170.5, 575, 113
        ],
        "DelphinXD": [
            466, 725, 60, 215.5, 810, 466
        ],
        "NotAGoodIGN": [
            820, 1025, 388, 216, 1495, 1101
        ],

        "HGod": [
            820, 1225, 732, 390, 1295, 905
        ],
        "Sacred_Bean": [
            688, 150, 220, 345, 800, 863
        ],
        "RAHplaysMC24": [
            246, 500, 284, 390, 360, 459
        ],
        "MrLukieCookie": [
            820, 900, 594, 412.5, 670, 983
        ]
    }
},
{
    id: 10,
    name: "MCCC 10",
    date: null,
    season: 1,
    noncanon: false,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["yellow", "green"],
        winner: "green"
    },

    games: [
        "sky_battle",
        "parkour_warrior",
        "tgttos",
        "battle_box",
        "hole_in_the_wall",
        "rocket_spleef_rush"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "yellow",
            name: "Yellow Yaks",
            color: "#ffff55",
            players: [
                "NotAGoodIGN",
                "Wailed_Burrito61",
                "MrLukieCookie",
                "zxOni"
            ]
        },
        {
            id: "green",
            name: "Green Geckos",
            color: "#00aa00",
            players: [
                "HGod",
                "vazzavv",
                "ItsMrChick3nMan",
                "Awsomeants"
            ]
        },
        {
            id: "aqua",
            name: "Aqua Axolotls",
            color: "#55ffff",
            players: [
                "RAHplaysMC24",
                "Frogo62",
                "Paddyproo",
                "FennecFox1247"
            ]
        },
        {
            id: "pink",
            name: "Pink Parrots",
            color: "#ff55cc",
            players: [
                "DelphinXD",
                "Creep1et",
                "Rainbow_Rare",
                "Jazzieeeeeee"
            ]
        }
    ],

    scores: {
        "NotAGoodIGN": [
            60, 926, 951, 585, 940, 875
        ],
        "Wailed_Burrito61": [
            168, 480, 579, 427.5, 700, 750
        ],
        "MrLukieCookie": [
            96, 750, 626, 517.5, 635, 1075
        ],
        "zxOni": [
            72, 464, 994, 540, 865, 450
        ],

        "HGod": [
            776, 828, 928, 570, 925, 1150
        ],
        "vazzavv": [
            148, 828, 756, 412.5, 755, 650
        ],
        "ItsMrChick3nMan": [
            40, 772, 637, 390, 860, 950
        ],
        "Awsomeants": [
            32, 120, 153, 367.5, 580, 275
        ],

        "RAHplaysMC24": [
            200, 426, 360, 142.5, 740, 350
        ],
        "Frogo62": [
            712, 820, 608, 322.5, 710, 975
        ],
        "Paddyproo": [
            496, 734, 477, 165, 815, 175
        ],
        "FennecFox1247": [
            532, 726, 1186, 322.5, 1245, 1200
        ],

        "DelphinXD": [
            612, 258, 462, 367.5, 415, 675
        ],
        "Creep1et": [
            1504, 1182, 1402, 547.5, 1660, 1125
        ],
        "Rainbow_Rare": [
            424, 182, 197, 322.5, 345, 100
        ],
        "Jazzieeeeeee": [
            300, 464, 478, 300, 380, 75
        ]
    }
},

{
    id: 11,
    name: "MCCC 11",
    date: null,
    season: 2,
    noncanon: false,
    banner: "assets/backgrounds/main-lobby.webp",
    dodgebolt: {
        finalists: ["fuchsia", "green"],
        winner: "green"
    },
    games: [
        "sky_battle",
        "rocket_spleef_rush",
        "parkour_warrior",
        "hole_in_the_wall",
        "tgttos",
        "battle_box"
    ],
    multipliers: [1, 1.5, 2, 2, 2.5, 3],
    teams: [
        {
            id: "red",
            name: "Red Ravens",
            color: "#ff3333",
            icon: "assets/teams/halloween/red.webp",
            players: ["arfgon", "FroopyLoopidy", "HGod", "Hoin"]
        },
        {
            id: "orange",
            name: "Orange Oozes",
            color: "#ff8800",
            icon: "assets/teams/halloween/orange.webp",
            players: ["zxOni", "FennecFox1247", "Rainbow_Rare", "Wailed_Burrito61"]
        },
        {
            id: "green",
            name: "Green Goblins",
            color: "#00bb22",
            icon: "assets/teams/halloween/green.webp",
            players: ["GriffinTheGopher", "Creep1et", "Awsomeants", "RAHplaysMC24"]
        },
        {
            id: "aqua",
            name: "Aqua Abominations",
            color: "#44ccff",
            icon: "assets/teams/halloween/aqua.webp",
            players: ["5hys", "NotAGoodIGN", "Jazzieeeeeee", "Paddyproo"]
        },
        {
            id: "blue",
            name: "Blue Banshees",
            color: "#4477ff",
            icon: "assets/teams/halloween/blue.webp",
            players: ["Duckling2468", "MrLukieCookie", "DelphinXD", "huskyjasmin"]
        },
        {
            id: "fuchsia",
            name: "Fuchsia Frankensteins",
            color: "#ee22dd",
            icon: "assets/teams/halloween/pink.webp",
            players: ["ItsMrChick3nMan", "Frogo62", "Theactualone__", "vazzavv"]
        }
    ],
    scores: {
        "arfgon":            [547, 500, 306, 645, 409, 540],
        "FroopyLoopidy":     [431, 575, 582, 540, 475, 405],
        "HGod":              [1013, 1375, 940, 930, 1144, 675],
        "Hoin":              [427, 1200, 862, 605, 982, 517.5],

        "zxOni":             [778, 1500, 846, 970, 948, 690],
        "FennecFox1247":     [954, 1150, 1058, 865, 815, 645],
        "Rainbow_Rare":      [422, 575, 162, 415, 221, 442.5],
        "Wailed_Burrito61":  [558, 1075, 546, 560, 450, 532.5],

        "GriffinTheGopher":  [282, 575, 0, 1020, 174, 390],
        "Creep1et":          [2134, 2200, 1336, 1685, 1829, 840],
        "Awsomeants":        [502, 375, 192, 285, 393, 345],
        "RAHplaysMC24":      [630, 750, 776, 405, 615, 322.5],

        "5hys":              [303, 1150, 712, 310, 869, 330],
        "NotAGoodIGN":       [795, 1500, 1204, 1305, 1219, 465],
        "Jazzieeeeeee":      [423, 325, 778, 585, 898, 240],
        "Paddyproo":         [239, 700, 822, 385, 620, 330],

        "Duckling2468":      [203, 1100, 506, 520, 706, 165],
        "MrLukieCookie":     [747, 900, 1020, 1315, 1184, 210],
        "DelphinXD":         [243, 725, 600, 245, 249, 165],
        "huskyjasmin":       [63, 25, 84, 320, 105, 120],

        "ItsMrChick3nMan":   [328, 1025, 980, 1610, 1143, 450],
        "Frogo62":           [812, 1375, 848, 220, 915, 630],
        "Theactualone__":      [684, 1000, 482, 1080, 396, 450],
        "vazzavv":           [636, 1525, 822, 880, 962, 472.5]
    }
},

{
    id: 12,
    name: "MCCC 12",
    date: null,
    season: 2,
    noncanon: false,
    banner: "assets/backgrounds/main-lobby.webp",
    dodgebolt: { finalists: ["orange", "yellow"], winner: "yellow" },
    games: [
        "sky_battle",
        "battle_box",
        "rocket_spleef_rush",
        "tgttos",
        "hole_in_the_wall",
        "parkour_warrior"
    ],
    multipliers: [1, 1.5, 2, 2, 2.5, 3],
    teams: [
        {
            id: "red",
            name: "Red Rabbits",
            color: "#ff4444",
            players: ["zxOni", "Hoin", "Rainbow_Rare", "NotAGoodIGN"]
        },
        {
            id: "orange",
            name: "Orange Ocelots",
            color: "#ff9933",
            players: ["Frogo62", "HGod", "DelphinXD", "Wailed_Burrito61"]
        },
        {
            id: "yellow",
            name: "Yellow Yaks",
            color: "#ffdd33",
            players: ["Awsomeants", "5hys", "Creep1et", "Jazzieeeeeee"]
        },
        {
            id: "cyan",
            name: "Cyan Coyotes",
            color: "#33cccc",
            players: ["GriffinTheGopher", "Sacred_Bean", "FennecFox1247", "ItsMrChick3nMan"]
        },
        {
            id: "purple",
            name: "Purple Pandas",
            color: "#aa44ff",
            players: ["vazzavv", "Duckling2468", "MrLukieCookie", "RAHplaysMC24", "Ev4An"]
        }
    ],

    participation: {
    "vazzavv": [true, true, true, true, false, false],
    "Ev4An": [false, false, false, false, true, true]
},

    scores: {
        "zxOni":             [668, 450, 800, 1028, 910, 590],
        "Hoin":              [900, 540, 500, 563, 780, 530],
        "Rainbow_Rare":      [436, 382.5, 450, 589, 270, 200],
        "NotAGoodIGN":       [448, 652.5, 1350, 920, 1065, 962],

        "Frogo62":           [956, 412.5, 1125, 697, 1250, 876],
        "HGod":              [736, 525, 1000, 817, 530, 884],
        "DelphinXD":         [300, 412.5, 850, 575, 705, 466],
        "Wailed_Burrito61":  [628, 367.5, 950, 565, 550, 652],

        "Awsomeants":        [388, 435, 150, 189, 535, 146],
        "5hys":              [376, 412.5, 1025, 661, 520, 466],
        "Creep1et":          [1912, 637.5, 1850, 1674, 1905, 1386],
        "Jazzieeeeeee":      [576, 300, 175, 406, 320, 544],

        "GriffinTheGopher":  [356, 202.5, 175, 93, 335, 38],
        "Sacred_Bean":       [716, 360, 675, 1054, 585, 986],
        "FennecFox1247":     [1040, 225, 1450, 1073, 1590, 760],
        "ItsMrChick3nMan":   [396, 225, 950, 1159, 1005, 854],

        "vazzavv":           [316, 60, 900, 0, 0, 0],
        "Duckling2468":      [168, 150, 850, 791, 490, 660],
        "MrLukieCookie":     [172, 167.5, 650, 351, 535, 814],
        "RAHplaysMC24":      [176, 82.5, 475, 482, 490, 514],
        "Ev4An":             [0, 0, 0, 0, 290, 92]
    }
},
{
    id: 13,
    name: "MCCC 13",
    date: null,
    season: 2,
    noncanon: false,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["cerulean", "emerald"],
        winner: "emerald"
    },

    games: [
        "battle_box",
        "parkour_warrior",
        "rocket_spleef_rush",
        "hole_in_the_wall",
        "tgttos",
        "sky_battle"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "red",
            name: "Red Reindeer",
            color: "#ff4444",
            icon: "assets/teams/christmas/red.webp",
            players: [
                "QuotheTheRaven",
                "Creep1et",
                "RAHplaysMC24",
                "GriffinTheGopher"
            ]
        },
        {
            id: "ginger",
            name: "Ginger Breadmen",
            color: "#d98232",
            icon: "assets/teams/christmas/orange.webp",
            players: [
                "FroopyLoopidy",
                "5hys",
                "HGod",
                "Wailed_Burrito61"
            ]
        },
        {
            id: "emerald",
            name: "Emerald Elves",
            color: "#38b449",
            icon: "assets/teams/christmas/green.webp",
            players: [
                "Sacred_Bean",
                "DelphinXD",
                "ItsMrChick3nMan",
                "Duckling2468"
            ]
        },
        {
            id: "cerulean",
            name: "Cerulean Candy Canes",
            color: "#4385ef",
            icon: "assets/teams/christmas/aqua.webp",
            players: [
                "Ev4An",
                "Awsomeants",
                "NotAGoodIGN",
                "Frogo62"
            ]
        },
        {
            id: "sapphire",
            name: "Sapphire Santas",
            color: "#253bca",
            icon: "assets/teams/christmas/blue.webp",
            players: [
                "Drakon52",
                "Hoin",
                "FennecFox1247",
                "Rainbow_Rare"
            ]
        },
        {
            id: "purple",
            name: "Purple Penguins",
            color: "#a044dd",
            icon: "assets/teams/christmas/purple.webp",
            players: [
                "Paddyproo",
                "MrLukieCookie",
                "Jazzieeeeeee",
                "Haze7895"
            ]
        }
    ],

    scores: {
        "QuotheTheRaven":    [410.5, 92, 100, 320, 93, 407],
        "Creep1et":          [793.5, 1312, 1600, 1385, 2222, 2295],
        "RAHplaysMC24":      [433, 484, 975, 475, 444, 583],
        "GriffinTheGopher":  [500.5, 98, 425, 400, 126, 347],

        "FroopyLoopidy":     [373, 362, 675, 730, 234, 280],
        "5hys":              [463.5, 716, 1300, 1140, 959, 352],
        "HGod":              [643, 934, 1550, 550, 1046, 536],
        "Wailed_Burrito61":  [395.5, 670, 1125, 525, 900, 688],

        "Sacred_Bean":       [378.5, 926, 1150, 1070, 1135, 696],
        "DelphinXD":         [356.5, 614, 625, 1075, 680, 328],
        "ItsMrChick3nMan":   [491.5, 918, 1100, 370, 1383, 664],
        "Duckling2468":      [356, 330, 1275, 925, 453, 460],

        "Ev4An":             [560.5, 262, 150, 385, 545, 700],
        "Awsomeants":        [470.5, 178, 750, 860, 319, 488],
        "NotAGoodIGN":       [673, 1034, 1550, 960, 1148, 1112],
        "Frogo62":           [673.5, 1034, 2075, 1235, 1225, 956],

        "Drakon52":          [335.5, 452, 150, 370, 334, 599],
        "Hoin":              [493, 948, 1500, 465, 917, 523],
        "FennecFox1247":    [380.5, 1126, 1175, 1020, 1470, 539],
        "Rainbow_Rare":      [381, 270, 350, 385, 379, 295],

        "Paddyproo":         [0, 800, 1075, 635, 351, 393],
        "MrLukieCookie":     [22.5, 694, 1075, 1440, 386, 617],
        "Jazzieeeeeee":      [45, 988, 725, 280, 690, 525],
        "Haze7895":          [22.5, 622, 125, 680, 198, 289]
        }

},

{
    id: 14,
    name: "MCCC Scuffed",
    date: null,
    season: 2,
    noncanon: true,
    banner: "assets/backgrounds/main-lobby.webp",

    // Dodgebolt was 3v3: Red/Pink/Purple vs Orange/Yellow/Cyan.
    // The winning side was Orange/Yellow/Cyan.
    // These extra fields record the result without changing existing scoring code.
    dodgebolt: {
        finalists: ["red", "pink", "purple", "orange", "yellow", "cyan"],
        winner: null,
        sides: [
            ["red", "pink", "purple"],
            ["orange", "yellow", "cyan"]
        ],
        winningSide: ["orange", "yellow", "cyan"]
    },

    games: [
        "hole_in_the_wall",
        "tgttos",
        "rocket_spleef_rush",
        "sky_battle",
        "battle_box",
        "parkour_warrior"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    // Scuffed-specific rule, to be implemented separately.
    teamScoreMultipliers: {
        cyan: 6
    },

    teams: [
        {
            id: "red",
            name: "Red Rabbits",
            color: "#ff4444",
            players: [
                "Princessnini20",
                "Creep1et",
                "FennecFox1247",
                "smella67"
            ]
        },
        {
            id: "orange",
            name: "Orange Ocelots",
            color: "#ff9900",
            players: [
                "DelphinXD",
                "Sacred_Bean",
                "Wailed_Burrito61",
                "Jazzieeeeeee",
                "NotAGoodIGN"
            ]
        },
        {
            id: "yellow",
            name: "Yellow Yaks",
            color: "#ffdd33",
            players: ["5hys"]
        },
        {
            id: "cyan",
            name: "Cyan Coyotes",
            color: "#33cccc",
            players: ["FroopyLoopidy"]
        },
        {
            id: "purple",
            name: "Purple Pandas",
            color: "#aa44ff",
            players: [
                "Rainbow_Rare",
                "zxOni",
                "Drakon52",
                "GriffinTheGopher",
                "RAHplaysMC24",
                "JitsuZombie06",
                "Jamescannon86",
                "KweenLegend"
            ]
        },
        {
            id: "pink",
            name: "Pink Parrots",
            color: "#ff55cc",
            players: [
                "MrLukieCookie",
                "Ev4An",
                "Frogo62"
            ]
        },
    ],

    // Individual scores are unmultiplied.
    // Order: HITW, TGTTOS, RSR, SB, BB, PKW.
    // Zero currently represents a missing leaderboard entry.

    scores: {
        "Princessnini20":   [80, 60, 50, 396, 685, 0],
        "Creep1et":         [1500, 1742, 1750, 3248, 870, 1034],
        "FennecFox1247":    [1500, 1534, 1575, 1180, 892.5, 988],
        "smella67":         [655, 407, 50, 404, 685, 124],

        "DelphinXD":        [735, 846, 1225, 554, 652.5, 656],
        "Sacred_Bean":      [260, 287, 725, 706, 652.5, 910],
        "Wailed_Burrito61": [1075, 441, 1200, 306, 855, 854],
        "Jazzieeeeeee":     [870, 918, 600, 342, 652.5, 594],
        "NotAGoodIGN":      [0, 0, 0, 0, 0, 924],

        "5hys":             [715, 497, 800, 2228, 1147.5, 784],

        "FroopyLoopidy":    [850, 581, 975, 576, 1035, 186],

        "Rainbow_Rare":     [295, 533, 875, 194, 802.5, 292],
        "zxOni":            [0, 0, 975, 162, 885, 722],
        "Drakon52":         [610, 718, 475, 390, 975, 516],
        "GriffinTheGopher": [555, 373, 625, 194, 735, 154],
        "RAHplaysMC24":     [570, 536, 700, 242, 817.5, 592],
        "JitsuZombie06":    [665, 528, 200, 150, 847.5, 248],
        "Jamescannon86":    [615, 506, 250, 358, 757.5, 132],
        "KweenLegend":      [770, 478, 825, 198, 727.5, 692],

        "MrLukieCookie":    [625, 922, 1200, 2086, 1151, 892],
        "Ev4An":            [600, 0, 0, 0, 0, 0],
        "Frogo62":          [1215, 556, 1075, 1890, 1241.5, 616]
    }
},

{
    id: 15,
    name: "MCCC 14",
    date: null,
    season: 2,
    banner: "assets/backgrounds/main-lobby.webp",
    dodgebolt: {
        finalists: ["lime", "cyan"],
        winner: "cyan"
    },
    games: [
        "tgttos",
        "hole_in_the_wall",
        "battle_box",
        "parkour_warrior",
        "sky_battle",
        "rocket_spleef_rush"
    ],
    multipliers: [1, 1.5, 2, 2, 2.5, 3],
    teams: [
        {
            id: "red",
            name: "Red Rabbits",
            color: "#ff4444",
            players: ["Ev4An", "DelphinXD", "Frogo62", "Jazzieeeeeee"]
        },
        {
            id: "orange",
            name: "Orange Ocelots",
            color: "#ff9900",
            players: ["RAHplaysMC24", "HGod", "JitsuZombie06", "5hys"]
        },
        {
            id: "lime",
            name: "Lime Llamas",
            color: "#44ff44",
            players: ["Creep1et", "Iadide", "Jamescannon86"]
        },
        {
            id: "cyan",
            name: "Cyan Coyotes",
            color: "#00caaa",
            players: ["Drakon52", "MrLukieCookie", "GriffinTheGopher", "FennecFox1247"]
        },
        {
            id: "aqua",
            name: "Aqua Axolotls",
            color: "#55ccff",
            players: ["ItsMrChick3nMan", "FroopyLoopidy", "vazzavv", "Haze7895"]
        },
        {
            id: "pink",
            name: "Pink Parrots",
            color: "#ff55cc",
            players: ["KweenLegend", "Wailed_Burrito61", "NotAGoodIGN", "Mimikkip"]
        }
    ],
    scores: {
        "Ev4An":            [685, 240, 397.5, 260, 511, 0],
        "DelphinXD":        [634, 125, 307.5, 514, 319, 825],
        "Frogo62":          [871, 390, 532.5, 894, 1255, 650],
        "Jazzieeeeeee":     [445, 0, 262.5, 762, 439, 225],

        "RAHplaysMC24":     [392, 850, 330, 522, 372, 675],
        "HGod":             [978, 1290, 510, 964, 840, 1525],
        "JitsuZombie06":    [661, 460, 307.5, 298, 812, 225],
        "5hys":             [604, 635, 262.5, 614, 508, 1100],

        "Creep1et":         [1733, 1785, 885, 1458, 3111, 1725],
        "Iadide":           [225, 580, 480, 160, 458, 600],
        "Jamescannon86":    [326, 550, 592.5, 724, 603, 850],

        "Drakon52":         [650, 665, 487.5, 894, 416, 400],
        "MrLukieCookie":    [551, 1495, 757.5, 886, 412, 1625],
        "GriffinTheGopher":[214, 255, 487.5, 76, 296, 150],
        "FennecFox1247":   [1295, 1375, 532.5, 1048, 608, 1575],

        "ItsMrChick3nMan":  [982, 815, 232.5, 816, 619, 1025],
        "FroopyLoopidy":    [447, 740, 210, 284, 547, 725],
        "vazzavv":          [733, 720, 332.5, 972, 631, 1000],
        "Haze7895":         [704, 270, 165, 708, 367, 350],

        "KweenLegend":      [553, 585, 420, 336, 264, 775],
        "Wailed_Burrito61": [1162, 1245, 510, 344, 236, 1300],
        "NotAGoodIGN":      [1616, 1515, 735, 1050, 436, 1675],
        "Mimikkip":         [285, 710, 600, 638, 144, 325]
    }
},

{
    id: 16,
    name: "MCCC 15",
    date: null,
    season: 2,
    banner: "assets/backgrounds/main-lobby.webp",
    dodgebolt: {
        finalists: ["aqua", "pink"],
        winner: "aqua"
    },
    games: [
        "battle_box",
        "tgttos",
        "hole_in_the_wall",
        "rocket_spleef_rush",
        "parkour_warrior",
        "sky_battle"
    ],
    multipliers: [1, 1.5, 2, 2, 2.5, 3],
    teams: [
        {
            id: "orange",
            name: "Orange Ocelots",
            color: "#ff9900",
            players: ["Iadide", "Jazzieeeeeee", "Creep1et", "DelphinXD"]
        },
        {
            id: "lime",
            name: "Lime Llamas",
            color: "#44ff44",
            players: ["5hys", "RAHplaysMC24", "Duckling2468", "MrLukieCookie"]
        },
        {
            id: "aqua",
            name: "Aqua Axolotls",
            color: "#55ccff",
            players: ["FennecFox1247", "NotAGoodIGN", "Mimikkip", "FroopyLoopidy"]
        },
        {
            id: "pink",
            name: "Pink Parrots",
            color: "#ff55cc",
            players: ["Wailed_Burrito61", "Jamescannon86", "Hoin", "Sacred_Bean"]
        }
    ],
    ghostScores: {
        pink: [390, 1637 / 3, 3320 / 3, 0, 0, 0]
    },


    scores: {
        "Iadide":           [442.5, 167, 225, 350, 90, 350],
        "Jazzieeeeeee":     [442.5, 496, 435, 0, 696, 518],
        "Creep1et":         [960, 1451, 1450, 925, 1190, 1398],
        "DelphinXD":        [487.5, 578, 825, 775, 342, 466],

        "5hys":             [307.5, 510, 410, 850, 580, 95],
        "RAHplaysMC24":     [285, 512, 345, 350, 504, 95],
        "Duckling2468":     [397.5, 504, 440, 900, 480, 115],
        "MrLukieCookie":    [397.5, 977, 945, 1025, 774, 223],

        "FennecFox1247":   [442.5, 1029, 1090, 1150, 874, 911],
        "NotAGoodIGN":     [442.5, 1055, 1070, 1225, 836, 707],
        "Mimikkip":         [262.5, 577, 595, 350, 642, 723],
        "FroopyLoopidy":    [330, 545, 355, 375, 288, 791],

        "Wailed_Burrito61": [442.5, 485, 780, 775, 618, 558],
        "Jamescannon86":    [307.5, 425, 1395, 625, 458, 298],
        "Hoin":             [420, 727, 1145, 450, 820, 862],
        "Sacred_Bean":      [0, 0, 0, 575, 488, 454]
    },
    participation: {
        "Sacred_Bean": [false, false, false, true, true, true]
    }
},

{
    id: 17,
    name: "MCCC Sub 30",
    date: null,
    season: 2,
    noncanon: true,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["blue", "orange"],
        winner: "blue"
    },

    games: [
        "battle_box",
        "tgttos",
        "hole_in_the_wall",
        "rocket_spleef_rush",
        "parkour_warrior",
        "sky_battle"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "orange",
            name: "Orange Ocelots",
            color: "#ff9900",
            players: [
                "ItsMrChick3nMan",
                "GriffinTheGopher",
                "JitsuZombie06",
                "RAHplaysMC24"
            ]
        },
        {
            id: "cyan",
            name: "Cyan Coyotes",
            color: "#00bfa5",
            players: [
                "Sacred_Bean",
                "KweenLegend",
                "Mimikkip",
                "itzmeen"
            ]
        },
        {
            id: "blue",
            name: "Blue Bats",
            color: "#4477ff",
            players: [
                "Wailed_Burrito61",
                "Jamescannon86",
                "Drakon52",
                "Paddyproo"
            ]
        },
        {
            id: "purple",
            name: "Purple Pandas",
            color: "#aa00ff",
            players: [
                "MrLukieCookie",
                "Princessnini20",
                "DelphinXD",
                "Jazzieeeeeee"
            ]
        }
    ],

    scores: {
        "ItsMrChick3nMan":  [373.5, 1241, 644, 1025, 974, 1110],
        "GriffinTheGopher": [373, 137, 376, 575, 92, 650],
        "JitsuZombie06":    [485.5, 718, 612, 300, 404, 480],
        "RAHplaysMC24":     [440.5, 522, 392, 875, 696, 445],

        "Sacred_Bean":      [105, 828, 559, 750, 866, 740],
        "KweenLegend":      [217.5, 868, 347, 600, 572, 1050],
        "Mimikkip":         [127.5, 724, 343, 650, 712, 1280],
        "itzmeen":          [60, 59, 215, 50, 84, 0],

        "Wailed_Burrito61": [832.5, 810, 588, 850, 836, 1455],
        "Jamescannon86":    [720, 917, 1008, 900, 550, 1450],
        "Drakon52":         [742.5, 929, 920, 500, 982, 605],
        "Paddyproo":        [675, 699, 512, 900, 672, 650],

        "MrLukieCookie":    [382.5, 1015, 1099, 775, 904, 1225],
        "Princessnini20":   [202.5, 121, 219, 50, 84, 250],
        "DelphinXD":        [315, 520, 323, 925, 542, 805],
        "Jazzieeeeeee":     [225, 584, 555, 175, 390, 375]
    }
},

{
    id: 18,
    name: "MCCC 16",
    date: null,
    season: 2,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["red", "purple"],
        winner: "purple"
    },

    games: [
        "rocket_spleef_rush",
        "hole_in_the_wall",
        "battle_box",
        "sky_battle",
        "tgttos",
        "parkour_warrior"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "red",
            name: "Red Rabbits",
            color: "#ff4444",
            players: [
                "Drakon52",
                "FennecFox1247",
                "Mimikkip",
                "QuotheTheRaven"
            ]
        },
        {
            id: "green",
            name: "Green Geckos",
            color: "#00aa00",
            players: [
                "Jamescannon86",
                "RAHplaysMC24",
                "NotAGoodIGN",
                "JitsuZombie06"
            ]
        },
        {
            id: "aqua",
            name: "Aqua Axolotls",
            color: "#55ccff",
            players: [
                "FroopyLoopidy",
                "MrLukieCookie",
                "5hys",
                "Sacred_Bean"
            ]
        },
        {
            id: "purple",
            name: "Purple Pandas",
            color: "#aa44ff",
            players: [
                "Creep1et",
                "KweenLegend",
                "DelphinXD",
                "Princessnini20"
            ]
        }
    ],

    // RSR, HITW, BB, SB, TGTTOS, PKW
    // Individual scores before game multipliers.
    scores: {
        "Drakon52": [
            600, 860, 480, 1056, 805, 920
        ],
        "FennecFox1247": [
            850, 1455, 547.5, 1656, 1287, 1012
        ],
        "Mimikkip": [
            450, 895, 412.5, 832, 594, 742
        ],
        "QuotheTheRaven": [
            25, 310, 300, 620, 230, 136
        ],

        "Jamescannon86": [
            1100, 890, 405, 322, 373, 666
        ],
        "RAHplaysMC24": [
            400, 500, 450, 350, 376, 550
        ],
        "NotAGoodIGN": [
            975, 1080, 742.5, 746, 1114, 828
        ],
        "JitsuZombie06": [
            200, 380, 472.5, 202, 348, 442
        ],

        "FroopyLoopidy": [
            400, 450, 165, 153, 430, 312
        ],
        "MrLukieCookie": [
            1075, 1105, 345, 285, 633, 450
        ],
        "5hys": [
            925, 500, 210, 161, 939, 542
        ],
        "Sacred_Bean": [
            800, 1005, 142.5, 157, 623, 726
        ],

        "Creep1et": [
            1150, 1715, 682.5, 1199, 1407, 1144
        ],
        "KweenLegend": [
            675, 1155, 345, 463, 519, 504
        ],
        "DelphinXD": [
            725, 210, 547.5, 227, 975, 542
        ],
        "Princessnini20": [
            50, 60, 300, 271, 105, 114
        ]
    }
},

{
    id: 19,
    name: "MCCC 17",
    date: null,
    season: 2,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["aqua", "yellow"],
        winner: "aqua"
    },

    games: [
        "tgttos",
        "parkour_warrior",
        "sky_battle",
        "battle_box",
        "rocket_spleef_rush",
        "hole_in_the_wall"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "red",
            name: "Red Rabbits",
            color: "#ff4444",
            players: [
                "Wailed_Burrito61",
                "KweenLegend",
                "ItsMrChick3nMan",
                "JitsuZombie06"
            ]
        },
        {
            id: "orange",
            name: "Orange Ocelots",
            color: "#ff9900",
            players: [
                "FennecFox1247",
                "GriffinTheGopher",
                "FroopyLoopidy",
                "DelphinXD"
            ]
        },
        {
            id: "yellow",
            name: "Yellow Yaks",
            color: "#ffdd33",
            players: [
                "NotAGoodIGN",
                "huskyjasmin",
                "5hys",
                "Hoin"
            ]
        },
        {
            id: "aqua",
            name: "Aqua Axolotls",
            color: "#55ccff",
            players: [
                "Mimikkip",
                "Jamescannon86",
                "Sacred_Bean",
                "Awsomeants"
            ]
        },
        {
            id: "blue",
            name: "Blue Bats",
            color: "#4477ff",
            players: [
                "Creep1et",
                "QuotheTheRaven",
                "RAHplaysMC24",
                "Rainbow_Rare"
            ]
        }
    ],

    // TGTTOS, PKW, SB, BB, RSR, HITW
    // Individual scores before game multipliers.
    scores: {
        "Wailed_Burrito61": [
            1048, 830, 836, 585, 1000, 660
        ],
        "KweenLegend": [
            595, 760, 280, 450, 875, 975
        ],
        "ItsMrChick3nMan": [
            795, 962, 564, 517.5, 975, 715
        ],
        "JitsuZombie06": [
            856, 414, 484, 517.5, 450, 570
        ],

        "FennecFox1247": [
            1407, 900, 580, 472.5, 900, 1215
        ],
        "GriffinTheGopher": [
            235, 122, 212, 270, 275, 515
        ],
        "FroopyLoopidy": [
            447, 438, 228, 225, 375, 665
        ],
        "DelphinXD": [
            731, 590, 336, 247.5, 325, 145
        ],

        "NotAGoodIGN": [
            1343, 946, 324, 457.5, 1625, 1540
        ],
        "huskyjasmin": [
            185, 130, 288, 390, 200, 210
        ],
        "5hys": [
            668, 490, 564, 390, 1300, 520
        ],
        "Hoin": [
            830, 800, 584, 502.5, 1525, 500
        ],

        "Mimikkip": [
            519, 676, 640, 502.5, 1000, 1100
        ],
        "Jamescannon86": [
            693, 1022, 860, 502.5, 1000, 1140
        ],
        "Sacred_Bean": [
            768, 830, 800, 367.5, 675, 940
        ],
        "Awsomeants": [
            391, 192, 340, 390, 1150, 385
        ],

        "Creep1et": [
            1508, 1240, 2292, 675, 1200, 1905
        ],
        "QuotheTheRaven": [
            87, 130, 292, 472.5, 50, 180
        ],
        "RAHplaysMC24": [
            596, 568, 548, 517.5, 800, 465
        ],
        "Rainbow_Rare": [
            266, 230, 620, 450, 300, 415
        ]
    }
},

{
    id: 20,
    name: "MCCC Duos",
    date: null,
    season: 2,
    noncanon: true,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["orange", "green"],
        winner: "orange"
    },

    games: [
        "battle_box",
        "tgttos",
        "hole_in_the_wall",
        "sky_battle",
        "parkour_warrior",
        "rocket_spleef_rush"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "red",
            name: "Red Rabbits",
            color: "#ff4444",
            players: ["DelphinXD", "Wailed_Burrito61"]
        },
        {
            id: "orange",
            name: "Orange Ocelots",
            color: "#ff9900",
            players: ["NotAGoodIGN", "Jazzieeeeeee"]
        },
        {
            id: "lime",
            name: "Lime Llamas",
            color: "#44ff44",
            players: ["Jamescannon86", "KweenLegend"]
        },
        {
            id: "green",
            name: "Green Geckos",
            color: "#00aa00",
            players: ["Frogo62", "Ev4An"]
        },
        {
            id: "aqua",
            name: "Aqua Axolotls",
            color: "#55ccff",
            players: ["FennecFox1247", "RAHplaysMC24"]
        },
        {
            id: "cyan",
            name: "Cyan Coyotes",
            color: "#00aaaa",
            players: ["5hys", "Sacred_Bean"]
        },
        {
            id: "blue",
            name: "Blue Bats",
            color: "#5555ff",
            players: ["Awsomeants", "Drakon52"]
        }
    ],

    scores: {
        "DelphinXD":       [690, 656, 660, 169, 573, 725],
        "Wailed_Burrito61":[735, 874, 730, 49, 849, 875],

        "NotAGoodIGN":     [727.5, 1194, 1375, 1225, 1133, 1475],
        "Jazzieeeeeee":    [457.5, 369, 690, 497, 399, 150],

        "Jamescannon86":   [780, 517, 1335, 395, 522, 600],
        "KweenLegend":     [577.5, 558, 1115, 399, 690, 525],

        "Frogo62":         [1282.5, 835, 355, 1133, 958, 825],
        "Ev4An":           [1237.5, 455, 990, 737, 225, 0],

        "FennecFox1247":   [1087.5, 822, 1210, 745, 744, 825],
        "RAHplaysMC24":    [840, 356, 185, 281, 432, 475],

        "5hys":            [945, 610, 880, 355, 468, 400],
        "Sacred_Bean":     [720, 793, 1075, 275, 783, 900],

        "Awsomeants":      [787.5, 347, 340, 218, 60, 350],
        "Drakon52":        [922.5, 941, 570, 626, 831, 150]
    }
},
{
    id: 21,
    name: "MCCC 18",
    date: null,
    season: 2,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["purple", "pink"],
        winner: "pink"
    },

    games: [
        "rocket_spleef_rush",
        "parkour_warrior",
        "sky_battle",
        "tgttos",
        "hole_in_the_wall",
        "battle_box"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "orange",
            name: "Orange Ocelots",
            color: "#ff9900",
            players: [
                "Jazzieeeeeee",
                "Iadide",
                "FennecFox1247",
                "ItsMrChick3nMan"
            ]
        },
        {
            id: "cyan",
            name: "Cyan Coyotes",
            color: "#00bfa5",
            players: [
                "funkyman376",
                "FroopyLoopidy",
                "Drakon52",
                "NotAGoodIGN"
            ]
        },
        {
            id: "purple",
            name: "Purple Pandas",
            color: "#aa44ff",
            players: [
                "5hys",
                "Wailed_Burrito61",
                "Jamescannon86",
                "DelphinXD"
            ]
        },
        {
            id: "pink",
            name: "Pink Parrots",
            color: "#ff55cc",
            players: [
                "RAHplaysMC24",
                "JollyLemur",
                "Creep1et",
                "Pinewoodcar34"
            ]
        }
    ],

    // RSR, PKW, SB, TGTTOS, HITW, BB
    // Individual scores before game multipliers.
    scores: {
        "Jazzieeeeeee": [
            250, 374, 355, 357, 350, 165
        ],
        "Iadide": [
            275, 146, 539, 206, 465, 142.5
        ],
        "FennecFox1247": [
            1125, 874, 1067, 1112, 1400, 277.5
        ],
        "ItsMrChick3nMan": [
            875, 896, 467, 814, 1265, 232.5
        ],

        "funkyman376": [
            100, 160, 235, 143, 330, 202.5
        ],
        "FroopyLoopidy": [
            725, 412, 283, 395, 675, 202.5
        ],
        "Drakon52": [
            500, 804, 451, 1054, 870, 247.5
        ],
        "NotAGoodIGN": [
            1025, 958, 559, 1155, 1565, 495
        ],

        "5hys": [
            600, 664, 596, 862, 565, 345
        ],
        "Wailed_Burrito61": [
            800, 558, 400, 902, 1070, 502.5
        ],
        "Jamescannon86": [
            1125, 658, 804, 947, 930, 502.5
        ],
        "DelphinXD": [
            1075, 696, 396, 546, 470, 435
        ],

        "RAHplaysMC24": [
            475, 626, 520, 539, 790, 570
        ],
        "JollyLemur": [
            75, 0, 268, 21, 150, 480
        ],
        "Creep1et": [
            1500, 1290, 1595, 1332, 1555, 1042.5
        ],
        "Pinewoodcar34": [
            75, 154, 276, 339, 120, 570
        ]
    }
},

{
    id: 22,
    name: "MCCC 19",
    date: null,
    season: 2,
    banner: "assets/backgrounds/main-lobby.webp",

    dodgebolt: {
        finalists: ["cyan", "yellow"],
        winner: "yellow"
    },

    games: [
        "rocket_spleef_rush",
        "tgttos",
        "sky_battle",
        "parkour_warrior",
        "hole_in_the_wall",
        "battle_box"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "red",
            name: "Red Rabbits",
            color: "#ff4444",
            players: [
                "NotAGoodIGN",
                "5hys",
                "RAHplaysMC24",
                "JitsuZombie06"
            ]
        },
        {
            id: "yellow",
            name: "Yellow Yaks",
            color: "#ffdd00",
            players: [
                "Frogo62",
                "MrLukieCookie",
                "Sacred_Bean",
                "Duckling2468"
            ]
        },
        {
            id: "green",
            name: "Green Geckos",
            color: "#00aa00",
            players: [
                "Wailed_Burrito61",
                "ItsMrChick3nMan",
                "KweenLegend",
                "Theactualone__"
            ]
        },
        {
            id: "cyan",
            name: "Cyan Coyotes",
            color: "#00aaaa",
            players: [
                "Creep1et",
                "Drakon52",
                "GriffinTheGopher",
                "JollyLemur"
            ]
        },
        {
            id: "purple",
            name: "Purple Pandas",
            color: "#aa00ff",
            players: [
                "FennecFox1247",
                "Jamescannon86",
                "DelphinXD",
                "Princessnini20"
            ]
        }
    ],

    scores: {
        "NotAGoodIGN":       [1275, 1307, 408, 916, 1230, 630],
        "5hys":              [725, 575, 460, 452, 400, 472.5],
        "RAHplaysMC24":      [425, 682, 308, 262, 675, 405],
        "JitsuZombie06":     [175, 602, 508, 316, 800, 540],

        "Frogo62":           [1550, 1081, 704, 676, 1125, 375],
        "MrLukieCookie":     [875, 690, 388, 630, 1000, 352.5],
        "Sacred_Bean":       [500, 764, 316, 992, 995, 352.5],
        "Duckling2468":      [1250, 840, 376, 438, 450, 397.5],

        "Wailed_Burrito61":  [575, 482, 140, 568, 710, 172.5],
        "ItsMrChick3nMan":   [1100, 756, 116, 852, 245, 82.5],
        "KweenLegend":       [550, 662, 92, 684, 880, 127.5],
        "Theactualone__":   [300, 226, 104, 192, 125, 105],

        "Creep1et":          [1475, 1662, 3128, 1386, 1905, 960],
        "Drakon52":          [900, 957, 588, 954, 755, 487.5],
        "GriffinTheGopher":  [600, 167, 300, 200, 185, 442.5],
        "JollyLemur":        [150, 75, 308, 0, 320, 465],

        "FennecFox1247":     [1275, 970, 1024, 722, 910, 322.5],
        "Jamescannon86":     [1225, 770, 1080, 900, 1465, 300],
        "DelphinXD":         [1075, 539, 700, 806, 465, 142.5],
        "Princessnini20":    [50, 152, 532, 54, 120, 120]
    }
},




];


/* ==========================================
   NEXT EVENT PROJECTION
   ========================================== */


const MCCC_PROJECTION = {
    name: "MCCC Halloween",

    games: [
        "sky_battle",
        "rocket_spleef_rush",
        "tgttos",
        "hole_in_the_wall",
        "parkour_warrior",
        "battle_box"
    ],

    multipliers: [1, 1.5, 2, 2, 2.5, 3],

    teams: [
        {
            id: "red",
            name: "Red Ravens",
            color: "#ff4444",
            icon: "assets/teams/halloween/red.webp",
            players: [
                "Haze7895",
                "FennecFox1247",
                "DelphinXD",
                "KweenLegend"
            ]
        },
        {
            id: "mustard",
            name: "Mustard Mummies",
            color: "#c5a333",
            icon: "assets/teams/halloween/yellow.webp",
            players: [
                "funkyman376",
                "vazzavv",
                "GriffinTheGopher",
                "Jamescannon86"
            ]
        },
        {
            id: "lime",
            name: "Lime Liches",
            color: "#76c83c",
            icon: "assets/teams/halloween/lime.webp",
            players: [
                "ItsMrChick3nMan",
                "Frogo62",
                "Paddyproo",
                "Ev4An"
            ]
        },
        {
            id: "aqua",
            name: "Aqua Abominations",
            color: "#36cbd3",
            icon: "assets/teams/halloween/aqua.webp",
            players: [
                "Pinewoodcar34",
                "Princessnini20",
                "Creep1et",
                "Leetavious"
            ]
        },
        {
            id: "violet",
            name: "Violet Vampires",
            color: "#a05bd6",
            icon: "assets/teams/halloween/purple.webp",
            players: [
                "Sacred_Bean",
                "RAHplaysMC24",
                "Wailed_Burrito61",
                "JitsuZombie06"
            ]
        }
    ],

    newcomers: {
        "Leetavious": 1000
    }
};


/* ==========================================
   SHARED DATA HELPERS
   ========================================== */

function getEventById(eventId) {
    return MCCC_EVENTS.find(
        event => event.id === Number(eventId)
    );
}

function getLatestEvent() {
    return MCCC_EVENTS[MCCC_EVENTS.length - 1];
}

function getPlayerTeam(event, playerName) {
    return event.teams.find(
        team => team.players.includes(playerName)
    );
}

function getPlayerGameScore(event, playerName, gameId) {
    const gameIndex = event.games.indexOf(gameId);

    if (gameIndex === -1) return null;

    const scores = event.scores[playerName];

    if (!scores) return null;

    return scores[gameIndex] ?? null;
}

function getPlayerTotal(event, playerName, multiplied = false) {
    const scores = event.scores[playerName];

    if (!scores) return null;

    return scores.reduce((total, score, index) => {
        const multiplier = multiplied
            ? event.multipliers[index]
            : 1;

        return total + score * multiplier;
    }, 0);
}

function getTeamTotal(event, team, multiplied = true) {
    // Add up the real players' scores
    const playerTotal = team.players.reduce((total, playerName) => {
        return total + (
            getPlayerTotal(event, playerName, multiplied) ?? 0
        );
    }, 0);

    // Get any ghost scores belonging to this team
    const ghostScores = event.ghostScores?.[team.id] || [];

    // Add the ghost scores, applying multipliers when needed
    const ghostTotal = ghostScores.reduce((total, score, index) => {
        const multiplier = multiplied
            ? (event.multipliers?.[index] ?? 1)
            : 1;

        return total + score * multiplier;
    }, 0);

    return playerTotal + ghostTotal;
}

/* ==========================================
   GLOBAL DATA ACCESS
   ========================================== */

window.MCCC_GAMES = MCCC_GAMES;
window.MCCC_EVENTS = MCCC_EVENTS;
window.MCCC_PROJECTION = MCCC_PROJECTION;

window.MCCC_PLAYERS = [
    ...new Set(
        MCCC_EVENTS.flatMap(event =>
            event.teams.flatMap(team => team.players)
        )
    )
].sort((a, b) => a.localeCompare(b));

window.MCCC_DATA = {
    getEventById,
    getLatestEvent,
    getPlayerTeam,
    getPlayerGameScore,
    getPlayerTotal,
    getTeamTotal
};


