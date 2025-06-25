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

    // 读取对应的MDX文件
    const filePath = path.join(process.cwd(), "app", "(legal)", type, "page.mdx");
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(filePath, "utf-8");
    
    // 简单的MDX到HTML转换（去除MDX语法，保留基本格式）
    let htmlContent = content
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/^\* (.+)$/gm, "<li>$1</li>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n\n/g, "</p><p>")
      .replace(/^(?!<[h|u|l])/gm, "<p>")
      .replace(/$(?![h|u|l|p])/gm, "</p>");
    
    // 处理列表项
    htmlContent = htmlContent.replace(/(<li>.*<\/li>)/g, (match) => {
      return "<ul>" + match + "</ul>";
    });
    
    // 清理多余的标签
    htmlContent = htmlContent
      .replace(/<p><\/p>/g, "")
      .replace(/<p>(<[h|u])/g, "$1")
      .replace(/(<\/[h|u|l]>)<\/p>/g, "$1");

    return NextResponse.json({ content: htmlContent });
  } catch (error) {
    console.error("Error reading legal document:", error);
    return NextResponse.json(
      { error: "Failed to load document" },
      { status: 500 }
    );
  }
} 