// ========================================
// 深淵探險者 - Roguelike RPG Game
// ========================================

// 遊戲常量
const GRID_SIZE = 15;
const CELL_TYPES = {
    EMPTY: 0,
    WALL: 1,
    PLAYER: 2,
    ENEMY: 3,
    ITEM: 4,
    STAIRS: 5,
    TRAP: 6
};

// 技能樹系統 - 每個職業的技能樹
const SKILL_TREES = {
    warrior: [
        { id: 'w1', name: '重擊', level: 1, maxLevel: 5, mpCost: 10, desc: '造成120%~200%傷害', 
          effect: (player, enemy, level) => {
            const damage = Math.floor(player.attack * (1 + level * 0.2) - enemy.defense);
            return { damage: Math.max(1, damage), message: `⚔️ 重擊 Lv.${level}！` };
          }
        },
        { id: 'w2', name: '鐵壁防禦', level: 3, maxLevel: 3, mpCost: 15, desc: '3回合內防禦+50%~150%', 
          effect: (player, enemy, level) => {
            player.tempDefenseBonus = Math.floor(player.defense * level * 0.5);
            player.defenseBuffTurns = 3;
            return { damage: 0, message: `🛡️ 鐵壁防禦 Lv.${level}！防禦大幅提升`, isDefense: true };
          }
        },
        { id: 'w3', name: '戰吼', level: 5, maxLevel: 3, mpCost: 20, desc: '降低敵人10%~30%攻擊力3回合', 
          effect: (player, enemy, level) => {
            enemy.attackDebuff = Math.floor(enemy.attack * level * 0.1);
            enemy.debuffTurns = 3;
            return { damage: 0, message: `📢 戰吼 Lv.${level}！敵人攻擊力降低` };
          }
        },
        { id: 'w4', name: '順劈斬', level: 8, maxLevel: 5, mpCost: 25, desc: '造成150%~250%傷害，無視30%防禦', 
          effect: (player, enemy, level) => {
            const defense = Math.floor(enemy.defense * 0.7);
            const damage = Math.floor(player.attack * (1.3 + level * 0.2) - defense);
            return { damage: Math.max(1, damage), message: `⚡ 順劈斬 Lv.${level}！` };
          }
        }
    ],
    mage: [
        { id: 'm1', name: '魔法飛彈', level: 1, maxLevel: 5, mpCost: 12, desc: '造成130%~210%魔法傷害', 
          effect: (player, enemy, level) => {
            const damage = Math.floor(player.attack * (1.1 + level * 0.2));
            return { damage: Math.max(1, damage), message: `✨ 魔法飛彈 Lv.${level}！` };
          }
        },
        { id: 'm2', name: '寒冰箭', level: 3, maxLevel: 3, mpCost: 18, desc: '造成150%傷害，減緩敵人1~3回合', 
          effect: (player, enemy, level) => {
            const damage = Math.floor(player.attack * 1.5);
            enemy.slowTurns = level;
            return { damage: Math.max(1, damage), message: `❄️ 寒冰箭 Lv.${level}！敵人被減速` };
          }
        },
        { id: 'm3', name: '魔力護盾', level: 5, maxLevel: 3, mpCost: 20, desc: '吸收20%~60%最大生命的傷害', 
          effect: (player, enemy, level) => {
            player.shield = Math.floor(player.maxHp * level * 0.2);
            return { damage: 0, message: `🛡️ 魔力護盾 Lv.${level}！獲得${player.shield}點護盾`, isDefense: true };
          }
        },
        { id: 'm4', name: '閃電鏈', level: 8, maxLevel: 5, mpCost: 30, desc: '造成180%~300%魔法傷害', 
          effect: (player, enemy, level) => {
            const damage = Math.floor(player.attack * (1.4 + level * 0.3));
            return { damage: Math.max(1, damage), message: `⚡ 閃電鏈 Lv.${level}！` };
          }
        }
    ],
    priest: [
        { id: 'p1', name: '治療術', level: 1, maxLevel: 5, mpCost: 15, desc: '恢復30%~50%最大生命', 
          effect: (player, enemy, level) => {
            const heal = Math.floor(player.maxHp * (0.2 + level * 0.06));
            player.hp = Math.min(player.maxHp, player.hp + heal);
            return { damage: 0, message: `✨ 治療術 Lv.${level}！恢復${heal}生命`, isHeal: true };
          }
        },
        { id: 'p2', name: '神聖之光', level: 3, maxLevel: 3, mpCost: 18, desc: '造成140%傷害，對不死系180%', 
          effect: (player, enemy, level) => {
            const multiplier = (enemy.name.includes('骷髏') || enemy.name.includes('吸血鬼')) ? 1.8 : 1.4;
            const damage = Math.floor(player.attack * multiplier * (1 + (level - 1) * 0.2));
            return { damage: Math.max(1, damage), message: `✨ 神聖之光 Lv.${level}！` };
          }
        },
        { id: 'p3', name: '祝福', level: 5, maxLevel: 3, mpCost: 20, desc: '增加15%~45%攻擊力3回合', 
          effect: (player, enemy, level) => {
            player.attackBuff = Math.floor(player.attack * level * 0.15);
            player.buffTurns = 3;
            return { damage: 0, message: `🙏 祝福 Lv.${level}！攻擊力提升` };
          }
        },
        { id: 'p4', name: '神聖新星', level: 8, maxLevel: 5, mpCost: 35, desc: '造成200%~320%傷害並恢復20%生命', 
          effect: (player, enemy, level) => {
            const damage = Math.floor(player.attack * (1.6 + level * 0.3));
            const heal = Math.floor(player.maxHp * 0.2);
            player.hp = Math.min(player.maxHp, player.hp + heal);
            return { damage: Math.max(1, damage), message: `💫 神聖新星 Lv.${level}！恢復${heal}生命` };
          }
        }
    ],
    rogue: [
        { id: 'r1', name: '暗襲', level: 1, maxLevel: 5, mpCost: 12, desc: '造成140%~220%傷害', 
          effect: (player, enemy, level) => {
            const damage = Math.floor(player.attack * (1.2 + level * 0.2) - enemy.defense * 0.5);
            return { damage: Math.max(1, damage), message: `🗡️ 暗襲 Lv.${level}！` };
          }
        },
        { id: 'r2', name: '毒刃', level: 3, maxLevel: 3, mpCost: 15, desc: '造成120%傷害，中毒持續扣血2~4回合', 
          effect: (player, enemy, level) => {
            const damage = Math.floor(player.attack * 1.2 - enemy.defense * 0.5);
            enemy.poison = Math.floor(player.attack * 0.3);
            enemy.poisonTurns = level + 1;
            return { damage: Math.max(1, damage), message: `🧪 毒刃 Lv.${level}！敵人中毒` };
          }
        },
        { id: 'r3', name: '閃避步', level: 5, maxLevel: 3, mpCost: 18, desc: '下回合30%~90%機率閃避攻擊', 
          effect: (player, enemy, level) => {
            player.dodgeChance = level * 0.3;
            player.dodgeTurns = 1;
            return { damage: 0, message: `💨 閃避步 Lv.${level}！進入閃避狀態`, isDefense: true };
          }
        },
        { id: 'r4', name: '背刺', level: 8, maxLevel: 5, mpCost: 25, desc: '造成250%~450%暴擊傷害', 
          effect: (player, enemy, level) => {
            const damage = Math.floor(player.attack * (2 + level * 0.5) - enemy.defense * 0.3);
            return { damage: Math.max(1, damage), message: `💀 背刺 Lv.${level}！`, isCrit: true };
          }
        }
    ]
};

