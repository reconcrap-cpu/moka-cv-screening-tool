# 测试数据准备指南

## 概述

本文档说明如何准备实际环境测试所需的数据。所有测试均在实际环境中执行，需要真实的候选人信息和简历文件。

## 数据要求

### 1. 候选人基本信息 (至少10条)

需要提供以下信息：

| 字段 | 说明 | 是否必填 | 示例 |
|------|------|---------|------|
| name | 候选人姓名 | ✅ 必填 | 张三 |
| school | 学校名称 | ✅ 必填 | 清华大学 |
| major | 专业名称 | ✅ 必填 | 计算机科学与技术 |
| education | 学历 | ✅ 必填 | 本科/硕士/博士/大专/高中 |
| graduationYear | 毕业年份 | ✅ 必填 | 2024 |
| phone | 手机号 | ⭕ 可选 | 13800138000 |
| email | 邮箱 | ⭕ 可选 | zhangsan@example.com |
| detailUrl | 详情页URL | ⭕ 可选 | https://moka.hiring.com/candidate/12345 |
| resumeFormat | 简历格式 | ⭕ 可选 | img-blob/img-page/iframe-svg/iframe-html/other |

### 2. 候选人详情页URL (至少10个)

- 需要包含不同简历格式的详情页
- URL需要是Moka招聘系统的真实页面
- 用于测试简历捕获功能

### 3. 简历文件 (至少5份)

- **格式要求**: PDF、Word、图片格式
- **内容要求**: 包含完整的教育背景和工作经历
- **存放位置**: `tests/resumes/` 目录下

## 数据填写方式

### 方式1: JSON格式

编辑 `tests/test_data_template.json` 文件，填写候选人信息：

```json
{
  "testData": {
    "candidates": [
      {
        "id": "candidate_001",
        "name": "张三",
        "school": "清华大学",
        "major": "计算机科学与技术",
        "education": "本科",
        "graduationYear": "2024",
        "phone": "13800138000",
        "email": "zhangsan@example.com",
        "detailUrl": "https://moka.hiring.com/candidate/12345",
        "resumeFormat": "img-blob"
      }
    ]
  }
}
```

### 方式2: CSV格式

创建 `tests/test_data.csv` 文件：

```csv
姓名,学校,专业,学历,毕业年份,手机号,邮箱,详情页URL,简历格式
张三,清华大学,计算机科学与技术,本科,2024,13800138000,zhangsan@example.com,https://moka.hiring.com/candidate/12345,img-blob
李四,北京大学,软件工程,硕士,2025,13900139000,lisi@example.com,https://moka.hiring.com/candidate/67890,iframe-svg
```

## 简历格式说明

| 格式 | 说明 | 选择器 |
|------|------|--------|
| img-blob | Blob URL格式简历 | `.img-blob` |
| img-page | 普通图片格式简历 | `.img-page` |
| iframe-svg | iframe中的SVG格式简历 | `#iframeResume` |
| iframe-html | iframe中的HTML格式简历 | `#iframeResume` |
| other | 其他格式 | - |

## 测试场景

需要准备至少5个测试场景，包含筛选标准：

```json
{
  "testScenarios": [
    {
      "id": "scenario_001",
      "name": "基本筛选流程",
      "targetCount": 10,
      "screeningCriteria": "计算机相关专业，本科及以上学历",
      "fullScreeningCriteria": "计算机相关专业，本科及以上学历，有实习经验优先"
    }
  ]
}
```

## 数据验证

提交数据前，请确保：

- [ ] 候选人基本信息 ≥ 10条
- [ ] 候选人详情页URL ≥ 10个
- [ ] 不同格式简历 ≥ 5份
- [ ] 数据格式正确（JSON或CSV）
- [ ] 所有必填字段已填写
- [ ] 简历文件已放入 `tests/resumes/` 目录

## 隐私保护

**重要提示**：
- 测试数据仅用于功能验证，不会用于其他用途
- 建议使用脱敏后的数据（如隐藏部分手机号、邮箱）
- 简历文件可删除敏感个人信息
- 测试完成后可删除所有测试数据

## 下一步

完成数据准备后，请通知开发团队，我们将开始执行实际环境测试。
