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
var orderTable = document.querySelector('.orderTable');
var popUpDiv = document.querySelector('[data-js="popUpDiv"]');
var chartEl = document.querySelector('#productRevenue'); // data

var orderData; // event

orderTable.addEventListener('click', doubleCheckMsg);
init();

function init() {
  getOrderData();
}

;

function getOrderData() {
  axios.get("".concat(baseUrl, "/").concat(adminOrder_path), tokenObj).then(function (res) {
    orderData = res.data.orders;
    renderOrderList();
  })["catch"](function (err) {
    var errData = err.response.data;

    if (!errData.status) {
      console.log(errData.message);
    }

    ;
  }).then(function () {
    var loadingAnimation = document.querySelector('[data-loading]');
    loadingAnimation.setAttribute('data-loading', false);
  });
}

;

function renderOrderList() {
  var msg = document.querySelector('p[data-hasOrder]');

  if (orderData.length === 0) {
    msg.setAttribute('data-hasOrder', true);
    orderTable.setAttribute('data-hasOrder', false);
    chartEl.setAttribute('data-hasOrder', false);
  } else {
    msg.setAttribute('data-hasOrder', false);
    orderTable.setAttribute('data-hasOrder', true);
    chartEl.setAttribute('data-hasOrder', true);
    var str = '';
    orderData.forEach(function (item) {
      var listStr = '';
      item.products.forEach(function (item) {
        listStr += "<li>".concat(item.title, "</li>");
      });
      var date = new Date(item.createdAt * 1000).toLocaleDateString();
      str += "\n        <tr class=\"border-b\">\n          <td class=\"p-1.5 border-r\">".concat(item.id, "</td>\n          <td class=\"p-1.5 border-r\">\n            <ul>\n              <li>").concat(item.user.name, "</li>\n              <li>").concat(item.user.tel, "</li>\n            </ul>\n          </td>\n          <td class=\"p-1.5 border-r\">").concat(item.user.address, "</td>\n          <td class=\"p-1.5 border-r\">").concat(item.user.email, "</td>\n          <td class=\"p-1.5 border-r\">\n            <ul>").concat(listStr, "</ul>\n          </td>\n          <td class=\"p-1.5 border-r text-center\">").concat(date, "</td>\n          <td class=\"p-1.5 border-r text-center\">\n            <a class=\"text-info underline\" href=\"#\" data-id=\"").concat(item.id, "\" data-js=\"paidBtn\">").concat(item.paid ? '已處理' : '未處理', "</a>\n          </td>\n          <td class=\"p-1.5 text-center\">\n            <button class=\"text-white bg-danger hover:opacity-70 rounded py-1.5 px-2.5\" data-js=\"deleteOrderBtn\" data-id=\"").concat(item.id, "\">\u522A\u9664</button>\n          </td>\n        </tr>\n    ");
    });
    orderList.innerHTML = str;
    renderChart();
  }

  ;
}

;

function deleteOrder(id, btnProp) {
  if (btnProp === 'deleteAll') {
    axios["delete"]("".concat(baseUrl, "/").concat(adminOrder_path), tokenObj).then(function (res) {
      getOrderData();
    })["catch"](function (err) {
      var errData = err.response.data;

      if (!errData.status) {
        console.log(errData.message);
      }

      ;
    }).then(function () {
      popUpDiv.setAttribute('data-popUp', false);
    });
  } else if (btnProp === 'deleteOne') {
    axios["delete"]("".concat(baseUrl, "/").concat(adminOrder_path, "/").concat(id), tokenObj).then(function (res) {
      getOrderData();
    })["catch"](function (err) {
      var errData = err.response.data;

      if (!errData.status) {
        console.log(errData.message);
      }

      ;
    }).then(function () {
      popUpDiv.setAttribute('data-popUp', false);
    });
  }

  ;
}

;

