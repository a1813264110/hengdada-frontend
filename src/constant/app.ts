/**
 * 应用类型枚举
 */
export const APP_TYPE_ENUM = {
  SCORING: 0, // 得分类
  EVALUATION: 1, // 测评类
};

/**
 * 应用类型映射
 */
export const APP_TYPE_MAP = {
  [APP_TYPE_ENUM.SCORING]: "得分类",
  [APP_TYPE_ENUM.EVALUATION]: "测评类",
};

/**
 * 评分策略枚举
 */
export const APP_SCORING_STRATEGY_ENUM = {
  CUSTOM: 0, // 自定义
  AI: 1, // AI
};

/**
 * 评分策略映射
 */
export const APP_SCORING_STRATEGY_MAP = {
  [APP_SCORING_STRATEGY_ENUM.CUSTOM]: "自定义",
  [APP_SCORING_STRATEGY_ENUM.AI]: "AI",
};

/**
 * 审核状态枚举
 */
export const REVIEW_STATUS_ENUM = {
  PENDING: 0, // 待审核
  PASS: 1, // 通过
  REJECT: 2, // 拒绝
};

/**
 * 审核状态映射
 */
export const REVIEW_STATUS_MAP = {
  [REVIEW_STATUS_ENUM.PENDING]: "待审核",
  [REVIEW_STATUS_ENUM.PASS]: "已通过",
  [REVIEW_STATUS_ENUM.REJECT]: "已拒绝",
};
