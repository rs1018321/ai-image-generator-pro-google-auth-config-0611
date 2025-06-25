/**
 * 检测文本是否主要为英语
 * @param text 待检测的文本
 * @returns boolean 如果主要是英语返回 true，否则返回 false
 */
export function isEnglishText(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return true; // 空文本默认为英语
  }

  const trimmedText = text.trim();
  
  // 英语字符的正则表达式（包括字母、数字、标点符号、空格）
  const englishCharRegex = /[a-zA-Z0-9\s.,!?'"()\-:;]/;
  
  // 中文字符的正则表达式
  const chineseCharRegex = /[\u4e00-\u9fff]/;
  
  // 其他常见非英语字符（日语、韩语、阿拉伯语、俄语等）
  const otherNonEnglishRegex = /[\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u0600-\u06ff\u0400-\u04ff]/;
  
  let englishCharCount = 0;
  let nonEnglishCharCount = 0;
  let totalSignificantChars = 0;
  
  for (const char of trimmedText) {
    // 跳过空格和标点符号进行字符计数
    if (/\s/.test(char)) continue;
    
    totalSignificantChars++;
    
    if (englishCharRegex.test(char)) {
      // 如果是中文或其他非英语字符，不算作英语
      if (chineseCharRegex.test(char) || otherNonEnglishRegex.test(char)) {
        nonEnglishCharCount++;
      } else {
        englishCharCount++;
      }
    } else {
      nonEnglishCharCount++;
    }
  }
  
  // 如果总字符数太少，通过一些简单规则判断
  if (totalSignificantChars < 5) {
    // 检查是否包含明显的非英语字符
    return !chineseCharRegex.test(trimmedText) && !otherNonEnglishRegex.test(trimmedText);
  }
  
  // 如果英语字符占比超过80%，认为是英语
  const englishRatio = englishCharCount / totalSignificantChars;
  
  console.log(`🔍 语言检测结果: 总字符数=${totalSignificantChars}, 英语字符=${englishCharCount}, 非英语字符=${nonEnglishCharCount}, 英语比例=${englishRatio.toFixed(2)}`);
  
  return englishRatio >= 0.8;
}

/**
 * 获取推荐的模型基于文本语言
 * @param text 用户输入的文本
 * @returns 推荐的模型名称
 */
export function getRecommendedModel(text: string): 'flux' | 'minimax' {
  const isEnglish = isEnglishText(text);
  console.log(`📊 文本语言检测: "${text}" -> ${isEnglish ? '英语' : '非英语'} -> 推荐模型: ${isEnglish ? 'Flux' : 'MiniMax'}`);
  return isEnglish ? 'flux' : 'minimax';
} 