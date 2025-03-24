<template>
  <a-button type="primary" @click="handleClick">AI生成题目</a-button>
  <a-drawer
    :width="340"
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    unmountOnClose
  >
    <template #title> AI生成题目 </template>
    <div>
      <a-form
        label-align="left"
        auto-label-width
        :model="form"
        @submit="handleSubmit"
      >
        <a-form-item label="应用id">
          {{ appId }}
        </a-form-item>
        <a-form-item field="questionNumber" label="题目数量">
          <a-input-number
            min="0"
            max="20"
            v-model="form.questionNumber"
            placeholder="请输入题目数量"
          />
        </a-form-item>
        <a-form-item field="optionNumber" label="选项数量">
          <a-input-number
            min="0"
            max="6"
            v-model="form.optionNumber"
            placeholder="请输入选项数量"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button
              :loading="submitting"
              type="primary"
              html-type="submit"
              style="width: 120px"
            >
              {{ submitting ? "生成中..." : "一键生成" }}
            </a-button>
            <a-button
              :loading="sseSubmitting"
              style="width: 120px"
              @click="handleSSESubmit"
            >
              {{ sseSubmitting ? "生成中..." : "实时生成" }}
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import API from "@/api";
import message from "@arco-design/web-vue/es/message";
import { aiGenerateQuestionUsingPost } from "@/api/questionController";

interface Props {
  appId: string;
  onSuccess?: (result: API.QuestionContentDTO[]) => void;
  onSSESuccess?: (result: API.QuestionContentDTO) => void;
  onSSEStart?: (event: any) => void;
  onSSEClose?: (event: any) => void;
}

const props = withDefaults(defineProps<Props>(), {
  appId: () => {
    return "";
  },
});

const form = reactive({
  optionNumber: 2,
  questionNumber: 10,
}) as API.AiGenerateQuestionRequest;

const visible = ref(false);
const submitting = ref(false);
const sseSubmitting = ref(false);

const handleClick = () => {
  visible.value = true;
};
const handleOk = () => {
  visible.value = false;
};
const handleCancel = () => {
  visible.value = false;
};

/**
 * 提交表单
 * @param data
 */
const handleSubmit = async () => {
  if (!props.appId) {
    message.error("请先创建应用");
    return;
  }
  submitting.value = true;
  const res = await aiGenerateQuestionUsingPost({
    appId: props.appId as any,
    ...form,
  });
  if (res.data.code === 0 && res.data.data.length > 0) {
    if (props.onSuccess) {
      props.onSuccess(res.data.data);
    } else {
      message.success("生成题目成功");
    }
    //关闭抽屉
    handleCancel();
  } else {
    message.error("操作失败，" + res.data.message);
  }
  submitting.value = false;
};

/**
 * 实时生成,sse 流式返回
 */
const handleSSESubmit = async () => {
  if (!props.appId) {
    message.error("请先创建应用");
    return;
  }
  sseSubmitting.value = true;

  // 创建sse请求
  const eventSource = new EventSource(
    // 后端地址
    "http://localhost:8101/api/question/ai_generate/sse" +
      `?appId=${props.appId}&optionNumber=${form.optionNumber}&questionNumber=${form.questionNumber}`
  );
  let first = true;

  // 使用addEventListener监听'message'事件
  eventSource.addEventListener('message', (event) => {
    if (first) {
      props.onSSEStart?.(event);
      handleCancel();
      first = !first;
    }
    
    console.log("收到消息:", event.data);
    
    try {
      // 直接解析JSON字符串
      const questionObj = JSON.parse(event.data);
      // 调用回调函数处理对象
      props.onSSESuccess?.(questionObj);
    } catch (error) {
      console.error("解析失败:", error, event.data);
    }
  });

  // 错误处理
  eventSource.addEventListener('error', (event) => {
    if (event.eventPhase === EventSource.CLOSED) {
      console.log("正常关闭连接");
      eventSource.close();
      props.onSSEClose?.(event);
    } else {
      console.error("SSE连接错误", event);
      eventSource.close();
      message.error("生成失败，请重试");
    }
    sseSubmitting.value = false;
  });

  // 完成处理
  eventSource.addEventListener('complete', (event) => {
    console.log("SSE连接完成", event);
    eventSource.close();
    props.onSSEClose?.(event);
    sseSubmitting.value = false;
  });
};
</script>

<style scoped></style>
