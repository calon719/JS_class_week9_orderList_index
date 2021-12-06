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

// data
let orderData;

// event
orderTable.addEventListener('click', deleteOrder);
orderTable.addEventListener('click', isPaid);

init();

function init() {
  getOrderData();
};

function getOrderData() {
  axios.get(`${baseUrl}/${adminOrder_path}`, tokenObj).then(function (res) {
    orderData = res.data.orders;
    renderOrderList();
    renderChart();
  }).catch(function (err) {
    let errData = err.response.data;
    if (!errData.status) {
      console.log(errData.message);
    };
  });
};

function renderOrderList() {
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
};

function deleteOrder(e) {
  let targetJs = e.target.dataset.js;
  if (targetJs !== 'deleteOrderBtn' && targetJs !== 'deleteAllOrderBtn') {
    return
  } else if (targetJs === 'deleteAllOrderBtn') {
    axios.delete(`${baseUrl}/${adminOrder_path}`, tokenObj).then(function (res) {
      getOrderData();
    }).catch(function (err) {
      let errData = err.response.data;
      if (!errData.status) {
        console.log(errData.message);
      };
    });
  } else if (targetJs === 'deleteOrderBtn') {
    let id = e.target.dataset.id;
    axios.delete(`${baseUrl}/${adminOrder_path}/${id}`, tokenObj).then(function (res) {
      getOrderData();
    }).catch(function (err) {
      let errData = err.response.data;
      if (!errData.status) {
        console.log(errData.message);
      };
    });
  };
};

function isPaid(e) {
  e.preventDefault();
  if (e.target.dataset.js !== 'paidBtn') { return }
  let id = e.target.dataset.id;
  let obj = {
    "data": {
      "id": id,
      "paid": true
    }
  };
  axios.put(`${baseUrl}/${adminOrder_path}`, obj, tokenObj).then(function (res) {
    console.log(res);
    getOrderData();
  }).catch(function (err) {
    let errData = err.response.data;
    if (!errData.status) {
      console.log(errData.message);
    };
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

  let newAry = ary.sort(function (a, b) {
    if (a.revenue > b.revenue) return -1; // true 時後面的數放在前面
    if (a.revenue < b.revenue) return 1; // true 時前面得數放在前面
  });

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

  // 根據順序上圖表顏色
  chartData.push([otherObj.title, otherObj.revenue]);
  chartData = chartData.sort(function (a, b) {
    if (a[1] > b[1]) return -1;
    if (a[1] < b[1]) return 1;
  });

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
}


