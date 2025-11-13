// 二轉職業補完 - 將這段代碼複製到 game.js 中對應位置

// 將所有二轉職業添加 mp 和 mpCost 的完整定義：

gladiator: {
    name: '劍鬥士',
    icon: '🗡️',
    baseClass: 'berserker',
    hp: 170,
    mp: 48,
    attack: 32,
    defense: 12,
    critChance: 0.25,
    skillName: '終結技',
    skillDesc: '消耗35魔力，造成450%暴擊傷害並吸血20%',
    mpCost: 35,
    skillEffect: (player, enemy) => {
        const damage = Math.floor(player.attack * 4.5 - enemy.defense);
        const lifesteal = Math.floor(damage * 0.2);
        player.hp = Math.min(player.maxHp, player.hp + lifesteal);
        return { damage: Math.max(1, damage), message: `💥 終結技！吸取 ${lifesteal} 生命`, hpCost: 0, isCrit: true };
    }
},
crusader: {
    name: '十字軍',
    icon: '✝️',
    baseClass: 'paladin',
    hp: 200,
    mp: 70,
    attack: 25,
    defense: 20,
    critChance: 0.15,
    skillName: '聖光審判',
    skillDesc: '消耗35魔力，造成280%傷害並恢復30%生命',
    mpCost: 35,
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
    mp: 75,
    attack: 22,
    defense: 25,
    critChance: 0.12,
    skillName: '不屈意志',
    skillDesc: '消耗30魔力，造成200%傷害並獲得20%護盾',
    mpCost: 30,
    skillEffect: (player, enemy) => {
        const damage = Math.floor(player.attack * 2 - enemy.defense);
        const shield = Math.floor(player.maxHp * 0.2);
        player.hp = Math.min(player.maxHp, player.hp + shield);
        return { damage: Math.max(1, damage), message: `🛡️ 不屈意志！獲得 ${shield} 護盾`, hpCost: 0 };
    }
},
archmage: {
    name: '大法師',
    icon: '🔮',
    baseClass: 'elementalist',
    hp: 120,
    mp: 150,
    attack: 38,
    defense: 8,
    critChance: 0.25,
    skillName: '奧術轟炸',
    skillDesc: '消耗50魔力，造成500%魔法傷害',
    mpCost: 50,
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
    mp: 140,
    attack: 35,
    defense: 10,
    critChance: 0.30,
    skillName: '雷霆風暴',
    skillDesc: '消耗45魔力，造成450%傷害並降低敵人攻擊',
    mpCost: 45,
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
    mp: 130,
    attack: 32,
    defense: 10,
    critChance: 0.22,
    skillName: '生命汲取',
    skillDesc: '消耗40魔力，造成350%傷害並吸取50%生命',
    mpCost: 40,
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
    mp: 135,
    attack: 34,
    defense: 8,
    critChance: 0.20,
    skillName: '惡魔契約',
    skillDesc: '消耗55魔力，造成550%傷害',
    mpCost: 55,
    skillEffect: (player, enemy) => {
        const damage = Math.floor(player.attack * 5.5);
        return { damage: Math.max(1, damage), message: '😈 惡魔契約！', hpCost: 0 };
    }
},
cardinal: {
    name: '紅衣主教',
    icon: '👼',
    baseClass: 'bishop',
    hp: 160,
    mp: 120,
    attack: 22,
    defense: 15,
    critChance: 0.15,
    skillName: '神聖之光',
    skillDesc: '消耗45魔力，造成300%傷害並恢復50%生命',
    mpCost: 45,
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
    mp: 115,
    attack: 25,
    defense: 12,
    critChance: 0.18,
    skillName: '預言打擊',
    skillDesc: '消耗38魔力，必定暴擊造成350%傷害',
    mpCost: 38,
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
    mp: 85,
    attack: 28,
    defense: 12,
    critChance: 0.35,
    skillName: '究極連擊',
    skillDesc: '消耗40魔力，連續攻擊5次',
    mpCost: 40,
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
    mp: 80,
    attack: 30,
    defense: 14,
    critChance: 0.30,
    skillName: '破甲掌',
    skillDesc: '消耗35魔力，造成380%傷害並降低敵人防禦',
    mpCost: 35,
    skillEffect: (player, enemy) => {
        const damage = Math.floor(player.attack * 3.8 - enemy.defense * 0.5);
        enemy.defense = Math.max(0, enemy.defense - 5);
        return { damage: Math.max(1, damage), message: '💥 破甲掌！敵人防禦降低', hpCost: 0 };
    }
},
shadowblade: {
    name: '影刃',
    icon: '🌑',
    baseClass: 'assassin',
    hp: 130,
    mp: 75,
    attack: 35,
    defense: 10,
    critChance: 0.45,
    skillName: '影襲',
    skillDesc: '消耗45魔力，必定暴擊造成550%傷害',
    mpCost: 45,
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
    mp: 70,
    attack: 38,
    defense: 8,
    critChance: 0.50,
    skillName: '致命毒刃',
    skillDesc: '消耗42魔力，造成500%暴擊傷害並持續傷害',
    mpCost: 42,
    skillEffect: (player, enemy) => {
        const damage = Math.floor(player.attack * 5 - enemy.defense);
        const dot = Math.floor(player.attack * 0.5);
        enemy.hp -= dot;
        return { damage: Math.max(1, damage), message: `🔪 致命毒刃！額外 ${dot} 毒傷`, hpCost: 0, isCrit: true };
    }
},
sniper: {
    name: '狙擊手',
    icon: '🎯',
    baseClass: 'ranger',
    hp: 120,
    mp: 78,
    attack: 33,
    defense: 12,
    critChance: 0.40,
    skillName: '致命射擊',
    skillDesc: '消耗38魔力，造成480%傷害無視防禦',
    mpCost: 38,
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
    mp: 80,
    attack: 28,
    defense: 15,
    critChance: 0.35,
    skillName: '野獸之怒',
    skillDesc: '消耗32魔力，造成350%傷害並恢復30%生命',
    mpCost: 32,
    skillEffect: (player, enemy) => {
        const damage = Math.floor(player.attack * 3.5);
        const heal = Math.floor(damage * 0.3);
        player.hp = Math.min(player.maxHp, player.hp + heal);
        return { damage: Math.max(1, damage), message: `🐺 野獸之怒！恢復 ${heal} 生命`, hpCost: 0 };
    }
}
