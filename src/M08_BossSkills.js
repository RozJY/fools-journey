/**
 * M08 Boss技能库 - Boss Skill Library
 * 22个Boss × 正逆位技能 + 被动能力
 * 每个技能是独立函数，接收战斗上下文，操作 StatusEffectManager / DeckManager / PlayerState
 *
 * 【Cocos适配指南】
 * 1. 技能执行后通过事件通知 UI 播放对应特效:
 *    ctx.emit('skill-activated', { bossKey, skillId, params })
 * 2. 每个Boss的技能特效资源建议放在 resources/fx/{bossKey}/ 下
 * 3. 可将本文件拆分为 skills/{bossKey}.js 独立文件，按需加载
 */

const { EffectType, StatusEffect } = require('./M05_StatusEffect');
const { Element, ElementSystem, SUIT_TO_ELEMENT } = require('./M02_ElementSystem');

/* ================================================================
   技能注册表 — skillId → function(ctx)
   ctx 包含:
     ctx.player      : PlayerState
     ctx.boss        : BossRuntime { hp, maxHp, element, alignment, ... }
     ctx.deck        : DeckManager
     ctx.status      : StatusEffectManager
     ctx.rng         : RandomSystem
     ctx.turnNumber  : 当前回合数
     ctx.journey     : { defeatedBosses: [], ... }  旅途上下文
     ctx.emit(event, data) : 事件发射（UI通知）
   ================================================================ */

const Skills = {};

/* ==================== 0 愚人 ==================== */
Skills['fool_blank'] = (ctx) => {
    // 正位/逆位相同: 固定造成2点伤害
    ctx.player.takeDamage(2);
    return { damage: 2, desc: '空白 — 固定2点伤害' };
};

/* ==================== I 魔术师 ==================== */
Skills['magician_mimic'] = (ctx) => {
    // 正位|万象: 复制玩家上回合打出牌的元素
    if (ctx.lastPlayedElement && ctx.lastPlayedElement !== Element.NONE) {
        ctx.boss.element = ctx.lastPlayedElement;
        return { desc: `万象 — Boss元素变为${ctx.lastPlayedElement}` };
    }
    return { desc: '万象 — 无可复制的元素' };
};

Skills['magician_fraud'] = (ctx) => {
    // 逆位|欺诈: 随机互换玩家手中2张牌的元素标记
    const numberCards = ctx.deck.getNumberCards();
    if (numberCards.length >= 2) {
        const [a, b] = ctx.rng.pickN(numberCards, 2);
        const tempSuit = a.suit;
        a.suit = b.suit;
        b.suit = tempSuit;
        return { desc: '欺诈 — 2张手牌元素互换', cards: [a.id, b.id] };
    }
    return { desc: '欺诈 — 手牌不足，未生效' };
};

/* ==================== II 女祭司 ==================== */
Skills['priestess_veil'] = (ctx) => {
    // 正位|帷幕: 隐藏Boss元素2回合
    ctx.status.addToBoss(new StatusEffect(EffectType.ELEMENT_HIDDEN, { duration: 2 }));
    return { desc: '帷幕 — Boss元素隐藏2回合' };
};

Skills['priestess_illusion'] = (ctx) => {
    // 逆位|幻象: 封锁玩家一个花色1回合
    const suits = ['wands', 'cups', 'swords', 'pentacles'];
    const locked = ctx.rng.pick(suits);
    ctx.status.addToPlayer(new StatusEffect(EffectType.SUIT_LOCK, { duration: 1, suit: locked }));
    return { desc: `幻象 — ${locked}花色被封锁1回合`, suit: locked };
};

/* ==================== III 女皇 ==================== */
Skills['empress_fertile'] = (ctx) => {
    // 正位|丰饶: Boss回复3HP
    ctx.boss.hp = Math.min(ctx.boss.maxHp, ctx.boss.hp + 3);
    return { heal: 3, desc: '丰饶 — Boss回复3HP' };
};

Skills['empress_suffocate'] = (ctx) => {
    // 逆位|窒息: 玩家手牌上限-2（整场）
    ctx.deck.setHandLimit(Math.max(1, ctx.deck.handLimit - 2));
    ctx.status.addToPlayer(new StatusEffect(EffectType.HAND_LIMIT_DOWN, { duration: -1, value: 2 }));
    return { desc: '窒息 — 手牌上限-2（整场）' };
};