// 職業系統
const CLASSES = {
    // 初始職業
    warrior: {
        name: '戰士',
        icon: '⚔️',
        hp: 120,
        mp: 30,
        attack: 15,
        defense: 8,
        critChance: 0.1,
        skillName: '狂暴打擊',
        skillDesc: '消耗15魔力，造成200%傷害',
        mpCost: 15,
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 2 - enemy.defense);
            return { damage: Math.max(1, damage), message: '⚔️ 狂暴打擊！', hpCost: 0 };
        }
    },
    mage: {
        name: '法師',
        icon: '🔮',
        hp: 80,
        mp: 100,
        attack: 18,
        defense: 3,
        critChance: 0.15,
        skillName: '火球術',
        skillDesc: '消耗20魔力，造成250%魔法傷害',
        mpCost: 20,
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 2.5);
            return { damage: Math.max(1, damage), message: '🔥 火球術！', hpCost: 0 };
        }
    },
    priest: {
        name: '牧師',
        icon: '✨',
        hp: 100,
        mp: 80,
        attack: 10,
        defense: 6,
        critChance: 0.08,
        skillName: '神聖治療',
        skillDesc: '消耗25魔力，恢復40%生命值',
        mpCost: 25,
        skillEffect: (player, enemy) => {
            const heal = Math.floor(player.maxHp * 0.4);
            player.hp = Math.min(player.maxHp, player.hp + heal);
            return { damage: 0, message: `✨ 神聖治療！恢復 ${heal} 生命值`, hpCost: 0, isHeal: true };
        }
    },
    rogue: {
        name: '盜賊',
        icon: '🗡️',
        hp: 90,
        mp: 50,
        attack: 14,
        defense: 5,
        critChance: 0.25,
        skillName: '致命一擊',
        skillDesc: '消耗18魔力，必定暴擊造成300%傷害',
        mpCost: 18,
        skillEffect: (player, enemy) => {
            const damage = Math.floor((player.attack * 3 - enemy.defense));
            return { damage: Math.max(1, damage), message: '💀 致命一擊！', hpCost: 0, isCrit: true };
        }
    },
    
    // 戰士一轉
    berserker: {
        name: '狂戰士',
        icon: '⚔️',
        baseClass: 'warrior',
        hp: 140,
        mp: 40,
        attack: 20,
        defense: 10,
        critChance: 0.15,
        skillName: '嗜血狂怒',
        skillDesc: '消耗25魔力，造成300%傷害並吸取30%生命',
        mpCost: 25,
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 3 - enemy.defense);
            const lifesteal = Math.floor(damage * 0.3);
            player.hp = Math.min(player.maxHp, player.hp + lifesteal);
            return { damage: Math.max(1, damage), message: `💢 嗜血狂怒！吸取 ${lifesteal} 生命`, hpCost: 0 };
        }
    },
    paladin: {
        name: '聖騎士',
        icon: '🛡️',
        baseClass: 'warrior',
        hp: 150,
        mp: 60,
        attack: 18,
        defense: 15,
        critChance: 0.12,
        skillName: '神聖打擊',
        skillDesc: '消耗22魔力，造成180%傷害並恢復20%生命',
        mpCost: 22,
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 1.8 - enemy.defense);
            const heal = Math.floor(player.maxHp * 0.2);
            player.hp = Math.min(player.maxHp, player.hp + heal);
            return { damage: Math.max(1, damage), message: `⚡ 神聖打擊！恢復 ${heal} 生命`, hpCost: 0 };
        }
    },
    
    // 法師一轉
    elementalist: {
        name: '元素使',
        icon: '🌟',
        baseClass: 'mage',
        hp: 95,
        mp: 120,
        attack: 25,
        defense: 5,
        critChance: 0.20,
        skillName: '元素爆發',
        skillDesc: '消耗35魔力，造成350%魔法傷害',
        mpCost: 35,
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 3.5);
            return { damage: Math.max(1, damage), message: '💥 元素爆發！', hpCost: 0 };
        }
    },
    warlock: {
        name: '術士',
        icon: '🌙',
        baseClass: 'mage',
        hp: 100,
        mp: 110,
        attack: 22,
        defense: 6,
        critChance: 0.18,
        skillName: '暗影詛咒',
        skillDesc: '消耗28魔力，造成280%傷害並削弱敵人',
        mpCost: 28,
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 2.8);
            enemy.defense = Math.max(0, enemy.defense - 3);
            return { damage: Math.max(1, damage), message: '🌑 暗影詛咒！敵人防禦降低', hpCost: 0 };
        }
    },
    
    // 牧師一轉
    bishop: {
        name: '主教',
        icon: '⛪',
        baseClass: 'priest',
        hp: 120,
        mp: 100,
        attack: 15,
        defense: 10,
        critChance: 0.10,
        skillName: '神聖審判',
        skillDesc: '消耗30魔力，造成200%傷害並恢復30%生命',
        mpCost: 30,
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 2 - enemy.defense);
            const heal = Math.floor(player.maxHp * 0.3);
            player.hp = Math.min(player.maxHp, player.hp + heal);
            return { damage: Math.max(1, damage), message: `⚡ 神聖審判！恢復 ${heal} 生命`, hpCost: 0 };
        }
    },
    monk: {
        name: '武僧',
        icon: '🥋',
        baseClass: 'priest',
        hp: 110,
        mp: 70,
        attack: 18,
        defense: 8,
        critChance: 0.22,
        skillName: '連環掌',
        skillDesc: '消耗25魔力，連續攻擊3次',
        mpCost: 25,
        skillEffect: (player, enemy) => {
            const singleDamage = Math.floor(player.attack * 0.7 - enemy.defense * 0.5);
            const totalDamage = Math.max(3, singleDamage * 3);
            return { damage: totalDamage, message: '👊 連環掌！', hpCost: 0 };
        }
    },
    
    // 盜賊一轉
    assassin: {
        name: '刺客',
        icon: '🗡️',
        baseClass: 'rogue',
        hp: 105,
        mp: 60,
        attack: 22,
        defense: 7,
        critChance: 0.35,
        skillName: '暗殺',
        skillDesc: '消耗30魔力，必定暴擊造成400%傷害',
        mpCost: 30,
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 4 - enemy.defense);
            return { damage: Math.max(1, damage), message: '🔪 暗殺！', hpCost: 0, isCrit: true };
        }
    },
    ranger: {
        name: '遊俠',
        icon: '🏹',
        baseClass: 'rogue',
        hp: 100,
        mp: 65,
        attack: 20,
        defense: 8,
        critChance: 0.30,
        skillName: '多重射擊',
        skillDesc: '消耗22魔力，造成250%傷害無視防禦',
        mpCost: 22,
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 2.5);
            return { damage: Math.max(1, damage), message: '🏹 多重射擊！', hpCost: 0 };
        }
    },
    
    // 戰士二轉
    warlord: {
        name: '戰爭領主',
        icon: '👑',
        baseClass: 'berserker',
        hp: 180,
        mp: 50,
        attack: 30,
        defense: 15,
        critChance: 0.20,
        skillName: '戰爭怒吼',
        skillDesc: '消耗40魔力，造成400%傷害並吸取25%生命',
        mpCost: 40,
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 4 - enemy.defense);
            const lifesteal = Math.floor(damage * 0.25);
            player.hp = Math.min(player.maxHp, player.hp + lifesteal);
            return { damage: Math.max(1, damage), message: `⚔️ 戰爭怒吼！吸取 ${lifesteal} 生命`, hpCost: 0 };
        }
    },
    gladiator: {
        name: '劍鬥士',
        icon: '🗡️',
        baseClass: 'berserker',
        hp: 170,
        attack: 32,
        defense: 12,
        critChance: 0.25,
        skillName: '終結技',
        skillDesc: '造成 450% 暴擊傷害',
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 4.5 - enemy.defense);
            return { damage: Math.max(1, damage), message: '💥 終結技！', hpCost: 0, isCrit: true };
        }
    },
    crusader: {
        name: '十字軍',
        icon: '✝️',
        baseClass: 'paladin',
        hp: 200,
        attack: 25,
        defense: 20,
        critChance: 0.15,
        skillName: '聖光審判',
        skillDesc: '造成 280% 傷害並恢復 30% 生命',
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 2.8 - enemy.defense);
            const heal = Math.floor(player.maxHp * 0.3);
            player.hp = Math.min(player.maxHp, player.hp + heal);
            return { damage: Math.max(1, damage), message: `⚡ 聖光審判！恢復 ${heal} 生命`, hpCost: 0 };
        }
    },
    guardian: {
        name: '守護者',
        icon: '🛡️',
        baseClass: 'paladin',
        hp: 220,
        attack: 22,
        defense: 25,
        critChance: 0.12,
        skillName: '不屈意志',
        skillDesc: '造成 200% 傷害並獲得護盾',
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 2 - enemy.defense);
            const shield = Math.floor(player.maxHp * 0.2);
            player.hp = Math.min(player.maxHp, player.hp + shield);
            return { damage: Math.max(1, damage), message: `🛡️ 不屈意志！獲得 ${shield} 護盾`, hpCost: 0 };
        }
    },
    
    // 法師二轉
    archmage: {
        name: '大法師',
        icon: '🔮',
        baseClass: 'elementalist',
        hp: 120,
        attack: 38,
        defense: 8,
        critChance: 0.25,
        skillName: '奧術轟炸',
        skillDesc: '造成 500% 魔法傷害',
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 5);
            return { damage: Math.max(1, damage), message: '💫 奧術轟炸！', hpCost: 0 };
        }
    },
    stormcaller: {
        name: '風暴使者',
        icon: '⚡',
        baseClass: 'elementalist',
        hp: 115,
        attack: 35,
        defense: 10,
        critChance: 0.30,
        skillName: '雷霆風暴',
        skillDesc: '造成 450% 傷害並降低敵人攻擊',
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 4.5);
            enemy.attack = Math.max(1, enemy.attack - 5);
            return { damage: Math.max(1, damage), message: '⚡ 雷霆風暴！敵人攻擊降低', hpCost: 0 };
        }
    },
    necromancer: {
        name: '死靈法師',
        icon: '💀',
        baseClass: 'warlock',
        hp: 130,
        attack: 32,
        defense: 10,
        critChance: 0.22,
        skillName: '生命汲取',
        skillDesc: '造成 350% 傷害並吸取生命',
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 3.5);
            const lifesteal = Math.floor(damage * 0.5);
            player.hp = Math.min(player.maxHp, player.hp + lifesteal);
            return { damage: Math.max(1, damage), message: `💀 生命汲取！吸收 ${lifesteal} 生命`, hpCost: 0 };
        }
    },
    demonologist: {
        name: '惡魔學者',
        icon: '😈',
        baseClass: 'warlock',
        hp: 125,
        attack: 34,
        defense: 8,
        critChance: 0.20,
        skillName: '惡魔契約',
        skillDesc: '消耗 30% 生命造成 550% 傷害',
        skillEffect: (player, enemy) => {
            const hpCost = Math.floor(player.maxHp * 0.3);
            const damage = Math.floor(player.attack * 5.5);
            return { damage: Math.max(1, damage), message: '😈 惡魔契約！', hpCost };
        }
    },
    
    // 牧師二轉
    cardinal: {
        name: '紅衣主教',
        icon: '👼',
        baseClass: 'bishop',
        hp: 160,
        attack: 22,
        defense: 15,
        critChance: 0.15,
        skillName: '神聖之光',
        skillDesc: '造成 300% 傷害並恢復 50% 生命',
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 3 - enemy.defense);
            const heal = Math.floor(player.maxHp * 0.5);
            player.hp = Math.min(player.maxHp, player.hp + heal);
            return { damage: Math.max(1, damage), message: `✨ 神聖之光！恢復 ${heal} 生命`, hpCost: 0 };
        }
    },
    prophet: {
        name: '先知',
        icon: '🔯',
        baseClass: 'bishop',
        hp: 150,
        attack: 25,
        defense: 12,
        critChance: 0.18,
        skillName: '預言打擊',
        skillDesc: '必定暴擊造成 350% 傷害',
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 3.5 - enemy.defense);
            return { damage: Math.max(1, damage), message: '🔯 預言打擊！', hpCost: 0, isCrit: true };
        }
    },
    grandmaster: {
        name: '宗師',
        icon: '🏯',
        baseClass: 'monk',
        hp: 140,
        attack: 28,
        defense: 12,
        critChance: 0.35,
        skillName: '究極連擊',
        skillDesc: '連續攻擊 5 次',
        skillEffect: (player, enemy) => {
            const singleDamage = Math.floor(player.attack * 0.7 - enemy.defense * 0.3);
            const totalDamage = Math.max(5, singleDamage * 5);
            return { damage: totalDamage, message: '🥊 究極連擊！', hpCost: 0 };
        }
    },
    champion: {
        name: '鬥士',
        icon: '💪',
        baseClass: 'monk',
        hp: 145,
        attack: 30,
        defense: 14,
        critChance: 0.30,
        skillName: '破甲掌',
        skillDesc: '造成 380% 傷害並降低敵人防禦',
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 3.8 - enemy.defense * 0.5);
            enemy.defense = Math.max(0, enemy.defense - 5);
            return { damage: Math.max(1, damage), message: '💥 破甲掌！敵人防禦降低', hpCost: 0 };
        }
    },
    
    // 盜賊二轉
    shadowblade: {
        name: '影刃',
        icon: '🌑',
        baseClass: 'assassin',
        hp: 130,
        attack: 35,
        defense: 10,
        critChance: 0.45,
        skillName: '影襲',
        skillDesc: '必定暴擊造成 550% 傷害',
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 5.5 - enemy.defense);
            return { damage: Math.max(1, damage), message: '🌑 影襲！', hpCost: 0, isCrit: true };
        }
    },
    nightblade: {
        name: '夜刃',
        icon: '🔪',
        baseClass: 'assassin',
        hp: 125,
        attack: 38,
        defense: 8,
        critChance: 0.50,
        skillName: '致命毒刃',
        skillDesc: '造成 500% 暴擊傷害並持續傷害',
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 5 - enemy.defense);
            const dot = Math.floor(player.attack * 0.5);
            enemy.hp -= dot; // 額外持續傷害
            return { damage: Math.max(1, damage), message: `🔪 致命毒刃！額外 ${dot} 毒傷`, hpCost: 0, isCrit: true };
        }
    },
    sniper: {
        name: '狙擊手',
        icon: '🎯',
        baseClass: 'ranger',
        hp: 120,
        attack: 33,
        defense: 12,
        critChance: 0.40,
        skillName: '致命射擊',
        skillDesc: '造成 480% 傷害，無視防禦',
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 4.8);
            return { damage: Math.max(1, damage), message: '🎯 致命射擊！', hpCost: 0 };
        }
    },
    beastmaster: {
        name: '馴獸師',
        icon: '🐺',
        baseClass: 'ranger',
        hp: 135,
        attack: 28,
        defense: 15,
        critChance: 0.35,
        skillName: '野獸之怒',
        skillDesc: '造成 350% 傷害並恢復生命',
        skillEffect: (player, enemy) => {
            const damage = Math.floor(player.attack * 3.5);
            const heal = Math.floor(damage * 0.3);
            player.hp = Math.min(player.maxHp, player.hp + heal);
            return { damage: Math.max(1, damage), message: `🐺 野獸之怒！恢復 ${heal} 生命`, hpCost: 0 };
        }
    }
};

