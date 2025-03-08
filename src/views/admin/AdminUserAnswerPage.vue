<template>
  <div id="adminUserAnswerPage">
    <a-form
      style="margin-bottom: 20px"
      label-align="left"
      auto-label-width
      :model="formSearchParams"
      layout="inline"
      @submit="doSearch"
    >
      <a-form-item field="userId" label="用户ID">
        <a-input v-model="formSearchParams.userId" placeholder="请输入用户ID" />
      </a-form-item>
      <a-form-item field="questionId" label="题目ID">
        <a-input
          v-model="formSearchParams.questionId"
          placeholder="请输入题目ID"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100px">
          搜索
        </a-button>
      </a-form-item>
    </a-form>
    <a-card>
      <a-table
        :columns="columns"
        :data="dataList"
        :loading="loading"
        :pagination="{
          showTotal: true,
          pageSize: searchParams.pageSize,
          current: searchParams.current,
          total,
        }"
        @page-change="onPageChange"
        :bordered="false"
        stripe
      >
        <template #resultPicture="{ record }">
          <a-image
            v-if="record.resultPicture"
            :src="record.resultPicture"
            :width="50"
            height="50"
            fit="cover"
          />
          <span v-else>无图片</span>
        </template>
        <template #resultScore="{ record }">
          <a-tag :color="getScoreColor(record.resultScore)">{{
            record.resultScore
          }}</a-tag>
        </template>
        <template #scoringStrategy="{ record }">
          <a-tag :color="record.scoringStrategy === 0 ? 'blue' : 'green'">
            {{ record.scoringStrategy === 0 ? "自定义" : "AI" }}
          </a-tag>
        </template>
        <template #choices="{ record }">
          <a-button type="text" @click="showChoicesModal(record)">
            <template #icon><icon-eye /></template>
            查看选择
          </a-button>
        </template>
        <template #optional="{ record }">
          <a-space>
            <a-button
              type="text"
              status="success"
              @click="showEditModal(record)"
            >
              <template #icon><icon-edit /></template>
              编辑
            </a-button>
            <a-popconfirm
              content="确定要删除这条用户答案吗？"
              @ok="doDelete(record)"
            >
              <a-button type="text" status="danger">
                <template #icon><icon-delete /></template>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
        <template #empty>
          <a-empty description="暂无用户答案数据" />
        </template>
      </a-table>
    </a-card>
    <a-modal
      v-model:visible="editModalVisible"
      title="编辑用户答案"
      @ok="handleEdit"
      @cancel="closeEditModal"
      :width="700"
      :ok-button-props="{ loading: submitting }"
    >
      <a-form ref="formRef" :model="form" layout="vertical" :rules="formRules">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="resultName" label="结果名称">
              <a-input v-model="form.resultName" placeholder="请输入结果名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="resultScore" label="结果得分">
              <a-input-number
                v-model="form.resultScore"
                placeholder="请输入结果得分"
                :min="0"
                :max="100"
                :step="1"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="resultDesc" label="结果描述">
          <a-textarea
            v-model="form.resultDesc"
            placeholder="请输入结果描述"
            :auto-size="{ minRows: 2, maxRows: 5 }"
          />
        </a-form-item>
        <a-form-item field="resultPicture" label="结果图片">
          <a-input
            v-model="form.resultPicture"
            placeholder="请输入结果图片URL"
          />
        </a-form-item>
        <a-form-item field="scoringStrategy" label="评分策略">
          <a-radio-group v-model="form.scoringStrategy">
            <a-radio :value="0">自定义</a-radio>
            <a-radio :value="1">AI</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal
      v-model:visible="choicesModalVisible"
      title="用户选择详情"
      :footer="false"
      :width="800"
    >
      <a-spin :loading="detailLoading">
        <div v-if="currentRecord">
          <a-descriptions :column="2" bordered size="small" title="基本信息">
            <a-descriptions-item label="ID">{{
              currentRecord.id
            }}</a-descriptions-item>
            <a-descriptions-item label="用户ID">{{
              currentRecord.userId
            }}</a-descriptions-item>
            <a-descriptions-item label="题目ID">{{
              currentRecord.questionId
            }}</a-descriptions-item>
            <a-descriptions-item label="结果名称">{{
              currentRecord.resultName || "无"
            }}</a-descriptions-item>
            <a-descriptions-item label="结果得分">
              <a-tag :color="getScoreColor(currentRecord.resultScore)">{{
                currentRecord.resultScore
              }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="评分策略">
              <a-tag
                :color="currentRecord.scoringStrategy === 0 ? 'blue' : 'green'"
              >
                {{ currentRecord.scoringStrategy === 0 ? "自定义" : "AI" }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">{{
              formatDate(currentRecord.createTime)
            }}</a-descriptions-item>
            <a-descriptions-item label="更新时间">{{
              formatDate(currentRecord.updateTime)
            }}</a-descriptions-item>
          </a-descriptions>
          <a-divider>选择项</a-divider>
          <div v-if="isValidChoices">
            <a-table
              :columns="choicesColumns"
              :data="parsedChoices"
              :pagination="false"
              bordered
            >
              <template #isCorrect="{ record }">
                <a-tag :color="record.isCorrect ? 'green' : 'red'">
                  {{ record.isCorrect ? "正确" : "错误" }}
                </a-tag>
              </template>
            </a-table>
          </div>
          <div v-else>
            <a-alert
              type="warning"
              message="选择项数据不是有效的JSON格式或为空"
            />
            <pre v-if="currentRecord.choices" class="json-preview">{{
              currentRecord.choices
            }}</pre>
          </div>
          <a-divider>结果描述</a-divider>
          <p>{{ currentRecord.resultDesc || "无结果描述" }}</p>
          <a-divider>结果图片</a-divider>
          <div style="text-align: center">
            <a-image
              v-if="currentRecord.resultPicture"
              :src="currentRecord.resultPicture"
              :width="300"
              fit="contain"
            />
            <a-empty v-else description="无结果图片" />
          </div>
        </div>
        <div v-else>
          <a-empty description="无用户答案数据" />
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {
  deleteUserAnswerUsingPost,
  listUserAnswerVoByPageUsingPost,
  updateUserAnswerUsingPost,
  getUserAnswerVoByIdUsingGet,
} from "@/api/userAnswerController";
import { ref, watchEffect, computed, reactive } from "vue";
import API from "@/api";
import message from "@arco-design/web-vue/es/message";
import { IconEye, IconEdit, IconDelete } from "@arco-design/web-vue/es/icon";

