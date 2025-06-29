#!/bin/bash

# 检查是否存在部署标记文件
if [ -f "DEPLOY_FLAG" ]; then
    echo "✅ 找到部署标记，允许部署"
    exit 1  # 退出码1表示应该构建
else
    echo "🚫 未找到部署标记，跳过部署"
    exit 0  # 退出码0表示跳过构建
fi 