/* ==================== IV 皇帝 ==================== */
Skills['emperor_decree'] = (ctx) => {
    // 正位|敕令: 玩家必须打最大点数牌，且不可触发元素克制
    ctx.status.addToPlayer(new StatusEffect(EffectType.FORCE_MAX_CARD, { duration: 1 }));
    ctx.status.addToPlayer(new StatusEffect(EffectType.NO_ELEMENT_BONUS, { duration: 1 }));
    return { desc: '敕令 — 必须打最大点数牌，无法克制' };
};

Skills['emperor_tyranny'] = (ctx) => {
    // 逆位|暴政: 4伤害 + 弃最高牌 + Boss自伤2
    ctx.player.takeDamage(4);
    ctx.deck.discardHighest();
    ctx.boss.hp -= 2;
    return { damage: 4, selfDamage: 2, desc: '暴政 — 4伤害+弃最高牌，Boss自伤2' };
};

/* ==================== V 教皇 ==================== */
Skills['hierophant_dogma'] = (ctx) => {
    // 正位|教义: 必须连续打同花色（换花色则无法攻击）
    // 实际判定在 CombatEngine 中检查 lastPlayedSuit
    ctx.boss._dogmaActive = true;
    return { desc: '教义 — 必须连续打同花色' };
};

Skills['hierophant_shackle'] = (ctx) => {
    // 逆位|禁锢: 封印宫廷牌2回合
    ctx.status.addToPlayer(new StatusEffect(EffectType.COURT_SEAL, { duration: 2 }));
    return { desc: '禁锢 — 宫廷牌封印2回合' };
};

/* ==================== VI 恋人 ==================== */
Skills['lovers_choice'] = (ctx) => {
    // 正位|抛择: 翻出2张牌，玩家选1入手、1永久移除
    // 返回待选牌，由 CombatEngine 提交玩家选择
    const revealed = ctx.deck.drawFromTop(2);
    return { desc: '抛择 — 翻出2张牌，请选择', revealed, requireChoice: true };
};

Skills['lovers_split'] = (ctx) => {
    // 逆位|分离: 手牌分奇偶两组，本回合只能用其中一组
    const group = ctx.rng.chance(0.5) ? 'odd' : 'even';
    ctx.status.addToPlayer(new StatusEffect(EffectType.ODD_EVEN_LOCK, { duration: 1, group }));
    return { desc: `分离 — 本回合只能使用${group === 'odd' ? '奇数' : '偶数'}牌`, group };
};

/* ==================== VII 战车 ==================== */
Skills['chariot_charge'] = (ctx) => {
    // 正位|驰骋: 攻击力递增（上限4）
    const currentAtk = Math.min(4, 1 + ctx.turnNumber);
    ctx.player.takeDamage(currentAtk);
    return { damage: currentAtk, desc: `驰骋 — 造成${currentAtk}伤害（递增）` };
};

Skills['chariot_crash'] = (ctx) => {
    // 逆位|失控: 回合数×2伤害(上限6) + 自伤2
    const dmg = Math.min(6, ctx.turnNumber * 2);
    ctx.player.takeDamage(dmg);
    ctx.boss.hp -= 2;
    return { damage: dmg, selfDamage: 2, desc: `失控 — ${dmg}伤害，Boss自伤2` };
};

/* ==================== VIII 力量 ==================== */
Skills['strength_tame'] = (ctx) => {
    // 正位|柔驯: 获得2点护甲（累计叠加）
    const armor = ctx.status.getBossEffect(EffectType.BOSS_ARMOR);
    if (armor) {
        armor.value += 2;
    } else {
        ctx.status.addToBoss(new StatusEffect(EffectType.BOSS_ARMOR, { duration: -1, value: 2 }));
    }
    return { desc: '柔驯 — Boss护甲+2' };
};

Skills['strength_rage'] = (ctx) => {
    // 逆位|狂暴: 玩家每次攻击后反击3点
    ctx.status.addToPlayer(new StatusEffect(EffectType.COUNTER_ATTACK, { duration: -1, value: 3 }));
    return { desc: '狂暴 — 玩家攻击后受3点反击' };
};

/* ==================== IX 隐者 ==================== */
Skills['hermit_alone'] = (ctx) => {
    // 正位|独行: 禁用宫廷牌整场
    ctx.status.addToPlayer(new StatusEffect(EffectType.COURT_SEAL, { duration: -1 }));
    return { desc: '独行 — 宫廷牌整场禁用' };
};

