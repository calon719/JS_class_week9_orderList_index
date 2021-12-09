// 後台
// API
const api_path = 'calon';
const token = 'zqvqaKYuHkZmVjBBRE9EepP5KF13';
const baseUrl = 'https://livejs-api.hexschool.io';
const adminOrder_path = `api/livejs/v1/admin/${api_path}/orders`;
const tokenObj = {
  headers: {
    'Authorization': token
  }
};

// DOM
const orderList = document.querySelector('[data-js="orderList"]');
const orderTable = document.querySelector('.orderTable');
const popUpDiv = document.querySelector('[data-js="popUpDiv"]');
const chartEl = document.querySelector('#productRevenue');

// data
let orderData;

// event
orderTable.addEventListener('click', doubleCheckMsg);

init();

function init() {
  getOrderData();
};

function getOrderData() {
  axios.get(`${baseUrl}/${adminOrder_path}`, tokenObj).then(function (res) {
    orderData = res.data.orders;
    renderOrderList();
  }).catch(function (err) {
    let errData = err.response.data;
    if (!errData.status) {
      console.log(errData.message);
    };
  }).then(function () {
    const loadingAnimation = document.querySelector('[data-loading]');
    loadingAnimation.setAttribute('data-loading', 'hidden');
  });
};

function renderOrderList() {
  const msg = document.querySelector('p[data-hasOrder]');
  if (orderData.length === 0) {
    msg.setAttribute('data-hasOrder', 'show');
    orderTable.setAttribute('data-hasOrder', 'hidden');
    chartEl.setAttribute('data-hasOrder', 'hidden');
  } else {
    msg.setAttribute('data-hasOrder', 'hidden');
    orderTable.setAttribute('data-hasOrder', 'show');
    chartEl.setAttribute('data-hasOrder', 'show');

    let str = '';
    orderData.forEach(function (item) {
      let listStr = ''
      item.products.forEach(function (item) {
        listStr += `<li>${item.title}</li>`
      });
      let date = new Date(item.createdAt * 1000).toLocaleDateString();
      str += `
        <tr class="border-b">
          <td class="p-1.5 border-r">${item.id}</td>
          <td class="p-1.5 border-r">
            <ul>
              <li>${item.user.name}</li>
              <li>${item.user.tel}</li>
            </ul>
          </td>
          <td class="p-1.5 border-r">${item.user.address}</td>
          <td class="p-1.5 border-r">${item.user.email}</td>
          <td class="p-1.5 border-r">
            <ul>${listStr}</ul>
          </td>
          <td class="p-1.5 border-r text-center">${date}</td>
          <td class="p-1.5 border-r text-center">
            <a class="text-info underline" href="#" data-id="${item.id}" data-js="paidBtn">${item.paid ? '已處理' : '未處理'}</a>
          </td>
          <td class="p-1.5 text-center">
            <button class="text-white bg-danger hover:opacity-70 rounded py-1.5 px-2.5" data-js="deleteOrderBtn" data-id="${item.id}">刪除</button>
          </td>
        </tr>
    `
    });
    orderList.innerHTML = str;
    renderChart();
  };
};

function deleteOrder(id, btnProp) {
  if (btnProp === 'deleteAll') {
    axios.delete(`${baseUrl}/${adminOrder_path}`, tokenObj).then(function (res) {
      getOrderData();
    }).catch(function (err) {
      let errData = err.response.data;
      if (!errData.status) {
        console.log(errData.message);
      };
    }).then(function () {
      popUpDiv.setAttribute('data-popUp', 'hidden');
    });
  } else if (btnProp === 'deleteOne') {
    axios.delete(`${baseUrl}/${adminOrder_path}/${id}`, tokenObj).then(function (res) {
      getOrderData();
    }).catch(function (err) {
      let errData = err.response.data;
      if (!errData.status) {
        console.log(errData.message);
      };
    }).then(function () {
      popUpDiv.setAttribute('data-popUp', 'hidden');
    });
  };
};

function changePaid(id, status) {
  let obj = {
    "data": {
      "id": id,
      "paid": !status
    }
  };
  axios.put(`${baseUrl}/${adminOrder_path}`, obj, tokenObj).then(function (res) {
    getOrderData();
  }).catch(function (err) {
    let errData = err.response.data;
    if (!errData.status) {
      console.log(errData.message);
    };
  }).then(function () {
    popUpDiv.setAttribute('data-popUp', 'hidden');
  });
};

