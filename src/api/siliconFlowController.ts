// @ts-ignore
/* eslint-disable */
import request from "@/request";

/** chat POST /api/siliconflow/chat */
export async function chatUsingPost(
  body: API.ChatRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString_>("/api/siliconflow/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** chatCreative POST /api/siliconflow/chat/creative */
export async function chatCreativeUsingPost(
  body: API.ChatRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString_>("/api/siliconflow/chat/creative", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** chatStable POST /api/siliconflow/chat/stable */
export async function chatStableUsingPost(
  body: API.ChatRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString_>("/api/siliconflow/chat/stable", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