Skills['hermit_seal'] = (ctx) => {
    // 逆位|封闭: 下一次抽牌被禁止（通过 DRAW_BAN 标记, duration=1）
    ctx.status.addToPlayer(new StatusEffect(EffectType.DRAW_BAN, { duration: -1, value: 1 }));
    return { desc: '封闭 — 下一次抽牌被禁止' };
};

/* ==================== X 命运之轮 ==================== */
Skills['wheel_turn'] = (ctx) => {
    // 正位|命运流转: 随机切换Boss元素
    const elems = ElementSystem.getAllElements();
    ctx.boss.element = ctx.rng.pick(elems);
    return { desc: `命运流转 — Boss元素变为${ctx.boss.element}` };
};

Skills['wheel_doom'] = (ctx) => {
    // 逆位|厄运连锁: 50%概率随机弃一张手牌
    if (ctx.rng.chance(0.5)) {
        const discarded = ctx.deck.discardRandom();
        return { desc: '厄运连锁 — 随机弃1牌', discarded: discarded?.id };
    }
    return { desc: '厄运连锁 — 未触发' };
};

/* ==================== XI 正义 ==================== */
Skills['justice_scale'] = (ctx) => {
    // 正位|天秤: 反射玩家伤害的30%
    // 实际在伤害结算后处理，这里设置标记
    ctx.boss._reflectPercent = 0.3;
    return { desc: '天秤 — 反射30%伤害给玩家' };
};

Skills['justice_bias'] = (ctx) => {
    // 逆位|偏颇: 窃取玩家元素克制加成转为Boss攻击力
    // 在伤害计算时处理: 如果玩家有克制加成，Boss攻击+2
    ctx.boss._stealElementBonus = true;
    return { desc: '偏颇 — 窃取克制加成为攻击力' };
};

/* ==================== XII 倒吊人 ==================== */
Skills['hangedman_sacrifice'] = (ctx) => {
    // 正位|献祭: 玩家攻击前必须弃1牌
    ctx.status.addToPlayer(new StatusEffect(EffectType.SACRIFICE, { duration: -1 }));
    return { desc: '献祭 — 每次攻击前弃1牌' };
};

Skills['hangedman_stagnate'] = (ctx) => {
    // 逆位|停滞: 回合结束不再自动抽牌
    ctx.status.addToPlayer(new StatusEffect(EffectType.DRAW_BAN, { duration: -1, value: 99 }));
    return { desc: '停滞 — 不再自动抽牌' };
};

/* ==================== XIII 死神 ==================== */
Skills['death_transform'] = (ctx) => {
    // 正位|蜕变: 弃2抽2
    const result = ctx.deck.transformHand(2, 2);
    return { desc: '蜕变 — 弃2张抽2张', ...result };
};

Skills['death_corrode'] = (ctx) => {
    // 逆位|腐蚀: 每回合2点持续伤害（无视护甲）
    ctx.status.addToPlayer(new StatusEffect(EffectType.CORRODE, { duration: -1, value: 2 }));
    return { desc: '腐蚀 — 每回合2点持续伤害（无视护甲）' };
};

/* ==================== XIV 节制 ==================== */
Skills['temperance_harmony'] = (ctx) => {
    // 正位|调和: 伤害上限8
    ctx.status.addToPlayer(new StatusEffect(EffectType.DAMAGE_CAP, { duration: -1, value: 8 }));
    return { desc: '调和 — 单回合伤害上限8' };
};

Skills['temperance_imbalance'] = (ctx) => {
    // 逆位|失衡: 每回合攻击两次，每次2点
    ctx.player.takeDamage(2);
    ctx.player.takeDamage(2);
    return { damage: 4, desc: '失衡 — 两次2点伤害' };
};

/* ==================== XV 恶魔 ==================== */
Skills['devil_chain'] = (ctx) => {
    // 正位|锁链: 随机锁定手中1张牌
    const hand = ctx.deck.hand;
    if (hand.length > 0) {
        const card = ctx.rng.pick(hand);
        ctx.status.addToPlayer(new StatusEffect(EffectType.CARD_LOCK, { duration: -1, cardId: card.id }));
        return { desc: `锁链 — ${card.id}被锁定`, cardId: card.id };
    }
    return { desc: '锁链 — 无手牌可锁定' };
};

Skills['devil_tempt'] = (ctx) => {
    // 逆位|诱惑: 提议交易（5伤换3牌）— 返回选项供玩家决定
    return { desc: '诱惑 — 受5伤害换3张牌？', requireChoice: true, choiceType: 'tempt' };
};

