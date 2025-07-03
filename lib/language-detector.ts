/**
 * 检测文本是否主要为英语
 * @param text 待检测的文本
 * @returns boolean 始终返回 true，因为项目只支持英语
 */
export function isEnglishText(text: string): boolean {
  return true; // 项目只支持英语
}

/**
 * 获取推荐的模型基于文本语言
 * @param text 用户输入的文本
 * @returns 推荐的模型名称，始终返回 flux 因为只支持英语
 */
export function getRecommendedModel(text: string): 'flux' | 'minimax' {
  console.log(`📊 文本语言检测: "${text}" -> 英语 -> 推荐模型: Flux`);
  return 'flux';
} 