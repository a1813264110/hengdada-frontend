<template>
  <div id="adminAppPage">
    <a-form
      style="marginbottom: '20px'"
      label-align="left"
      auto-label-width
      :model="formSearchParams"
      layout="inline"
      @submit="doSearch"
    >
      <a-form-item field="appName" label="应用名称">
        <a-input
          v-model="formSearchParams.appName"
          placeholder="请输入应用名称"
        />
      </a-form-item>
      <a-form-item field="appDesc" label="应用描述">
        <a-input
          v-model="formSearchParams.appDesc"
          placeholder="请输入应用描述"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100px">
          搜索
        </a-button>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="showAddModal"> 新增应用 </a-button>
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
    >
      <template #optional="{ record }">
        <a-space>
          <a-button
            :status="record.reviewStatus === 0 ? 'warning' : 'normal'"
            @click="showReviewModal(record)"
          >
            {{ record.reviewStatus === 0 ? "待审核" : "重新审核" }}
          </a-button>
        </a-space>
      </template>
      <template #discontinued="{ record }">
        <a-space>
          <a-button
            status="danger"
            @click="showDiscontinueModal(record)"
            v-if="record.reviewStatus === 1"
          >
            下架应用
          </a-button>
        </a-space>
      </template>
    </a-table>

    <!-- 添加审核对话框 -->
    <a-modal
      v-model:visible="reviewModalVisible"
      title="应用审核"
      @ok="handleReview"
      @cancel="closeReviewModal"
    >
      <a-form :model="reviewForm">
        <a-form-item label="审核状态">
          <a-radio-group v-model="reviewForm.reviewStatus">
            <a-radio :value="1">通过</a-radio>
            <a-radio :value="2">拒绝</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="审核信息">
          <a-textarea
            v-model="reviewForm.reviewMessage"
            placeholder="请输入审核信息"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加下架确认对话框 -->
    <a-modal
      v-model:visible="discontinueModalVisible"
      title="下架应用"
      @ok="handleDiscontinue"
      @cancel="closeDiscontinueModal"
    >
      <p>确定要下架该应用吗？下架后用户将无法使用此应用。</p>
      <a-form :model="discontinueForm">
        <a-form-item label="下架原因">
          <a-textarea
            v-model="discontinueForm.reviewMessage"
            placeholder="请输入下架原因"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加新增应用对话框 -->
    <a-modal
      v-model:visible="addModalVisible"
      title="新增应用"
      @ok="handleAdd"
      @cancel="closeAddModal"
    >
      <a-form :model="addForm" layout="vertical">
        <a-form-item
          field="appName"
          label="应用名称"
          :rules="[{ required: true, message: '请输入应用名称' }]"
        >
          <a-input v-model="addForm.appName" placeholder="请输入应用名称" />
        </a-form-item>
        <a-form-item field="appDesc" label="应用描述">
          <a-textarea v-model="addForm.appDesc" placeholder="请输入应用描述" />
        </a-form-item>
        <a-form-item field="appIcon" label="应用图标">
          <a-input v-model="addForm.appIcon" placeholder="请输入应用图标URL" />
        </a-form-item>
        <a-form-item
          field="appType"
          label="应用类型"
          :rules="[{ required: true, message: '请选择应用类型' }]"
        >
          <a-radio-group v-model="addForm.appType">
            <a-radio :value="0">得分类</a-radio>
            <a-radio :value="1">测评类</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          field="scoringStrategy"
          label="评分策略"
          :rules="[{ required: true, message: '请选择评分策略' }]"
        >
          <a-radio-group v-model="addForm.scoringStrategy">
            <a-radio :value="0">自定义</a-radio>
            <a-radio :value="1">AI</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {
  deleteUserUsingPost,
  listUserByPageUsingPost,
} from "@/api/userController";
import { ref, watchEffect } from "vue";
import API from "@/api";
import message from "@arco-design/web-vue/es/message";
import {
  deleteAppUsingPost,
  listAppByPageUsingPost,
  doAppReviewUsingPost,
  addAppUsingPost,
} from "@/api/appController";

const formSearchParams = ref<API.AppQueryRequest>({});

//初始化搜索条件,（不应该被修改）
const initSearchParams = {
  current: 1,
  pageSize: 10,
};

const searchParams = ref<API.AppQueryRequest>({
  ...initSearchParams,
});
const dataList = ref<API.App[]>([]);
const total = ref<number>(0);

// 审核相关的状态
const reviewModalVisible = ref(false);
const reviewForm = ref({
  id: 0,
  reviewStatus: 1,
  reviewMessage: "",
});

// 下架相关的状态
const discontinueModalVisible = ref(false);
const discontinueForm = ref({
  id: 0,
  reviewMessage: "",
});