/* ==================== XVI 高塔 ==================== */
Skills['tower_lightning'] = (ctx) => {
    // 正位|天雷: 6点伤害
    ctx.player.takeDamage(6);
    return { damage: 6, desc: '天雷 — 6点伤害' };
};

Skills['tower_collapse'] = (ctx) => {
    // 逆位|崩塔: 对玩家和Boss各4点
    ctx.player.takeDamage(4);
    ctx.boss.hp -= 4;
    return { damage: 4, selfDamage: 4, desc: '崩塔 — 双方各受4伤' };
};

/* ==================== XVII 星星 ==================== */
Skills['star_light'] = (ctx) => {
    // 正位|启明: Boss回复2HP + 玩家额外抽1牌
    ctx.boss.hp = Math.min(ctx.boss.maxHp, ctx.boss.hp + 2);
    ctx.deck.draw(1);
    return { heal: 2, desc: '启明 — Boss回复2HP，玩家抽1牌' };
};

Skills['star_disillusion'] = (ctx) => {
    // 逆位|幻灭: 取消所有加成2回合
    ctx.status.addToPlayer(new StatusEffect(EffectType.ALL_BONUS_CANCEL, { duration: 2 }));
    return { desc: '幻灭 — 所有加成取消2回合' };
};

/* ==================== XVIII 月亮 ==================== */
Skills['moon_fog'] = (ctx) => {
    // 正位|迷雾: 手牌面朝下打乱，随机抽1张打出
    // 返回标记，由 CombatEngine 在玩家行动阶段执行随机出牌
    ctx.boss._fogActive = true;
    return { desc: '迷雾 — 本回合随机出牌', requireAutoPlay: true };
};

Skills['moon_nightmare'] = (ctx) => {
    // 逆位|梦魇: 召唤恐惧标记 +1层
    ctx.status.addToPlayer(new StatusEffect(EffectType.FEAR, { duration: -1, stacks: 1 }));
    const total = ctx.status.getFearDamage();
    return { desc: `梦魇 — 恐惧标记+1（当前${total}层）` };
};

/* ==================== XIX 太阳 ==================== */
Skills['sun_radiance'] = (ctx) => {
    // 正位|普照: 玩家攻击+2（通过临时buff），Boss每回合回复2HP
    ctx.boss._playerAtkBuff = 2;
    ctx.boss.hp = Math.min(ctx.boss.maxHp, ctx.boss.hp + 2);
    return { desc: '普照 — 玩家攻击+2，Boss回复2HP' };
};

Skills['sun_scorch'] = (ctx) => {
    // 逆位|炙灼: 烧毁手中点数最低的牌
    const discarded = ctx.deck.discardLowest();
    return { desc: '炙灼 — 烧毁最低点数牌', discarded: discarded?.id };
};

/* ==================== XX 审判 ==================== */
Skills['judgement_revelation'] = (ctx) => {
    // 正位|天启: 召唤上一场Boss的技能
    const journey = ctx.journey || {};
    const defeated = journey.defeatedBosses || [];
    if (defeated.length > 0) {
        const lastBoss = defeated[defeated.length - 1];
        const skillId = lastBoss.skillId;
        if (Skills[skillId]) {
            const result = Skills[skillId](ctx);
            return { desc: `天启 — 召唤${lastBoss.name}的技能`, inner: result };
        }
    }
    return { desc: '天启 — 无可召唤的技能' };
};

Skills['judgement_reckoning'] = (ctx) => {
    // 逆位|清算: 额外造成玩家已损HP 30%的伤害
    const lostHp = ctx.player.maxHp - ctx.player.hp;
    const extraDmg = Math.floor(lostHp * 0.3);
    ctx.player.takeDamage(extraDmg);
    return { damage: extraDmg, desc: `清算 — 额外${extraDmg}伤害（已损HP×30%）` };
};

/* ==================== XXI 世界 ==================== */
Skills['world_completion'] = (ctx) => {
    // 正位|大圆满: 按顺序激活已遇Boss的正位技能（减半版）
    const journey = ctx.journey || {};
    const defeated = journey.defeatedBosses || [];
    const cycleIndex = (ctx.boss._worldCycle || 0) % defeated.length;
    const target = defeated[cycleIndex];
    ctx.boss._worldCycle = cycleIndex + 1;

    // 采用该Boss元素
    if (target) {
        ctx.boss.element = target.element;
        const skillId = target.skillId;
        if (Skills[skillId]) {
            // 减半: 第一轮伤害/效果减半
            const fullCycle = ctx.boss._worldCycle > defeated.length;
            ctx.boss._worldHalf = !fullCycle;
            const result = Skills[skillId](ctx);
            return { desc: `大圆满 — 激活${target.name}技能${!fullCycle ? '(减半)' : ''}`, inner: result };
        }
    }
    return { desc: '大圆满 — 无已遇Boss' };
};