// 職業進階路線
const JOB_ADVANCEMENT = {
    10: {
        warrior: ['berserker', 'paladin'],
        mage: ['elementalist', 'warlock'],
        priest: ['bishop', 'monk'],
        rogue: ['assassin', 'ranger']
    },
    30: {
        berserker: ['warlord', 'gladiator'],
        paladin: ['crusader', 'guardian'],
        elementalist: ['archmage', 'stormcaller'],
        warlock: ['necromancer', 'demonologist'],
        bishop: ['cardinal', 'prophet'],
        monk: ['grandmaster', 'champion'],
        assassin: ['shadowblade', 'nightblade'],
        ranger: ['sniper', 'beastmaster']
    }
};

// 敵人模板
const ENEMY_TEMPLATES = [
    { name: '哥布林', avatar: '👹', hp: 30, attack: 5, defense: 2, exp: 20, gold: 10, level: 1 },
    { name: '骷髏戰士', avatar: '💀', hp: 45, attack: 8, defense: 3, exp: 35, gold: 20, level: 2 },
    { name: '黑暗法師', avatar: '🧙‍♂️', hp: 40, attack: 12, defense: 2, exp: 45, gold: 30, level: 3 },
    { name: '獸人勇士', avatar: '👺', hp: 70, attack: 10, defense: 5, exp: 55, gold: 35, level: 4 },
    { name: '石像鬼', avatar: '🗿', hp: 90, attack: 12, defense: 8, exp: 70, gold: 45, level: 5 },
    { name: '惡魔', avatar: '😈', hp: 100, attack: 15, defense: 6, exp: 90, gold: 60, level: 6 },
    { name: '吸血鬼', avatar: '🧛', hp: 85, attack: 18, defense: 5, exp: 100, gold: 70, level: 7 },
    { name: '龍族守衛', avatar: '🐉', hp: 150, attack: 20, defense: 10, exp: 150, gold: 100, level: 8 },
    { name: '深淵領主', avatar: '👿', hp: 200, attack: 25, defense: 12, exp: 200, gold: 150, level: 9 }
];

// 物品模板
const ITEM_TEMPLATES = [
    { name: '小型血瓶', type: 'consumable', avatar: '🧪', effect: { hp: 30 }, rarity: 'common', price: 20 },
    { name: '中型血瓶', type: 'consumable', avatar: '⚗️', effect: { hp: 60 }, rarity: 'uncommon', price: 40 },
    { name: '大型血瓶', type: 'consumable', avatar: '💊', effect: { hp: 100 }, rarity: 'rare', price: 80 },
    { name: '小型魔瓶', type: 'consumable', avatar: '🔵', effect: { mp: 20 }, rarity: 'common', price: 20 },
    { name: '中型魔瓶', type: 'consumable', avatar: '💠', effect: { mp: 40 }, rarity: 'uncommon', price: 40 },
    { name: '大型魔瓶', type: 'consumable', avatar: '💎', effect: { mp: 80 }, rarity: 'rare', price: 80 },
    { name: '萬能藥', type: 'consumable', avatar: '✨', effect: { hp: 50, mp: 50 }, rarity: 'rare', price: 100 },
    { name: '金幣袋', type: 'gold', avatar: '💰', effect: { gold: 50 }, rarity: 'common', price: 0 },
    { name: '寶箱', type: 'gold', avatar: '�', effect: { gold: 150 }, rarity: 'rare', price: 0 },
    { name: '鐵劍', type: 'weapon', avatar: '🗡️', effect: { attack: 5 }, rarity: 'common', price: 50 },
    { name: '鋼劍', type: 'weapon', avatar: '⚔️', effect: { attack: 10 }, rarity: 'uncommon', price: 150 },
    { name: '秘銀劍', type: 'weapon', avatar: '⚡', effect: { attack: 15 }, rarity: 'rare', price: 300 },
    { name: '傳說之劍', type: 'weapon', avatar: '🔪', effect: { attack: 20 }, rarity: 'legendary', price: 600 },
    { name: '皮甲', type: 'armor', avatar: '🦺', effect: { defense: 3 }, rarity: 'common', price: 50 },
    { name: '鎖甲', type: 'armor', avatar: '🛡️', effect: { defense: 7 }, rarity: 'uncommon', price: 150 },
    { name: '板甲', type: 'armor', avatar: '🏺', effect: { defense: 12 }, rarity: 'rare', price: 300 },
    { name: '龍鱗甲', type: 'armor', avatar: '🐲', effect: { defense: 15 }, rarity: 'legendary', price: 600 },
    { name: '力量戒指', type: 'accessory', avatar: '💍', effect: { attack: 8, defense: 3 }, rarity: 'rare', price: 200 },
    { name: '守護護符', type: 'accessory', avatar: '📿', effect: { defense: 10, hp: 50 }, rarity: 'rare', price: 200 },
    { name: '賢者之石', type: 'accessory', avatar: '🔮', effect: { mp: 30, attack: 5 }, rarity: 'legendary', price: 400 }
];

