var FoolsJourney = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/M15_RandomSystem.js
  var require_M15_RandomSystem = __commonJS({
    "src/M15_RandomSystem.js"(exports, module) {
      var RandomSystem = class {
        /**
         * @param {number} [seed] - 随机种子，默认使用当前时间
         */
        constructor(seed) {
          this._seed = (seed !== void 0 ? seed : Date.now()) >>> 0;
          this._initial = this._seed;
        }
        /** 重置到初始种子 */
        reset() {
          this._seed = this._initial;
        }
        /** 设置新种子 */
        setSeed(seed) {
          this._seed = seed >>> 0;
          this._initial = this._seed;
        }
        /**
         * Mulberry32 PRNG — 返回 [0, 1)
         */
        next() {
          this._seed |= 0;
          this._seed = this._seed + 1831565813 | 0;
          let t = Math.imul(this._seed ^ this._seed >>> 15, 1 | this._seed);
          t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
        /** [min, max] 闭区间整数 */
        nextInt(min, max) {
          return Math.floor(this.next() * (max - min + 1)) + min;
        }
        /** 以给定概率返回 true */
        chance(prob) {
          return this.next() < prob;
        }
        /** Fisher-Yates 原地洗牌，返回同一数组引用 */
        shuffle(arr) {
          for (let i = arr.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i);
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          return arr;
        }
        /** 随机取一个元素 */
        pick(arr) {
          return arr[this.nextInt(0, arr.length - 1)];
        }
        /** 随机取 n 个不重复元素 */
        pickN(arr, n) {
          const copy = arr.slice();
          this.shuffle(copy);
          return copy.slice(0, Math.min(n, copy.length));
        }
        /**
         * 带权重随机选择
         * @param {Array} items
         * @param {number[]} weights
         */
        weightedPick(items, weights) {
          const total = weights.reduce((a, b) => a + b, 0);
          let roll = this.next() * total;
          for (let i = 0; i < items.length; i++) {
            roll -= weights[i];
            if (roll <= 0) return items[i];
          }
          return items[items.length - 1];
        }
        /**
         * 生成 Boss 行动序列
         * 规则：技能概率50%，两次技能之间至少一次普攻
         * @param {number} length - 预生成长度
         * @returns {string[]} 'skill' | 'attack'
         */
        generateBossActions(length) {
          const seq = [];
          let lastSkill = false;
          for (let i = 0; i < length; i++) {
            if (lastSkill) {
              seq.push("attack");
              lastSkill = false;
            } else if (this.chance(0.5)) {
              seq.push("skill");
              lastSkill = true;
            } else {
              seq.push("attack");
            }
          }
          return seq;
        }
      };
      module.exports = RandomSystem;
    }
  });

  // src/M02_ElementSystem.js
  var require_M02_ElementSystem = __commonJS({
    "src/M02_ElementSystem.js"(exports, module) {
      var Element = Object.freeze({
        FIRE: "fire",
        WATER: "water",
        WIND: "wind",
        EARTH: "earth",
        NONE: "none"
        // 愚人、世界
      });
      var Suit = Object.freeze({
        WANDS: "wands",
        // 权杖
        CUPS: "cups",
        // 圣杯
        SWORDS: "swords",
        // 宝剑
        PENTACLES: "pentacles"
        // 星币
      });
      var SUIT_TO_ELEMENT = Object.freeze({
        [Suit.WANDS]: Element.FIRE,
        [Suit.CUPS]: Element.WATER,
        [Suit.SWORDS]: Element.WIND,
        [Suit.PENTACLES]: Element.EARTH
      });
      var COUNTER_MAP = Object.freeze({
        [Element.FIRE]: Element.WIND,
        [Element.WIND]: Element.EARTH,
        [Element.EARTH]: Element.WATER,
        [Element.WATER]: Element.FIRE
      });
      var ALL_ELEMENTS = Object.freeze([Element.FIRE, Element.WATER, Element.WIND, Element.EARTH]);
      var ALL_SUITS = Object.freeze([Suit.WANDS, Suit.CUPS, Suit.SWORDS, Suit.PENTACLES]);
      var ElementSystem = class _ElementSystem {
        static suitToElement(suit) {
          return SUIT_TO_ELEMENT[suit] || Element.NONE;
        }
        static isCounter(atk, def) {
          if (atk === Element.NONE || def === Element.NONE) return false;
          return COUNTER_MAP[atk] === def;
        }
        static isCountered(atk, def) {
          return _ElementSystem.isCounter(def, atk);
        }
        /**
         * 元素伤害修正（正常克制关系）
         * @returns {number} +2 | 0 | -1
         */
        static getModifier(atkElem, defElem) {
          if (atkElem === Element.NONE || defElem === Element.NONE) return 0;
          if (_ElementSystem.isCounter(atkElem, defElem)) return 2;
          if (_ElementSystem.isCountered(atkElem, defElem)) return -1;
          return 0;
        }
        /**
         * 反转克制关系（倒吊人被动: 被克变克制，克制变被克）
         */
        static getModifierReversed(atkElem, defElem) {
          if (atkElem === Element.NONE || defElem === Element.NONE) return 0;
          if (_ElementSystem.isCounter(atkElem, defElem)) return -1;
          if (_ElementSystem.isCountered(atkElem, defElem)) return 2;
          return 0;
        }
        static getAllElements() {
          return ALL_ELEMENTS;
        }
        static getAllSuits() {
          return ALL_SUITS;
        }
      };
      module.exports = { Element, Suit, SUIT_TO_ELEMENT, COUNTER_MAP, ElementSystem };
    }
  });

  // src/M03_SpiritNumber.js
  var require_M03_SpiritNumber = __commonJS({
    "src/M03_SpiritNumber.js"(exports, module) {
      var SpiritGroup = Object.freeze({
        CREATIVE: "creative",
        // 开创之力 1-5
        CONVERGENT: "convergent"
        // 收束之力 6-10
      });
      var Alignment = Object.freeze({
        UPRIGHT: "upright",
        // 正位
        REVERSED: "reversed"
        // 逆位
      });
      var SpiritNumber = class _SpiritNumber {
        /** 点数 → 灵数组 */
        static getGroup(pip) {
          return pip <= 5 ? SpiritGroup.CREATIVE : SpiritGroup.CONVERGENT;
        }
        /**
         * 点数 → 基础伤害
         * 开创: 1-5 → 1-5
         * 收束: 6-10 → 1-5（即 pip - 5，防止收束数值过高）
         */
        static getBaseDamage(pip) {
          return pip <= 5 ? pip : pip - 5;
        }
        /**
         * 灵数对位加成
         * @param {number} pip - 1~10
         * @param {string} bossAlignment - Alignment.UPRIGHT / REVERSED
         * @returns {number} +2 或 0
         */
        static getAlignmentBonus(pip, bossAlignment) {
          const group = _SpiritNumber.getGroup(pip);
          if (group === SpiritGroup.CREATIVE && bossAlignment === Alignment.UPRIGHT) return 2;
          if (group === SpiritGroup.CONVERGENT && bossAlignment === Alignment.REVERSED) return 2;
          return 0;
        }
        /** 灵数含义文本（UI展示用） */
        static getMeaning(pip) {
          const M = {
            1: "\u79CD\u5B50\xB7\u8D77\u59CB",
            2: "\u5E73\u8861\xB7\u9009\u62E9",
            3: "\u521B\u9020\xB7\u751F\u957F",
            4: "\u7A33\u56FA\xB7\u6839\u57FA",
            5: "\u51B2\u7A81\xB7\u8F6C\u53D8",
            6: "\u548C\u8C10\xB7\u7597\u6108",
            7: "\u5185\u7701\xB7\u667A\u6167",
            8: "\u638C\u63A7\xB7\u529B\u91CF",
            9: "\u5706\u6EE1\xB7\u5C06\u6210",
            10: "\u8F6E\u56DE\xB7\u7EC8\u7ED3"
          };
          return M[pip] || "";
        }
      };
      module.exports = { SpiritGroup, Alignment, SpiritNumber };
    }
  });

  // src/M01_CardData.js
  var require_M01_CardData = __commonJS({
    "src/M01_CardData.js"(exports, module) {
      var { Element, Suit } = require_M02_ElementSystem();
      var { Alignment } = require_M03_SpiritNumber();
      var CardType = Object.freeze({
        NUMBER: "number",
        COURT: "court",
        MAJOR: "major"
      });
      var CourtRank = Object.freeze({
        PAGE: "page",
        KNIGHT: "knight",
        QUEEN: "queen",
        KING: "king"
      });
      function createNumberCards() {
        const cards = [];
        const suits = [Suit.WANDS, Suit.CUPS, Suit.SWORDS, Suit.PENTACLES];
        for (const suit of suits) {
          for (let pip = 1; pip <= 10; pip++) {
            cards.push({
              id: `${suit}_${pip}`,
              type: CardType.NUMBER,
              suit,
              pip
              // 【Cocos适配】spriteFrame: `cards/number/${suit}_${String(pip).padStart(2,'0')}`
            });
          }
        }
        return cards;
      }
      function createCourtCards() {
        const cards = [];
        const suits = [Suit.WANDS, Suit.CUPS, Suit.SWORDS, Suit.PENTACLES];
        const ranks = [CourtRank.PAGE, CourtRank.KNIGHT, CourtRank.QUEEN, CourtRank.KING];
        for (const suit of suits) {
          for (const rank of ranks) {
            cards.push({
              id: `${suit}_${rank}`,
              type: CardType.COURT,
              suit,
              rank
            });
          }
        }
        return cards;
      }
      var MAJOR_ARCANA = Object.freeze([
        // ---------- 无属性 ----------
        {
          id: 0,
          key: "fool",
          name: "\u611A\u4EBA",
          nameEn: "The Fool",
          element: Element.NONE,
          planet: "\u5929\u738B\u661F",
          theme: "\u8D77\u70B9\xB7\u7A7A\u767D\xB7\u65E0\u9650\u53EF\u80FD",
          hp: { upright: 8, reversed: 8 },
          // 剧情模式 HP 见 M13 中的缩放参数；此处为短旅途基准
          storyHp: { upright: 8, reversed: 8 },
          // 数值平衡表中的校准参数
          balancedHp: { upright: 8, reversed: 8 },
          balancedSkillDmg: { upright: 2, reversed: 2 },
          skillId: { upright: "fool_blank", reversed: "fool_blank" },
          passiveId: null
        },
        // ---------- 风象 ----------
        {
          id: 1,
          key: "magician",
          name: "\u9B54\u672F\u5E08",
          nameEn: "The Magician",
          element: Element.WIND,
          planet: "\u6C34\u661F",
          theme: "\u521B\u9020\xB7\u610F\u5FD7\xB7\u8D44\u6E90",
          hp: { upright: 10, reversed: 10 },
          balancedHp: { upright: 28, reversed: 28 },
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "magician_mimic", reversed: "magician_fraud" },
          passiveId: "magician_table"
        },
        // ---------- 水象 ----------
        {
          id: 2,
          key: "priestess",
          name: "\u5973\u796D\u53F8",
          nameEn: "The High Priestess",
          element: Element.WATER,
          planet: "\u6708\u4EAE",
          theme: "\u76F4\u89C9\xB7\u6F5C\u610F\u8BC6\xB7\u795E\u79D8",
          hp: { upright: 10, reversed: 10 },
          balancedHp: { upright: 26, reversed: 26 },
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "priestess_veil", reversed: "priestess_illusion" },
          passiveId: "priestess_moonShadow"
        },
        // ---------- 土象 ----------
        {
          id: 3,
          key: "empress",
          name: "\u5973\u7687",
          nameEn: "The Empress",
          element: Element.EARTH,
          planet: "\u91D1\u661F",
          theme: "\u4E30\u9976\xB7\u5B55\u80B2\xB7\u81EA\u7136",
          hp: { upright: 12, reversed: 12 },
          balancedHp: { upright: 28, reversed: 26 },
          balancedSkillDmg: { upright: 4, reversed: 5 },
          skillId: { upright: "empress_fertile", reversed: "empress_suffocate" },
          passiveId: "empress_nurture"
        },
        // ---------- 火象 ----------
        {
          id: 4,
          key: "emperor",
          name: "\u7687\u5E1D",
          nameEn: "The Emperor",
          element: Element.FIRE,
          planet: "\u767D\u7F8A\u5EA7",
          theme: "\u6743\u5A01\xB7\u79E9\u5E8F\xB7\u652F\u914D",
          hp: { upright: 12, reversed: 12 },
          balancedHp: { upright: 26, reversed: 30 },
          balancedSkillDmg: { upright: 5, reversed: 6 },
          skillId: { upright: "emperor_decree", reversed: "emperor_tyranny" },
          passiveId: "emperor_crown"
        },
        // ---------- 土象 ----------
        {
          id: 5,
          key: "hierophant",
          name: "\u6559\u7687",
          nameEn: "The Hierophant",
          element: Element.EARTH,
          planet: "\u91D1\u725B\u5EA7",
          theme: "\u4F20\u7EDF\xB7\u6559\u5BFC\xB7\u4FE1\u4EF0",
          hp: { upright: 12, reversed: 12 },
          balancedHp: { upright: 26, reversed: 26 },
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "hierophant_dogma", reversed: "hierophant_shackle" },
          passiveId: "hierophant_precept"
        },
        // ---------- 风象 ----------
        {
          id: 6,
          key: "lovers",
          name: "\u604B\u4EBA",
          nameEn: "The Lovers",
          element: Element.WIND,
          planet: "\u53CC\u5B50\u5EA7",
          theme: "\u9009\u62E9\xB7\u5173\u7CFB\xB7\u548C\u8C10",
          hp: { upright: 10, reversed: 10 },
          balancedHp: { upright: 26, reversed: 26 },
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "lovers_choice", reversed: "lovers_split" },
          passiveId: "lovers_resonance"
        },
        // ---------- 水象 ----------
        {
          id: 7,
          key: "chariot",
          name: "\u6218\u8F66",
          nameEn: "The Chariot",
          element: Element.WATER,
          planet: "\u5DE8\u87F9\u5EA7",
          theme: "\u610F\u5FD7\xB7\u5F81\u670D\xB7\u524D\u8FDB",
          hp: { upright: 14, reversed: 14 },
          balancedHp: { upright: 26, reversed: 30 },
          balancedSkillDmg: { upright: 5, reversed: 6 },
          skillId: { upright: "chariot_charge", reversed: "chariot_crash" },
          passiveId: "chariot_crush"
        },
        // ---------- 火象 ----------
        {
          id: 8,
          key: "strength",
          name: "\u529B\u91CF",
          nameEn: "Strength",
          element: Element.FIRE,
          planet: "\u72EE\u5B50\u5EA7",
          theme: "\u52C7\u6C14\xB7\u8010\u5FC3\xB7\u5185\u5728\u529B\u91CF",
          hp: { upright: 14, reversed: 14 },
          balancedHp: { upright: 24, reversed: 26 },
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "strength_tame", reversed: "strength_rage" },
          passiveId: "strength_unyielding"
        },
        // ---------- 土象 ----------
        {
          id: 9,
          key: "hermit",
          name: "\u9690\u8005",
          nameEn: "The Hermit",
          element: Element.EARTH,
          planet: "\u5904\u5973\u5EA7",
          theme: "\u5185\u7701\xB7\u5B64\u72EC\xB7\u6307\u5F15",
          hp: { upright: 12, reversed: 12 },
          balancedHp: { upright: 26, reversed: 24 },
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "hermit_alone", reversed: "hermit_seal" },
          passiveId: "hermit_lantern"
        },
        // ---------- 火象 ----------
        {
          id: 10,
          key: "wheel",
          name: "\u547D\u8FD0\u4E4B\u8F6E",
          nameEn: "Wheel of Fortune",
          element: Element.FIRE,
          planet: "\u6728\u661F",
          theme: "\u547D\u8FD0\xB7\u8F6C\u6298\xB7\u5FAA\u73AF",
          hp: { upright: 14, reversed: 14 },
          balancedHp: { upright: 28, reversed: 26 },
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "wheel_turn", reversed: "wheel_doom" },
          passiveId: "wheel_karma"
        },
        // ---------- 风象 ----------
        {
          id: 11,
          key: "justice",
          name: "\u6B63\u4E49",
          nameEn: "Justice",
          element: Element.WIND,
          planet: "\u5929\u79E4\u5EA7",
          theme: "\u516C\u6B63\xB7\u56E0\u679C\xB7\u771F\u76F8",
          hp: { upright: 14, reversed: 14 },
          balancedHp: { upright: 26, reversed: 26 },
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "justice_scale", reversed: "justice_bias" },
          passiveId: "justice_verdict"
        },
        // ---------- 水象 ----------
        {
          id: 12,
          key: "hangedman",
          name: "\u5012\u540A\u4EBA",
          nameEn: "The Hanged Man",
          element: Element.WATER,
          planet: "\u6D77\u738B\u661F",
          theme: "\u727A\u7272\xB7\u7B49\u5F85\xB7\u65B0\u89C6\u89D2",
          hp: { upright: 12, reversed: 12 },
          balancedHp: { upright: 26, reversed: 24 },
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "hangedman_sacrifice", reversed: "hangedman_stagnate" },
          passiveId: "hangedman_invert"
        },
        // ---------- 水象 ----------
        {
          id: 13,
          key: "death",
          name: "\u6B7B\u795E",
          nameEn: "Death",
          element: Element.WATER,
          planet: "\u5929\u874E\u5EA7",
          theme: "\u7EC8\u7ED3\xB7\u8F6C\u5316\xB7\u91CD\u751F",
          hp: { upright: 12, reversed: 12 },
          balancedHp: { upright: 28, reversed: 24 },
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "death_transform", reversed: "death_corrode" },
          passiveId: "death_undying"
        },
        // ---------- 火象 ----------
        {
          id: 14,
          key: "temperance",
          name: "\u8282\u5236",
          nameEn: "Temperance",
          element: Element.FIRE,
          planet: "\u5C04\u624B\u5EA7",
          theme: "\u5E73\u8861\xB7\u8010\u5FC3\xB7\u8C03\u548C",
          hp: { upright: 14, reversed: 14 },
          balancedHp: { upright: 28, reversed: 26 },
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "temperance_harmony", reversed: "temperance_imbalance" },
          passiveId: "temperance_moderation"
        },
        // ---------- 土象 ----------
        {
          id: 15,
          key: "devil",
          name: "\u6076\u9B54",
          nameEn: "The Devil",
          element: Element.EARTH,
          planet: "\u6469\u7FAF\u5EA7",
          theme: "\u675F\u7F1A\xB7\u6B32\u671B\xB7\u9634\u5F71",
          hp: { upright: 16, reversed: 16 },
          balancedHp: { upright: 26, reversed: 26 },
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "devil_chain", reversed: "devil_tempt" },
          passiveId: "devil_obsession"
        },
        // ---------- 火象 ----------
        {
          id: 16,
          key: "tower",
          name: "\u9AD8\u5854",
          nameEn: "The Tower",
          element: Element.FIRE,
          planet: "\u706B\u661F",
          theme: "\u5D29\u6E83\xB7\u542F\u793A\xB7\u89E3\u653E",
          hp: { upright: 10, reversed: 10 },
          balancedHp: { upright: 24, reversed: 28 },
          balancedSkillDmg: { upright: 6, reversed: 6 },
          skillId: { upright: "tower_lightning", reversed: "tower_collapse" },
          passiveId: "tower_rebirth"
        },
        // ---------- 风象 ----------
        {
          id: 17,
          key: "star",
          name: "\u661F\u661F",
          nameEn: "The Star",
          element: Element.WIND,
          planet: "\u6C34\u74F6\u5EA7",
          theme: "\u5E0C\u671B\xB7\u7075\u611F\xB7\u5B81\u9759",
          hp: { upright: 12, reversed: 12 },
          balancedHp: { upright: 28, reversed: 26 },
          balancedSkillDmg: { upright: 4, reversed: 5 },
          skillId: { upright: "star_light", reversed: "star_disillusion" },
          passiveId: "star_glow"
        },
        // ---------- 水象 ----------
        {
          id: 18,
          key: "moon",
          name: "\u6708\u4EAE",
          nameEn: "The Moon",
          element: Element.WATER,
          planet: "\u53CC\u9C7C\u5EA7",
          theme: "\u5E7B\u89C9\xB7\u6050\u60E7\xB7\u6F5C\u610F\u8BC6",
          hp: { upright: 16, reversed: 16 },
          balancedHp: { upright: 26, reversed: 26 },
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "moon_fog", reversed: "moon_nightmare" },
          passiveId: "moon_tide"
        },
        // ---------- 火象 ----------
        {
          id: 19,
          key: "sun",
          name: "\u592A\u9633",
          nameEn: "The Sun",
          element: Element.FIRE,
          planet: "\u592A\u9633",
          theme: "\u5149\u660E\xB7\u6210\u529F\xB7\u6D3B\u529B",
          hp: { upright: 16, reversed: 16 },
          balancedHp: { upright: 30, reversed: 26 },
          balancedSkillDmg: { upright: 4, reversed: 5 },
          skillId: { upright: "sun_radiance", reversed: "sun_scorch" },
          passiveId: "sun_brilliance"
        },
        // ---------- 水象 ----------
        {
          id: 20,
          key: "judgement",
          name: "\u5BA1\u5224",
          nameEn: "Judgement",
          element: Element.WATER,
          planet: "\u51A5\u738B\u661F",
          theme: "\u89C9\u9192\xB7\u5BA1\u89C6\xB7\u91CD\u751F",
          hp: { upright: 18, reversed: 18 },
          balancedHp: { upright: 30, reversed: 24 },
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "judgement_revelation", reversed: "judgement_reckoning" },
          passiveId: "judgement_finalTrial"
        },
        // ---------- 无属性 ----------
        {
          id: 21,
          key: "world",
          name: "\u4E16\u754C",
          nameEn: "The World",
          element: Element.NONE,
          planet: "\u571F\u661F",
          theme: "\u5706\u6EE1\xB7\u6574\u5408\xB7\u7EC8\u6781\u5BA1\u89C6",
          hp: { upright: "dynamic", reversed: "dynamic" },
          // 12 + 已击败Boss数 × 2
          balancedHp: { upright: 24, reversed: 24 },
          // 短旅途平衡值
          balancedSkillDmg: { upright: 5, reversed: 5 },
          skillId: { upright: "world_completion", reversed: "world_shatter" },
          passiveId: "world_mirror"
        }
      ]);
      function createMinorArcanaDeck() {
        return [...createNumberCards(), ...createCourtCards()];
      }
      function createNumberDeck() {
        return createNumberCards();
      }
      function getBossById(id) {
        return MAJOR_ARCANA.find((b) => b.id === id) || null;
      }
      function getBossByKey(key) {
        return MAJOR_ARCANA.find((b) => b.key === key) || null;
      }
      function getRandomBossPool() {
        return MAJOR_ARCANA.filter((b) => b.id > 0 && b.id < 21);
      }
      module.exports = {
        CardType,
        CourtRank,
        MAJOR_ARCANA,
        createMinorArcanaDeck,
        createNumberDeck,
        createNumberCards,
        createCourtCards,
        getBossById,
        getBossByKey,
        getRandomBossPool
      };
    }
  });

  // src/M05_StatusEffect.js
  var require_M05_StatusEffect = __commonJS({
    "src/M05_StatusEffect.js"(exports, module) {
      var EffectType = Object.freeze({
        // --- Boss → 玩家 ---
        ARMOR: "armor",
        // 护甲（减伤，可叠加）
        FEAR: "fear",
        // 恐惧标记（每层每回合1伤害）
        SUIT_LOCK: "suit_lock",
        // 花色封锁（指定花色不可打出）
        COURT_SEAL: "court_seal",
        // 封印宫廷牌
        DRAW_BAN: "draw_ban",
        // 禁止抽牌
        HAND_LIMIT_DOWN: "hand_limit_down",
        // 手牌上限降低
        COUNTER_ATTACK: "counter_attack",
        // 反击（玩家攻击后受伤）
        DAMAGE_CAP: "damage_cap",
        // 伤害上限
        ELEMENT_IMMUNE: "element_immune",
        // 元素免疫（无法触发克制加成）
        ELEMENT_HIDDEN: "element_hidden",
        // 元素隐藏（Boss元素不可见）
        FORCE_MAX_CARD: "force_max_card",
        // 强制打出最大点数牌（皇帝正位）
        NO_ELEMENT_BONUS: "no_element_bonus",
        // 禁止元素克制效果（皇帝正位附带）
        CORRODE: "corrode",
        // 腐蚀（持续伤害，无视护甲）
        ODD_EVEN_LOCK: "odd_even_lock",
        // 奇偶锁（只能用奇数或偶数牌）
        CARD_LOCK: "card_lock",
        // 锁定手牌（需2次出牌机会）
        ELEMENT_INVERT: "element_invert",
        // 克制关系反转（倒吊人被动）
        SACRIFICE: "sacrifice",
        // 献祭（攻击前弃1牌）
        ALL_BONUS_CANCEL: "all_bonus_cancel",
        // 取消所有加成（星星逆位）
        // --- Boss 自身 ---
        BOSS_ARMOR: "boss_armor",
        // Boss护甲
        BOSS_ATK_BUFF: "boss_atk_buff",
        // Boss攻击力增益
        BOSS_REGEN: "boss_regen"
        // Boss回血
      });
      var StatusEffect = class {
        /**
         * @param {string} type - EffectType
         * @param {object} config
         * @param {number} [config.duration] - 持续回合数（-1=整场）
         * @param {number} [config.stacks]   - 叠加层数
         * @param {number} [config.value]    - 数值参数（护甲量、伤害上限等）
         * @param {string} [config.suit]     - 关联花色（花色封锁用）
         * @param {string} [config.group]    - 奇偶组 'odd'/'even'
         * @param {string} [config.source]   - 来源Boss key
         * @param {string} [config.cardId]   - 被锁定的手牌ID
         */
        constructor(type, config = {}) {
          this.type = type;
          this.duration = config.duration !== void 0 ? config.duration : -1;
          this.stacks = config.stacks || 1;
          this.value = config.value !== void 0 ? config.value : 0;
          this.suit = config.suit || null;
          this.group = config.group || null;
          this.source = config.source || null;
          this.cardId = config.cardId || null;
        }
        /** 回合结束时递减持续时间，返回是否已失效 */
        tick() {
          if (this.duration > 0) this.duration--;
          return this.duration === 0;
        }
        /** 是否永久（整场有效） */
        isPermanent() {
          return this.duration === -1;
        }
      };
      var StatusEffectManager = class {
        constructor() {
          this.playerEffects = [];
          this.bossEffects = [];
        }
        /** 重置所有状态（新战斗开始时） */
        clear() {
          this.playerEffects = [];
          this.bossEffects = [];
        }
        /* ---------- 添加 ---------- */
        addToPlayer(effect) {
          const existing = this.playerEffects.find((e) => e.type === effect.type && e.type === EffectType.FEAR);
          if (existing) {
            existing.stacks += effect.stacks;
            return existing;
          }
          this.playerEffects.push(effect);
          return effect;
        }
        addToBoss(effect) {
          const existing = this.bossEffects.find((e) => e.type === effect.type && e.type === EffectType.BOSS_ARMOR);
          if (existing) {
            existing.value += effect.value;
            return existing;
          }
          this.bossEffects.push(effect);
          return effect;
        }
        /* ---------- 查询 ---------- */
        /** 玩家是否有指定类型的效果 */
        playerHas(type) {
          return this.playerEffects.some((e) => e.type === type);
        }
        /** Boss是否有指定类型的效果 */
        bossHas(type) {
          return this.bossEffects.some((e) => e.type === type);
        }
        /** 获取玩家身上指定类型的效果（第一个） */
        getPlayerEffect(type) {
          return this.playerEffects.find((e) => e.type === type) || null;
        }
        /** 获取Boss身上指定类型的效果 */
        getBossEffect(type) {
          return this.bossEffects.find((e) => e.type === type) || null;
        }
        /** 获取玩家身上指定类型的所有效果 */
        getPlayerEffectsAll(type) {
          return this.playerEffects.filter((e) => e.type === type);
        }
        /* ---------- 移除 ---------- */
        removeFromPlayer(type) {
          this.playerEffects = this.playerEffects.filter((e) => e.type !== type);
        }
        removeFromBoss(type) {
          this.bossEffects = this.bossEffects.filter((e) => e.type !== type);
        }
        /* ---------- 回合结算 ---------- */
        /**
         * 回合结束时结算所有效果的持续时间
         * @returns {{ expiredPlayer: StatusEffect[], expiredBoss: StatusEffect[] }}
         */
        tickAll() {
          const expiredPlayer = [];
          const expiredBoss = [];
          this.playerEffects = this.playerEffects.filter((e) => {
            if (e.tick()) {
              expiredPlayer.push(e);
              return false;
            }
            return true;
          });
          this.bossEffects = this.bossEffects.filter((e) => {
            if (e.tick()) {
              expiredBoss.push(e);
              return false;
            }
            return true;
          });
          return { expiredPlayer, expiredBoss };
        }
        /* ---------- 伤害修正钩子 ---------- */
        /**
         * 计算恐惧标记总伤害
         */
        getFearDamage() {
          const fear = this.getPlayerEffect(EffectType.FEAR);
          return fear ? fear.stacks : 0;
        }
        /**
         * 获取Boss护甲总值
         */
        getBossArmor() {
          const armor = this.getBossEffect(EffectType.BOSS_ARMOR);
          return armor ? armor.value : 0;
        }
        /**
         * 减少Boss护甲（被伤害穿透时）
         */
        reduceBossArmor(amount) {
          const armor = this.getBossEffect(EffectType.BOSS_ARMOR);
          if (armor) {
            armor.value = Math.max(0, armor.value - amount);
            if (armor.value === 0) this.removeFromBoss(EffectType.BOSS_ARMOR);
          }
        }
        /**
         * 获取伤害上限（节制正位等）
         * @returns {number|null} null表示无上限
         */
        getDamageCap() {
          const cap = this.getPlayerEffect(EffectType.DAMAGE_CAP);
          return cap ? cap.value : null;
        }
        /**
         * 获取反击伤害值
         */
        getCounterDamage() {
          const counter = this.getPlayerEffect(EffectType.COUNTER_ATTACK);
          return counter ? counter.value : 0;
        }
        /**
         * 获取腐蚀伤害
         */
        getCorrodeDamage() {
          const corrode = this.getPlayerEffect(EffectType.CORRODE);
          return corrode ? corrode.value : 0;
        }
        /**
         * 检查花色是否被封锁
         */
        isSuitLocked(suit) {
          return this.playerEffects.some(
            (e) => e.type === EffectType.SUIT_LOCK && e.suit === suit
          );
        }
        /**
         * 检查手牌是否被锁定（恶魔正位）
         */
        isCardLocked(cardId) {
          return this.playerEffects.some(
            (e) => e.type === EffectType.CARD_LOCK && e.cardId === cardId
          );
        }
      };
      module.exports = { EffectType, StatusEffect, StatusEffectManager };
    }
  });

  // src/M04_DamageCalculator.js
  var require_M04_DamageCalculator = __commonJS({
    "src/M04_DamageCalculator.js"(exports, module) {
      var { ElementSystem } = require_M02_ElementSystem();
      var { SpiritNumber } = require_M03_SpiritNumber();
      var { EffectType } = require_M05_StatusEffect();
      var DamageCalculator = class {
        /**
         * 计算玩家对Boss的伤害
         * @param {object} params
         * @param {number} params.pip             - 数字牌点数 1-10
         * @param {string} params.cardElement     - 出牌的元素（可能被侍从修改）
         * @param {string} params.bossElement     - Boss当前元素
         * @param {string} params.bossAlignment   - Boss正逆位 'upright'/'reversed'
         * @param {object} params.courtBuff       - 宫廷牌Buff { damageMod, pipMod, forceAlignment, elementChanged }
         * @param {object} params.playerState     - M11 PlayerState 实例
         * @param {object} params.statusMgr       - M05 StatusEffectManager 实例
         * @param {object} [params.bossPassive]   - Boss被动修正函数（可选）
         * @returns {{ total, breakdown }}
         */
        static calculate(params) {
          const {
            pip,
            cardElement,
            bossElement,
            bossAlignment,
            courtBuff = {},
            playerState,
            statusMgr,
            bossPassive = null
          } = params;
          const breakdown = {
            baseDamage: 0,
            elementMod: 0,
            alignmentBonus: 0,
            courtBonus: 0,
            permanentBonus: 0,
            passiveMod: 0,
            capApplied: false,
            total: 0
          };
          let adjustedPip = pip;
          if (courtBuff.pipMod) {
            adjustedPip = Math.max(1, Math.min(10, pip + courtBuff.pipMod));
          }
          breakdown.baseDamage = SpiritNumber.getBaseDamage(adjustedPip);
          if (statusMgr.playerHas(EffectType.ALL_BONUS_CANCEL)) {
            breakdown.elementMod = 0;
          } else if (statusMgr.playerHas(EffectType.ELEMENT_IMMUNE) || statusMgr.playerHas(EffectType.NO_ELEMENT_BONUS)) {
            breakdown.elementMod = 0;
          } else if (statusMgr.playerHas(EffectType.ELEMENT_INVERT)) {
            breakdown.elementMod = ElementSystem.getModifierReversed(cardElement, bossElement);
          } else {
            breakdown.elementMod = ElementSystem.getModifier(cardElement, bossElement);
          }
          if (breakdown.elementMod > 0 && playerState.bonusCounter > 0) {
            breakdown.elementMod += playerState.bonusCounter;
          }
          if (statusMgr.playerHas(EffectType.ALL_BONUS_CANCEL)) {
            breakdown.alignmentBonus = 0;
          } else {
            const effectiveAlignment = courtBuff.forceAlignment || bossAlignment;
            breakdown.alignmentBonus = SpiritNumber.getAlignmentBonus(adjustedPip, effectiveAlignment);
            if (courtBuff.queenSameElement && breakdown.alignmentBonus > 0) {
              breakdown.alignmentBonus = 4;
            }
          }
          breakdown.courtBonus = courtBuff.damageMod || 0;
          breakdown.permanentBonus = playerState.getPermanentDamageBonus();
          if (bossPassive) {
            breakdown.passiveMod = bossPassive({
              pip: adjustedPip,
              baseDamage: breakdown.baseDamage,
              subtotal: breakdown.baseDamage + breakdown.elementMod + breakdown.alignmentBonus + breakdown.courtBonus + breakdown.permanentBonus
            });
          }
          let total = breakdown.baseDamage + breakdown.elementMod + breakdown.alignmentBonus + breakdown.courtBonus + breakdown.permanentBonus + breakdown.passiveMod;
          const cap = statusMgr.getDamageCap();
          if (cap !== null && total > cap) {
            total = cap;
            breakdown.capApplied = true;
          }
          total = Math.max(0, total);
          breakdown.total = total;
          return breakdown;
        }
        /**
         * 计算Boss对玩家的伤害（普攻/技能）
         * @param {number} baseDamage  - 基础伤害值
         * @param {object} statusMgr   - StatusEffectManager
         * @returns {number} 最终伤害
         */
        static calculateBossDamage(baseDamage, statusMgr) {
          let damage = baseDamage;
          const atkBuff = statusMgr.getBossEffect(EffectType.BOSS_ATK_BUFF);
          if (atkBuff) damage += atkBuff.value;
          return Math.max(0, damage);
        }
      };
      module.exports = DamageCalculator;
    }
  });

  // src/M06_DeckManager.js
  var require_M06_DeckManager = __commonJS({
    "src/M06_DeckManager.js"(exports, module) {
      var { createMinorArcanaDeck, CardType } = require_M01_CardData();
      var RandomSystem = require_M15_RandomSystem();
      var DeckManager = class {
        /**
         * @param {RandomSystem} rng - 随机数系统实例
         */
        constructor(rng) {
          this.rng = rng;
          this.drawPile = [];
          this.discardPile = [];
          this.hand = [];
          this.removedCards = [];
          this.handLimit = 8;
        }
        /* ---------- 初始化 ---------- */
        /** 用完整56张小阿尔卡纳初始化并洗牌 */
        init() {
          this.drawPile = createMinorArcanaDeck();
          this.discardPile = [];
          this.hand = [];
          this.removedCards = [];
          this.rng.shuffle(this.drawPile);
        }
        /** 设置手牌上限（女皇逆位可降低） */
        setHandLimit(limit) {
          this.handLimit = limit;
        }
        /* ---------- 抽牌 ---------- */
        /**
         * 抽 n 张牌到手牌（不超过上限）
         * @returns {object[]} 实际抽到的牌
         */
        draw(n = 1) {
          const drawn = [];
          for (let i = 0; i < n; i++) {
            if (this.hand.length >= this.handLimit) break;
            if (this.drawPile.length === 0) this._reshuffleDiscard();
            if (this.drawPile.length === 0) break;
            const card = this.drawPile.pop();
            this.hand.push(card);
            drawn.push(card);
          }
          return drawn;
        }
        /**
         * 初始发牌
         * @param {number} count - 初始手牌数（默认5）
         */
        dealInitialHand(count = 5) {
          return this.draw(count);
        }
        /* ---------- 出牌 ---------- */
        /**
         * 从手牌打出一张牌 → 弃牌堆
         * @param {string} cardId
         * @returns {object|null} 被打出的牌
         */
        playCard(cardId) {
          const idx = this.hand.findIndex((c) => c.id === cardId);
          if (idx === -1) return null;
          const card = this.hand.splice(idx, 1)[0];
          this.discardPile.push(card);
          return card;
        }
        /* ---------- 弃牌 ---------- */
        /**
         * 强制弃掉指定牌
         * @param {string} cardId
         */
        discardById(cardId) {
          const idx = this.hand.findIndex((c) => c.id === cardId);
          if (idx === -1) return null;
          const card = this.hand.splice(idx, 1)[0];
          this.discardPile.push(card);
          return card;
        }
        /** 弃掉手中点数最高的牌（皇帝逆位、太阳逆位） */
        discardHighest() {
          const numberCards = this.hand.filter((c) => c.type === CardType.NUMBER);
          if (numberCards.length === 0) return null;
          numberCards.sort((a, b) => b.pip - a.pip);
          return this.discardById(numberCards[0].id);
        }
        /** 弃掉手中点数最低的牌（太阳逆位 - 炙灼） */
        discardLowest() {
          const numberCards = this.hand.filter((c) => c.type === CardType.NUMBER);
          if (numberCards.length === 0) return null;
          numberCards.sort((a, b) => a.pip - b.pip);
          return this.discardById(numberCards[0].id);
        }
        /** 随机弃掉一张手牌（命运之轮逆位） */
        discardRandom() {
          if (this.hand.length === 0) return null;
          const card = this.rng.pick(this.hand);
          return this.discardById(card.id);
        }
        /** 弃掉指定数量手牌并重新抽取（死神正位：蜕变） */
        transformHand(discardCount, drawCount) {
          const discarded = [];
          for (let i = 0; i < discardCount && this.hand.length > 0; i++) {
            const card = this.rng.pick(this.hand);
            const d = this.discardById(card.id);
            if (d) discarded.push(d);
          }
          const drawn = this.draw(drawCount);
          return { discarded, drawn };
        }
        /* ---------- 永久移除 ---------- */
        /** 永久移除一张牌（恋人正位：抛择） */
        removeCard(cardId) {
          const idx = this.hand.findIndex((c) => c.id === cardId);
          if (idx !== -1) {
            this.removedCards.push(this.hand.splice(idx, 1)[0]);
            return true;
          }
          const dIdx = this.drawPile.findIndex((c) => c.id === cardId);
          if (dIdx !== -1) {
            this.removedCards.push(this.drawPile.splice(dIdx, 1)[0]);
            return true;
          }
          return false;
        }
        /* ---------- 查询 ---------- */
        /** 获取手中的数字牌 */
        getNumberCards() {
          return this.hand.filter((c) => c.type === CardType.NUMBER);
        }
        /** 获取手中的宫廷牌 */
        getCourtCards() {
          return this.hand.filter((c) => c.type === CardType.COURT);
        }
        /** 从抽牌堆顶翻出 n 张（不放入手牌，恋人正位用） */
        peekTop(n = 1) {
          return this.drawPile.slice(-n).reverse();
        }
        /** 从抽牌堆顶取出 n 张 */
        drawFromTop(n = 1) {
          const cards = [];
          for (let i = 0; i < n && this.drawPile.length > 0; i++) {
            cards.push(this.drawPile.pop());
          }
          return cards;
        }
        /** 将牌加入手牌（不经过抽牌堆） */
        addToHand(card) {
          if (this.hand.length < this.handLimit) {
            this.hand.push(card);
            return true;
          }
          return false;
        }
        /** 手牌数 */
        handSize() {
          return this.hand.length;
        }
        /** 是否有可出的数字牌（考虑花色封锁） */
        hasPlayableNumberCard(lockedSuits = []) {
          return this.hand.some(
            (c) => c.type === CardType.NUMBER && !lockedSuits.includes(c.suit)
          );
        }
        /* ---------- 内部 ---------- */
        /** 弃牌堆洗回抽牌堆 */
        _reshuffleDiscard() {
          this.drawPile = this.discardPile.slice();
          this.discardPile = [];
          this.rng.shuffle(this.drawPile);
        }
      };
      module.exports = DeckManager;
    }
  });

  // src/M09_CourtCard.js
  var require_M09_CourtCard = __commonJS({
    "src/M09_CourtCard.js"(exports, module) {
      var { CourtRank } = require_M01_CardData();
      var { ElementSystem, SUIT_TO_ELEMENT } = require_M02_ElementSystem();
      var CourtCardLogic = class {
        /**
         * 计算宫廷牌对数字牌的增益效果
         * @param {object} courtCard   - 宫廷牌 { suit, rank }
         * @param {object} numberCard  - 数字牌 { suit, pip }
         * @param {string} bossAlignment - Boss当前正逆位
         * @returns {object} courtBuff - 传给 DamageCalculator 的buff对象
         */
        static resolve(courtCard, numberCard, bossAlignment) {
          const courtElem = SUIT_TO_ELEMENT[courtCard.suit];
          const numberElem = SUIT_TO_ELEMENT[numberCard.suit];
          const sameElement = courtElem === numberElem;
          const buff = {
            damageMod: 0,
            // 附加伤害修正
            pipMod: 0,
            // 点数修正
            forceAlignment: null,
            // 强制对位（王后）
            queenSameElement: false,
            elementChanged: false,
            // 元素是否被侍从改变
            newElement: null,
            // 侍从改变后的新元素
            flipAlignment: false,
            // 国王是否翻转正逆位
            kingSkipBossTurn: false,
            // 国王同元素: Boss本回合无法行动
            kingWeakened: false
            // 国王异元素: Boss伤害减半
          };
          switch (courtCard.rank) {
            case CourtRank.PAGE:
              if (sameElement) {
                buff.damageMod = 2;
              } else {
                buff.elementChanged = true;
                buff.newElement = courtElem;
                buff.damageMod = -1;
              }
              break;
            case CourtRank.KNIGHT:
              if (sameElement) {
                buff.pipMod = 4;
              } else {
                buff.pipMod = 2;
              }
              break;
            case CourtRank.QUEEN:
              if (sameElement) {
                buff.queenSameElement = true;
              }
              buff.forceAlignment = "__queen_override__";
              break;
            case CourtRank.KING:
              buff.flipAlignment = true;
              if (sameElement) {
                buff.kingSkipBossTurn = true;
              } else {
                buff.kingWeakened = true;
              }
              break;
          }
          return buff;
        }
        /**
         * 针对骑士，计算最优点数调节方向
         * 玩家希望最终伤害最大化，骑士可以 +N 或 -N
         * @param {number} pip - 原始点数
         * @param {number} range - 调节范围（2或4）
         * @param {string} bossAlignment - Boss正逆位
         * @returns {{ bestPip, bestDirection }} 最优调节后的点数和方向
         */
        static knightBestAdjust(pip, range, bossAlignment) {
          const { SpiritNumber } = require_M03_SpiritNumber();
          let bestPip = pip;
          let bestDamage = -Infinity;
          for (let delta = -range; delta <= range; delta++) {
            const adjusted = Math.max(1, Math.min(10, pip + delta));
            const base = SpiritNumber.getBaseDamage(adjusted);
            const bonus = SpiritNumber.getAlignmentBonus(adjusted, bossAlignment);
            const total = base + bonus;
            if (total > bestDamage) {
              bestDamage = total;
              bestPip = adjusted;
            }
          }
          return { bestPip, direction: bestPip - pip };
        }
      };
      module.exports = CourtCardLogic;
    }
  });

  // src/M11_PlayerState.js
  var require_M11_PlayerState = __commonJS({
    "src/M11_PlayerState.js"(exports, module) {
      var PlayerState = class {
        constructor() {
          this.maxHp = 25;
          this.hp = 25;
          this.shield = 0;
          this.hand = [];
          this.handLimit = 8;
          this.starBlessing = false;
          this.bonusDamage = 0;
          this.bonusCounter = 0;
          this.bossesDefeated = 0;
          this.suitUsageCount = {};
          this.acceptedTempt = false;
          this.lastPlayedSuit = null;
          this.consecutiveSuit = 0;
        }
        /* ---------- 生命值 ---------- */
        /** 受到伤害（先消耗护盾） */
        takeDamage(amount) {
          if (amount <= 0) return 0;
          let remaining = amount;
          if (this.shield > 0) {
            const absorbed = Math.min(this.shield, remaining);
            this.shield -= absorbed;
            remaining -= absorbed;
          }
          this.hp = Math.max(0, this.hp - remaining);
          return remaining;
        }
        /** 回复生命值 */
        heal(amount) {
          const before = this.hp;
          this.hp = Math.min(this.maxHp, this.hp + amount);
          return this.hp - before;
        }
        /** 场间恢复（按最大生命百分比） */
        restoreBetweenBattles(percent) {
          const amount = Math.floor(this.maxHp * percent);
          return this.heal(amount);
        }
        /** 是否存活 */
        isAlive() {
          return this.hp > 0;
        }
        /* ---------- 护盾 ---------- */
        addShield(amount) {
          this.shield += amount;
        }
        /* ---------- Buff管理 ---------- */
        /** 激活星之祝福（不叠加） */
        activateStarBlessing() {
          this.starBlessing = true;
        }
        /** 获取总永久伤害加成 */
        getPermanentDamageBonus() {
          let bonus = this.bonusDamage;
          if (this.starBlessing) bonus += 1;
          return bonus;
        }
        /** 里程碑: +4 HP */
        milestoneBonusHp() {
          this.maxHp += 4;
          this.hp += 4;
        }
        /** 里程碑: 克制+2 */
        milestoneBonusCounter() {
          this.bonusCounter += 2;
        }
        /** 里程碑: 基础伤害+1 */
        milestoneBonusDamage() {
          this.bonusDamage += 1;
        }
        /* ---------- 花色使用统计 ---------- */
        /** 记录使用了某花色 */
        recordSuitUsage(suit) {
          if (!this.suitUsageCount[suit]) this.suitUsageCount[suit] = 0;
          this.suitUsageCount[suit]++;
          if (suit === this.lastPlayedSuit) {
            this.consecutiveSuit++;
          } else {
            this.consecutiveSuit = 1;
          }
          this.lastPlayedSuit = suit;
        }
        /** 获取使用次数最少的花色（世界被动） */
        getLeastUsedSuit() {
          const { WANDS, CUPS, SWORDS, PENTACLES } = require_M02_ElementSystem().Suit;
          const suits = [WANDS, CUPS, SWORDS, PENTACLES];
          let minCount = Infinity;
          let minSuit = suits[0];
          for (const s of suits) {
            const count = this.suitUsageCount[s] || 0;
            if (count < minCount) {
              minCount = count;
              minSuit = s;
            }
          }
          return minSuit;
        }
        /* ---------- 新旅途重置 ---------- */
        /** 开始新旅途时重置（保留模式解锁等外部数据） */
        resetForNewJourney() {
          this.maxHp = 25;
          this.hp = 25;
          this.shield = 0;
          this.handLimit = 8;
          this.starBlessing = false;
          this.bonusDamage = 0;
          this.bonusCounter = 0;
          this.bossesDefeated = 0;
          this.suitUsageCount = {};
          this.acceptedTempt = false;
          this.lastPlayedSuit = null;
          this.consecutiveSuit = 0;
        }
        /** 无尽模式: 保留里程碑强化，只重置战斗临时状态 */
        resetForNewCycle() {
          this.suitUsageCount = {};
          this.lastPlayedSuit = null;
          this.consecutiveSuit = 0;
        }
        /* ---------- 序列化 ---------- */
        toJSON() {
          return {
            maxHp: this.maxHp,
            hp: this.hp,
            shield: this.shield,
            handLimit: this.handLimit,
            starBlessing: this.starBlessing,
            bonusDamage: this.bonusDamage,
            bonusCounter: this.bonusCounter,
            bossesDefeated: this.bossesDefeated,
            suitUsageCount: { ...this.suitUsageCount },
            acceptedTempt: this.acceptedTempt
          };
        }
        fromJSON(data) {
          Object.assign(this, data);
        }
      };
      module.exports = PlayerState;
    }
  });

  // src/M08_BossSkills.js
  var require_M08_BossSkills = __commonJS({
    "src/M08_BossSkills.js"(exports, module) {
      var { EffectType, StatusEffect } = require_M05_StatusEffect();
      var { Element, ElementSystem, SUIT_TO_ELEMENT } = require_M02_ElementSystem();
      var Skills = {};
      Skills["fool_blank"] = (ctx) => {
        ctx.player.takeDamage(2);
        return { damage: 2, desc: "\u7A7A\u767D \u2014 \u56FA\u5B9A2\u70B9\u4F24\u5BB3" };
      };
      Skills["magician_mimic"] = (ctx) => {
        if (ctx.lastPlayedElement && ctx.lastPlayedElement !== Element.NONE) {
          ctx.boss.element = ctx.lastPlayedElement;
          return { desc: `\u4E07\u8C61 \u2014 Boss\u5143\u7D20\u53D8\u4E3A${ctx.lastPlayedElement}` };
        }
        return { desc: "\u4E07\u8C61 \u2014 \u65E0\u53EF\u590D\u5236\u7684\u5143\u7D20" };
      };
      Skills["magician_fraud"] = (ctx) => {
        const numberCards = ctx.deck.getNumberCards();
        if (numberCards.length >= 2) {
          const [a, b] = ctx.rng.pickN(numberCards, 2);
          const tempSuit = a.suit;
          a.suit = b.suit;
          b.suit = tempSuit;
          return { desc: "\u6B3A\u8BC8 \u2014 2\u5F20\u624B\u724C\u5143\u7D20\u4E92\u6362", cards: [a.id, b.id] };
        }
        return { desc: "\u6B3A\u8BC8 \u2014 \u624B\u724C\u4E0D\u8DB3\uFF0C\u672A\u751F\u6548" };
      };
      Skills["priestess_veil"] = (ctx) => {
        ctx.status.addToBoss(new StatusEffect(EffectType.ELEMENT_HIDDEN, { duration: 2 }));
        return { desc: "\u5E37\u5E55 \u2014 Boss\u5143\u7D20\u9690\u85CF2\u56DE\u5408" };
      };
      Skills["priestess_illusion"] = (ctx) => {
        const suits = ["wands", "cups", "swords", "pentacles"];
        const locked = ctx.rng.pick(suits);
        ctx.status.addToPlayer(new StatusEffect(EffectType.SUIT_LOCK, { duration: 1, suit: locked }));
        return { desc: `\u5E7B\u8C61 \u2014 ${locked}\u82B1\u8272\u88AB\u5C01\u95011\u56DE\u5408`, suit: locked };
      };
      Skills["empress_fertile"] = (ctx) => {
        ctx.boss.hp = Math.min(ctx.boss.maxHp, ctx.boss.hp + 3);
        return { heal: 3, desc: "\u4E30\u9976 \u2014 Boss\u56DE\u590D3HP" };
      };
      Skills["empress_suffocate"] = (ctx) => {
        ctx.deck.setHandLimit(Math.max(1, ctx.deck.handLimit - 2));
        ctx.status.addToPlayer(new StatusEffect(EffectType.HAND_LIMIT_DOWN, { duration: -1, value: 2 }));
        return { desc: "\u7A92\u606F \u2014 \u624B\u724C\u4E0A\u9650-2\uFF08\u6574\u573A\uFF09" };
      };
      Skills["emperor_decree"] = (ctx) => {
        ctx.status.addToPlayer(new StatusEffect(EffectType.FORCE_MAX_CARD, { duration: 1 }));
        ctx.status.addToPlayer(new StatusEffect(EffectType.NO_ELEMENT_BONUS, { duration: 1 }));
        return { desc: "\u6555\u4EE4 \u2014 \u5FC5\u987B\u6253\u6700\u5927\u70B9\u6570\u724C\uFF0C\u65E0\u6CD5\u514B\u5236" };
      };
      Skills["emperor_tyranny"] = (ctx) => {
        ctx.player.takeDamage(4);
        ctx.deck.discardHighest();
        ctx.boss.hp -= 2;
        return { damage: 4, selfDamage: 2, desc: "\u66B4\u653F \u2014 4\u4F24\u5BB3+\u5F03\u6700\u9AD8\u724C\uFF0CBoss\u81EA\u4F242" };
      };
      Skills["hierophant_dogma"] = (ctx) => {
        ctx.boss._dogmaActive = true;
        return { desc: "\u6559\u4E49 \u2014 \u5FC5\u987B\u8FDE\u7EED\u6253\u540C\u82B1\u8272" };
      };
      Skills["hierophant_shackle"] = (ctx) => {
        ctx.status.addToPlayer(new StatusEffect(EffectType.COURT_SEAL, { duration: 2 }));
        return { desc: "\u7981\u9522 \u2014 \u5BAB\u5EF7\u724C\u5C01\u53702\u56DE\u5408" };
      };
      Skills["lovers_choice"] = (ctx) => {
        const revealed = ctx.deck.drawFromTop(2);
        return { desc: "\u629B\u62E9 \u2014 \u7FFB\u51FA2\u5F20\u724C\uFF0C\u8BF7\u9009\u62E9", revealed, requireChoice: true };
      };
      Skills["lovers_split"] = (ctx) => {
        const group = ctx.rng.chance(0.5) ? "odd" : "even";
        ctx.status.addToPlayer(new StatusEffect(EffectType.ODD_EVEN_LOCK, { duration: 1, group }));
        return { desc: `\u5206\u79BB \u2014 \u672C\u56DE\u5408\u53EA\u80FD\u4F7F\u7528${group === "odd" ? "\u5947\u6570" : "\u5076\u6570"}\u724C`, group };
      };
      Skills["chariot_charge"] = (ctx) => {
        const currentAtk = Math.min(4, 1 + ctx.turnNumber);
        ctx.player.takeDamage(currentAtk);
        return { damage: currentAtk, desc: `\u9A70\u9A8B \u2014 \u9020\u6210${currentAtk}\u4F24\u5BB3\uFF08\u9012\u589E\uFF09` };
      };
      Skills["chariot_crash"] = (ctx) => {
        const dmg = Math.min(6, ctx.turnNumber * 2);
        ctx.player.takeDamage(dmg);
        ctx.boss.hp -= 2;
        return { damage: dmg, selfDamage: 2, desc: `\u5931\u63A7 \u2014 ${dmg}\u4F24\u5BB3\uFF0CBoss\u81EA\u4F242` };
      };
      Skills["strength_tame"] = (ctx) => {
        const armor = ctx.status.getBossEffect(EffectType.BOSS_ARMOR);
        if (armor) {
          armor.value += 2;
        } else {
          ctx.status.addToBoss(new StatusEffect(EffectType.BOSS_ARMOR, { duration: -1, value: 2 }));
        }
        return { desc: "\u67D4\u9A6F \u2014 Boss\u62A4\u7532+2" };
      };
      Skills["strength_rage"] = (ctx) => {
        ctx.status.addToPlayer(new StatusEffect(EffectType.COUNTER_ATTACK, { duration: -1, value: 3 }));
        return { desc: "\u72C2\u66B4 \u2014 \u73A9\u5BB6\u653B\u51FB\u540E\u53D73\u70B9\u53CD\u51FB" };
      };
      Skills["hermit_alone"] = (ctx) => {
        ctx.status.addToPlayer(new StatusEffect(EffectType.COURT_SEAL, { duration: -1 }));
        return { desc: "\u72EC\u884C \u2014 \u5BAB\u5EF7\u724C\u6574\u573A\u7981\u7528" };
      };
      Skills["hermit_seal"] = (ctx) => {
        ctx.status.addToPlayer(new StatusEffect(EffectType.DRAW_BAN, { duration: -1, value: 1 }));
        return { desc: "\u5C01\u95ED \u2014 \u6BCF\u56DE\u5408\u62BD\u724C-1\uFF08\u6574\u573A\uFF09" };
      };
      Skills["wheel_turn"] = (ctx) => {
        const elems = ElementSystem.getAllElements();
        ctx.boss.element = ctx.rng.pick(elems);
        return { desc: `\u547D\u8FD0\u6D41\u8F6C \u2014 Boss\u5143\u7D20\u53D8\u4E3A${ctx.boss.element}` };
      };
      Skills["wheel_doom"] = (ctx) => {
        if (ctx.rng.chance(0.5)) {
          const discarded = ctx.deck.discardRandom();
          return { desc: "\u5384\u8FD0\u8FDE\u9501 \u2014 \u968F\u673A\u5F031\u724C", discarded: discarded?.id };
        }
        return { desc: "\u5384\u8FD0\u8FDE\u9501 \u2014 \u672A\u89E6\u53D1" };
      };
      Skills["justice_scale"] = (ctx) => {
        ctx.boss._reflectPercent = 0.3;
        return { desc: "\u5929\u79E4 \u2014 \u53CD\u5C0430%\u4F24\u5BB3\u7ED9\u73A9\u5BB6" };
      };
      Skills["justice_bias"] = (ctx) => {
        ctx.boss._stealElementBonus = true;
        return { desc: "\u504F\u9887 \u2014 \u7A83\u53D6\u514B\u5236\u52A0\u6210\u4E3A\u653B\u51FB\u529B" };
      };
      Skills["hangedman_sacrifice"] = (ctx) => {
        ctx.status.addToPlayer(new StatusEffect(EffectType.SACRIFICE, { duration: -1 }));
        return { desc: "\u732E\u796D \u2014 \u6BCF\u6B21\u653B\u51FB\u524D\u5F031\u724C" };
      };
      Skills["hangedman_stagnate"] = (ctx) => {
        ctx.status.addToPlayer(new StatusEffect(EffectType.DRAW_BAN, { duration: -1, value: 99 }));
        return { desc: "\u505C\u6EDE \u2014 \u4E0D\u518D\u81EA\u52A8\u62BD\u724C" };
      };
      Skills["death_transform"] = (ctx) => {
        const result = ctx.deck.transformHand(2, 2);
        return { desc: "\u8715\u53D8 \u2014 \u5F032\u5F20\u62BD2\u5F20", ...result };
      };
      Skills["death_corrode"] = (ctx) => {
        ctx.status.addToPlayer(new StatusEffect(EffectType.CORRODE, { duration: -1, value: 2 }));
        return { desc: "\u8150\u8680 \u2014 \u6BCF\u56DE\u54082\u70B9\u6301\u7EED\u4F24\u5BB3\uFF08\u65E0\u89C6\u62A4\u7532\uFF09" };
      };
      Skills["temperance_harmony"] = (ctx) => {
        ctx.status.addToPlayer(new StatusEffect(EffectType.DAMAGE_CAP, { duration: -1, value: 8 }));
        return { desc: "\u8C03\u548C \u2014 \u5355\u56DE\u5408\u4F24\u5BB3\u4E0A\u96508" };
      };
      Skills["temperance_imbalance"] = (ctx) => {
        ctx.player.takeDamage(2);
        ctx.player.takeDamage(2);
        return { damage: 4, desc: "\u5931\u8861 \u2014 \u4E24\u6B212\u70B9\u4F24\u5BB3" };
      };
      Skills["devil_chain"] = (ctx) => {
        const hand = ctx.deck.hand;
        if (hand.length > 0) {
          const card = ctx.rng.pick(hand);
          ctx.status.addToPlayer(new StatusEffect(EffectType.CARD_LOCK, { duration: -1, cardId: card.id }));
          return { desc: `\u9501\u94FE \u2014 ${card.id}\u88AB\u9501\u5B9A`, cardId: card.id };
        }
        return { desc: "\u9501\u94FE \u2014 \u65E0\u624B\u724C\u53EF\u9501\u5B9A" };
      };
      Skills["devil_tempt"] = (ctx) => {
        return { desc: "\u8BF1\u60D1 \u2014 \u53D75\u4F24\u5BB3\u63623\u5F20\u724C\uFF1F", requireChoice: true, choiceType: "tempt" };
      };
      Skills["tower_lightning"] = (ctx) => {
        ctx.player.takeDamage(6);
        return { damage: 6, desc: "\u5929\u96F7 \u2014 6\u70B9\u4F24\u5BB3" };
      };
      Skills["tower_collapse"] = (ctx) => {
        ctx.player.takeDamage(4);
        ctx.boss.hp -= 4;
        return { damage: 4, selfDamage: 4, desc: "\u5D29\u5854 \u2014 \u53CC\u65B9\u5404\u53D74\u4F24" };
      };
      Skills["star_light"] = (ctx) => {
        ctx.boss.hp = Math.min(ctx.boss.maxHp, ctx.boss.hp + 2);
        ctx.deck.draw(1);
        return { heal: 2, desc: "\u542F\u660E \u2014 Boss\u56DE\u590D2HP\uFF0C\u73A9\u5BB6\u62BD1\u724C" };
      };
      Skills["star_disillusion"] = (ctx) => {
        ctx.status.addToPlayer(new StatusEffect(EffectType.ALL_BONUS_CANCEL, { duration: 2 }));
        return { desc: "\u5E7B\u706D \u2014 \u6240\u6709\u52A0\u6210\u53D6\u6D882\u56DE\u5408" };
      };
      Skills["moon_fog"] = (ctx) => {
        ctx.boss._fogActive = true;
        return { desc: "\u8FF7\u96FE \u2014 \u672C\u56DE\u5408\u968F\u673A\u51FA\u724C", requireAutoPlay: true };
      };
      Skills["moon_nightmare"] = (ctx) => {
        ctx.status.addToPlayer(new StatusEffect(EffectType.FEAR, { duration: -1, stacks: 1 }));
        const total = ctx.status.getFearDamage();
        return { desc: `\u68A6\u9B47 \u2014 \u6050\u60E7\u6807\u8BB0+1\uFF08\u5F53\u524D${total}\u5C42\uFF09` };
      };
      Skills["sun_radiance"] = (ctx) => {
        ctx.boss._playerAtkBuff = 2;
        ctx.boss.hp = Math.min(ctx.boss.maxHp, ctx.boss.hp + 2);
        return { desc: "\u666E\u7167 \u2014 \u73A9\u5BB6\u653B\u51FB+2\uFF0CBoss\u56DE\u590D2HP" };
      };
      Skills["sun_scorch"] = (ctx) => {
        const discarded = ctx.deck.discardLowest();
        return { desc: "\u7099\u707C \u2014 \u70E7\u6BC1\u6700\u4F4E\u70B9\u6570\u724C", discarded: discarded?.id };
      };
      Skills["judgement_revelation"] = (ctx) => {
        const journey = ctx.journey || {};
        const defeated = journey.defeatedBosses || [];
        if (defeated.length > 0) {
          const lastBoss = defeated[defeated.length - 1];
          const skillId = lastBoss.skillId;
          if (Skills[skillId]) {
            const result = Skills[skillId](ctx);
            return { desc: `\u5929\u542F \u2014 \u53EC\u5524${lastBoss.name}\u7684\u6280\u80FD`, inner: result };
          }
        }
        return { desc: "\u5929\u542F \u2014 \u65E0\u53EF\u53EC\u5524\u7684\u6280\u80FD" };
      };
      Skills["judgement_reckoning"] = (ctx) => {
        const lostHp = ctx.player.maxHp - ctx.player.hp;
        const extraDmg = Math.floor(lostHp * 0.3);
        ctx.player.takeDamage(extraDmg);
        return { damage: extraDmg, desc: `\u6E05\u7B97 \u2014 \u989D\u5916${extraDmg}\u4F24\u5BB3\uFF08\u5DF2\u635FHP\xD730%\uFF09` };
      };
      Skills["world_completion"] = (ctx) => {
        const journey = ctx.journey || {};
        const defeated = journey.defeatedBosses || [];
        const cycleIndex = (ctx.boss._worldCycle || 0) % defeated.length;
        const target = defeated[cycleIndex];
        ctx.boss._worldCycle = cycleIndex + 1;
        if (target) {
          ctx.boss.element = target.element;
          const skillId = target.skillId;
          if (Skills[skillId]) {
            const fullCycle = ctx.boss._worldCycle > defeated.length;
            ctx.boss._worldHalf = !fullCycle;
            const result = Skills[skillId](ctx);
            return { desc: `\u5927\u5706\u6EE1 \u2014 \u6FC0\u6D3B${target.name}\u6280\u80FD${!fullCycle ? "(\u51CF\u534A)" : ""}`, inner: result };
          }
        }
        return { desc: "\u5927\u5706\u6EE1 \u2014 \u65E0\u5DF2\u9047Boss" };
      };
      Skills["world_shatter"] = (ctx) => {
        ctx.player.takeDamage(3);
        const journey = ctx.journey || {};
        const defeated = journey.defeatedBosses || [];
        if (defeated.length >= 2) {
          const picked = ctx.rng.pickN(defeated, 2);
          return { damage: 3, desc: `\u788E\u955C \u2014 3\u4F24+\u6FC0\u6D3B${picked.map((b) => b.name).join("\u3001")}\u7684\u88AB\u52A8` };
        }
        return { damage: 3, desc: "\u788E\u955C \u2014 3\u4F24\u5BB3" };
      };
      var Passives = {};
      Passives["magician_table"] = (ctx, trigger) => {
        if (trigger === "onTurnStart") {
          const usedSuits = new Set(ctx.deck.discardPile.map((c) => c.suit));
          ctx.boss._atkBonus = usedSuits.size;
        }
      };
      Passives["priestess_moonShadow"] = (ctx, trigger) => {
        if (trigger === "onPlayerAttack") {
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
      Passives["empress_nurture"] = (ctx, trigger) => {
        if (trigger === "onPlayerAttack" && ctx.rng.chance(0.5)) {
          ctx.deck.draw(1);
        }
      };
      Passives["emperor_crown"] = (ctx, trigger) => {
        if (trigger === "onDamageCalc") {
          return (info) => {
            if (ctx.lastAttackElement === Element.WATER) return -1;
            return 0;
          };
        }
      };
      Passives["hierophant_precept"] = (ctx, trigger) => {
        if (trigger === "onDamageCalc") {
          return (info) => {
            if (info.pip === 1) return Math.floor(info.subtotal * 0.5);
            return 0;
          };
        }
      };
      Passives["lovers_resonance"] = (ctx, trigger) => {
        if (trigger === "onDamageCalc") {
          return (info) => {
            if (ctx.player.consecutiveSuit >= 2) return 3;
            return 0;
          };
        }
      };
      Passives["chariot_crush"] = (ctx, trigger) => {
        if (trigger === "onDamageCalc") {
          return (info) => {
            if (info.subtotal <= 1) return -info.subtotal;
            return 0;
          };
        }
      };
      Passives["strength_unyielding"] = (ctx, trigger) => {
        if (trigger === "onTurnStart") {
          if (ctx.boss.hp < ctx.boss.maxHp * 0.3) {
            ctx.boss._unyieldingActive = true;
          }
        }
      };
      Passives["hermit_lantern"] = (ctx, trigger) => {
        if (trigger === "onBattleStart") {
          return { preview: ctx.boss.actionSequence.slice(0, 3) };
        }
      };
      Passives["wheel_karma"] = (ctx, trigger) => {
        if (trigger === "onPlayerAttack") {
          if (ctx.player.consecutiveSuit >= 2) {
            ctx.boss._karmaBonus = 3;
          }
        }
      };
      Passives["justice_verdict"] = (ctx, trigger) => {
        if (trigger === "onKingFlip") {
          return { immune: true };
        }
      };
      Passives["hangedman_invert"] = (ctx, trigger) => {
        if (trigger === "onBattleStart") {
          ctx.status.addToPlayer(new StatusEffect(EffectType.ELEMENT_INVERT, { duration: -1 }));
        }
      };
      Passives["death_undying"] = (ctx, trigger) => {
        if (trigger === "onBossDefeated" && !ctx.boss._hasRevived) {
          ctx.boss._hasRevived = true;
          ctx.boss.hp = 4;
          return { revived: true, hp: 4 };
        }
      };
      Passives["temperance_moderation"] = (ctx, trigger) => {
        if (trigger === "onDamageCalc") {
          return (info) => {
            if (info.pip === 3 || info.pip === 7) return -2;
            return 0;
          };
        }
      };
      Passives["devil_obsession"] = (ctx, trigger) => {
        if (trigger === "onTurnStart" && ctx.player.acceptedTempt) {
          ctx.boss._obsessionBonus = 2;
        }
      };
      Passives["tower_rebirth"] = (ctx, trigger) => {
        if (trigger === "onBossDefeated") {
          ctx.player.heal(5);
          ctx.deck.draw(1);
          return { healed: 5, drawn: 1 };
        }
      };
      Passives["star_glow"] = (ctx, trigger) => {
        if (trigger === "onBossDefeated") {
          ctx.player.heal(3);
          return { healed: 3 };
        }
      };
      Passives["moon_tide"] = (ctx, trigger) => {
        if (trigger === "onTurnStart") {
          ctx.boss._tideBonus = ctx.turnNumber % 2 === 1 ? 2 : -1;
        }
      };
      Passives["sun_brilliance"] = (ctx, trigger) => {
        if (trigger === "onBattleStart") {
          ctx.status.addToPlayer(new StatusEffect(EffectType.ELEMENT_IMMUNE, { duration: -1 }));
        }
      };
      Passives["judgement_finalTrial"] = (ctx, trigger) => {
        if (trigger === "onDamageCalc") {
          return (info) => {
            return 0;
          };
        }
      };
      Passives["world_mirror"] = (ctx, trigger) => {
        if (trigger === "onTurnStart") {
          const leastSuit = ctx.player.getLeastUsedSuit();
          ctx.boss._mirrorElement = SUIT_TO_ELEMENT[leastSuit];
        }
      };
      function executeSkill(skillId, ctx) {
        const fn = Skills[skillId];
        if (!fn) return { desc: `\u672A\u77E5\u6280\u80FD: ${skillId}` };
        return fn(ctx);
      }
      function triggerPassive(passiveId, ctx, trigger) {
        const fn = Passives[passiveId];
        if (!fn) return null;
        return fn(ctx, trigger);
      }
      function hasSkill(skillId) {
        return !!Skills[skillId];
      }
      module.exports = { Skills, Passives, executeSkill, triggerPassive, hasSkill };
    }
  });

  // src/M07_BossController.js
  var require_M07_BossController = __commonJS({
    "src/M07_BossController.js"(exports, module) {
      var { getBossById } = require_M01_CardData();
      var { Alignment } = require_M03_SpiritNumber();
      var { executeSkill, triggerPassive } = require_M08_BossSkills();
      var BossRuntime = class {
        /**
         * @param {object} bossData  - M01 中的大阿尔卡纳数据
         * @param {string} alignment - 'upright' | 'reversed'
         * @param {object} opts      - { hpOverride, hpScale }
         */
        constructor(bossData, alignment, opts = {}) {
          this.data = bossData;
          this.id = bossData.id;
          this.key = bossData.key;
          this.name = bossData.name;
          this.element = bossData.element;
          this.baseElement = bossData.element;
          this.alignment = alignment;
          const baseHp = opts.hpOverride || bossData.balancedHp[alignment] || bossData.hp[alignment];
          this.maxHp = Math.floor(baseHp * (opts.hpScale || 1));
          this.hp = this.maxHp;
          this.skillId = bossData.skillId[alignment];
          this.passiveId = bossData.passiveId;
          this.actionSequence = [];
          this.actionIndex = 0;
          this._hasRevived = false;
          this._worldCycle = 0;
          this._worldHalf = false;
          this._dogmaActive = false;
          this._fogActive = false;
          this._reflectPercent = 0;
          this._stealElementBonus = false;
          this._playerAtkBuff = 0;
          this._atkBonus = 0;
          this._karmaBonus = 0;
          this._obsessionBonus = 0;
          this._tideBonus = 0;
          this._unyieldingActive = false;
          this._noCounterStreak = 0;
          this._mirrorElement = null;
          this._courtHalf = false;
        }
        /* ---------- 行动 ---------- */
        /**
         * 初始化行动序列
         * @param {RandomSystem} rng
         * @param {number} [length=20] 预生成长度
         */
        initActions(rng, length = 20) {
          this.actionSequence = rng.generateBossActions(length);
          this.actionIndex = 0;
        }
        /** 获取当前回合行动类型 */
        getNextAction() {
          if (this.actionIndex >= this.actionSequence.length) {
            return "attack";
          }
          return this.actionSequence[this.actionIndex++];
        }
        /* ---------- 普攻 ---------- */
        /** 基础攻击力（含各种Buff） */
        getAttackDamage() {
          let dmg = 3;
          dmg += this._atkBonus;
          dmg += this._karmaBonus;
          dmg += this._obsessionBonus;
          dmg += this._tideBonus;
          return Math.max(0, dmg);
        }
        /** 回合开始时重置一次性标记 */
        resetTurnFlags() {
          this._karmaBonus = 0;
          this._reflectPercent = 0;
          this._stealElementBonus = false;
          this._fogActive = false;
          this._playerAtkBuff = 0;
        }
        /* ---------- HP ---------- */
        takeDamage(amount) {
          this.hp = Math.max(0, this.hp - amount);
          return this.hp;
        }
        isDefeated() {
          return this.hp <= 0;
        }
        /** 翻转正逆位（国王效果） */
        flipAlignment() {
          this.alignment = this.alignment === Alignment.UPRIGHT ? Alignment.REVERSED : Alignment.UPRIGHT;
          this.skillId = this.data.skillId[this.alignment];
        }
        /* ---------- 序列化 ---------- */
        toJSON() {
          return {
            id: this.id,
            alignment: this.alignment,
            hp: this.hp,
            maxHp: this.maxHp,
            element: this.element,
            actionIndex: this.actionIndex,
            _hasRevived: this._hasRevived
          };
        }
      };
      var BossController = class {
        /**
         * 创建Boss运行时实例
         * @param {number} bossId      - 大阿尔卡纳编号 0-21
         * @param {string} alignment   - 'upright' | 'reversed'
         * @param {RandomSystem} rng
         * @param {object} [opts]      - { hpOverride, hpScale }
         */
        static create(bossId, alignment, rng, opts = {}) {
          const data = getBossById(bossId);
          if (!data) throw new Error(`Boss not found: ${bossId}`);
          if (bossId === 21 && opts.defeatedCount !== void 0) {
            opts.hpOverride = opts.hpOverride || 12 + opts.defeatedCount * 2;
          }
          const boss = new BossRuntime(data, alignment, opts);
          boss.initActions(rng);
          return boss;
        }
        /**
         * 随机决定Boss正逆位
         * @param {RandomSystem} rng
         * @returns {string}
         */
        static randomAlignment(rng) {
          return rng.chance(0.5) ? Alignment.UPRIGHT : Alignment.REVERSED;
        }
      };
      module.exports = { BossRuntime, BossController };
    }
  });

  // src/M10_CombatEngine.js
  var require_M10_CombatEngine = __commonJS({
    "src/M10_CombatEngine.js"(exports, module) {
      var DamageCalculator = require_M04_DamageCalculator();
      var { StatusEffectManager, EffectType, StatusEffect } = require_M05_StatusEffect();
      var { ElementSystem, SUIT_TO_ELEMENT } = require_M02_ElementSystem();
      var { SpiritNumber } = require_M03_SpiritNumber();
      var CourtCardLogic = require_M09_CourtCard();
      var { executeSkill, triggerPassive } = require_M08_BossSkills();
      var { CardType } = require_M01_CardData();
      var Phase = Object.freeze({
        INIT: "init",
        BOSS_ACTION: "boss_action",
        PLAYER_ACTION: "player_action",
        SETTLE: "settle",
        ENDED: "ended"
      });
      var BattleResult = Object.freeze({
        WIN: "win",
        LOSE: "lose",
        ONGOING: "ongoing"
      });
      var CombatEngine = class {
        /**
         * @param {object} deps - 依赖注入
         * @param {import('./M11_PlayerState')} deps.player
         * @param {import('./M07_BossController').BossRuntime} deps.boss
         * @param {import('./M06_DeckManager')} deps.deck
         * @param {import('./M15_RandomSystem')} deps.rng
         * @param {object} [deps.journey] - 旅途上下文 { defeatedBosses }
         * @param {object} [deps.config]  - 模式配置 { isStoryMode, drawPerTurn, healBetween }
         */
        constructor(deps) {
          this.player = deps.player;
          this.boss = deps.boss;
          this.deck = deps.deck;
          this.rng = deps.rng;
          this.journey = deps.journey || { defeatedBosses: [] };
          this.config = deps.config || {};
          this.status = new StatusEffectManager();
          this.turnNumber = 0;
          this.phase = Phase.INIT;
          this.result = BattleResult.ONGOING;
          this.lastPlayedElement = null;
          this.lastAttackCountered = false;
          this.lastAttackElement = null;
          this.lastDamageToB = 0;
          this._pendingChoice = null;
        }
        /* ==========================================================
           战斗主流程
           ========================================================== */
        /** 初始化战斗 */
        startBattle() {
          this.phase = Phase.INIT;
          this.turnNumber = 0;
          this.status.clear();
          this.deck.dealInitialHand(5);
          const passiveResult = this._triggerPassive("onBattleStart");
          if (this.config.isStoryMode) {
            this.status.clear();
          }
          this._nextTurn();
        }
        /** 进入下一回合 */
        _nextTurn() {
          this.turnNumber++;
          this.boss.resetTurnFlags();
          this._triggerPassive("onTurnStart");
          const fearDmg = this.status.getFearDamage();
          if (fearDmg > 0) {
            this.player.takeDamage(fearDmg);
            if (!this.player.isAlive()) return this._endBattle(BattleResult.LOSE);
          }
          const corrodeDmg = this.status.getCorrodeDamage();
          if (corrodeDmg > 0) {
            this.player.hp = Math.max(0, this.player.hp - corrodeDmg);
            if (!this.player.isAlive()) return this._endBattle(BattleResult.LOSE);
          }
          this.phase = Phase.BOSS_ACTION;
          this._executeBossAction();
        }
        /* ---------- Boss行动阶段 ---------- */
        _executeBossAction() {
          const action = this.boss.getNextAction();
          let result;
          if (action === "skill") {
            const ctx = this._buildSkillContext();
            result = executeSkill(this.boss.skillId, ctx);
          } else {
            const dmg = this.boss.getAttackDamage();
            this.player.takeDamage(dmg);
            result = { damage: dmg, desc: `\u666E\u901A\u653B\u51FB \u2014 ${dmg}\u70B9\u4F24\u5BB3` };
          }
          if (!this.player.isAlive()) return this._endBattle(BattleResult.LOSE);
          if (result && result.requireChoice) {
            this._pendingChoice = result;
          }
          this.phase = Phase.PLAYER_ACTION;
        }
        /* ---------- 玩家行动阶段 ---------- */
        /**
         * 提交玩家行动（由 UI 层调用）
         * @param {object} action
         * @param {string} action.numberCardId   - 打出的数字牌ID
         * @param {string} [action.courtCardId]  - 附加的宫廷牌ID（可选）
         * @param {object} [action.choiceData]   - 技能选择数据
         */
        submitPlayerAction(action) {
          if (this.phase !== Phase.PLAYER_ACTION) return;
          if (this._pendingChoice) {
            this._resolveChoice(action.choiceData);
            this._pendingChoice = null;
          }
          if (this.boss._fogActive) {
            const numberCards = this.deck.getNumberCards();
            if (numberCards.length > 0) {
              const randomCard = this.rng.pick(numberCards);
              action.numberCardId = randomCard.id;
              action.courtCardId = null;
            }
          }
          if (this.status.playerHas(EffectType.FORCE_MAX_CARD)) {
            const numberCards = this.deck.getNumberCards();
            if (numberCards.length > 0) {
              numberCards.sort((a, b) => b.pip - a.pip);
              action.numberCardId = numberCards[0].id;
            }
          }
          if (this.status.playerHas(EffectType.SACRIFICE)) {
            this.deck.discardRandom();
          }
          const card = this.deck.hand.find((c) => c.id === action.numberCardId);
          if (!card || card.type !== CardType.NUMBER) return;
          if (this.status.isSuitLocked(card.suit)) return;
          const oddEvenEffect = this.status.getPlayerEffect(EffectType.ODD_EVEN_LOCK);
          if (oddEvenEffect) {
            const isOdd = card.pip % 2 === 1;
            if (oddEvenEffect.group === "odd" && !isOdd) return;
            if (oddEvenEffect.group === "even" && isOdd) return;
          }
          if (this.boss._dogmaActive && this.lastPlayedElement) {
            const cardElem = SUIT_TO_ELEMENT[card.suit];
            if (cardElem !== this.lastPlayedElement) {
              this.phase = Phase.SETTLE;
              this._settleTurn();
              return;
            }
          }
          this.deck.playCard(action.numberCardId);
          let courtBuff = {};
          if (action.courtCardId && !this.status.playerHas(EffectType.COURT_SEAL)) {
            const courtCard = this.deck.hand.find((c) => c.id === action.courtCardId);
            if (courtCard && courtCard.type === CardType.COURT) {
              courtBuff = CourtCardLogic.resolve(courtCard, card, this.boss.alignment);
              if (this.boss._courtHalf) {
                courtBuff.damageMod = Math.floor((courtBuff.damageMod || 0) / 2);
                if (courtBuff.pipMod) courtBuff.pipMod = Math.floor(courtBuff.pipMod / 2);
              }
              if (courtBuff.flipAlignment) {
                const verdictResult = this._triggerPassive("onKingFlip");
                if (!verdictResult || !verdictResult.immune) {
                  this.boss.flipAlignment();
                }
              }
              this.deck.playCard(action.courtCardId);
            }
          }
          let attackElement = SUIT_TO_ELEMENT[card.suit];
          if (courtBuff.elementChanged && courtBuff.newElement) {
            attackElement = courtBuff.newElement;
          }
          let bossElement = this.boss.element;
          if (this.status.bossHas(EffectType.ELEMENT_HIDDEN)) {
            bossElement = "none";
          }
          const passiveModFn = this._getPassiveDamageMod();
          const breakdown = DamageCalculator.calculate({
            pip: card.pip,
            cardElement: attackElement,
            bossElement,
            bossAlignment: this.boss.alignment,
            courtBuff,
            playerState: this.player,
            statusMgr: this.status,
            bossPassive: passiveModFn
          });
          if (this.boss._playerAtkBuff) {
            breakdown.total += this.boss._playerAtkBuff;
          }
          let finalDamage = breakdown.total;
          const armor = this.status.getBossArmor();
          if (armor > 0) {
            const absorbed = Math.min(armor, finalDamage);
            this.status.reduceBossArmor(absorbed);
            finalDamage -= absorbed;
          }
          if (this.boss._unyieldingActive && armor > 0) {
            const extraArmor = Math.floor(armor * 0.5);
            finalDamage = Math.max(0, finalDamage - extraArmor);
          }
          this.boss.takeDamage(finalDamage);
          this.lastDamageToB = finalDamage;
          this.lastPlayedElement = attackElement;
          this.lastAttackElement = attackElement;
          this.lastAttackCountered = ElementSystem.isCounter(attackElement, bossElement);
          this.player.recordSuitUsage(card.suit);
          this._triggerPassive("onPlayerAttack");
          const counterDmg = this.status.getCounterDamage();
          if (counterDmg > 0) {
            let actualCounter = counterDmg;
            if (this.boss._unyieldingActive) actualCounter = Math.floor(counterDmg * 1.5);
            this.player.takeDamage(actualCounter);
          }
          if (this.boss._reflectPercent > 0) {
            const reflectDmg = Math.floor(finalDamage * this.boss._reflectPercent);
            if (reflectDmg > 0) this.player.takeDamage(reflectDmg);
          }
          this.phase = Phase.SETTLE;
          this._settleTurn();
        }
        /** 玩家跳过回合（手牌不足等情况） */
        skipPlayerTurn() {
          if (this.phase !== Phase.PLAYER_ACTION) return;
          this.phase = Phase.SETTLE;
          this._settleTurn();
        }
        /* ---------- 结算阶段 ---------- */
        _settleTurn() {
          if (this.boss.isDefeated()) {
            const reviveResult = this._triggerPassive("onBossDefeated");
            if (reviveResult && reviveResult.revived) {
            } else {
              this._triggerPassive("onBossDefeated");
              return this._endBattle(BattleResult.WIN);
            }
          }
          if (!this.player.isAlive()) {
            return this._endBattle(BattleResult.LOSE);
          }
          if (!this.status.playerHas(EffectType.DRAW_BAN)) {
            this.deck.draw(1);
          } else {
            const drawBan = this.status.getPlayerEffect(EffectType.DRAW_BAN);
            if (drawBan && drawBan.value < 99) {
              const drawCount = Math.max(0, 1 - drawBan.value);
              if (drawCount > 0) this.deck.draw(drawCount);
            }
          }
          this.status.tickAll();
          this._nextTurn();
        }
        /* ---------- 战斗结束 ---------- */
        _endBattle(result) {
          this.result = result;
          this.phase = Phase.ENDED;
          return result;
        }
        /* ---------- 辅助 ---------- */
        /** 构建技能执行上下文 */
        _buildSkillContext() {
          return {
            player: this.player,
            boss: this.boss,
            deck: this.deck,
            status: this.status,
            rng: this.rng,
            turnNumber: this.turnNumber,
            journey: this.journey,
            lastPlayedElement: this.lastPlayedElement,
            lastAttackCountered: this.lastAttackCountered,
            lastAttackElement: this.lastAttackElement,
            emit: (event, data) => {
            }
          };
        }
        /** 触发Boss被动 */
        _triggerPassive(trigger) {
          if (!this.boss.passiveId) return null;
          if (this.config.isStoryMode) return null;
          const ctx = this._buildSkillContext();
          return triggerPassive(this.boss.passiveId, ctx, trigger);
        }
        /** 获取被动的伤害修正函数（传给 DamageCalculator） */
        _getPassiveDamageMod() {
          if (!this.boss.passiveId || this.config.isStoryMode) return null;
          const ctx = this._buildSkillContext();
          const result = triggerPassive(this.boss.passiveId, ctx, "onDamageCalc");
          return typeof result === "function" ? result : null;
        }
        /** 处理技能待决选择 */
        _resolveChoice(choiceData) {
          if (!choiceData || !this._pendingChoice) return;
          if (this._pendingChoice.revealed) {
            const { keepCardId, removeCardId } = choiceData;
            const revealed = this._pendingChoice.revealed;
            for (const card of revealed) {
              if (card.id === keepCardId) {
                this.deck.addToHand(card);
              } else {
                this.deck.removedCards.push(card);
              }
            }
          }
          if (this._pendingChoice.choiceType === "tempt") {
            if (choiceData.accept) {
              this.player.takeDamage(5);
              this.deck.draw(3);
              this.player.acceptedTempt = true;
            }
          }
        }
        /* ---------- 查询 ---------- */
        getPhase() {
          return this.phase;
        }
        getResult() {
          return this.result;
        }
        getTurnNumber() {
          return this.turnNumber;
        }
      };
      module.exports = { CombatEngine, Phase, BattleResult };
    }
  });

  // src/M12_BlessingSystem.js
  var require_M12_BlessingSystem = __commonJS({
    "src/M12_BlessingSystem.js"(exports, module) {
      var BlessingSystem = class {
        /**
         * 生成三个祝福选项
         * @param {import('./M11_PlayerState')} player
         * @returns {object[]} 选项数组
         */
        static getOptions(player) {
          const options = [
            {
              id: "star",
              name: "\u661F\u4E4B\u795D\u798F",
              desc: "\u6240\u6709\u653B\u51FB\u6C38\u4E45+1\u4F24\u5BB3",
              icon: "star",
              // 【Cocos适配】对应 resources/ui/blessing_star.png
              disabled: player.starBlessing,
              // 整个旅途只能选一次
              disabledReason: "\u5DF2\u83B7\u5F97"
            },
            {
              id: "moon",
              name: "\u6708\u4E4B\u795D\u798F",
              desc: "\u83B7\u5F976\u70B9\u62A4\u76FE\uFF08\u53EF\u53E0\u52A0\uFF09",
              icon: "moon",
              disabled: false
            },
            {
              id: "sun",
              name: "\u65E5\u4E4B\u795D\u798F",
              desc: "\u7ACB\u5373\u56DE\u590D10HP",
              icon: "sun",
              disabled: false
            }
          ];
          return options;
        }
        /**
         * 应用祝福效果
         * @param {string} blessingId - 'star' | 'moon' | 'sun'
         * @param {import('./M11_PlayerState')} player
         * @returns {object} 效果描述
         */
        static apply(blessingId, player) {
          switch (blessingId) {
            case "star":
              if (player.starBlessing) return { success: false, reason: "\u5DF2\u62E5\u6709\u661F\u4E4B\u795D\u798F" };
              player.activateStarBlessing();
              return { success: true, desc: "\u6240\u6709\u653B\u51FB\u6C38\u4E45+1\u4F24\u5BB3" };
            case "moon":
              player.addShield(6);
              return { success: true, desc: `\u62A4\u76FE+6\uFF08\u5F53\u524D${player.shield}\uFF09` };
            case "sun":
              const healed = player.heal(10);
              return { success: true, desc: `\u56DE\u590D${healed}HP\uFF08${player.hp}/${player.maxHp}\uFF09` };
            default:
              return { success: false, reason: "\u672A\u77E5\u795D\u798F" };
          }
        }
      };
      module.exports = BlessingSystem;
    }
  });

  // src/M13_GameModeManager.js
  var require_M13_GameModeManager = __commonJS({
    "src/M13_GameModeManager.js"(exports, module) {
      var { getRandomBossPool, getBossById } = require_M01_CardData();
      var { BossController } = require_M07_BossController();
      var { Alignment } = require_M03_SpiritNumber();
      var GameMode = Object.freeze({
        STORY: "story",
        SHORT: "short",
        ENDLESS: "endless"
      });
      var GameModeManager = class {
        /**
         * @param {import('./M15_RandomSystem')} rng
         */
        constructor(rng) {
          this.rng = rng;
          this.unlockedModes = /* @__PURE__ */ new Set([GameMode.STORY]);
          this.storyProgress = 0;
          this.storyClearedBosses = /* @__PURE__ */ new Set();
          this.currentMode = null;
          this.currentRun = null;
        }
        /* ========== 解锁链 ========== */
        /** 检查并更新解锁状态 */
        checkUnlocks() {
          if (this.storyProgress >= 10 && !this.unlockedModes.has(GameMode.SHORT)) {
            this.unlockedModes.add(GameMode.SHORT);
          }
          if (this.storyProgress >= 40 && !this.unlockedModes.has(GameMode.ENDLESS)) {
            this.unlockedModes.add(GameMode.ENDLESS);
          }
        }
        isUnlocked(mode) {
          return this.unlockedModes.has(mode);
        }
        /* ========== 剧情模式 ========== */
        /**
         * 开始剧情模式关卡
         * @param {number} bossId     - Boss编号 1-20
         * @param {string} alignment  - 'upright' | 'reversed'
         * @returns {object} 战斗配置
         */
        startStoryBattle(bossId, alignment) {
          this.currentMode = GameMode.STORY;
          const boss = BossController.create(bossId, alignment, this.rng, {
            // 剧情模式用更高HP（设计文档: 20+，6-8回合）
            // 使用 balancedHp 作为基础，额外放大
            hpScale: 1
          });
          return {
            mode: GameMode.STORY,
            boss,
            config: {
              isStoryMode: true,
              // Boss被动不生效
              fullHealBetween: true,
              // 每关满血开局
              drawPerTurn: 1
            }
          };
        }
        /** 记录剧情模式通关 */
        recordStoryWin(bossId, alignment) {
          this.storyProgress++;
          const key = `${bossId}_${alignment}`;
          this.storyClearedBosses.add(key);
          this.checkUnlocks();
        }
        /* ========== 短旅途模式 ========== */
        /**
         * 生成短旅途: 愚人 + 5随机Boss + 世界 = 7关
         * @returns {object} 旅途配置
         */
        startShortJourney() {
          this.currentMode = GameMode.SHORT;
          const clearedIds = /* @__PURE__ */ new Set();
          for (const key of this.storyClearedBosses) {
            clearedIds.add(parseInt(key.split("_")[0]));
          }
          const pool = getRandomBossPool().filter((b) => clearedIds.has(b.id));
          const selected = this.rng.pickN(pool, Math.min(5, pool.length));
          const stages = [
            { bossId: 0, alignment: this.rng.chance(0.5) ? Alignment.UPRIGHT : Alignment.REVERSED },
            ...selected.map((b) => ({
              bossId: b.id,
              alignment: BossController.randomAlignment(this.rng)
            })),
            { bossId: 21, alignment: BossController.randomAlignment(this.rng) }
          ];
          this.currentRun = {
            stages,
            currentStage: 0,
            defeatedBosses: []
          };
          return {
            mode: GameMode.SHORT,
            stages,
            config: {
              isStoryMode: false,
              healBetweenPercent: 0.7,
              // 场间恢复70%
              drawPerTurn: 1
            }
          };
        }
        /**
         * 获取短旅途当前关的Boss实例
         */
        getShortJourneyBoss() {
          const run = this.currentRun;
          if (!run) return null;
          const stage = run.stages[run.currentStage];
          if (!stage) return null;
          let hpScale = 1;
          if (run.currentStage === 1) hpScale = 0.9;
          else if (run.currentStage >= 3) hpScale = 1.1;
          const opts = { hpScale };
          if (stage.bossId === 21) {
            opts.defeatedCount = run.defeatedBosses.length;
          }
          return BossController.create(stage.bossId, stage.alignment, this.rng, opts);
        }
        /** 短旅途推进到下一关 */
        advanceShortJourney(defeatedBossInfo) {
          const run = this.currentRun;
          if (!run) return false;
          run.defeatedBosses.push(defeatedBossInfo);
          run.currentStage++;
          return run.currentStage < run.stages.length;
        }
        /* ========== 无尽模式 ========== */
        /**
         * 开始无尽模式
         * @returns {object}
         */
        startEndlessMode() {
          this.currentMode = GameMode.ENDLESS;
          this.currentRun = {
            cycle: 0,
            // 当前轮回数
            stageInCycle: 0,
            // 轮回内关卡（0-9）
            totalStage: 0,
            // 总关卡数
            defeatedBosses: [],
            recentBossIds: []
            // 最近5关的BossId（防重复）
          };
          return { mode: GameMode.ENDLESS };
        }
        /**
         * 获取无尽模式当前Boss
         * 结构: 每10关 = 愚人(第1关) + 8随机 + 世界(第10关)
         */
        getEndlessBoss() {
          const run = this.currentRun;
          if (!run) return null;
          const pos = run.stageInCycle;
          let bossId, alignment;
          if (pos === 0) {
            bossId = 0;
            alignment = BossController.randomAlignment(this.rng);
          } else if (pos === 9) {
            bossId = 21;
            alignment = BossController.randomAlignment(this.rng);
          } else {
            const pool = getRandomBossPool().filter(
              (b) => !run.recentBossIds.includes(b.id)
            );
            const picked = this.rng.pick(pool.length > 0 ? pool : getRandomBossPool());
            bossId = picked.id;
            alignment = BossController.randomAlignment(this.rng);
          }
          const hpScale = 1 + 0.4 * run.cycle;
          const opts = { hpScale };
          if (bossId === 21) opts.defeatedCount = run.defeatedBosses.length;
          return BossController.create(bossId, alignment, this.rng, opts);
        }
        /** 无尽模式推进 */
        advanceEndless(defeatedBossInfo) {
          const run = this.currentRun;
          if (!run) return;
          run.defeatedBosses.push(defeatedBossInfo);
          run.recentBossIds.push(defeatedBossInfo.id);
          if (run.recentBossIds.length > 5) run.recentBossIds.shift();
          run.stageInCycle++;
          run.totalStage++;
          if (run.stageInCycle >= 10) {
            run.stageInCycle = 0;
            run.cycle++;
          }
        }
        /**
         * 检查是否到达里程碑（每5关）
         * @returns {boolean}
         */
        isEndlessMilestone() {
          const run = this.currentRun;
          return run && run.totalStage > 0 && run.totalStage % 5 === 0;
        }
        /**
         * 获取里程碑选项
         * @returns {object[]}
         */
        getMilestoneOptions() {
          return [
            { id: "hp", name: "+4 \u6700\u5927HP", desc: "\u6C38\u4E45\u589E\u52A04\u70B9\u6700\u5927\u751F\u547D\u503C" },
            { id: "counter", name: "\u514B\u5236+2", desc: "\u5143\u7D20\u514B\u5236\u989D\u5916+2\u4F24\u5BB3" },
            { id: "damage", name: "\u57FA\u7840\u4F24\u5BB3+1", desc: "\u6240\u6709\u653B\u51FB\u57FA\u7840\u4F24\u5BB3+1" }
          ];
        }
        /* ========== 情报系统 ========== */
        /**
         * 预览下一关Boss（元素已知，正逆位未知）
         */
        peekNextBoss() {
          if (this.currentMode === GameMode.SHORT && this.currentRun) {
            const nextStage = this.currentRun.stages[this.currentRun.currentStage];
            if (nextStage) {
              const data = getBossById(nextStage.bossId);
              return { name: data.name, element: data.element, id: data.id };
            }
          }
          return null;
        }
        /* ========== 序列化 ========== */
        toJSON() {
          return {
            unlockedModes: [...this.unlockedModes],
            storyProgress: this.storyProgress,
            storyClearedBosses: [...this.storyClearedBosses],
            currentMode: this.currentMode,
            currentRun: this.currentRun
          };
        }
        fromJSON(data) {
          this.unlockedModes = new Set(data.unlockedModes);
          this.storyProgress = data.storyProgress;
          this.storyClearedBosses = new Set(data.storyClearedBosses);
          this.currentMode = data.currentMode;
          this.currentRun = data.currentRun;
        }
      };
      module.exports = { GameMode, GameModeManager };
    }
  });

  // src/M14_SaveSystem.js
  var require_M14_SaveSystem = __commonJS({
    "src/M14_SaveSystem.js"(exports, module) {
      var SAVE_KEY = "fools_journey_save";
      var SAVE_VERSION = 1;
      var SaveSystem = class {
        constructor() {
          this._data = null;
        }
        /**
         * 创建完整存档快照
         * @param {import('./M11_PlayerState')} player
         * @param {import('./M13_GameModeManager').GameModeManager} modeMgr
         * @returns {object} 可序列化的存档对象
         */
        createSnapshot(player, modeMgr) {
          return {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            player: player.toJSON(),
            mode: modeMgr.toJSON()
          };
        }
        /**
         * 保存到存储
         * @param {object} snapshot
         */
        save(snapshot) {
          this._data = snapshot;
          const json = JSON.stringify(snapshot);
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(SAVE_KEY, json);
          }
        }
        /**
         * 读取存档
         * @returns {object|null}
         */
        load() {
          let json = null;
          if (typeof localStorage !== "undefined") {
            json = localStorage.getItem(SAVE_KEY);
          }
          if (!json) return null;
          try {
            const data = JSON.parse(json);
            if (data.version !== SAVE_VERSION) {
              return this._migrate(data);
            }
            this._data = data;
            return data;
          } catch (e) {
            console.error("\u5B58\u6863\u8BFB\u53D6\u5931\u8D25:", e);
            return null;
          }
        }
        /**
         * 从存档恢复状态
         * @param {import('./M11_PlayerState')} player
         * @param {import('./M13_GameModeManager').GameModeManager} modeMgr
         */
        restore(player, modeMgr) {
          const data = this.load();
          if (!data) return false;
          player.fromJSON(data.player);
          modeMgr.fromJSON(data.mode);
          return true;
        }
        /** 删除存档 */
        clear() {
          this._data = null;
          if (typeof localStorage !== "undefined") {
            localStorage.removeItem(SAVE_KEY);
          }
        }
        /** 是否有存档 */
        hasSave() {
          if (typeof localStorage !== "undefined") {
            return localStorage.getItem(SAVE_KEY) !== null;
          }
          return this._data !== null;
        }
        /** 版本迁移（未来扩展用） */
        _migrate(data) {
          data.version = SAVE_VERSION;
          return data;
        }
      };
      module.exports = SaveSystem;
    }
  });

  // src/index.js
  var require_index = __commonJS({
    "src/index.js"(exports, module) {
      module.exports = {
        // --- 数据层 ---
        RandomSystem: require_M15_RandomSystem(),
        ElementSystem: require_M02_ElementSystem(),
        SpiritNumber: require_M03_SpiritNumber(),
        CardData: require_M01_CardData(),
        // --- 核心系统 ---
        DamageCalculator: require_M04_DamageCalculator(),
        StatusEffect: require_M05_StatusEffect(),
        DeckManager: require_M06_DeckManager(),
        CourtCardLogic: require_M09_CourtCard(),
        PlayerState: require_M11_PlayerState(),
        // --- 战斗系统 ---
        BossSkills: require_M08_BossSkills(),
        BossController: require_M07_BossController(),
        CombatEngine: require_M10_CombatEngine(),
        // --- 模式与存档 ---
        BlessingSystem: require_M12_BlessingSystem(),
        GameModeManager: require_M13_GameModeManager(),
        SaveSystem: require_M14_SaveSystem()
      };
    }
  });
  return require_index();
})();