function isPaid(id, status) {
  var obj = {
    "data": {
      "id": id,
      "paid": !status
    }
  };
  axios.put("".concat(baseUrl, "/").concat(adminOrder_path), obj, tokenObj).then(function (res) {
    getOrderData();
  })["catch"](function (err) {
    var errData = err.response.data;

    if (!errData.status) {
      console.log(errData.message);
    }

    ;
  }).then(function () {
    popUpDiv.setAttribute('data-popUp', false);
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

;

function doubleCheckMsg(e) {
  e.preventDefault();
  var targetJs = e.target.dataset.js;

  if (targetJs !== 'deleteOrderBtn' && targetJs !== 'deleteAllOrderBtn' && targetJs !== 'paidBtn') {
    return;
  }

  ;
  var popUpMsg = document.querySelector('[data-js="popUpMsg"]');
  var orderId;
  var target;
  var str = '';
  popUpDiv.setAttribute('data-popUp', true);

  if (targetJs == 'deleteAllOrderBtn') {
    str += "\n      <div class=\"popUp-body pr-16 mb-2\">\n      <p class=\"text-lg pb-1.5\">\u78BA\u5B9A\u8981\u522A\u9664<strong>\u5168\u90E8\u8A02\u55AE</strong>\u55CE\uFF1F</p>\n      </div>\n      <div class=\"popUp-footer flex justify-end\">\n      <button class=\"mr-2 py-2 px-3 bg-gray-400 text-white rounded hover:opacity-75\" data-js=\"dblCheckBtn\" data-dblCheckBtn=\"false\">\u53D6\u6D88</button>\n      <button class=\"py-2 px-3 bg-danger text-white rounded hover:opacity-75\" data-prop=\"deleteAll\" data-js=\"dblCheckBtn\" data-dblCheckBtn=\"true\">\u522A\u9664</button>\n      </div>\n      ";
  } else {
    orderId = e.target.dataset.id;
    target = orderData.filter(function (item) {
      return item.id == orderId;
    });
    target = target[0];
    var productStr = '';
    target.products.forEach(function (item) {
      productStr += "<li>".concat(item.title, "</li>");
    });

    if (targetJs == 'deleteOrderBtn') {
      str += "\n        <div class=\"popUp-body p-4 border-b\">\n          <p class=\"text-lg pb-1.5\">\u78BA\u5B9A\u8981\u522A\u9664\u4EE5\u4E0B\u8A02\u55AE\u55CE\uFF1F</p>\n          <hr>\n          <ul class=\"mt-4\"}>\n            <li>\u8A02\u55AE\u7DE8\u865F\uFF1A".concat(target.id, "</li>\n            <li>\u9867\u5BA2\u59D3\u540D\uFF1A").concat(target.user.name, "</li>\n            <li>\n              \u8CFC\u8CB7\u7522\u54C1\uFF1A\n              <ul class=\"list-disc ml-8\">").concat(productStr, "</ul>\n            </li>\n            <li>\u7E3D\u91D1\u984D\uFF1A").concat(target.total, "\n        </div>\n        <div class=\"popUp-footer flex justify-end py-4\">\n          <button class=\"mr-2 py-2 px-3 bg-gray-400 text-white rounded hover:opacity-75\" data-js=\"dblCheckBtn\" data-dblCheckBtn=\"false\">\u53D6\u6D88</button>\n          <button class=\"py-2 px-3 bg-danger text-white rounded hover:opacity-75\" data-prop=\"deleteOne\" data-js=\"dblCheckBtn\" data-dblCheckBtn=\"true\">\u522A\u9664</button>\n        </div>\n      ");
    } else if (targetJs === 'paidBtn') {
      str += "\n        <div class=\"popUp-body p-4 border-b\">\n          <p class=\"text-lg pb-1.5\">\n            \u78BA\u5B9A\u8981\u5C07\u4EE5\u4E0B\u8A02\u55AE\u7684\u72C0\u614B\u5F9E <span class=\"text-info underline\">".concat(target.paid ? '已處理' : '未處理', "</span> \u6539\u6210 \n            <span class=\"text-info underline\">").concat(target.paid ? '未處理' : '已處理', "</span> \u55CE\uFF1F\n          </p>\n          <hr>\n          <ul class=\"mt-4\"}>\n            <li>\u8A02\u55AE\u7DE8\u865F\uFF1A").concat(target.id, "</li>\n            <li>\u9867\u5BA2\u59D3\u540D\uFF1A").concat(target.user.name, "</li>\n            <li>\n              \u8CFC\u8CB7\u7522\u54C1\uFF1A\n              <ul class=\"list-disc ml-8\">").concat(productStr, "</ul>\n            </li>\n            <li>\u7E3D\u91D1\u984D\uFF1A").concat(target.total, "\n        </div>\n        <div class=\"popUp-footer flex justify-end py-4\">\n          <button class=\"mr-2 py-2 px-3 bg-gray-400 text-white rounded hover:opacity-75\" data-js=\"dblCheckBtn\" data-dblCheckBtn=\"false\">\u53D6\u6D88</button>\n          <button class=\"py-2 px-3 bg-danger text-white rounded hover:opacity-75\" data-prop=\"changePaid\" data-js=\"dblCheckBtn\" data-dblCheckBtn=\"true\">\u78BA\u5B9A</button>\n        </div>\n      ");
    }

    ;
  }

  ;
  popUpMsg.innerHTML = str;
  popUpDiv.addEventListener('click', function (e) {
    var targetJs = e.target.dataset.js;
    var btnProp = e.target.dataset.prop;

    if (targetJs !== 'popUpDiv' && targetJs !== 'dblCheckBtn') {
      return;
    } else if (Object.is(popUpDiv, e.target) || e.target.dataset.dblcheckbtn === 'false') {
      popUpDiv.setAttribute('data-popUp', false);
    } else if (btnProp === 'changePaid') {
      isPaid(orderId, target.paid);
    } else if (btnProp === 'deleteOne' || btnProp === 'deleteAll') {
      deleteOrder(orderId, btnProp);
    }

    ;
  });
}

;
//# sourceMappingURL=all.js.map