// 遊戲狀態
let gameState = {
    player: {
        x: 0,
        y: 0,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        attack: 10,
        defense: 5,
        level: 1,
        exp: 0,
        expToLevel: 100,
        gold: 0,
        critChance: 0.1,
        equipment: {
            weapon: null,
            armor: null,
            accessory: null
        },
        inventory: [],
        kills: 0,
        class: null,  // 當前職業
        classHistory: []  // 職業歷史記錄
    },
    dungeon: {
        level: 1,
        grid: [],
        enemies: [],
        items: [],
        stairsFound: false
    },
    inBattle: false,
    currentEnemy: null,
    gameOver: false,
    classSelected: false
};

// ========================================
// 初始化遊戲
// ========================================

function initGame() {
    setupEventListeners();
    setupEquipmentSlots();
    setupMusicControl();
    showPrologue();
}

function setupEventListeners() {
    document.getElementById('newGameBtn').addEventListener('click', startNewGame);
    document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);
    document.getElementById('healBtn').addEventListener('click', healPlayer);
    
    // 開場劇情按鈕
    document.getElementById('startAdventureBtn').addEventListener('click', () => {
        document.getElementById('prologueModal').style.display = 'none';
        showClassSelection();
    });
    document.getElementById('attackBtn').addEventListener('click', () => playerBattleAction('attack'));
    document.getElementById('defendBtn').addEventListener('click', () => playerBattleAction('defend'));
    document.getElementById('fleeBtn').addEventListener('click', () => playerBattleAction('flee'));
    document.getElementById('restartBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').style.display = 'none';
        showClassSelection();
    });
    document.getElementById('sellModeBtn').addEventListener('click', toggleSellMode);
    
    // 職業選擇
    document.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', () => {
            const className = card.dataset.class;
            selectClass(className);
        });
    });
    
    // 鍵盤控制
    document.addEventListener('keydown', handleKeyPress);
    
    // 虛擬方向鍵控制
    document.querySelectorAll('.dpad-btn[data-direction]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const direction = btn.dataset.direction;
            let dx = 0, dy = 0;
            
            switch(direction) {
                case 'up': dy = -1; break;
                case 'down': dy = 1; break;
                case 'left': dx = -1; break;
                case 'right': dx = 1; break;
            }
            
            movePlayer(dx, dy);
        });
    });
    
    gameState.sellMode = false;
}

// 顯示開場劇情
function showPrologue() {
    document.getElementById('prologueModal').style.display = 'flex';
}

// 顯示職業選擇
function showClassSelection() {
    document.getElementById('classSelectModal').style.display = 'flex';
    gameState.classSelected = false;
    clearLog();
    addLog('歡迎來到深淵探險者！', 'welcome');
    addLog('請選擇你的職業開始冒險...', 'info');
}

// 選擇職業
function selectClass(className) {
    const classData = CLASSES[className];
    
    // 初始化玩家屬性
    gameState.player = {
        x: 0,
        y: 0,
        hp: classData.hp,
        maxHp: classData.hp,
        mp: classData.mp || 50,
        maxMp: classData.mp || 50,
        attack: classData.attack,
        defense: classData.defense,
        level: 1,
        exp: 0,
        expToLevel: 100,
        gold: 0,
        critChance: classData.critChance,
        equipment: {
            weapon: null,
            armor: null,
            accessory: null
        },
        inventory: [],
        kills: 0,
        class: className,
        classHistory: [className],
        skillPoints: 0,  // 技能點數
        learnedSkills: {}  // 已學習的技能 {skillId: level}
    };
    
    gameState.classSelected = true;
    gameState.sellMode = false;
    document.getElementById('classSelectModal').style.display = 'none';
    
    // 更新角色頭像
    document.getElementById('playerAvatar').textContent = classData.icon;
    document.querySelectorAll('.battle-avatar')[0].textContent = classData.icon;
    
    addLog(`你選擇了 ${classData.icon} ${classData.name}！`, 'success');
    addLog(`技能：${classData.skillName} - ${classData.skillDesc}`, 'info');
    
    // 自動開啟音樂（如果音樂已啟用）
    if (musicEnabled && bgMusic) {
        playMusic();
    }
    
    initializeNewGame();
}

// 初始化新遊戲（選擇職業後）
function initializeNewGame() {
    // 重置地牢
    gameState.dungeon = {
        level: 1,
        grid: [],
        enemies: [],
        items: [],
        stairsFound: false
    };
    
    gameState.gameOver = false;
    gameState.inBattle = false;
    
    // 生成地牢
    generateDungeon();
    
    // 更新UI
    updateUI();
    
    const classData = CLASSES[gameState.player.class];
    addLog('🎮 新遊戲開始！', 'success');
    addLog(`職業：${classData.icon} ${classData.name}`, 'info');
    addLog(`你進入了地牢的第 ${gameState.dungeon.level} 層...`, 'info');
    addLog('小心探索，擊敗敵人，尋找下層的樓梯！', 'info');
}

function handleKeyPress(e) {
    if (gameState.inBattle || gameState.gameOver) return;
    
    let dx = 0, dy = 0;
    
    switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup': dy = -1; break;
        case 's': case 'arrowdown': dy = 1; break;
        case 'a': case 'arrowleft': dx = -1; break;
        case 'd': case 'arrowright': dx = 1; break;
        default: return;
    }
    
    e.preventDefault();
    movePlayer(dx, dy);
}

// ========================================
// 遊戲流程
// ========================================

function startNewGame() {
    // 關閉所有模態框
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('battleModal').style.display = 'none';
    document.getElementById('skillTreeModal').style.display = 'none';
    
    // 總是顯示職業選擇界面
    showClassSelection();
}

function generateDungeon() {
    const level = gameState.dungeon.level;
    const grid = [];
    
    // 初始化空地牢
    for (let y = 0; y < GRID_SIZE; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            grid[y][x] = CELL_TYPES.EMPTY;
        }
    }
    
    // 添加牆壁（隨機迷宮效果）
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (Math.random() < 0.15) {
                grid[y][x] = CELL_TYPES.WALL;
            }
        }
    }
    
    // 確保起點附近可通行
    const startX = Math.floor(Math.random() * 3) + 1;
    const startY = Math.floor(Math.random() * 3) + 1;
    
    for (let y = startY - 1; y <= startY + 1; y++) {
        for (let x = startX - 1; x <= startX + 1; x++) {
            if (y >= 0 && y < GRID_SIZE && x >= 0 && x < GRID_SIZE) {
                grid[y][x] = CELL_TYPES.EMPTY;
            }
        }
    }
    
    // 放置玩家
    gameState.player.x = startX;
    gameState.player.y = startY;
    grid[startY][startX] = CELL_TYPES.PLAYER;
    
    // 生成敵人
    const enemyCount = 5 + level * 2;
    gameState.dungeon.enemies = [];
    
    for (let i = 0; i < enemyCount; i++) {
        let x, y;
        let attempts = 0;
        
        do {
            x = Math.floor(Math.random() * GRID_SIZE);
            y = Math.floor(Math.random() * GRID_SIZE);
            attempts++;
        } while ((grid[y][x] !== CELL_TYPES.EMPTY || 
                 Math.abs(x - startX) < 3 || Math.abs(y - startY) < 3) && 
                 attempts < 100);
        
        if (attempts < 100) {
            const templateIndex = Math.min(
                Math.floor(level / 2) + Math.floor(Math.random() * 3),
                ENEMY_TEMPLATES.length - 1
            );
            const template = ENEMY_TEMPLATES[templateIndex];
            
            const enemy = {
                ...template,
                x, y,
                maxHp: template.hp + level * 5,
                hp: template.hp + level * 5,
                attack: template.attack + level * 2,
                defense: template.defense + level
            };
            
            gameState.dungeon.enemies.push(enemy);
            grid[y][x] = CELL_TYPES.ENEMY;
        }
    }
    
    // 生成物品
    const itemCount = 3 + Math.floor(level * 1.5);
    gameState.dungeon.items = [];
    
    for (let i = 0; i < itemCount; i++) {
        let x, y;
        let attempts = 0;
        
        do {
            x = Math.floor(Math.random() * GRID_SIZE);
            y = Math.floor(Math.random() * GRID_SIZE);
            attempts++;
        } while (grid[y][x] !== CELL_TYPES.EMPTY && attempts < 100);
        
        if (attempts < 100) {
            let item;
            const roll = Math.random();
            
            // 消耗品（補血補魔）- 40%
            if (roll < 0.4) {
                item = { ...ITEM_TEMPLATES[Math.floor(Math.random() * 7)] };
            }
            // 金幣 - 20%
            else if (roll < 0.6) {
                item = { ...ITEM_TEMPLATES[7 + Math.floor(Math.random() * 2)] };
            }
            // 裝備（武器+護甲）- 30%
            else if (roll < 0.9) {
                item = { ...ITEM_TEMPLATES[9 + Math.floor(Math.random() * 8)] };
            }
            // 稀有飾品 - 10%
            else {
                item = { ...ITEM_TEMPLATES[17 + Math.floor(Math.random() * 3)] };
            }
            
            item.x = x;
            item.y = y;
            
            gameState.dungeon.items.push(item);
            grid[y][x] = CELL_TYPES.ITEM;
        }
    }
    
    // 放置樓梯（遠離起點）
    let stairsX, stairsY;
    let attempts = 0;
    
    do {
        stairsX = Math.floor(Math.random() * GRID_SIZE);
        stairsY = Math.floor(Math.random() * GRID_SIZE);
        attempts++;
    } while ((grid[stairsY][stairsX] !== CELL_TYPES.EMPTY || 
             Math.abs(stairsX - startX) < 8 || Math.abs(stairsY - startY) < 8) && 
             attempts < 200);
    
    grid[stairsY][stairsX] = CELL_TYPES.STAIRS;
    gameState.dungeon.stairsFound = false;
    
    gameState.dungeon.grid = grid;
    renderDungeon();
}

