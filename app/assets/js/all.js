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
const changeChartBtnDiv = document.querySelector('[data-js="changeChartBtnDiv"]');
const chartSection = document.querySelector('.productChart');
const orderList = document.querySelector('[data-js="orderList"]');
const orderTable = document.querySelector('.orderTable');
const popUpDiv = document.querySelector('[data-js="popUpDiv"]');

// data
let orderData = [];

// event
changeChartBtnDiv.addEventListener('click', changeChart);
orderTable.addEventListener('click', doubleCheckMsg);

init();

function init() {
  getOrderData();
};

function getOrderData() {
  axios.get(`${baseUrl}/${adminOrder_path}`, tokenObj).then(res => {
    orderData = res.data.orders;
    renderOrderList();
  }).catch(err => {
    let errData = err.response.data;
    if (!errData.status) {
      console.log(errData.message);
    };
  }).then(() => {
    const loadingAnimation = document.querySelector('[data-loading]');
    loadingAnimation.setAttribute('data-loading', 'hidden');
  });
};

function renderOrderList() {
  const msg = document.querySelector('p[data-hasOrder]');
  if (orderData.length === 0) {
    msg.setAttribute('data-hasOrder', 'show');
    orderTable.setAttribute('data-hasOrder', 'hidden');
    chartSection.setAttribute('data-hasOrder', 'hidden');
  } else {
    msg.setAttribute('data-hasOrder', 'hidden');
    orderTable.setAttribute('data-hasOrder', 'show');
    chartSection.setAttribute('data-hasOrder', 'show');

    let str = '';
    orderData.forEach(item => {
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
    axios.delete(`${baseUrl}/${adminOrder_path}`, tokenObj).then(res => {
      orderData = res.data.orders;
      renderOrderList();
    }).catch(err => {
      let errData = err.response.data;
      if (!errData.status) {
        console.log(errData.message);
      };
    }).then(() => {
      popUpDiv.setAttribute('data-popUp', 'hidden');
    });
  } else if (btnProp === 'deleteOne') {
    axios.delete(`${baseUrl}/${adminOrder_path}/${id}`, tokenObj).then(res => {
      orderData = res.data.orders;
      renderOrderList();
    }).catch(err => {
      let errData = err.response.data;
      if (!errData.status) {
        console.log(errData.message);
      };
    }).then(() => {
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
  axios.put(`${baseUrl}/${adminOrder_path}`, obj, tokenObj).then(res => {
    orderData = res.data.orders;
    renderOrderList();
  }).catch(err => {
    let errData = err.response.data;
    if (!errData.status) {
      console.log(errData.message);
    };
  }).then(() => {
    popUpDiv.setAttribute('data-popUp', 'hidden');
  });
};

function renderChart() {
  let productTitleTemporaryAry = [];
  let categoryChartData = [];

  orderData.forEach(item => {
    filterChartData(item.products, 'category', categoryChartData);
    filterChartData(item.products, 'title', productTitleTemporaryAry);
  });

  // 處理 全品項營收比重 資料 
  // 從大排到小
  productTitleTemporaryAry = productTitleTemporaryAry.sort((a, b) => b.revenue - a.revenue);

  let productTitleChartData = [];
  // 收入排名四（含）之後的資料都算入「其他」
  let otherObj = {
    label: '其他',
    revenue: 0
  };
  productTitleTemporaryAry.forEach((item, index) => {
    if (index < 3) {
      productTitleChartData.push(item);
    } else {
      otherObj.revenue += item.revenue;
    };
  });
  if (productTitleTemporaryAry.length > 3) {
    productTitleChartData.push(otherObj);
  };

  categoryChartData = toC3PieChartFormat(categoryChartData);
  productTitleChartData = toC3PieChartFormat(productTitleChartData);


  console.log(productTitleChartData, categoryChartData)

  const productCategoryChart = c3.generate({
    bindto: '#categoryRevenueChart',
    data: {
      columns: categoryChartData.chartData,
      type: 'pie',
      colors: categoryChartData.chartColor
    },
    size: {
      height: 400,
      width: 400
    },
  });

  const productTitleChart = c3.generate({
    bindto: '#productRevenueChart',
    data: {
      columns: productTitleChartData.chartData,
      type: 'pie',
      colors: productTitleChartData.chartColor
    },
    size: {
      height: 400,
      width: 400
    },
  });
};

function filterChartData(ary, key, outputData) {
  ary.forEach(item => {
    const label = item[key];
    const totalPrice = item.price * item.quantity;
    const aryCheck = outputData.some(item => item.label === label);
    if (outputData.length === 0 || !aryCheck) {
      let obj = {};
      obj.label = label;
      obj.revenue = totalPrice;
      outputData.push(obj)
    } else {
      outputData.forEach(item => {
        item.revenue += totalPrice;
      });
    };
  });
};


// 整理成 C3.js Pie 格式 [['label_1', 數量], ['label_2', 數量], ....]
function toC3PieChartFormat(data) {
  // 由大排到小，chart 顏色要用
  data = data.sort((a, b) => b.revenue - a.revenue);
  let chartFormatData = {
    chartData: [],
    chartColor: {}
  };
  data.forEach(item => {
    let ary = [];
    ary.push(item.label, item.revenue);
    chartFormatData.chartData.push(ary);
  });

  // 根據順序上圖表顏色
  const colorData = ['#301E5F', '#5434A7', '#9D7FEA', '#DACBFF'];

  chartFormatData.chartData.forEach((item, index) => {
    if (data.length > 3) {
      chartFormatData.chartColor[item[0]] = colorData[index];
    } else {
      chartFormatData.chartColor[item[0]] = colorData[index + 1];
    };
  });

  return chartFormatData;
};

function changeChart(e) {
  const btnStatus = e.target.getAttribute('data-chartBtn');
  if (e.target.nodeName !== 'BUTTON' || btnStatus === 'active') { return };

  const chartName = e.target.getAttribute('data-chartName');
  const chartDivs = document.querySelectorAll('[data-chart]');
  const btns = document.querySelectorAll('[data-js="chartBtn"]');

  btns.forEach(item => {
    if (item.getAttribute('data-chartName') === chartName) {
      item.setAttribute('data-chartBtn', 'active');
    } else {
      item.setAttribute('data-chartBtn', 'default');
    }
  });

  chartDivs.forEach(item => {
    if (item.getAttribute('data-js') === chartName) {
      item.setAttribute('data-chart', 'show');
    } else {
      item.setAttribute('data-chart', 'hidden');
    }
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
    target = orderData.filter(item => item.id == orderId);
    target = target[0];
    let productStr = '';
    target.products.forEach(item => {
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
  popUpDiv.addEventListener('click', e => {
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
  }, { once: true });
};