Skills['world_shatter'] = (ctx) => {
    // 逆位|碎镜: 随机激活2个已遇Boss的被动 + 3点伤害
    ctx.player.takeDamage(3);
    const journey = ctx.journey || {};
    const defeated = journey.defeatedBosses || [];
    if (defeated.length >= 2) {
        const picked = ctx.rng.pickN(defeated, 2);
        return { damage: 3, desc: `碎镜 — 3伤+激活${picked.map(b => b.name).join('、')}的被动` };
    }
    return { damage: 3, desc: '碎镜 — 3伤害' };
};

/* ================================================================
   被动注册表 — passiveId → function(ctx, trigger)
   trigger: 'onBattleStart' | 'onTurnStart' | 'onPlayerAttack' |
            'onBossDefeated' | 'onDamageCalc'
   ================================================================ */

const Passives = {};

// I 魔术师 - 四元素台: 已出牌花色种类数 → Boss攻击+N
Passives['magician_table'] = (ctx, trigger) => {
    if (trigger === 'onTurnStart') {
        const usedSuits = new Set(ctx.deck.discardPile.map(c => c.suit));
        ctx.boss._atkBonus = usedSuits.size;
    }
};

// II 女祭司 - 月影: 连续2回合未命中克制 → Boss回复2HP
Passives['priestess_moonShadow'] = (ctx, trigger) => {
    if (trigger === 'onPlayerAttack') {
        if (!ctx.lastAttackCountered) {
            ctx.boss._noCounterStreak = (ctx.boss._noCounterStreak || 0) + 1;
            if (ctx.boss._noCounterStreak >= 2) {
                ctx.boss.hp = Math.min(ctx.boss.maxHp, ctx.boss.hp + 2);
                ctx.boss._noCounterStreak = 0;
            }
        } else {
            ctx.boss._noCounterStreak = 0;
        }
    }
};

// III 女皇 - 孕育: 受攻击后50%概率让玩家抽1牌
Passives['empress_nurture'] = (ctx, trigger) => {
    if (trigger === 'onPlayerAttack' && ctx.rng.chance(0.5)) {
        ctx.deck.draw(1);
    }
};

// IV 皇帝 - 王权: 水克制伤害仅减少25%而非正常值
Passives['emperor_crown'] = (ctx, trigger) => {
    if (trigger === 'onDamageCalc') {
        // 如果攻击元素是水（克制火），修正值从+2降为+1（减少25%效果约定为修正-1）
        // 具体实现在 DamageCalculator 中通过 bossPassive 回调
        return (info) => {
            if (ctx.lastAttackElement === Element.WATER) return -1;
            return 0;
        };
    }
};

// V 教皇 - 戒律: Ace伤害+50%（所有加成后乘算）
Passives['hierophant_precept'] = (ctx, trigger) => {
    if (trigger === 'onDamageCalc') {
        return (info) => {
            if (info.pip === 1) return Math.floor(info.subtotal * 0.5);
            return 0;
        };
    }
};

// VI 恋人 - 共鸣: 连续2张相同花色，第二张+3
Passives['lovers_resonance'] = (ctx, trigger) => {
    if (trigger === 'onDamageCalc') {
        return (info) => {
            if (ctx.player.consecutiveSuit >= 2) return 3;
            return 0;
        };
    }
};

// VII 战车 - 碾压: 伤害为1时无效化
Passives['chariot_crush'] = (ctx, trigger) => {
    if (trigger === 'onDamageCalc') {
        return (info) => {
            if (info.subtotal <= 1) return -info.subtotal; // 归零
            return 0;
        };
    }
};

// VIII 力量 - 不屈: HP<30%时护甲/反击×1.5
Passives['strength_unyielding'] = (ctx, trigger) => {
    if (trigger === 'onTurnStart') {
        if (ctx.boss.hp < ctx.boss.maxHp * 0.3) {
            ctx.boss._unyieldingActive = true;
        }
    }
};

// IX 隐者 - 灯火: 战斗开始时预览3回合技能顺序
Passives['hermit_lantern'] = (ctx, trigger) => {
    if (trigger === 'onBattleStart') {
        return { preview: ctx.boss.actionSequence.slice(0, 3) };
    }
};

