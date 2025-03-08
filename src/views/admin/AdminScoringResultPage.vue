<template>
  <div id="adminScoringResultPage">
    <!-- 搜索表单 -->
    <a-form
      style="margin-bottom: 20px"
      label-align="left"
      auto-label-width
      :model="formSearchParams"
      layout="inline"
      @submit="doSearch"
    >
      <a-form-item field="userId" label="用户ID">
        <a-input
          v-model="formSearchParams.userId"
          placeholder="请输入用户ID"
        />
      </a-form-item>
      <a-form-item field="appId" label="应用ID">
        <a-input
          v-model="formSearchParams.appId"
          placeholder="请输入应用ID"
        />
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
      <a-form-item>
        <a-button type="primary" @click="showAddModal">新增评分结果</a-button>
      </a-form-item>
    </a-form>
    
    <!-- 评分结果表格 -->
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
        <!-- 得分列自定义渲染 -->
        <template #score="{ record }">
          <a-tag :color="getScoreColor(record.score)">{{ record.score }}</a-tag>
        </template>
        
        <!-- 结果数据列自定义渲染 -->
        <template #resultData="{ record }">
          <a-button type="text" @click="showResultDataModal(record)">
            <template #icon><icon-eye /></template>
            查看详情
          </a-button>
        </template>
        
        <!-- 操作列自定义渲染 -->
        <template #optional="{ record }">
          <a-space>
            <a-button type="text" status="success" @click="showEditModal(record)">
              <template #icon><icon-edit /></template>
              编辑
            </a-button>
            <a-popconfirm
              content="确定要删除这条评分结果吗？"
              @ok="doDelete(record)"
            >
              <a-button type="text" status="danger">
                <template #icon><icon-delete /></template>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
        
        <!-- 结果图片列自定义渲染 -->
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
        
        <!-- 空数据自定义渲染 -->
        <template #empty>
          <a-empty description="暂无评分结果数据" />
        </template>
      </a-table>
    </a-card>
    
    <!-- 新增/编辑评分结果对话框 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="closeModal"
      :width="700"
      :ok-button-props="{ loading: submitting }"
    >
      <a-form
        ref="formRef"
        :model="form"
        layout="vertical"
        :rules="formRules"
      >
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="userId" label="用户ID" required>
              <a-input
                v-model="form.userId"
                placeholder="请输入用户ID"
              />
            </a-form-item>
          </a-col>
          
          <a-col :span="8">
            <a-form-item field="appId" label="应用ID" required>
              <a-input
                v-model="form.appId"
                placeholder="请输入应用ID"
              />
            </a-form-item>
          </a-col>
          
          <a-col :span="8">
            <a-form-item field="questionId" label="题目ID" required>
              <a-input
                v-model="form.questionId"
                placeholder="请输入题目ID"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="score" label="得分" required>
          <a-slider
            v-model="form.score"
            :min="0"
            :max="100"
            :step="1"
            show-ticks
            show-input
          />
        </a-form-item>
        
        <a-form-item field="resultName" label="结果名称">
          <a-input
            v-model="form.resultName"
            placeholder="请输入结果名称"
          />
        </a-form-item>
        
        <a-form-item field="resultDesc" label="结果描述">
          <a-textarea
            v-model="form.resultDesc"
            placeholder="请输入结果描述"
            :auto-size="{ minRows: 2, maxRows: 5 }"
          />
        </a-form-item>
        
        <a-form-item field="resultProp" label="结果属性">
          <a-input
            v-model="form.resultProp"
            placeholder="请输入结果属性"
          />
        </a-form-item>
        
        <a-form-item field="resultPicture" label="结果图片">
          <a-input
            v-model="form.resultPicture"
            placeholder="请输入结果图片URL"
          />
        </a-form-item>
        
        <a-form-item field="resultData" label="结果数据">
          <a-textarea
            v-model="form.resultData"
            placeholder="请输入JSON格式的结果数据"
            :auto-size="{ minRows: 5, maxRows: 15 }"
          />
          <div class="form-item-help">
            <a-typography-text type="secondary">请输入有效的JSON格式数据</a-typography-text>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 查看结果数据对话框 -->
    <a-modal
      v-model:visible="resultDataModalVisible"
      title="评分结果详情"
      :footer="false"
      :width="800"
    >
      <a-spin :loading="detailLoading">
        <div v-if="currentRecord">
          <a-descriptions :column="2" bordered size="small" title="基本信息">
            <a-descriptions-item label="ID">{{ currentRecord.id }}</a-descriptions-item>
            <a-descriptions-item label="用户ID">{{ currentRecord.userId }}</a-descriptions-item>
            <a-descriptions-item label="应用ID">{{ currentRecord.appId }}</a-descriptions-item>
            <a-descriptions-item label="题目ID">{{ currentRecord.questionId }}</a-descriptions-item>
            <a-descriptions-item label="得分">
              <a-tag :color="getScoreColor(currentRecord.score)">{{ currentRecord.score }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ formatDate(currentRecord.createTime) }}</a-descriptions-item>
            <a-descriptions-item label="更新时间" :span="2">{{ formatDate(currentRecord.updateTime) }}</a-descriptions-item>
          </a-descriptions>
          
          <a-divider>结果数据</a-divider>
          
          <div v-if="isValidJson">
            <a-tabs default-active-key="formatted">
              <a-tab-pane key="formatted" title="格式化视图">
                <pre class="json-preview">{{ formattedResultData }}</pre>
              </a-tab-pane>
              <a-tab-pane key="raw" title="原始数据">
                <pre class="json-preview">{{ currentResultData }}</pre>
              </a-tab-pane>
            </a-tabs>
          </div>
          <div v-else>
            <a-alert type="warning" message="结果数据不是有效的JSON格式" />
            <pre class="json-preview">{{ currentResultData }}</pre>
          </div>
          
          <a-descriptions :column="2" bordered size="small" title="详细信息">
            <a-descriptions-item label="结果名称">{{ currentRecord.resultName || '无' }}</a-descriptions-item>
            <a-descriptions-item label="结果属性">{{ currentRecord.resultProp || '无' }}</a-descriptions-item>
            <a-descriptions-item label="结果描述" :span="2">{{ currentRecord.resultDesc || '无' }}</a-descriptions-item>
            <a-descriptions-item label="结果图片" :span="2">
              <a-image
                v-if="currentRecord.resultPicture"
                :src="currentRecord.resultPicture"
                :width="200"
                fit="contain"
              />
              <span v-else>无图片</span>
            </a-descriptions-item>
          </a-descriptions>
        </div>
        <div v-else>
          <a-empty description="无结果数据" />
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, computed, reactive } from "vue";
import { IconEye, IconEdit, IconDelete } from '@arco-design/web-vue/es/icon';
import API from "@/api";
import message from "@arco-design/web-vue/es/message";
import {
  listScoringResultVoByPageUsingPost,
  addScoringResultUsingPost,
  updateScoringResultUsingPost,
  deleteScoringResultUsingPost,
  getScoringResultVoByIdUsingGet
} from "@/api/scoringResultController";

