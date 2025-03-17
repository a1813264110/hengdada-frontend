<template>
  <div id="addAppPage">
    <h2 style="margin-bottom: 16px">创建应用</h2>
    <a-form
      :style="{ maxWidth: '480px' }"
      label-align="left"
      auto-label-width
      :model="form"
      @submit="handleSubmit"
    >
      <a-form-item field="appName" label="应用名称">
        <a-input v-model="form.appName" placeholder="请输入应用名称" />
      </a-form-item>
      <a-form-item field="appDesc" label="应用描述">
        <a-input v-model="form.appDesc" placeholder="请输入应用描述" />
      </a-form-item>
      <a-form-item field="appIcon" label="应用图标">
        <a-input v-model="form.appIcon" placeholder="请输入应用图标" />
      </a-form-item>
      <a-form-item field="appType" label="应用类型">
        <a-select
          v-model="form.appType"
          :style="{ width: '320px' }"
          placeholder="请选择应用类型"
        >
          <a-option
            v-for="(value, key) of APP_TYPE_MAP"
            :value="Number(key)"
            :label="value"
          />
        </a-select>
      </a-form-item>
      <a-form-item field="scoringStrategy" label="评分策略">
        <a-select
          v-model="form.scoringStrategy"
          :style="{ width: '320px' }"
          placeholder="请选择评分策略"
        >
          <a-option
            v-for="(value, key) of APP_SCORING_STRATEGY_MAP"
            :value="Number(key)"
            :label="value"
          />
        </a-select>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 120px">
          提交
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watchEffect } from "vue";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import { useLoginUserStore } from "@/store/userStore";
import API from "@/api";
import {
  addAppUsingPost,
  editAppUsingPost,
  getAppVoByIdUsingGet,
} from "@/api/appController";
import { APP_SCORING_STRATEGY_MAP, APP_TYPE_MAP } from "@/constant/app";

interface Props {
  appId: string;
}

const props = withDefaults(defineProps<Props>(), {
  appId: "",
});

const oldApp = ref<API.AppVO>({});

/**
 * 加载数据
 */
const loadData = async () => {
  if (!props.appId) {
    return;
  }
  const res = await getAppVoByIdUsingGet({
    id: props.appId as any,
  });
  if (res.data.code === 0 && res.data.data) {
    oldApp.value = res.data.data;
    form.value = res.data.data;
  } else {
    message.error("获取数据失败，" + res.data.message);
  }
};

/**
 * 获取旧数据
 */
watchEffect(() => {
  loadData();
});

/**
 * 表单信息
 */
const form = ref({
  appName: "",
  appDesc: "",
  appType: 0,
  scoringStrategy: 0,
  appIcon: "",
} as API.AppAddRequest);

const router = useRouter();
const loginUserStore = useLoginUserStore();

/**
 * 提交表单
 * @param data
 */
const handleSubmit = async () => {
  let res: any;
  //判断是否为修改
  if (props.appId) {
    //如果为修改
    res = await editAppUsingPost({
      id: props.appId as any,
      ...form.value,
    });
  } else {
    //不为修改则是创建
    res = await addAppUsingPost(form.value);
  }
  if (res.data.code === 0) {
    message.success("操作成功,3秒后跳转至应用详情页");
    setTimeout(() => {
      router.push(`/app/detail/${props.appId || res.data.data}`);
    }, 3000);
  } else {
    message.error("操作失败，" + res.data.message);
  }
};
</script>