// X 命运之轮 - 因果: 连续2回合同花色 → Boss下回合攻击+3
Passives['wheel_karma'] = (ctx, trigger) => {
    if (trigger === 'onPlayerAttack') {
        if (ctx.player.consecutiveSuit >= 2) {
            ctx.boss._karmaBonus = 3;
        }
    }
};

// XI 正义 - 裁定: 免疫国王翻转
Passives['justice_verdict'] = (ctx, trigger) => {
    if (trigger === 'onKingFlip') {
        return { immune: true };
    }
};

// XII 倒吊人 - 倒悬: 元素克制反转（整场）
Passives['hangedman_invert'] = (ctx, trigger) => {
    if (trigger === 'onBattleStart') {
        ctx.status.addToPlayer(new StatusEffect(EffectType.ELEMENT_INVERT, { duration: -1 }));
    }
};

// XIII 死神 - 不灭: 首次击杀后4HP复活
Passives['death_undying'] = (ctx, trigger) => {
    if (trigger === 'onBossDefeated' && !ctx.boss._hasRevived) {
        ctx.boss._hasRevived = true;
        ctx.boss.hp = 4;
        return { revived: true, hp: 4 };
    }
};

// XIV 节制 - 中庸: 点数3或7伤害-2
Passives['temperance_moderation'] = (ctx, trigger) => {
    if (trigger === 'onDamageCalc') {
        return (info) => {
            if (info.pip === 3 || info.pip === 7) return -2;
            return 0;
        };
    }
};

// XV 恶魔 - 执念: 接受诱惑后Boss攻击永久+2
Passives['devil_obsession'] = (ctx, trigger) => {
    if (trigger === 'onTurnStart' && ctx.player.acceptedTempt) {
        ctx.boss._obsessionBonus = 2;
    }
};

// XVI 高塔 - 逢生: 被击败时玩家回复5HP+抽1牌
Passives['tower_rebirth'] = (ctx, trigger) => {
    if (trigger === 'onBossDefeated') {
        ctx.player.heal(5);
        ctx.deck.draw(1);
        return { healed: 5, drawn: 1 };
    }
};

// XVII 星星 - 星辉: 被击败时玩家额外回复3HP
Passives['star_glow'] = (ctx, trigger) => {
    if (trigger === 'onBossDefeated') {
        ctx.player.heal(3);
        return { healed: 3 };
    }
};

// XVIII 月亮 - 潮汐: 奇数回合攻击+2，偶数回合-1
Passives['moon_tide'] = (ctx, trigger) => {
    if (trigger === 'onTurnStart') {
        ctx.boss._tideBonus = (ctx.turnNumber % 2 === 1) ? 2 : -1;
    }
};

// XIX 太阳 - 辉耀: 免疫元素克制
Passives['sun_brilliance'] = (ctx, trigger) => {
    if (trigger === 'onBattleStart') {
        ctx.status.addToPlayer(new StatusEffect(EffectType.ELEMENT_IMMUNE, { duration: -1 }));
    }
};

// XX 审判 - 终审: 宫廷牌效果减半
Passives['judgement_finalTrial'] = (ctx, trigger) => {
    if (trigger === 'onDamageCalc') {
        return (info) => {
            // courtBonus 减半（在 CombatEngine 中实际应用）
            return 0; // 标记在 ctx.boss._courtHalf = true
        };
    }
};

// XXI 世界 - 旅途之镜: 元素 = 玩家使用最少的花色对应元素
Passives['world_mirror'] = (ctx, trigger) => {
    if (trigger === 'onTurnStart') {
        const leastSuit = ctx.player.getLeastUsedSuit();
        ctx.boss._mirrorElement = SUIT_TO_ELEMENT[leastSuit];
    }
};

/* ========== 导出 ========== */

/** 执行技能 */
function executeSkill(skillId, ctx) {
    const fn = Skills[skillId];
    if (!fn) return { desc: `未知技能: ${skillId}` };
    return fn(ctx);
}

/** 触发被动 */
function triggerPassive(passiveId, ctx, trigger) {
    const fn = Passives[passiveId];
    if (!fn) return null;
    return fn(ctx, trigger);
}

/** 检查技能是否存在 */
function hasSkill(skillId) {
    return !!Skills[skillId];
}

module.exports = { Skills, Passives, executeSkill, triggerPassive, hasSkill };
