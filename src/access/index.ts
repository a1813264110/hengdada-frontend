import router from "@/router";
import { useLoginUserStore } from "@/store/userStore";
import ACCESS_ENUM from "./accessEnum";
import checkAccess from "./checkAccess";

//进入页面之前先进行权限校验

router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore();
  let loginUser = loginUserStore.loginUser;
  //如果之前未尝试获取用户登录信息，才自动登录
  if (!loginUser || !loginUser.userRole) {
    //加await是为了等待用户成功登录并获取到值后，再执行后续操作
    await loginUserStore.fetchLoginUser();
    loginUser = loginUserStore.loginUser;
  }

  console.log("登陆用户信息", loginUser);
  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN;
  // 要跳转的页面必须要登陆
  if (needAccess !== ACCESS_ENUM.NOT_LOGIN) {
    // 如果没登陆，跳转到登录页面
    if (
      !loginUser ||
      !loginUser.userRole ||
      loginUser.userRole === ACCESS_ENUM.NOT_LOGIN
    ) {
      next(`/user/login?redirect=${to.fullPath}`);
      return;
    }
    // 如果已经登陆了，但是权限不足，那么跳转到无权限页面
    if (!checkAccess(loginUser, needAccess)) {
      next("/noAuth");
      return;
    }
  }
  next();
});
