<template>
  <div id="adminQuestionPage">
    <a-form
      style="marginbottom: '20px'"
      label-align="left"
      auto-label-width
      :model="formSearchParams"
      layout="inline"
      @submit="doSearch"
    >
      <a-form-item field="title" label="题目标题">
        <a-input
          v-model="formSearchParams.title"
          placeholder="请输入题目标题"
        />
      </a-form-item>
      <a-form-item field="content" label="题目内容">
        <a-input
          v-model="formSearchParams.content"
          placeholder="请输入题目内容"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100px">
          搜索
        </a-button>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="showAddModal"> 新增题目 </a-button>
      </a-form-item>
    </a-form>

    <a-table
      :columns="columns"
      :data="dataList"
      :pagination="{
        showTotal: true,
        pageSize: searchParams.pageSize,
        current: searchParams.current,
        total,
      }"
      @page-change="onPageChange"
    >
      <template #optional="{ record }">
        <a-space>
          <a-button type="primary" @click="showEditModal(record)"
            >编辑</a-button
          >
          <a-button status="danger" @click="doDelete(record)">删除</a-button>
        </a-space>
      </template>

      <template #detail="{ record }">
        <a-button type="text" @click="showDetailModal(record)">
          查看详情
        </a-button>
      </template>
    </a-table>

    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="closeModal"
      :width="800"
      :ok-button-props="{ disabled: formSubmitting }"
    >
      <div style="max-height: 600px; overflow-y: auto">
        <a-form
          ref="questionFormRef"
          :model="questionForm"
          layout="vertical"
          @submit="handleSubmit"
          :rules="formRules"
        >
          <a-form-item field="title" label="题目集标题">
            <a-input
              v-model="questionForm.title"
              placeholder="请输入题目集标题"
            />
          </a-form-item>

          <!-- 题目列表 -->
          <a-collapse :default-active-key="[0]">
            <a-collapse-item
              v-for="(question, qIndex) in questions"
              :key="qIndex"
              :header="`题目 ${qIndex + 1}${
                question.title ? ': ' + question.title : ''
              }`"
            >
              <div style="position: relative; padding-right: 40px">
                <a-button
                  status="danger"
                  size="mini"
                  shape="circle"
                  @click="removeQuestion(qIndex)"
                  v-if="questions.length > 1"
                  style="position: absolute; right: 0; top: 0"
                >
                  <icon-delete />
                </a-button>

                <a-form-item
                  :field="`questions[${qIndex}].title`"
                  label="题目标题"
                  :validate-trigger="['change', 'blur']"
                  :rules="[{ required: true, message: '请输入题目标题' }]"
                >
                  <a-input
                    v-model="question.title"
                    placeholder="请输入题目标题"
                  />
                </a-form-item>

                <!-- 选项列表 -->
                <div style="margin-left: 20px">
                  <a-divider orientation="left">选项列表</a-divider>

                  <a-row
                    v-for="(option, oIndex) in question.options"
                    :key="`${qIndex}-${oIndex}`"
                    :gutter="16"
                    style="margin-bottom: 16px; position: relative"
                  >
                    <a-col :span="4">
                      <a-form-item
                        :field="`questions[${qIndex}].options[${oIndex}].key`"
                        label="选项 key"
                        :validate-trigger="['change', 'blur']"
                        :rules="[{ required: true, message: '请输入选项key' }]"
                      >
                        <a-input v-model="option.key" placeholder="如: A" />
                      </a-form-item>
                    </a-col>

                    <a-col :span="14">
                      <a-form-item
                        :field="`questions[${qIndex}].options[${oIndex}].value`"
                        label="选项值"
                        :validate-trigger="['change', 'blur']"
                        :rules="[{ required: true, message: '请输入选项内容' }]"
                      >
                        <a-input
                          v-model="option.value"
                          placeholder="请输入选项内容"
                        />
                      </a-form-item>
                    </a-col>

                    <a-col :span="4">
                      <a-form-item
                        :field="`questions[${qIndex}].options[${oIndex}].score`"
                        label="选项得分"
                      >
                        <a-radio-group v-model="option.score" type="button">
                          <a-radio :value="1">正确</a-radio>
                          <a-radio :value="0">错误</a-radio>
                        </a-radio-group>
                      </a-form-item>
                    </a-col>

                    <a-col
                      :span="2"
                      style="
                        display: flex;
                        align-items: center;
                        padding-top: 30px;
                      "
                    >
                      <a-button
                        status="danger"
                        shape="circle"
                        size="mini"
                        @click="removeOption(qIndex, oIndex)"
                        v-if="question.options.length > 1"
                      >
                        <icon-delete />
                      </a-button>
                    </a-col>
                  </a-row>

                  <div
                    style="
                      margin-top: 16px;
                      display: flex;
                      justify-content: center;
                    "
                  >
                    <a-button type="dashed" @click="addOption(qIndex)">
                      <template #icon><icon-plus /></template>
                      添加选项
                    </a-button>
                  </div>
                </div>
              </div>
            </a-collapse-item>
          </a-collapse>

          <div style="margin-top: 16px; display: flex; justify-content: center">
            <a-button type="primary" @click="addQuestion">
              <template #icon><icon-plus /></template>
              添加题目
            </a-button>
          </div>

          <a-form-item field="tags" label="题目标签" style="margin-top: 16px">
            <a-select
              v-model="questionForm.tags"
              placeholder="请选择或输入题目标签"
              allow-create
              allow-search
              multiple
            >
              <a-option v-for="tag in commonTags" :key="tag" :value="tag">{{
                tag
              }}</a-option>
            </a-select>
          </a-form-item>
        </a-form>
      </div>

      <template #footer>
        <a-space>
          <a-button @click="closeModal">取消</a-button>
          <a-button
            type="primary"
            :loading="formSubmitting"
            @click="handleSubmit"
          >
            {{ isEdit.value ? "保存修改" : "创建题目" }}
          </a-button>
        </a-space>
      </template>
    </a-modal>

    <a-modal
      v-model:visible="detailModalVisible"
      title="题目详情"
      :footer="false"
      :width="800"
    >
      <div v-if="currentQuestions.length > 0">
        <a-tabs>
          <a-tab-pane
            v-for="(question, index) in currentQuestions"
            :key="index"
            :title="`题目 ${index + 1}`"
          >
            <h3>{{ question.title }}</h3>
            <a-divider />
            <div
              v-for="(option, optIndex) in question.options"
              :key="optIndex"
              style="margin-bottom: 10px"
            >
              <div
                :style="{
                  color: option.score === 1 ? 'red' : 'inherit',
                  fontWeight: option.score === 1 ? 'bold' : 'normal',
                }"
              >
                <span style="margin-right: 8px">{{ option.key }}:</span>
                {{ option.value }}
                <span v-if="option.score === 1" style="color: red"
                  >(正确答案)</span
                >
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
      <div v-else>
        <a-empty description="无题目数据或解析失败" />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, computed, reactive, nextTick } from "vue";
import { IconDelete, IconPlus } from "@arco-design/web-vue/es/icon";
import API from "@/api";
import message from "@arco-design/web-vue/es/message";
import {
  addQuestionUsingPost,
  deleteQuestionUsingPost,
  listQuestionByPageUsingPost,
  updateQuestionUsingPost,
} from "@/api/questionController";

const formSearchParams = ref<API.QuestionQueryRequest>({});

//初始化搜索条件
const initSearchParams = {
  current: 1,
  pageSize: 10,
};

const searchParams = ref<API.QuestionQueryRequest>({
  ...initSearchParams,
});
const dataList = ref<API.Question[]>([]);
const total = ref<number>(0);

// 弹窗相关状态
const modalVisible = ref(false);
const modalTitle = ref("新增题目");
const formSubmitting = ref(false);
const isEdit = ref(false);
const questionFormRef = ref();
const questionForm = reactive<
  API.QuestionAddRequest | API.QuestionUpdateRequest
>({
  title: "",
  content: "",
  tags: "",
  answer: "",
});

// 添加详情对话框相关状态
const detailModalVisible = ref(false);
const currentQuestions = ref<any[]>([]);

// 添加题目编辑相关状态
const questions = ref<any[]>([]);

// 常用标签
const commonTags = ref([
  "地理",
  "历史",
  "科学",
  "文学",
  "艺术",
  "体育",
  "娱乐",
  "常识",
]);

// 表单验证规则
const formRules = {
  title: [{ required: true, message: "请输入题目集标题" }],
};

// 计算属性：将questions转换为JSON字符串
const questionsJson = computed(() => {
  return JSON.stringify(questions.value);
});

// 监听questions变化，更新questionForm.content
watchEffect(() => {
  questionForm.content = questionsJson.value;
});

// 表格列配置
const columns = [
  {
    title: "ID",
    dataIndex: "id",
  },
  {
    title: "题目标题",
    dataIndex: "title",
  },
  {
    title: "题目数量",
    dataIndex: "questionCount",
  },
  {
    title: "题目预览",
    dataIndex: "questionPreview",
  },
  {
    title: "题目标签",
    dataIndex: "tags",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
  },
  {
    title: "更新时间",
    dataIndex: "updateTime",
  },
  {
    title: "详情",
    slotName: "detail",
  },
  {
    title: "操作",
    slotName: "optional",
  },
];

/**
 * 加载数据
 */
const loadData = async () => {
  try {
    const res = await listQuestionByPageUsingPost(searchParams.value);
    if (res.data.code === 0) {
      // 处理数据，添加自定义字段
      const records = res.data.data?.records || [];
      dataList.value = records.map(record => {
        let questionCount = 0;
        let questionPreview = '无法解析';
        
        try {
          // 确保内容不为空
          if (record.content && record.content.trim()) {
            // 尝试解析JSON
            const questions = JSON.parse(record.content);
            
            // 验证解析结果是否为数组
            if (Array.isArray(questions)) {
              questionCount = questions.length;
              
              if (questions.length > 0) {
                const firstQuestion = questions[0];
                // 验证题目结构
                if (firstQuestion && firstQuestion.title && Array.isArray(firstQuestion.options)) {
                  const correctOption = firstQuestion.options.find(opt => opt.score === 1);
                  questionPreview = `${firstQuestion.title} (答案: ${correctOption ? correctOption.key : '未知'})`;
                } else {
                  questionPreview = '题目结构不完整';
                }
              } else {
                questionPreview = '无题目';
              }
            } else {
              questionPreview = '非数组格式';
            }
          } else {
            questionPreview = '内容为空';
          }
        } catch (e) {
          console.error('解析题目内容失败:', e, record.content);
          questionPreview = `解析失败: ${e instanceof Error ? e.message : '未知错误'}`;
        }
        
        return {
          ...record,
          questionCount,
          questionPreview
        };
      });
      
      total.value = res.data.data?.total || 0;
    } else {
      message.error("获取数据失败: " + res.data.message);
    }
  } catch (error) {
    console.error("加载数据失败:", error);
    message.error("加载数据失败，请检查网络连接");
  }
};

/**
 * 执行搜索
 */
const doSearch = async () => {
  searchParams.value = {
    ...initSearchParams,
    ...formSearchParams.value,
  };
};

/**
 * 显示新增对话框
 */
const showAddModal = () => {
  isEdit.value = false;
  modalTitle.value = "新增题目";

  // 重置表单
  Object.assign(questionForm, {
    title: "",
    content: "",
    tags: [],
    answer: "",
  });

  // 初始化一个空题目
  questions.value = [
    {
      title: "",
      options: [
        { key: "A", value: "", score: 0 },
        { key: "B", value: "", score: 0 },
        { key: "C", value: "", score: 0 },
        { key: "D", value: "", score: 0 },
      ],
    },
  ];

  modalVisible.value = true;

  // 重置表单验证状态
  nextTick(() => {
    questionFormRef.value?.resetFields();
  });
};

/**
 * 显示编辑对话框
 */
const showEditModal = (record: API.Question) => {
  isEdit.value = true;
  modalTitle.value = "编辑题目";
  
  try {
    // 确保内容不为空
    if (!record.content || !record.content.trim()) {
      message.warning('题目内容为空，将创建新题目结构');
      questions.value = [{
        title: "",
        options: [
          { key: "A", value: "", score: 0 },
          { key: "B", value: "", score: 0 },
          { key: "C", value: "", score: 0 },
          { key: "D", value: "", score: 0 }
        ]
      }];
    } else {
      // 尝试解析JSON
      const parsedContent = JSON.parse(record.content);
      
      // 检查解析结果是否为数组
      if (!Array.isArray(parsedContent) || parsedContent.length === 0) {
        message.warning('题目内容格式不正确或为空，将创建新题目结构');
        questions.value = [{
          title: "",
          options: [
            { key: "A", value: "", score: 0 },
            { key: "B", value: "", score: 0 },
            { key: "C", value: "", score: 0 },
            { key: "D", value: "", score: 0 }
          ]
        }];
      } else {
        // 验证并修复每个题目的结构
        questions.value = parsedContent.map(q => {
          // 确保题目有标题
          const title = q.title || "";
          
          // 确保选项是数组
          let options = Array.isArray(q.options) ? [...q.options] : [];
          
          // 如果选项为空，添加默认选项
          if (options.length === 0) {
            options = [
              { key: "A", value: "", score: 0 },
              { key: "B", value: "", score: 0 },
              { key: "C", value: "", score: 0 },
              { key: "D", value: "", score: 0 }
            ];
          }
          
          // 确保每个选项有正确的结构
          options = options.map(opt => ({
            key: opt.key || "",
            value: opt.value || "",
            score: typeof opt.score === 'number' ? opt.score : 0
          }));
          
          return { title, options };
        });
      }
    }
    
    // 处理标签
    let tags = record.tags;
    if (typeof tags === 'string') {
      tags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    } else if (!tags) {
      tags = [];
    }
    
    // 设置表单数据
    Object.assign(questionForm, {
      id: record.id,
      title: record.title || "",
      content: JSON.stringify(questions.value),
      tags: tags,
      answer: record.answer || "",
    });
    
    modalVisible.value = true;
    
    // 重置表单验证状态
    nextTick(() => {
      questionFormRef.value?.resetFields();
    });
  } catch (e) {
    console.error('解析题目内容失败:', e);
    message.error('题目内容解析失败: ' + (e instanceof Error ? e.message : String(e)));
    
    // 创建默认题目结构
    questions.value = [{
      title: "",
      options: [
        { key: "A", value: "", score: 0 },
        { key: "B", value: "", score: 0 },
        { key: "C", value: "", score: 0 },
        { key: "D", value: "", score: 0 }
      ]
    }];
    
    // 设置表单数据
    Object.assign(questionForm, {
      id: record.id,
      title: record.title || "",
      content: JSON.stringify(questions.value),
      tags: [],
      answer: record.answer || "",
    });
    
    modalVisible.value = true;
    
    // 重置表单验证状态
    nextTick(() => {
      questionFormRef.value?.resetFields();
    });
  }
};

/**
 * 关闭对话框
 */
const closeModal = () => {
  modalVisible.value = false;
  formSubmitting.value = false;
};

/**
 * 处理提交
 */
const handleSubmit = async () => {
  formSubmitting.value = true;

  try {
    // 表单验证
    await questionFormRef.value?.validate();

    // 验证每个题目
    for (let i = 0; i < questions.value.length; i++) {
      const question = questions.value[i];

      if (!question.title) {
        message.error(`题目 ${i + 1} 标题不能为空`);
        formSubmitting.value = false;
        return;
      }

      if (question.options.length === 0) {
        message.error(`题目 ${i + 1} 至少需要一个选项`);
        formSubmitting.value = false;
        return;
      }

      // 检查是否有正确答案（得分为1的选项）
      const hasCorrectAnswer = question.options.some(
        (opt: any) => opt.score === 1
      );
      if (!hasCorrectAnswer) {
        message.error(`题目 ${i + 1} 必须有一个正确答案（得分为1）`);
        formSubmitting.value = false;
        return;
      }

      // 检查选项内容
      for (let j = 0; j < question.options.length; j++) {
        const option = question.options[j];
        if (!option.key) {
          message.error(`题目 ${i + 1} 的选项 ${j + 1} 的key不能为空`);
          formSubmitting.value = false;
          return;
        }
        if (!option.value) {
          message.error(`题目 ${i + 1} 的选项 ${j + 1} 的内容不能为空`);
          formSubmitting.value = false;
          return;
        }
      }
    }

    // 处理标签
    if (Array.isArray(questionForm.tags)) {
      questionForm.tags = questionForm.tags.join(",");
    }

    // 更新content字段
    questionForm.content = JSON.stringify(questions.value);

    // 提交表单
    const res = isEdit.value
      ? await updateQuestionUsingPost(questionForm as API.QuestionUpdateRequest)
      : await addQuestionUsingPost(questionForm as API.QuestionAddRequest);

    if (res.data.code === 0) {
      message.success(isEdit.value ? "更新成功" : "新增成功");
      modalVisible.value = false;
      loadData();
    } else {
      message.error(
        (isEdit.value ? "更新" : "新增") + "失败：" + res.data.message
      );
    }
  } catch (error) {
    console.error("表单验证失败:", error);
    message.error("请检查表单填写是否正确");
  } finally {
    formSubmitting.value = false;
  }
};

/**
 * 删除题目
 */
const doDelete = async (record: API.Question) => {
  const res = await deleteQuestionUsingPost({
    id: record.id,
  });
  if (res.data.code === 0) {
    message.success("删除成功");
    loadData();
  } else {
    message.error("删除失败" + res.data.message);
  }
};

/**
 * 分页变化
 */
const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};

// 显示详情对话框
const showDetailModal = (record: API.Question) => {
  try {
    // 确保内容不为空
    if (!record.content || !record.content.trim()) {
      message.warning('题目内容为空');
      currentQuestions.value = [];
      detailModalVisible.value = true;
      return;
    }
    
    // 尝试解析JSON
    const questions = JSON.parse(record.content);
    
    // 检查解析结果是否为数组
    if (!Array.isArray(questions)) {
      message.warning('题目内容格式不正确，应为数组');
      currentQuestions.value = [];
      detailModalVisible.value = true;
      return;
    }
    
    // 验证每个题目的结构
    const validQuestions = questions.filter(q => 
      q && typeof q === 'object' && q.title && Array.isArray(q.options)
    );
    
    if (validQuestions.length === 0) {
      message.warning('未找到有效的题目数据');
      currentQuestions.value = [];
    } else if (validQuestions.length < questions.length) {
      message.warning('部分题目数据格式不正确，仅显示有效题目');
      currentQuestions.value = validQuestions;
    } else {
      currentQuestions.value = questions;
    }
    
    detailModalVisible.value = true;
    console.log('解析的题目:', currentQuestions.value);
  } catch (e) {
    console.error('解析题目内容失败:', e);
    message.error('题目内容解析失败: ' + (e instanceof Error ? e.message : String(e)));
    currentQuestions.value = [];
    detailModalVisible.value = true;
  }
};

/**
 * 添加新题目
 */
const addQuestion = () => {
  questions.value.push({
    title: "",
    options: [
      { key: "A", value: "", score: 0 },
      { key: "B", value: "", score: 0 },
      { key: "C", value: "", score: 0 },
      { key: "D", value: "", score: 0 },
    ],
  });
};

/**
 * 删除题目
 */
const removeQuestion = (index: number) => {
  questions.value.splice(index, 1);
};

/**
 * 添加选项
 */
const addOption = (questionIndex: number) => {
  const keys = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const currentOptions = questions.value[questionIndex].options;
  const nextKey = keys[currentOptions.length] || "";

  questions.value[questionIndex].options.push({
    key: nextKey,
    value: "",
    score: 0,
  });
};

/**
 * 删除选项
 */
const removeOption = (questionIndex: number, optionIndex: number) => {
  questions.value[questionIndex].options.splice(optionIndex, 1);
};

// 监听搜索参数变化
watchEffect(() => {
  loadData();
});

// 添加一个工具函数来验证题目数据
const validateQuestionData = (data: any): boolean => {
  if (!data || !Array.isArray(data)) {
    return false;
  }
  
  for (const question of data) {
    if (!question || typeof question !== 'object' || !question.title) {
      return false;
    }
    
    if (!Array.isArray(question.options) || question.options.length === 0) {
      return false;
    }
    
    for (const option of question.options) {
      if (!option || typeof option !== 'object' || !option.key || !option.value) {
        return false;
      }
      
      if (typeof option.score !== 'number') {
        return false;
      }
    }
  }
  
  return true;
};
</script>

<style scoped>
#adminQuestionPage {
  padding: 20px;
}

:deep(.arco-form-item-label-col) {
  font-weight: bold;
}

:deep(.arco-modal-body) {
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.arco-collapse-item-header) {
  font-weight: bold;
}

:deep(.arco-collapse-item-content-box) {
  padding: 16px;
}

:deep(.arco-radio-checked) {
  color: #fff;
  background-color: #165dff;
}
</style>