function movePlayer(dx, dy) {
    const newX = gameState.player.x + dx;
    const newY = gameState.player.y + dy;
    
    // 檢查邊界
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
        return;
    }
    
    const grid = gameState.dungeon.grid;
    const targetCell = grid[newY][newX];
    
    // 檢查牆壁
    if (targetCell === CELL_TYPES.WALL) {
        addLog('前方是堅固的牆壁！', 'warning');
        return;
    }
    
    // 檢查敵人
    if (targetCell === CELL_TYPES.ENEMY) {
        const enemy = gameState.dungeon.enemies.find(e => e.x === newX && e.y === newY);
        if (enemy) {
            startBattle(enemy);
            return;
        }
    }
    
    // 移動玩家
    grid[gameState.player.y][gameState.player.x] = CELL_TYPES.EMPTY;
    gameState.player.x = newX;
    gameState.player.y = newY;
    
    // 檢查物品
    if (targetCell === CELL_TYPES.ITEM) {
        const itemIndex = gameState.dungeon.items.findIndex(i => i.x === newX && i.y === newY);
        if (itemIndex !== -1) {
            pickupItem(gameState.dungeon.items[itemIndex]);
            gameState.dungeon.items.splice(itemIndex, 1);
        }
    }
    
    // 檢查樓梯
    if (targetCell === CELL_TYPES.STAIRS) {
        gameState.dungeon.stairsFound = true;
        addLog('🎉 你發現了通往下一層的樓梯！', 'success');
        document.getElementById('nextLevelBtn').disabled = false;
    }
    
    grid[newY][newX] = CELL_TYPES.PLAYER;
    renderDungeon();
    updateUI();
}

function nextLevel() {
    if (!gameState.dungeon.stairsFound) return;
    
    gameState.dungeon.level++;
    document.getElementById('nextLevelBtn').disabled = true;
    
    addLog(`⬇️ 你進入了地牢的第 ${gameState.dungeon.level} 層...`, 'info');
    addLog('敵人變得更強了！小心應對！', 'warning');
    
    generateDungeon();
    updateUI();
}

function healPlayer() {
    const cost = 30;
    
    if (gameState.player.gold < cost) {
        addLog('金幣不足，無法治療！', 'warning');
        return;
    }
    
    if (gameState.player.hp === gameState.player.maxHp) {
        addLog('生命值已滿，不需要治療！', 'info');
        return;
    }
    
    gameState.player.gold -= cost;
    const healAmount = Math.floor(gameState.player.maxHp * 0.5);
    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healAmount);
    
    addLog(`💊 治療成功！恢復了 ${healAmount} 點生命值（花費 ${cost} 金幣）`, 'success');
    updateUI();
}

// ========================================
// 物品系統
// ========================================

function pickupItem(item) {
    addLog(`📦 撿到了 ${item.name}！`, 'success');
    
    if (item.type === 'consumable') {
        // 消耗品直接使用或放入背包
        let used = false;
        if (item.effect.hp) {
            const actualHeal = Math.min(item.effect.hp, gameState.player.maxHp - gameState.player.hp);
            if (actualHeal > 0) {
                gameState.player.hp += actualHeal;
                addLog(`❤️ 恢復了 ${actualHeal} 點生命值`, 'success');
                used = true;
            }
        }
        if (item.effect.mp) {
            const actualRestore = Math.min(item.effect.mp, gameState.player.maxMp - gameState.player.mp);
            if (actualRestore > 0) {
                gameState.player.mp += actualRestore;
                addLog(`💙 恢復了 ${actualRestore} 點魔力值`, 'success');
                used = true;
            }
        }
        if (!used) {
            gameState.player.inventory.push({...item});
            addLog(`放入背包以備不時之需`, 'info');
        }
    } else if (item.type === 'gold') {
        gameState.player.gold += item.effect.gold;
        addLog(`💰 獲得了 ${item.effect.gold} 金幣`, 'success');
    } else {
        // 裝備物品
        gameState.player.inventory.push({...item});
        addLog(`已放入背包`, 'info');
        console.log('物品已加入背包:', item.name, '背包數量:', gameState.player.inventory.length);
    }
    
    updateUI();
    updateInventoryDisplay();
}

function equipItem(item, fromInventory = false) {
    let slot;
    
    if (item.type === 'weapon') slot = 'weapon';
    else if (item.type === 'armor') slot = 'armor';
    else if (item.type === 'accessory') slot = 'accessory';
    
    if (slot) {
        // 卸下舊裝備並放回背包
        if (gameState.player.equipment[slot]) {
            const oldItem = gameState.player.equipment[slot];
            removeEquipmentStats(oldItem);
            if (fromInventory) {
                gameState.player.inventory.push(oldItem);
            }
        }
        
        // 從背包移除新裝備
        if (fromInventory) {
            const itemIndex = gameState.player.inventory.findIndex(i => i === item);
            if (itemIndex !== -1) {
                gameState.player.inventory.splice(itemIndex, 1);
            }
        }
        
        // 裝備新物品
        gameState.player.equipment[slot] = item;
        applyEquipmentStats(item);
        addLog(`✨ 裝備了 ${item.name}！`, 'success');
        updateEquipmentDisplay();
        updateUI();
    }
}

function useConsumable(item) {
    if (item.type !== 'consumable') return false;
    
    let used = false;
    
    if (item.effect.hp) {
        const actualHeal = Math.min(item.effect.hp, gameState.player.maxHp - gameState.player.hp);
        if (actualHeal > 0) {
            gameState.player.hp += actualHeal;
            addLog(`❤️ 使用 ${item.name}，恢復了 ${actualHeal} 點生命值`, 'success');
            used = true;
        }
    }
    
    if (item.effect.mp) {
        const actualRestore = Math.min(item.effect.mp, gameState.player.maxMp - gameState.player.mp);
        if (actualRestore > 0) {
            gameState.player.mp += actualRestore;
            addLog(`💙 使用 ${item.name}，恢復了 ${actualRestore} 點魔力值`, 'success');
            used = true;
        }
    }
    
    if (used) {
        // 從背包移除
        const itemIndex = gameState.player.inventory.findIndex(i => i === item);
        if (itemIndex !== -1) {
            gameState.player.inventory.splice(itemIndex, 1);
        }
        updateUI();
    } else {
        addLog(`${item.name} 目前無法使用（已滿）`, 'warning');
    }
    
    return used;
}

function sellItem(item) {
    const sellPrice = Math.floor(item.price * 0.5);
    gameState.player.gold += sellPrice;
    
    // 從背包移除
    const itemIndex = gameState.player.inventory.findIndex(i => i === item);
    if (itemIndex !== -1) {
        gameState.player.inventory.splice(itemIndex, 1);
    }
    
    addLog(`💰 賣出 ${item.name}，獲得 ${sellPrice} 金幣`, 'success');
    updateUI();
}

function toggleSellMode() {
    gameState.sellMode = !gameState.sellMode;
    const btn = document.getElementById('sellModeBtn');
    
    if (gameState.sellMode) {
        btn.textContent = '❌ 取消賣出';
        btn.classList.remove('btn-warning');
        btn.classList.add('btn-danger');
        addLog('💰 賣出模式：點擊物品進行賣出（50%價格）', 'warning');
    } else {
        btn.textContent = '💰 賣出模式';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-warning');
        addLog('已取消賣出模式', 'info');
    }
    
    updateUI();
}

function applyEquipmentStats(item) {
    if (item.effect.attack) gameState.player.attack += item.effect.attack;
    if (item.effect.defense) gameState.player.defense += item.effect.defense;
    if (item.effect.hp) {
        gameState.player.maxHp += item.effect.hp;
        gameState.player.hp += item.effect.hp;
    }
    if (item.effect.mp) {
        gameState.player.maxMp += item.effect.mp;
        gameState.player.mp += item.effect.mp;
    }
}

function removeEquipmentStats(item) {
    if (item.effect.attack) gameState.player.attack -= item.effect.attack;
    if (item.effect.defense) gameState.player.defense -= item.effect.defense;
    if (item.effect.hp) {
        gameState.player.maxHp -= item.effect.hp;
        gameState.player.hp = Math.min(gameState.player.hp, gameState.player.maxHp);
    }
    if (item.effect.mp) {
        gameState.player.maxMp -= item.effect.mp;
        gameState.player.mp = Math.min(gameState.player.mp, gameState.player.maxMp);
    }
}

// ========================================
// 戰鬥系統
// ========================================

function startBattle(enemy) {
    gameState.inBattle = true;
    gameState.currentEnemy = { ...enemy };
    
    addLog(`⚔️ 遭遇 ${enemy.name}！戰鬥開始！`, 'danger');
    
    // 顯示戰鬥畫面
    document.getElementById('battleModal').style.display = 'flex';
    document.getElementById('enemyAvatar').textContent = enemy.avatar;
    document.getElementById('enemyName').textContent = enemy.name;
    
    updateBattleUI();
    clearBattleLog();
    addBattleLog(`遭遇 ${enemy.name}！`, 'danger');
}

