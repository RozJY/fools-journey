/**
 * M02 元素系统 - Element System
 * 四元素循环克制环 + 花色映射 + 伤害修正
 *
 * 克制环: 火→风→土→水→火
 * 修正值: 克制+2 | 中性0 | 被克-1
 *
 * 【Cocos适配指南】
 * 1. 文件尾改为: export { Element, Suit, SUIT_TO_ELEMENT, ElementSystem }
 * 2. 纯静态工具类，不继承 cc.Component
 * 3. 元素图标可在 Cocos 编辑器中通过 SpriteFrame 映射
 */

/** 元素枚举 */
const Element = Object.freeze({
    FIRE:  'fire',
    WATER: 'water',
    WIND:  'wind',
    EARTH: 'earth',
    NONE:  'none'       // 愚人、世界
});

/** 花色枚举 */
const Suit = Object.freeze({
    WANDS:     'wands',       // 权杖
    CUPS:      'cups',        // 圣杯
    SWORDS:    'swords',      // 宝剑
    PENTACLES: 'pentacles'    // 星币
});

/** 花色 → 元素 */
const SUIT_TO_ELEMENT = Object.freeze({
    [Suit.WANDS]:     Element.FIRE,
    [Suit.CUPS]:      Element.WATER,
    [Suit.SWORDS]:    Element.WIND,
    [Suit.PENTACLES]: Element.EARTH
});

/** 克制关系: key 克制 value */
const COUNTER_MAP = Object.freeze({
    [Element.FIRE]:  Element.WIND,
    [Element.WIND]:  Element.EARTH,
    [Element.EARTH]: Element.WATER,
    [Element.WATER]: Element.FIRE
});

const ALL_ELEMENTS = Object.freeze([Element.FIRE, Element.WATER, Element.WIND, Element.EARTH]);
const ALL_SUITS    = Object.freeze([Suit.WANDS, Suit.CUPS, Suit.SWORDS, Suit.PENTACLES]);

class ElementSystem {
    static suitToElement(suit) {
        return SUIT_TO_ELEMENT[suit] || Element.NONE;
    }

    static isCounter(atk, def) {
        if (atk === Element.NONE || def === Element.NONE) return false;
        return COUNTER_MAP[atk] === def;
    }

    static isCountered(atk, def) {
        return ElementSystem.isCounter(def, atk);
    }

    /**
     * 元素伤害修正（正常克制关系）
     * @returns {number} +2 | 0 | -1
     */
    static getModifier(atkElem, defElem) {
        if (atkElem === Element.NONE || defElem === Element.NONE) return 0;
        if (ElementSystem.isCounter(atkElem, defElem)) return 2;
        if (ElementSystem.isCountered(atkElem, defElem)) return -1;
        return 0;
    }

    /**
     * 反转克制关系（倒吊人被动: 被克变克制，克制变被克）
     */
    static getModifierReversed(atkElem, defElem) {
        if (atkElem === Element.NONE || defElem === Element.NONE) return 0;
        if (ElementSystem.isCounter(atkElem, defElem)) return -1;
        if (ElementSystem.isCountered(atkElem, defElem)) return 2;
        return 0;
    }

    static getAllElements() { return ALL_ELEMENTS; }
    static getAllSuits()    { return ALL_SUITS; }
}

module.exports = { Element, Suit, SUIT_TO_ELEMENT, COUNTER_MAP, ElementSystem };