function renderChart() {
  let ary = [];

  orderData.forEach(function (item) {
    item.products.forEach(function (item) {
      let title = item.title;
      let totalPrice = item.price * item.quantity;
      let aryCheck = ary.some(function (product) { return product.title == title });

      if (ary.length === 0 || !aryCheck) {
        let obj = {};
        obj.title = title;
        obj.revenue = totalPrice;
        ary.push(obj);
      } else {
        ary.forEach(function (item) {
          if (item.title === title) {
            item.revenue += totalPrice;
          };
        });
      };
    });
  });

  let newAry = ary.sort(function (a, b) { return b.revenue - a.revenue });

  let otherObj = {
    title: '其他',
    revenue: 0
  };


  let chartData = [];
  newAry.forEach(function (item, index) {
    let chartAry = [];
    if (index < 3) {
      chartAry.push(item.title, item.revenue);
      chartData.push(chartAry);
    } else {
      otherObj.revenue += item.revenue;
    };
  });

  chartData.push([otherObj.title, otherObj.revenue]);

  // 根據順序上圖表顏色
  chartData = chartData.sort(function (a, b) { return b[1] - a[1] });

  const colorData = ['#301E5F', '#5434A7', '#9D7FEA', '#DACBFF'];
  let colorObj = {};
  chartData.forEach(function (item, index) {
    colorObj[item[0]] = colorData[index];
  });

  let chart = c3.generate({
    bindto: '#productRevenue',
    data: {
      columns: chartData,
      type: 'pie',
      colors: colorObj
    },
    size: {
      height: 400,
      width: 400
    },
  });
};

function doubleCheckMsg(e) {
  e.preventDefault();
  let targetJs = e.target.dataset.js;
  if (targetJs !== 'deleteOrderBtn' && targetJs !== 'deleteAllOrderBtn' && targetJs !== 'paidBtn') { return };

  const popUpMsg = document.querySelector('[data-js="popUpMsg"]');
  let orderId;
  let target;
  let str = '';
  popUpDiv.setAttribute('data-popUp', 'show');

  if (targetJs == 'deleteAllOrderBtn') {
    str += `
      <div class="popUp-body pr-16 mb-2">
      <p class="text-lg pb-1.5">確定要刪除<strong>全部訂單</strong>嗎？</p>
      </div>
      <div class="popUp-footer flex justify-end">
      <button class="mr-2 py-2 px-3 bg-gray-400 text-white rounded hover:opacity-75" data-js="dblCheckBtn" data-dblCheckBtn="false">取消</button>
      <button class="py-2 px-3 bg-danger text-white rounded hover:opacity-75" data-prop="deleteAll" data-js="dblCheckBtn" data-dblCheckBtn="true">刪除</button>
      </div>
      `;
  } else {
    orderId = e.target.dataset.id;
    target = orderData.filter(function (item) { return item.id == orderId });
    target = target[0];
    let productStr = '';
    target.products.forEach(function (item) {
      productStr += `<li>${item.title}</li>`;
    });

    if (targetJs == 'deleteOrderBtn') {
      str += `
        <div class="popUp-body p-4 border-b">
          <p class="text-lg pb-1.5">確定要刪除以下訂單嗎？</p>
          <hr>
          <ul class="mt-4"}>
            <li>訂單編號：${target.id}</li>
            <li>顧客姓名：${target.user.name}</li>
            <li>
              購買產品：
              <ul class="list-disc ml-8">${productStr}</ul>
            </li>
            <li>總金額：${target.total}
        </div>
        <div class="popUp-footer flex justify-end py-4">
          <button class="mr-2 py-2 px-3 bg-gray-400 text-white rounded hover:opacity-75" data-js="dblCheckBtn" data-dblCheckBtn="false">取消</button>
          <button class="py-2 px-3 bg-danger text-white rounded hover:opacity-75" data-prop="deleteOne" data-js="dblCheckBtn" data-dblCheckBtn="true">刪除</button>
        </div>
      `;
    } else if (targetJs === 'paidBtn') {
      str += `
        <div class="popUp-body p-4 border-b">
          <p class="text-lg pb-1.5">
            確定要將以下訂單的狀態從 <span class="text-info underline">${target.paid ? '已處理' : '未處理'}</span> 更改為 
            <span class="text-info underline">${target.paid ? '未處理' : '已處理'}</span> 嗎？
          </p>
          <hr>
          <ul class="mt-4"}>
            <li>訂單編號：${target.id}</li>
            <li>顧客姓名：${target.user.name}</li>
            <li>
              購買產品：
              <ul class="list-disc ml-8">${productStr}</ul>
            </li>
            <li>總金額：${target.total}
        </div>
        <div class="popUp-footer flex justify-end py-4">
          <button class="mr-2 py-2 px-3 bg-gray-400 text-white rounded hover:opacity-75" data-js="dblCheckBtn" data-dblCheckBtn="false">取消</button>
          <button class="py-2 px-3 bg-danger text-white rounded hover:opacity-75" data-prop="changePaid" data-js="dblCheckBtn" data-dblCheckBtn="true">確定</button>
        </div>
      `;
    };
  };
  popUpMsg.innerHTML = str;
  popUpDiv.addEventListener('click', function (e) {
    let targetJs = e.target.dataset.js;
    let btnProp = e.target.dataset.prop;
    if (targetJs !== 'popUpDiv' && targetJs !== 'dblCheckBtn') {
      return;
    } else if (Object.is(popUpDiv, e.target) || e.target.dataset.dblcheckbtn === 'false') {
      popUpDiv.setAttribute('data-popUp', 'hidden');
    } else if (btnProp === 'changePaid') {
      let isPaid = target.paid;
      changePaid(orderId, isPaid);
    } else if (btnProp === 'deleteOne' || btnProp === 'deleteAll') {
      deleteOrder(orderId, btnProp);
    };
  });
};