// 新增应用相关的状态
const addModalVisible = ref(false);
const addForm = ref({
  appName: "",
  appDesc: "",
  appIcon: "",
  appType: 0,
  scoringStrategy: 0,
});

/**
 * 执行搜索
 */
const doSearch = async () => {
  searchParams.value = {
    ...initSearchParams,
    ...formSearchParams.value,
  };
};

//表格列配置
const columns = [
  {
    title: "ID",
    dataIndex: "id",
  },
  {
    title: "应用名称",
    dataIndex: "appName",
  },
  {
    title: "应用描述",
    dataIndex: "appDesc",
  },
  {
    title: "应用图标",
    dataIndex: "appIcon",
  },
  {
    title: "应用类型",
    dataIndex: "appType",
  },
  {
    title: "评分策略",
    dataIndex: "scoringStrategy",
  },
  {
    title: "审核状态",
    dataIndex: "reviewStatus",
    render: ({ record }) => {
      const statusMap: { [key: number]: string } = {
        0: "待审核",
        1: "已通过",
        2: "已拒绝",
      };
      return statusMap[record.reviewStatus] || record.reviewStatus;
    },
  },
  {
    title: "审核信息",
    dataIndex: "reviewMessage",
  },
  {
    title: "审核人ID",
    dataIndex: "reviewerId",
  },
  {
    title: "审核时间",
    dataIndex: "reviewTime",
  },
  {
    title: "创建用户ID",
    dataIndex: "userId",
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
    title: "操作",
    slotName: "optional",
  },
  {
    title: "下架",
    slotName: "discontinued",
  },
];
/**
 * 加载数据
 */
const loadData = async () => {
  //异步变同步用await和async语法
  const res = await listAppByPageUsingPost(searchParams.value);
  if (res.data.code === 0) {
    dataList.value = res.data.data?.records || [];
    total.value = res.data.data?.total || 0;
  } else {
    message.error("获取数据失败" + res.data.message);
  }
};
/**
 * 监听 searchParams 变量，改变时触发数据的重新加载
 */
watchEffect(() => {
  loadData();
});

/**
 * 当分页变化时，改变搜索条件，触发数据加载
 * @param page
 */
const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};

// 显示审核对话框
const showReviewModal = (record: API.App) => {
  reviewForm.value.id = record.id;
  reviewForm.value.reviewStatus = 1;
  reviewForm.value.reviewMessage = "";
  reviewModalVisible.value = true;
};

// 关闭审核对话框
const closeReviewModal = () => {
  reviewModalVisible.value = false;
};

// 处理审核提交
const handleReview = async () => {
  const res = await doAppReviewUsingPost({
    id: reviewForm.value.id,
    reviewStatus: reviewForm.value.reviewStatus,
    reviewMessage: reviewForm.value.reviewMessage,
  });

  if (res.data.code === 0) {
    message.success("审核成功");
    reviewModalVisible.value = false;
    loadData();
  } else {
    message.error("审核失败：" + res.data.message);
  }
};

// 显示下架确认对话框
const showDiscontinueModal = (record: API.App) => {
  discontinueForm.value.id = record.id;
  discontinueForm.value.reviewMessage = "";
  discontinueModalVisible.value = true;
};

// 关闭下架对话框
const closeDiscontinueModal = () => {
  discontinueModalVisible.value = false;
};

// 处理下架操作
const handleDiscontinue = async () => {
  const res = await doAppReviewUsingPost({
    id: discontinueForm.value.id,
    reviewStatus: 2, // 使用2表示下架/拒绝状态
    reviewMessage: discontinueForm.value.reviewMessage,
  });

  if (res.data.code === 0) {
    message.success("应用下架成功");
    discontinueModalVisible.value = false;
    loadData();
  } else {
    message.error("应用下架失败：" + res.data.message);
  }
};

// 修改原来的 doDelete 为 showDiscontinueModal
const doDelete = (record: API.App) => {
  showDiscontinueModal(record);
};

// 显示新增对话框
const showAddModal = () => {
  addForm.value = {
    appName: "",
    appDesc: "",
    appIcon: "",
    appType: 0,
    scoringStrategy: 0,
  };
  addModalVisible.value = true;
};

// 关闭新增对话框
const closeAddModal = () => {
  addModalVisible.value = false;
};

// 处理新增操作
const handleAdd = async () => {
  // 表单验证
  if (!addForm.value.appName) {
    message.error("请输入应用名称");
    return;
  }

  const res = await addAppUsingPost(addForm.value);

  if (res.data.code === 0) {
    message.success("新增应用成功");
    addModalVisible.value = false;
    loadData(); // 重新加载数据
  } else {
    message.error("新增应用失败：" + res.data.message);
  }
};
</script>

<style scoped>
#adminAppPage {
}
</style>
