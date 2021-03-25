const app = Vue.createApp({
  data() {
    return { url: "", slug: "", created: "" };
  },
  created() {
    // this points to the vm instance
  },
  methods: {
    async onSubmit() {
      console.log("onSubmit", this.url, this.slug);
      const { url, slug } = this;
      const params = { url, slug };
      console.log("params", params);
      if (!params.url.trim().length) {
        PNotify.error({
          title: "错误提示",
          text: '请输入要转换的 url',
        });
        return;
      }
      const res = await fetch("http://localhost:1323/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      }).then((res) => res.json());

      console.log("res", res);

      if (res.status === 0) {
        this.created = `${location.origin}/${res.data.slug}`;
      } else {
        PNotify.error({
          title: "错误提示",
          text: res.message,
        });
      }
    },
  },
});

const vm = app.mount("#root");