const formSearchParams = ref<API.UserAnswerQueryRequest>({});

//初始化搜索条件,（不应该被修改）
const initSearchParams = {
  current: 1,
  pageSize: 10,
};

const searchParams = ref<API.UserAnswerQueryRequest>({
  ...initSearchParams,
});
const dataList = ref<API.UserAnswerVO[]>([]);
const total = ref<number>(0);
const loading = ref(false);

// 编辑表单相关状态
const editModalVisible = ref(false);
const formRef = ref();
const submitting = ref(false);
const form = reactive<API.UserAnswerUpdateRequest>({
  id: undefined,
  resultName: "",
  resultDesc: "",
  resultPicture: "",
  resultScore: 0,
  scoringStrategy: 0,
});

// 表单验证规则
const formRules = {
  resultScore: [
    { type: "number", message: "得分必须为数字" },
    { min: 0, max: 100, message: "得分必须在0-100之间" },
  ],
};

// 选择项详情相关状态
const choicesModalVisible = ref(false);
const currentRecord = ref<API.UserAnswerVO | null>(null);
const detailLoading = ref(false);

// 计算属性：判断选择项是否有效
const isValidChoices = computed(() => {
  try {
    if (!currentRecord.value?.choices) return false;
    const choices = JSON.parse(currentRecord.value.choices);
    return Array.isArray(choices) && choices.length > 0;
  } catch (e) {
    return false;
  }
});

// 计算属性：解析选择项
const parsedChoices = computed(() => {
  try {
    if (!currentRecord.value?.choices) return [];
    return JSON.parse(currentRecord.value.choices);
  } catch (e) {
    return [];
  }
});

// 选择项表格列配置
const choicesColumns = [
  {
    title: "题目",
    dataIndex: "question",
    width: 200,
  },
  {
    title: "选择",
    dataIndex: "answer",
    width: 100,
  },
  {
    title: "是否正确",
    slotName: "isCorrect",
    width: 100,
  },
  {
    title: "得分",
    dataIndex: "score",
    width: 100,
  },
];

// 表格列配置
const columns = [
  {
    title: "ID",
    dataIndex: "id",
    width: 80,
  },
  {
    title: "用户ID",
    dataIndex: "userId",
    width: 100,
  },
  {
    title: "结果名称",
    dataIndex: "resultName",
    width: 150,
  },
  {
    title: "结果描述",
    dataIndex: "resultDesc",
    width: 200,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: "结果图片",
    slotName: "resultPicture",
    width: 100,
  },
  {
    title: "结果得分",
    dataIndex: "resultScore",
    slotName: "resultScore",
    width: 100,
  },
  {
    title: "评分策略",
    dataIndex: "scoringStrategy",
    slotName: "scoringStrategy",
    width: 100,
  },
  {
    title: "选择项",
    slotName: "choices",
    width: 100,
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    width: 180,
  },
  {
    title: "操作",
    slotName: "optional",
    width: 150,
    fixed: "right",
  },
];

