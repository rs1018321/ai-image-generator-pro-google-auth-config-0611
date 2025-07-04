import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    
    // 验证类型
    if (!["privacy-policy", "terms-of-service"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    // 构建MDX文件相对于项目根目录的路径
    const filePath = path.join(process.cwd(), 'content', 'legal', `${type}.mdx`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const fileContents = fs.readFileSync(filePath, "utf-8");
    
    // 改进的MDX到HTML转换
    let htmlContent = fileContents
      // 处理标题 - 添加适当的CSS类来控制间距
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-6 mt-8">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mb-4 mt-8">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-medium mb-3 mt-6">$1</h3>')
      // 处理粗体和斜体
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // 处理链接
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
      // 处理列表项（保持原始的 - 格式）
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      // 处理表格（基本支持）
      .replace(/^\| (.+) \|$/gm, (match) => {
        const cells = match.split('|').filter(cell => cell.trim()).map(cell => cell.trim());
        return '<tr>' + cells.map(cell => `<td class="border border-gray-300 px-4 py-2">${cell}</td>`).join('') + '</tr>';
      })
      // 处理段落 - 改进逻辑
      .split('\n\n')
      .map(block => {
        block = block.trim();
        if (!block) return '';
        
        // 如果已经是HTML标签，直接返回
        if (block.startsWith('<h') || block.startsWith('<ul') || block.startsWith('<table')) {
          return block;
        }
        
        // 如果包含列表项，包装为ul并添加样式
        if (block.includes('<li>')) {
          return '<ul class="list-disc list-inside mb-4 pl-4">' + block + '</ul>';
        }
        
        // 如果包含表格行，包装为table并添加样式
        if (block.includes('<tr>')) {
          return '<table class="w-full border-collapse border border-gray-300 mb-4">' + block + '</table>';
        }
        
        // 其他内容包装为段落并添加底部间距
        return '<p class="mb-4 leading-relaxed">' + block + '</p>';
      })
      .join('\n');

    return NextResponse.json({ content: htmlContent });
  } catch (error) {
    console.error("Error reading legal document:", error);
    return NextResponse.json(
      { error: "Failed to load document" },
      { status: 500 }
    );
  }
} 