// 搜索相关状态
const formSearchParams = ref<API.ScoringResultQueryRequest>({});
const initSearchParams = {
  current: 1,
  pageSize: 10,
};
const searchParams = ref<API.ScoringResultQueryRequest>({
  ...initSearchParams,
});

// 表格数据相关状态
const dataList = ref<API.ScoringResultVO[]>([]);
const total = ref<number>(0);
const loading = ref(false);

// 表单相关状态
const modalVisible = ref(false);
const modalTitle = ref("新增评分结果");
const isEdit = ref(false);
const formRef = ref();
const submitting = ref(false);
const form = reactive<API.ScoringResultAddRequest | API.ScoringResultUpdateRequest>({
  userId: undefined,
  appId: undefined,
  questionId: undefined,
  score: 0,
  resultData: "",
  resultName: "",
  resultDesc: "",
  resultProp: "",
  resultPicture: "",
});

// 表单验证规则
const formRules = {
  userId: [
    { required: true, message: "请输入用户ID" },
    { type: 'number', message: '用户ID必须为数字' }
  ],
  appId: [
    { required: true, message: "请输入应用ID" },
    { type: 'number', message: '应用ID必须为数字' }
  ],
  questionId: [
    { required: true, message: "请输入题目ID" },
    { type: 'number', message: '题目ID必须为数字' }
  ],
  score: [
    { required: true, message: "请输入得分" },
    { type: 'number', message: '得分必须为数字' },
    { min: 0, max: 100, message: '得分必须在0-100之间' }
  ],
};

// 结果数据详情相关状态
const resultDataModalVisible = ref(false);
const currentRecord = ref<API.ScoringResultVO | null>(null);
const currentResultData = ref<string>("");
const detailLoading = ref(false);

// 计算属性：判断JSON是否有效
const isValidJson = computed(() => {
  try {
    if (!currentResultData.value) return false;
    JSON.parse(currentResultData.value);
    return true;
  } catch (e) {
    return false;
  }
});

// 计算属性：格式化JSON数据
const formattedResultData = computed(() => {
  try {
    if (!currentResultData.value) return "";
    return JSON.stringify(JSON.parse(currentResultData.value), null, 2);
  } catch (e) {
    return currentResultData.value;
  }
});