function playerBattleAction(action) {
    if (!gameState.inBattle) return;
    
    const player = gameState.player;
    const enemy = gameState.currentEnemy;
    const classData = CLASSES[player.class];
    
    switch(action) {
        case 'attack':
            // 玩家攻擊
            const isCrit = Math.random() < player.critChance;
            let damage = Math.max(1, player.attack - enemy.defense);
            
            if (isCrit) {
                damage *= 2;
                addBattleLog(`💥 暴擊！你對 ${enemy.name} 造成了 ${damage} 點傷害！`, 'success');
            } else {
                addBattleLog(`⚔️ 你對 ${enemy.name} 造成了 ${damage} 點傷害`, 'info');
            }
            
            enemy.hp -= damage;
            
            if (enemy.hp <= 0) {
                winBattle();
                return;
            }
            
            // 敵人反擊
            enemyAttack();
            break;
            
        case 'defend':
            addBattleLog('🛡️ 你採取了防禦姿態', 'info');
            const reducedDamage = Math.floor((enemy.attack - player.defense * 1.5) * 0.5);
            const finalDamage = Math.max(1, reducedDamage);
            
            player.hp -= finalDamage;
            addBattleLog(`${enemy.name} 攻擊了你，但你成功防禦！只受到 ${finalDamage} 點傷害`, 'warning');
            
            if (player.hp <= 0) {
                gameOver();
                return;
            }
            break;
            
        case 'skill':
            // 使用職業專屬技能
            if (classData && classData.skillEffect) {
                // 檢查魔力
                const mpCost = classData.mpCost || 0;
                if (player.mp < mpCost) {
                    addBattleLog(`💙 魔力不足！需要 ${mpCost} 魔力`, 'warning');
                    return;
                }
                
                // 消耗魔力
                player.mp -= mpCost;
                
                const result = classData.skillEffect(player, enemy);
                
                // 扣除生命代價
                if (result.hpCost > 0) {
                    player.hp -= result.hpCost;
                }
                
                // 造成傷害
                if (result.damage > 0) {
                    enemy.hp -= result.damage;
                    
                    if (result.isCrit) {
                        addBattleLog(`${result.message} 造成 ${result.damage} 點暴擊傷害！`, 'success');
                    } else {
                        addBattleLog(`${result.message} 造成 ${result.damage} 點傷害！`, 'info');
                    }
                } else if (result.isHeal) {
                    addBattleLog(result.message, 'success');
                } else {
                    addBattleLog(result.message, 'info');
                }
                
                if (player.hp <= 0) {
                    gameOver();
                    return;
                }
                
                if (enemy.hp <= 0) {
                    winBattle();
                    return;
                }
                
                // 如果不是治療技能，敵人反擊
                if (!result.isHeal) {
                    enemyAttack();
                }
            }
            break;
            
        case 'flee':
            if (Math.random() < 0.4) {
                addBattleLog('🏃 逃跑成功！', 'success');
                endBattle(false);
            } else {
                addBattleLog('🏃 逃跑失敗！', 'warning');
                enemyAttack();
            }
            break;
    }
    
    updateBattleUI();
}

function enemyAttack() {
    const player = gameState.player;
    const enemy = gameState.currentEnemy;
    
    const damage = Math.max(1, enemy.attack - player.defense);
    player.hp -= damage;
    
    addBattleLog(`👹 ${enemy.name} 對你造成了 ${damage} 點傷害`, 'danger');
    
    if (player.hp <= 0) {
        gameOver();
    }
}

function winBattle() {
    const enemy = gameState.currentEnemy;
    
    addBattleLog(`🎉 你擊敗了 ${enemy.name}！`, 'success');
    
    // 獲得經驗和金幣
    gameState.player.exp += enemy.exp;
    gameState.player.gold += enemy.gold;
    gameState.player.kills++;
    
    addBattleLog(`獲得 ${enemy.exp} 經驗值和 ${enemy.gold} 金幣`, 'success');
    
    // 裝備掉落系統
    const dropChance = 0.3 + (enemy.level * 0.05); // 基礎30%，每級+5%
    if (Math.random() < dropChance) {
        const loot = generateLoot(enemy.level);
        if (loot) {
            addBattleLog(`💎 ${enemy.name} 掉落了 ${getRarityColor(loot.rarity)}${loot.name}！`, 'success');
            gameState.player.inventory.push({...loot});
            addLog(`📦 ${loot.name} 已放入背包`, 'success');
            console.log('戰利品已加入背包:', loot.name, '背包數量:', gameState.player.inventory.length);
            // 立即更新背包顯示
            updateInventoryDisplay();
        }
    }
    
    // 檢查升級
    checkLevelUp();
    
    // 從地圖移除敵人
    const enemyIndex = gameState.dungeon.enemies.findIndex(e => e.x === enemy.x && e.y === enemy.y);
    if (enemyIndex !== -1) {
        gameState.dungeon.enemies.splice(enemyIndex, 1);
    }
    
    setTimeout(() => {
        endBattle(true);
    }, 2000);
}