/**
 * 根据得分获取颜色
 */
const getScoreColor = (score: number) => {
  if (score >= 90) return "green";
  if (score >= 70) return "blue";
  if (score >= 60) return "orange";
  return "red";
};

/**
 * 格式化日期
 */
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleString();
  } catch (e) {
    return dateStr;
  }
};

/**
 * 加载数据
 */
const loadData = async () => {
  loading.value = true;
  try {
    // 处理数字类型参数
    const params = { ...searchParams.value };
    if (params.userId) params.userId = Number(params.userId);
    if (params.questionId) params.questionId = Number(params.questionId);

    const res = await listUserAnswerVoByPageUsingPost(params);
    if (res.data.code === 0) {
      dataList.value = res.data.data?.records || [];
      total.value = res.data.data?.total || 0;
    } else {
      message.error("获取数据失败: " + res.data.message);
    }
  } catch (error) {
    console.error("加载数据失败:", error);
    message.error("加载数据失败，请检查网络连接");
  } finally {
    loading.value = false;
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
 * 当分页变化时，改变搜索条件，触发数据加载
 */
const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};

/**
 * 显示编辑对话框
 */
const showEditModal = (record: API.UserAnswerVO) => {
  // 设置表单数据
  Object.assign(form, {
    id: record.id,
    resultName: record.resultName || "",
    resultDesc: record.resultDesc || "",
    resultPicture: record.resultPicture || "",
    resultScore: record.resultScore || 0,
    scoringStrategy: record.scoringStrategy || 0,
  });

  editModalVisible.value = true;

  // 重置表单验证状态
  setTimeout(() => {
    formRef.value?.resetFields();
  }, 0);
};

/**
 * 关闭编辑对话框
 */
const closeEditModal = () => {
  editModalVisible.value = false;
};

/**
 * 处理编辑提交
 */
const handleEdit = async () => {
  submitting.value = true;

  try {
    // 表单验证
    await formRef.value?.validate();

    // 确保数字类型字段为数字
    const submitForm = { ...form };
    submitForm.resultScore = Number(submitForm.resultScore);

    // 提交表单
    const res = await updateUserAnswerUsingPost(submitForm);

    if (res.data.code === 0) {
      message.success("更新成功");
      editModalVisible.value = false;
      loadData();
    } else {
      message.error("更新失败：" + res.data.message);
    }
  } catch (error) {
    console.error("表单验证失败:", error);
    message.error("请检查表单填写是否正确");
  } finally {
    submitting.value = false;
  }
};

/**
 * 删除用户答案
 */
const doDelete = async (record: API.UserAnswerVO) => {
  try {
    const res = await deleteUserAnswerUsingPost({
      id: record.id,
    });

    if (res.data.code === 0) {
      message.success("删除成功");
      loadData();
    } else {
      message.error("删除失败: " + res.data.message);
    }
  } catch (error) {
    console.error("删除失败:", error);
    message.error("删除失败，请检查网络连接");
  }
};

/**
 * 显示选择项详情
 */
const showChoicesModal = async (record: API.UserAnswerVO) => {
  detailLoading.value = true;
  choicesModalVisible.value = true;

  try {
    // 先显示基本信息
    currentRecord.value = record;

    // 尝试获取最新详情
    const res = await getUserAnswerVoByIdUsingGet({ id: record.id });
    if (res.data.code === 0 && res.data.data) {
      currentRecord.value = res.data.data;
    }
  } catch (error) {
    console.error("获取详情失败:", error);
    message.error("获取详情失败，显示现有数据");
  } finally {
    detailLoading.value = false;
  }
};

// 监听搜索参数变化，加载数据
watchEffect(() => {
  loadData();
});
</script>

<style scoped>
#adminUserAnswerPage {
  padding: 20px;
}

:deep(.arco-form-item-label-col) {
  font-weight: bold;
}

:deep(.arco-modal-body) {
  max-height: 70vh;
  overflow-y: auto;
}

.json-preview {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  overflow: auto;
  max-height: 400px;
  font-family: monospace;
  white-space: pre-wrap;
}

:deep(.arco-descriptions-item-label) {
  font-weight: bold;
}
</style>