// 表格列配置
const columns = [
  {
    title: "ID",
    dataIndex: "id",
    width: 80,
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
    title: "结果属性",
    dataIndex: "resultProp",
    width: 120,
  },
  {
    title: "结果图片",
    slotName: "resultPicture",
    width: 120,
  },
  {
    title: "用户ID",
    dataIndex: "userId",
    width: 100,
  },
  {
    title: "应用ID",
    dataIndex: "appId",
    width: 100,
  },
  {
    title: "题目ID",
    dataIndex: "questionId",
    width: 100,
  },
  {
    title: "得分",
    dataIndex: "score",
    slotName: "score",
    width: 100,
  },
  {
    title: "结果数据",
    slotName: "resultData",
    width: 120,
  },
  {
    title: "操作",
    slotName: "optional",
    width: 150,
    fixed: 'right',
  },
];

/**
 * 根据得分获取颜色
 */
const getScoreColor = (score: number) => {
  if (score >= 90) return 'green';
  if (score >= 70) return 'blue';
  if (score >= 60) return 'orange';
  return 'red';
};

/**
 * 格式化日期
 */
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
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
    if (params.appId) params.appId = Number(params.appId);
    if (params.questionId) params.questionId = Number(params.questionId);
    
    const res = await listScoringResultVoByPageUsingPost(params);
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
 * 显示新增对话框
 */
const showAddModal = () => {
  isEdit.value = false;
  modalTitle.value = "新增评分结果";
  
  // 重置表单
  Object.assign(form, {
    userId: undefined,
    appId: undefined,
    questionId: undefined,
    score: 0,
    resultData: "",
    resultName: "",
    resultDesc: "",
    resultProp: "",
    resultPicture: "",
  });
  
  modalVisible.value = true;
  
  // 重置表单验证状态
  setTimeout(() => {
    formRef.value?.resetFields();
  }, 0);
};

/**
 * 显示编辑对话框
 */
const showEditModal = (record: API.ScoringResultVO) => {
  isEdit.value = true;
  modalTitle.value = "编辑评分结果";
  
  // 设置表单数据
  Object.assign(form, {
    id: record.id,
    userId: record.userId,
    appId: record.appId,
    questionId: record.questionId,
    score: record.score,
    resultData: record.resultData || "",
    resultName: record.resultName || "",
    resultDesc: record.resultDesc || "",
    resultProp: record.resultProp || "",
    resultPicture: record.resultPicture || "",
  });
  
  modalVisible.value = true;
  
  // 重置表单验证状态
  setTimeout(() => {
    formRef.value?.resetFields();
  }, 0);
};

/**
 * 关闭对话框
 */
const closeModal = () => {
  modalVisible.value = false;
};

/**
 * 处理表单提交
 */
const handleSubmit = async () => {
  submitting.value = true;
  
  try {
    // 表单验证
    await formRef.value?.validate();
    
    // 验证结果数据是否为有效的JSON
    if (form.resultData) {
      try {
        JSON.parse(form.resultData);
      } catch (e) {
        message.error("结果数据不是有效的JSON格式");
        submitting.value = false;
        return;
      }
    }
    
    // 确保数字类型字段为数字
    const submitForm = { ...form };
    submitForm.userId = Number(submitForm.userId);
    submitForm.appId = Number(submitForm.appId);
    submitForm.questionId = Number(submitForm.questionId);
    submitForm.score = Number(submitForm.score);
    
    // 提交表单
    const res = isEdit.value
      ? await updateScoringResultUsingPost(submitForm as API.ScoringResultUpdateRequest)
      : await addScoringResultUsingPost(submitForm as API.ScoringResultAddRequest);
    
    if (res.data.code === 0) {
      message.success(isEdit.value ? "更新成功" : "新增成功");
      modalVisible.value = false;
      loadData();
    } else {
      message.error((isEdit.value ? "更新" : "新增") + "失败：" + res.data.message);
    }
  } catch (error) {
    console.error("表单验证失败:", error);
    message.error("请检查表单填写是否正确");
  } finally {
    submitting.value = false;
  }
};

/**
 * 删除评分结果
 */
const doDelete = async (record: API.ScoringResultVO) => {
  try {
    const res = await deleteScoringResultUsingPost({
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
 * 显示结果数据详情
 */
const showResultDataModal = async (record: API.ScoringResultVO) => {
  detailLoading.value = true;
  resultDataModalVisible.value = true;
  
  try {
    // 先显示基本信息
    currentRecord.value = record;
    currentResultData.value = record.resultData || "";
    
    // 尝试获取最新详情
    const res = await getScoringResultVoByIdUsingGet({ id: record.id });
    if (res.data.code === 0 && res.data.data) {
      currentRecord.value = res.data.data;
      currentResultData.value = res.data.data.resultData || "";
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
#adminScoringResultPage {
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

.form-item-help {
  margin-top: 4px;
  font-size: 12px;
}

:deep(.arco-slider) {
  margin: 10px 0;
}
</style>
