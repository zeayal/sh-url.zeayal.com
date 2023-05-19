 

const App = () => {

  const [url, setUrl] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [created, setCreated] = React.useState("");

  const onSubmit = async () => {
    console.log("onSubmit", url, slug);
    const params = { url, slug };
    console.log("params", params);
    if (!params.url.trim().length) {
      PNotify.error({
        title: "错误提示",
        text: '请输入要转换的 url',
      });
      return;
    }
    const res = await fetch("/url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }).then((res) => res.json());

    console.log("res", res);

    if (res.status === 0) {
      const newCreated = `${location.origin}/${res.data.slug}`;
      setCreated(newCreated)
    } else {
      PNotify.error({
        title: "错误提示",
        text: res.message,
      });
    }
  }


  const handleOnUrlChange = (e) => {
    console.log('e', e.target.value)
    setUrl(e.target.value)
  }


  const handleOnSlugChange  = (e) => {
    setSlug(e.target.value)
  }

  return (
      <section className="flex flex-col border-2 border-purple-500 p-10 shadow-md w-1/2 m-auto">
        <header className="text-xl text-white mb-4">
          <h2>短连接生成器</h2>
        </header>

        <form className="flex flex-col">
          <div className="flex">
            <label className="inline-block bg-purple-500 text-white w-36 p-3 px-5 rounded-l ">长链接</label>
            <input className="p-3 px-5 focus:outline-none text-base w-full" onChange={handleOnUrlChange} />
          </div>
          <div className="mt-2 flex">
            <label className="inline-block bg-purple-500 text-white w-36 p-3 px-5 rounded-l"  onChange={handleOnSlugChange}>指定路径</label>
            <input className="p-3 px-5 focus:outline-none  w-full" />
          </div>
          <button className="mt-4 bg-purple-500 hover:bg-purple-700 focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer" onClick={onSubmit}>
            点击生成
          </button>
        </form>

        <div className="text-white mt-12 p-2">
          <p>短链接: <a className="hover:bg-pruple-500 text-green-500 " target="_blank">{ created }</a></p>
      </div>
    </section >
  )
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);

 
