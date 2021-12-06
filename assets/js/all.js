"use strict";

// 後台
// API
var api_path = 'calon';
var token = 'zqvqaKYuHkZmVjBBRE9EepP5KF13';
var baseUrl = 'https://livejs-api.hexschool.io';
var adminOrder_path = "api/livejs/v1/admin/".concat(api_path, "/orders");
var tokenObj = {
  headers: {
    'Authorization': token
  }
}; // DOM

var orderList = document.querySelector('[data-js="orderList"]');
var orderTable = document.querySelector('.orderTable'); // data

var orderData; // event

orderTable.addEventListener('click', deleteOrder);
orderTable.addEventListener('click', isPaid);
init();

function init() {
  getOrderData();
}

;

function getOrderData() {
  axios.get("".concat(baseUrl, "/").concat(adminOrder_path), tokenObj).then(function (res) {
    orderData = res.data.orders;
    renderOrderList();
    renderChart();
  })["catch"](function (err) {
    var errData = err.response.data;

    if (!errData.status) {
      console.log(errData.message);
    }

    ;
  });
}

;

function renderOrderList() {
  var str = '';
  orderData.forEach(function (item) {
    var listStr = '';
    item.products.forEach(function (item) {
      listStr += "<li>".concat(item.title, "</li>");
    });
    var date = new Date(item.createdAt * 1000).toLocaleDateString();
    str += "\n      <tr class=\"border-b\">\n        <td class=\"p-1.5 border-r\">".concat(item.id, "</td>\n        <td class=\"p-1.5 border-r\">\n          <ul>\n            <li>").concat(item.user.name, "</li>\n            <li>").concat(item.user.tel, "</li>\n          </ul>\n        </td>\n        <td class=\"p-1.5 border-r\">").concat(item.user.address, "</td>\n        <td class=\"p-1.5 border-r\">").concat(item.user.email, "</td>\n        <td class=\"p-1.5 border-r\">\n          <ul>").concat(listStr, "</ul>\n        </td>\n        <td class=\"p-1.5 border-r text-center\">").concat(date, "</td>\n        <td class=\"p-1.5 border-r text-center\">\n          <a class=\"text-info underline\" href=\"#\" data-id=\"").concat(item.id, "\" data-js=\"paidBtn\">").concat(item.paid ? '已處理' : '未處理', "</a>\n        </td>\n        <td class=\"p-1.5 text-center\">\n          <button class=\"text-white bg-danger hover:opacity-70 rounded py-1.5 px-2.5\" data-js=\"deleteOrderBtn\" data-id=\"").concat(item.id, "\">\u522A\u9664</button>\n        </td>\n      </tr>\n  ");
  });
  orderList.innerHTML = str;
}

;

function deleteOrder(e) {
  var targetJs = e.target.dataset.js;

  if (targetJs !== 'deleteOrderBtn' && targetJs !== 'deleteAllOrderBtn') {
    return;
  } else if (targetJs === 'deleteAllOrderBtn') {
    axios["delete"]("".concat(baseUrl, "/").concat(adminOrder_path), tokenObj).then(function (res) {
      getOrderData();
    })["catch"](function (err) {
      var errData = err.response.data;

      if (!errData.status) {
        console.log(errData.message);
      }

      ;
    });
  } else if (targetJs === 'deleteOrderBtn') {
    var id = e.target.dataset.id;
    axios["delete"]("".concat(baseUrl, "/").concat(adminOrder_path, "/").concat(id), tokenObj).then(function (res) {
      getOrderData();
    })["catch"](function (err) {
      var errData = err.response.data;

      if (!errData.status) {
        console.log(errData.message);
      }

      ;
    });
  }

  ;
}

;

function isPaid(e) {
  e.preventDefault();

  if (e.target.dataset.js !== 'paidBtn') {
    return;
  }

  var id = e.target.dataset.id;
  var obj = {
    "data": {
      "id": id,
      "paid": true
    }
  };
  axios.put("".concat(baseUrl, "/").concat(adminOrder_path), obj, tokenObj).then(function (res) {
    console.log(res);
    getOrderData();
  })["catch"](function (err) {
    var errData = err.response.data;

    if (!errData.status) {
      console.log(errData.message);
    }

    ;
  });
}

;

function renderChart() {
  var ary = [];
  orderData.forEach(function (item) {
    item.products.forEach(function (item) {
      var title = item.title;
      var totalPrice = item.price * item.quantity;
      var aryCheck = ary.some(function (product) {
        return product.title == title;
      });

      if (ary.length === 0 || !aryCheck) {
        var obj = {};
        obj.title = title;
        obj.revenue = totalPrice;
        ary.push(obj);
      } else {
        ary.forEach(function (item) {
          if (item.title === title) {
            item.revenue += totalPrice;
          }

          ;
        });
      }

      ;
    });
  });
  var newAry = ary.sort(function (a, b) {
    if (a.revenue > b.revenue) return -1; // true 時後面的數放在前面

    if (a.revenue < b.revenue) return 1; // true 時前面得數放在前面
  });
  var otherObj = {
    title: '其他',
    revenue: 0
  };
  var chartData = [];
  newAry.forEach(function (item, index) {
    var chartAry = [];

    if (index < 3) {
      chartAry.push(item.title, item.revenue);
      chartData.push(chartAry);
    } else {
      otherObj.revenue += item.revenue;
    }

    ;
  }); // 根據順序上圖表顏色

  chartData.push([otherObj.title, otherObj.revenue]);
  chartData = chartData.sort(function (a, b) {
    if (a[1] > b[1]) return -1;
    if (a[1] < b[1]) return 1;
  });
  var colorData = ['#301E5F', '#5434A7', '#9D7FEA', '#DACBFF'];
  var colorObj = {};
  chartData.forEach(function (item, index) {
    colorObj[item[0]] = colorData[index];
  });
  var chart = c3.generate({
    bindto: '#productRevenue',
    data: {
      columns: chartData,
      type: 'pie',
      colors: colorObj
    },
    size: {
      height: 400,
      width: 400
    }
  });
}
//# sourceMappingURL=all.js.map