// 生成戰利品
function generateLoot(enemyLevel) {
    // 根據敵人等級決定掉落品質
    const rarityRoll = Math.random();
    let rarity;
    
    if (enemyLevel >= 7) {
        // 高級敵人：10%傳說，30%稀有，40%優秀，20%普通
        if (rarityRoll < 0.1) rarity = 'legendary';
        else if (rarityRoll < 0.4) rarity = 'rare';
        else if (rarityRoll < 0.8) rarity = 'uncommon';
        else rarity = 'common';
    } else if (enemyLevel >= 4) {
        // 中級敵人：5%傳說，25%稀有，45%優秀，25%普通
        if (rarityRoll < 0.05) rarity = 'legendary';
        else if (rarityRoll < 0.3) rarity = 'rare';
        else if (rarityRoll < 0.75) rarity = 'uncommon';
        else rarity = 'common';
    } else {
        // 低級敵人：2%傳說，15%稀有，33%優秀，50%普通
        if (rarityRoll < 0.02) rarity = 'legendary';
        else if (rarityRoll < 0.17) rarity = 'rare';
        else if (rarityRoll < 0.5) rarity = 'uncommon';
        else rarity = 'common';
    }
    
    // 過濾出對應稀有度的裝備（不包括藥水和金幣）
    const equipment = Object.keys(ITEM_TEMPLATES).filter(key => {
        const item = ITEM_TEMPLATES[key];
        return item.rarity === rarity && 
               (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory');
    });
    
    if (equipment.length === 0) return null;
    
    const itemKey = equipment[Math.floor(Math.random() * equipment.length)];
    return { ...ITEM_TEMPLATES[itemKey] };
}

// 獲取稀有度顏色標籤
function getRarityColor(rarity) {
    const colors = {
        'common': '⚪',
        'uncommon': '🟢',
        'rare': '🔵',
        'legendary': '🟡'
    };
    return colors[rarity] || '';
}

function endBattle(moveToCell) {
    gameState.inBattle = false;
    document.getElementById('battleModal').style.display = 'none';
    
    if (moveToCell && gameState.currentEnemy) {
        // 移動到敵人位置
        const grid = gameState.dungeon.grid;
        grid[gameState.player.y][gameState.player.x] = CELL_TYPES.EMPTY;
        
        gameState.player.x = gameState.currentEnemy.x;
        gameState.player.y = gameState.currentEnemy.y;
        grid[gameState.player.y][gameState.player.x] = CELL_TYPES.PLAYER;
        
        renderDungeon();
    }
    
    gameState.currentEnemy = null;
    updateUI();
}

function checkLevelUp() {
    if (gameState.player.exp >= gameState.player.expToLevel) {
        gameState.player.level++;
        gameState.player.exp -= gameState.player.expToLevel;
        gameState.player.expToLevel = Math.floor(gameState.player.expToLevel * 1.5);
        
        // 提升屬性
        gameState.player.maxHp += 20;
        gameState.player.hp = gameState.player.maxHp;
        gameState.player.maxMp += 10;
        gameState.player.mp = gameState.player.maxMp;
        gameState.player.attack += 3;
        gameState.player.defense += 2;
        gameState.player.critChance = Math.min(0.5, gameState.player.critChance + 0.02);
        
        // 獲得技能點
        gameState.player.skillPoints++;
        
        addLog(`🎊 升級了！現在是 ${gameState.player.level} 級！`, 'success');
        addLog('所有屬性提升，生命與魔力完全恢復！', 'success');
        addLog(`✨ 獲得 1 點技能點！當前共有 ${gameState.player.skillPoints} 點`, 'info');
        if (gameState.inBattle) {
            addBattleLog(`🎊 升級到 ${gameState.player.level} 級！屬性全面提升！`, 'success');
        }
        
        // 檢查是否可以轉職
        checkJobAdvancement();
    }
}

// 檢查轉職
function checkJobAdvancement() {
    const level = gameState.player.level;
    const currentClass = gameState.player.class;
    
    if (level === 10 || level === 30) {
        const advancement = JOB_ADVANCEMENT[level];
        if (advancement && advancement[currentClass]) {
            showJobAdvancement(level, advancement[currentClass]);
        }
    }
}

// 顯示轉職選項
function showJobAdvancement(level, jobOptions) {
    document.getElementById('jobChangeModal').style.display = 'flex';
    
    const text = level === 10 ? '恭喜達到 10 級！選擇你的進階職業' : '恭喜達到 30 級！選擇你的終極職業';
    document.getElementById('jobChangeText').textContent = text;
    
    const jobGrid = document.getElementById('jobOptions');
    jobGrid.innerHTML = '';
    
    jobOptions.forEach(jobId => {
        const jobData = CLASSES[jobId];
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            <div class="job-icon">${jobData.icon}</div>
            <h3>${jobData.name}</h3>
            <div class="job-stats">
                <p>❤️ 生命: <strong>${jobData.hp}</strong></p>
                <p>⚔️ 攻擊: <strong>${jobData.attack}</strong></p>
                <p>🛡️ 防禦: <strong>${jobData.defense}</strong></p>
                <p>🔥 暴擊: <strong>${Math.floor(jobData.critChance * 100)}%</strong></p>
            </div>
            <div class="job-skill">
                <strong>${jobData.skillName}</strong>
                <p>${jobData.skillDesc}</p>
            </div>
        `;
        
        jobCard.addEventListener('click', () => {
            advanceJob(jobId);
        });
        
        jobGrid.appendChild(jobCard);
    });
    
    addLog(`🎊 達到 ${level} 級！可以進行職業進階了！`, 'success');
}

// 轉職
function advanceJob(newJobId) {
    const oldClass = CLASSES[gameState.player.class];
    const newClass = CLASSES[newJobId];
    
    // 計算屬性差異
    const hpDiff = newClass.hp - oldClass.hp;
    const mpDiff = (newClass.mp || oldClass.mp) - (oldClass.mp || 50);
    const attackDiff = newClass.attack - oldClass.attack;
    const defenseDiff = newClass.defense - oldClass.defense;
    const critDiff = newClass.critChance - oldClass.critChance;
    
    // 更新玩家屬性
    gameState.player.maxHp += hpDiff;
    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + hpDiff);
    gameState.player.maxMp += mpDiff;
    gameState.player.mp = Math.min(gameState.player.maxMp, gameState.player.mp + mpDiff);
    gameState.player.attack += attackDiff;
    gameState.player.defense += defenseDiff;
    gameState.player.critChance += critDiff;
    
    gameState.player.class = newJobId;
    gameState.player.classHistory.push(newJobId);
    
    // 更新頭像
    document.getElementById('playerAvatar').textContent = newClass.icon;
    document.querySelectorAll('.battle-avatar')[0].textContent = newClass.icon;
    
    document.getElementById('jobChangeModal').style.display = 'none';
    
    addLog(`✨ 轉職成功！你現在是 ${newClass.icon} ${newClass.name}！`, 'success');
    addLog(`新技能：${newClass.skillName} - ${newClass.skillDesc}`, 'info');
    addLog(`屬性大幅提升！`, 'success');
    
    updateUI();
}

// ========================================
// 技能樹系統
// ========================================

// 打開技能樹面板
function openSkillTree() {
    if (!gameState.classSelected) {
        addLog('請先選擇職業開始遊戲！', 'warning');
        return;
    }
    
    const baseClass = gameState.player.classHistory[0]; // 取得初始職業
    
    if (!baseClass) {
        console.error('無法取得初始職業', gameState.player);
        addLog('技能樹系統錯誤，請重新開始遊戲', 'error');
        return;
    }
    
    const skills = SKILL_TREES[baseClass] || [];
    
    if (skills.length === 0) {
        console.error('找不到職業的技能樹', baseClass, SKILL_TREES);
        addLog('此職業尚無技能樹', 'warning');
        return;
    }
    
    document.getElementById('skillTreeModal').style.display = 'flex';
    document.getElementById('skillPointsDisplay').textContent = gameState.player.skillPoints;
    
    const container = document.getElementById('skillTreeContainer');
    container.innerHTML = '';
    
    skills.forEach(skill => {
        const currentLevel = gameState.player.learnedSkills[skill.id] || 0;
        const canLearn = gameState.player.level >= skill.level && currentLevel < skill.maxLevel;
        
        const skillCard = document.createElement('div');
        skillCard.className = `skill-card ${!canLearn && currentLevel === 0 ? 'locked' : ''} ${currentLevel > 0 ? 'learned' : ''}`;
        
        skillCard.innerHTML = `
            <div class="skill-header">
                <h4>${skill.name} ${currentLevel > 0 ? `Lv.${currentLevel}/${skill.maxLevel}` : ''}</h4>
                <span class="skill-unlock">需求等級: ${skill.level}</span>
            </div>
            <p class="skill-desc">${skill.desc}</p>
            <div class="skill-cost">消耗: ${skill.mpCost} MP</div>
            <div class="skill-buttons">
                ${canLearn && gameState.player.skillPoints > 0 ? 
                    `<button class="btn-skill-learn" onclick="learnSkill('${skill.id}')">
                        ${currentLevel === 0 ? '學習' : '升級'} (1點)
                    </button>` : ''}
            </div>
        `;
        
        container.appendChild(skillCard);
    });
}

// 學習或升級技能
function learnSkill(skillId) {
    if (gameState.player.skillPoints <= 0) {
        addLog('技能點不足！', 'error');
        return;
    }
    
    const baseClass = gameState.player.classHistory[0];
    const skill = SKILL_TREES[baseClass].find(s => s.id === skillId);
    
    if (!skill) return;
    
    const currentLevel = gameState.player.learnedSkills[skillId] || 0;
    
    if (gameState.player.level < skill.level) {
        addLog(`需要達到 ${skill.level} 級才能學習此技能！`, 'error');
        return;
    }
    
    if (currentLevel >= skill.maxLevel) {
        addLog('技能已達到最高等級！', 'error');
        return;
    }
    
    gameState.player.skillPoints--;
    gameState.player.learnedSkills[skillId] = currentLevel + 1;
    
    addLog(`✨ ${currentLevel === 0 ? '學習' : '升級'}了技能：${skill.name} Lv.${currentLevel + 1}！`, 'success');
    
    openSkillTree(); // 刷新顯示
}

// 關閉技能樹
function closeSkillTree() {
    document.getElementById('skillTreeModal').style.display = 'none';
}

// 使用技能（戰鬥中）
function useSkillInBattle(skillId) {
    const baseClass = gameState.player.classHistory[0];
    const skill = SKILL_TREES[baseClass].find(s => s.id === skillId);
    const skillLevel = gameState.player.learnedSkills[skillId] || 0;
    
    if (!skill || skillLevel === 0) {
        addBattleLog('尚未學習此技能！', 'error');
        return;
    }
    
    if (gameState.player.mp < skill.mpCost) {
        addBattleLog('魔力不足！', 'error');
        return;
    }
    
    // 消耗魔力
    gameState.player.mp -= skill.mpCost;
    
    // 執行技能效果
    const result = skill.effect(gameState.player, gameState.currentEnemy, skillLevel);
    
    if (result.damage > 0) {
        // 應用護盾
        let actualDamage = result.damage;
        if (gameState.currentEnemy.shield && gameState.currentEnemy.shield > 0) {
            const shieldDamage = Math.min(actualDamage, gameState.currentEnemy.shield);
            gameState.currentEnemy.shield -= shieldDamage;
            actualDamage -= shieldDamage;
            addBattleLog(`🛡️ 護盾吸收了 ${shieldDamage} 點傷害！`, 'info');
        }
        
        gameState.currentEnemy.hp -= actualDamage;
        addBattleLog(`${result.message} 造成 ${actualDamage} 點傷害！`, result.isCrit ? 'crit' : 'damage');
    } else if (!result.isHeal && !result.isDefense) {
        addBattleLog(result.message, 'info');
    } else {
        addBattleLog(result.message, 'success');
    }
    
    updateBattleUI();
    
    // 檢查敵人是否死亡
    if (gameState.currentEnemy.hp <= 0) {
        setTimeout(() => {
            winBattle();
        }, 500);
        return;
    }
    
    // 敵人回合
    setTimeout(() => {
        enemyTurn();
    }, 800);
}

function gameOver() {
    gameState.gameOver = true;
    gameState.inBattle = false;
    
    document.getElementById('battleModal').style.display = 'none';
    document.getElementById('gameOverModal').style.display = 'flex';
    document.getElementById('gameOverTitle').textContent = '💀 遊戲結束';
    document.getElementById('finalLevel').textContent = gameState.player.level;
    document.getElementById('finalDepth').textContent = gameState.dungeon.level;
    document.getElementById('finalKills').textContent = gameState.player.kills;
    document.getElementById('finalGold').textContent = gameState.player.gold;
    
    addLog('💀 你被擊敗了...', 'danger');
}

// ========================================
// UI 更新
// ========================================

function updateUI() {
    const player = gameState.player;
    const classData = CLASSES[player.class];
    
    // 更新玩家狀態
    document.getElementById('playerLevel').textContent = player.level;
    document.getElementById('dungeonLevel').textContent = gameState.dungeon.level;
    
    // 更新角色名稱顯示職業
    if (classData) {
        document.getElementById('playerName').textContent = classData.name;
    }
    
    // 更新生命值
    document.getElementById('hpText').textContent = `${player.hp}/${player.maxHp}`;
    document.getElementById('hpBar').style.width = `${(player.hp / player.maxHp) * 100}%`;
    
    // 更新魔力值
    document.getElementById('mpText').textContent = `${player.mp}/${player.maxMp}`;
    document.getElementById('mpBar').style.width = `${(player.mp / player.maxMp) * 100}%`;
    
    // 更新經驗值
    document.getElementById('expText').textContent = `${player.exp}/${player.expToLevel}`;
    document.getElementById('expBar').style.width = `${(player.exp / player.expToLevel) * 100}%`;
    
    // 更新屬性
    document.getElementById('playerAttack').textContent = player.attack;
    document.getElementById('playerDefense').textContent = player.defense;
    document.getElementById('playerGold').textContent = player.gold;
    document.getElementById('playerCrit').textContent = `${Math.floor(player.critChance * 100)}%`;
    
    // 更新技能按鈕文字（如果存在）
    if (classData) {
        const skillBtn = document.getElementById('skillBtn');
        if (skillBtn) {
            const mpCost = classData.mpCost || 0;
            skillBtn.textContent = `✨ ${classData.skillName} (${mpCost})`;
            skillBtn.disabled = player.mp < mpCost;
        }
    }
    
    updateInventoryDisplay();
}

function updateBattleUI() {
    const player = gameState.player;
    const enemy = gameState.currentEnemy;
    
    // 玩家生命值
    const playerHpPercent = (player.hp / player.maxHp) * 100;
    document.getElementById('battlePlayerHp').style.width = `${playerHpPercent}%`;
    document.getElementById('battlePlayerHpText').textContent = `${player.hp}/${player.maxHp}`;
    
    // 敵人生命值
    const enemyHpPercent = (enemy.hp / enemy.maxHp) * 100;
    document.getElementById('battleEnemyHp').style.width = `${enemyHpPercent}%`;
    document.getElementById('battleEnemyHpText').textContent = `${enemy.hp}/${enemy.maxHp}`;
    
    // 更新技能按鈕
    updateBattleSkills();
}

function updateBattleSkills() {
    const container = document.getElementById('battleSkills');
    container.innerHTML = '';
    
    const baseClass = gameState.player.classHistory[0];
    const skills = SKILL_TREES[baseClass] || [];
    
    // 顯示所有已學習的技能
    let hasSkills = false;
    skills.forEach(skill => {
        const skillLevel = gameState.player.learnedSkills[skill.id] || 0;
        
        // 只顯示已學習的技能
        if (skillLevel > 0) {
            hasSkills = true;
            const canUse = gameState.player.mp >= skill.mpCost;
            
            const btn = document.createElement('button');
            btn.className = `btn btn-skill ${!canUse ? 'disabled' : ''}`;
            btn.innerHTML = `
                <div class="skill-btn-name">${skill.name} Lv.${skillLevel}</div>
                <div class="skill-btn-cost">${skill.mpCost} MP</div>
            `;
            btn.disabled = !canUse;
            btn.onclick = () => useSkillInBattle(skill.id);
            
            container.appendChild(btn);
        }
    });
    
    // 如果沒有學習任何技能，顯示提示
    if (!hasSkills) {
        container.innerHTML = '<p class="no-skills">尚未學習技能（升級後打開技能樹學習技能）</p>';
    }
}

function updateEquipmentDisplay() {
    const equipment = gameState.player.equipment;
    
    updateEquipmentSlot('weaponSlot', equipment.weapon, '⚔️', '武器');
    updateEquipmentSlot('armorSlot', equipment.armor, '🛡️', '護甲');
    updateEquipmentSlot('accessorySlot', equipment.accessory, '💍', '飾品');
}

function updateEquipmentSlot(slotId, item, defaultIcon, defaultName) {
    const slot = document.getElementById(slotId);
    const iconEl = slot.querySelector('.slot-icon');
    const nameEl = slot.querySelector('.slot-name');
    
    if (item) {
        iconEl.textContent = item.avatar;
        nameEl.textContent = item.name;
        slot.classList.add('equipped');
        slot.title = `${item.name} - 點擊卸下`;
    } else {
        iconEl.textContent = defaultIcon;
        nameEl.textContent = defaultName;
        slot.classList.remove('equipped');
        slot.title = '無裝備';
    }
}

// 為裝備欄添加點擊事件（卸下裝備）
function setupEquipmentSlots() {
    ['weaponSlot', 'armorSlot', 'accessorySlot'].forEach(slotId => {
        const slot = document.getElementById(slotId);
        slot.addEventListener('click', () => {
            const slotType = slotId.replace('Slot', '');
            const equipment = gameState.player.equipment[slotType];
            
            if (equipment) {
                // 卸下裝備並放回背包
                removeEquipmentStats(equipment);
                gameState.player.equipment[slotType] = null;
                gameState.player.inventory.push(equipment);
                addLog(`卸下了 ${equipment.name}`, 'info');
                updateEquipmentDisplay();
                updateUI();
            }
        });
    });
}

function updateInventoryDisplay() {
    const inventory = document.getElementById('inventory');
    const items = gameState.player.inventory;
    
    console.log('更新背包顯示，物品數量:', items.length, items);
    
    if (items.length === 0) {
        inventory.innerHTML = '<div class="empty-inventory">背包是空的</div>';
        return;
    }
    
    inventory.innerHTML = '';
    
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `inventory-item ${item.rarity}`;
        
        if (gameState.sellMode) {
            itemDiv.classList.add('sell-mode');
        }
        
        itemDiv.innerHTML = `
            <span class="item-icon">${item.avatar}</span>
            <span class="item-name">${item.name}</span>
            ${gameState.sellMode ? `<span class="item-price">💰${Math.floor(item.price * 0.5)}</span>` : ''}
        `;
        
        itemDiv.addEventListener('click', () => {
            if (gameState.sellMode) {
                sellItem(item);
            } else if (item.type === 'consumable') {
                useConsumable(item);
            } else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
                equipItem(item, true);
            }
        });
        
        inventory.appendChild(itemDiv);
    });
}

function renderDungeon() {
    const grid = gameState.dungeon.grid;
    const dungeonGrid = document.getElementById('dungeonGrid');
    dungeonGrid.innerHTML = '';
    
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'dungeon-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            const cellType = grid[y][x];
            
            switch(cellType) {
                case CELL_TYPES.WALL:
                    cell.classList.add('wall');
                    cell.textContent = '🧱';
                    break;
                case CELL_TYPES.PLAYER:
                    cell.classList.add('player');
                    cell.textContent = '🧙';
                    break;
                case CELL_TYPES.ENEMY:
                    const enemy = gameState.dungeon.enemies.find(e => e.x === x && e.y === y);
                    cell.classList.add('enemy');
                    cell.textContent = enemy ? enemy.avatar : '👹';
                    break;
                case CELL_TYPES.ITEM:
                    const item = gameState.dungeon.items.find(i => i.x === x && i.y === y);
                    cell.classList.add('item');
                    cell.textContent = item ? item.avatar : '💎';
                    break;
                case CELL_TYPES.STAIRS:
                    cell.classList.add('stairs');
                    cell.textContent = '🚪';
                    break;
                default:
                    cell.classList.add('empty');
                    break;
            }
            
            // 點擊移動
            cell.addEventListener('click', () => {
                const dx = x - gameState.player.x;
                const dy = y - gameState.player.y;
                
                if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
                    movePlayer(dx, dy);
                }
            });
            
            dungeonGrid.appendChild(cell);
        }
    }
}

// ========================================
// 日誌系統
// ========================================

function addLog(message, type = 'info') {
    const log = document.getElementById('gameLog');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = message;
    
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    
    // 限制日誌條目數量
    while (log.children.length > 50) {
        log.removeChild(log.firstChild);
    }
}

function clearLog() {
    document.getElementById('gameLog').innerHTML = '';
}

function addBattleLog(message, type = 'info') {
    const log = document.getElementById('battleLog');
    const entry = document.createElement('div');
    entry.className = `battle-message ${type}`;
    entry.textContent = message;
    
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function clearBattleLog() {
    document.getElementById('battleLog').innerHTML = '';
}

// ========================================
// 音樂控制系統
// ========================================

let musicEnabled = true;
let bgMusic = null;

function setupMusicControl() {
    bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    
    // 檢查本地存儲的音樂設置
    const savedMusicState = localStorage.getItem('musicEnabled');
    if (savedMusicState !== null) {
        musicEnabled = savedMusicState === 'true';
    }
    
    // 設置初始狀態
    updateMusicButton();
    
    // 音樂按鈕點擊事件
    musicToggle.addEventListener('click', toggleMusic);
    
    // 嘗試自動播放（某些瀏覽器需要用戶互動）
    if (musicEnabled) {
        playMusic();
    }
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    localStorage.setItem('musicEnabled', musicEnabled);
    
    if (musicEnabled) {
        playMusic();
    } else {
        pauseMusic();
    }
    
    updateMusicButton();
}

function playMusic() {
    if (bgMusic && musicEnabled) {
        bgMusic.volume = 0.3; // 設置音量為 30%
        bgMusic.play().catch(error => {
            console.log('音樂播放失敗（可能需要用戶互動）:', error);
            // 如果自動播放失敗，在下次用戶點擊時再試
        });
    }
}

function pauseMusic() {
    if (bgMusic) {
        bgMusic.pause();
    }
}

function updateMusicButton() {
    const musicToggle = document.getElementById('musicToggle');
    if (musicEnabled) {
        musicToggle.textContent = '🔊';
        musicToggle.classList.remove('muted');
        musicToggle.title = '點擊關閉音樂';
    } else {
        musicToggle.textContent = '🔇';
        musicToggle.classList.add('muted');
        musicToggle.title = '點擊開啟音樂';
    }
}

// ========================================
// 啟動遊戲
// ========================================

window.addEventListener('DOMContentLoaded', initGame);
