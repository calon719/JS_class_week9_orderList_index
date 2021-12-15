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

var changeChartBtnDiv = document.querySelector('[data-js="changeChartBtnDiv"]');
var chartSection = document.querySelector('.productChart');
var orderList = document.querySelector('[data-js="orderList"]');
var orderTable = document.querySelector('.orderTable');
var popUpDiv = document.querySelector('[data-js="popUpDiv"]'); // data

var orderData = []; // event

changeChartBtnDiv.addEventListener('click', changeChart);
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
    loadingAnimation.setAttribute('data-loading', 'hidden');
  });
}

;

function renderOrderList() {
  var msg = document.querySelector('p[data-hasOrder]');

  if (orderData.length === 0) {
    msg.setAttribute('data-hasOrder', 'show');
    orderTable.setAttribute('data-hasOrder', 'hidden');
    chartSection.setAttribute('data-hasOrder', 'hidden');
  } else {
    msg.setAttribute('data-hasOrder', 'hidden');
    orderTable.setAttribute('data-hasOrder', 'show');
    chartSection.setAttribute('data-hasOrder', 'show');
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
      orderData = res.data.orders;
      renderOrderList();
    })["catch"](function (err) {
      var errData = err.response.data;

      if (!errData.status) {
        console.log(errData.message);
      }

      ;
    }).then(function () {
      popUpDiv.setAttribute('data-popUp', 'hidden');
    });
  } else if (btnProp === 'deleteOne') {
    axios["delete"]("".concat(baseUrl, "/").concat(adminOrder_path, "/").concat(id), tokenObj).then(function (res) {
      orderData = res.data.orders;
      renderOrderList();
    })["catch"](function (err) {
      var errData = err.response.data;

      if (!errData.status) {
        console.log(errData.message);
      }

      ;
    }).then(function () {
      popUpDiv.setAttribute('data-popUp', 'hidden');
    });
  }

  ;
}

;

function changePaid(id, status) {
  var obj = {
    "data": {
      "id": id,
      "paid": !status
    }
  };
  axios.put("".concat(baseUrl, "/").concat(adminOrder_path), obj, tokenObj).then(function (res) {
    orderData = res.data.orders;
    renderOrderList();
  })["catch"](function (err) {
    var errData = err.response.data;

    if (!errData.status) {
      console.log(errData.message);
    }

    ;
  }).then(function () {
    popUpDiv.setAttribute('data-popUp', 'hidden');
  });
}

;

function renderChart() {
  var productTitleTemporaryAry = [];
  var categoryChartData = [];
  orderData.forEach(function (item) {
    filterChartData(item.products, 'category', categoryChartData);
    filterChartData(item.products, 'title', productTitleTemporaryAry);
  }); // 處理 全品項營收比重 資料 
  // 從大排到小

  productTitleTemporaryAry = productTitleTemporaryAry.sort(function (a, b) {
    return b.revenue - a.revenue;
  });
  var productTitleChartData = []; // 收入排名四（含）之後的資料都算入「其他」

  var otherObj = {
    label: '其他',
    revenue: 0
  };
  productTitleTemporaryAry.forEach(function (item, index) {
    if (index < 3) {
      productTitleChartData.push(item);
    } else {
      otherObj.revenue += item.revenue;
    }

    ;
  });

  if (productTitleTemporaryAry.length >= 3) {
    productTitleChartData.push(otherObj);
  }

  ;
  categoryChartData = toC3PieChartFormat(categoryChartData);
  productTitleChartData = toC3PieChartFormat(productTitleChartData); // 根據順序上圖表顏色

  productTitleChartData = productTitleChartData.sort(function (a, b) {
    return b[1] - a[1];
  });
  var colorData = ['#301E5F', '#5434A7', '#9D7FEA', '#DACBFF'];
  var productTitleColors = {};
  var categoryColors = {};
  categoryChartData.forEach(function (item, index) {
    categoryColors[item[0]] = colorData[index + 1];
  });
  productTitleChartData.forEach(function (item, index) {
    productTitleColors[item[0]] = colorData[index];
  });
  var productCategoryChart = c3.generate({
    bindto: '#categoryRevenueChart',
    data: {
      columns: categoryChartData,
      type: 'pie',
      colors: categoryColors
    },
    size: {
      height: 400,
      width: 400
    }
  });
  var productTitleChart = c3.generate({
    bindto: '#productRevenueChart',
    data: {
      columns: productTitleChartData,
      type: 'pie',
      colors: productTitleColors
    },
    size: {
      height: 400,
      width: 400
    }
  });
}

;

function filterChartData(ary, key, outputData) {
  ary.forEach(function (item) {
    var label = item[key];
    var totalPrice = item.price * item.quantity;
    var aryCheck = outputData.some(function (item) {
      return item.label === label;
    });

    if (outputData.length === 0 || !aryCheck) {
      var obj = {};
      obj.label = label;
      obj.revenue = totalPrice;
      outputData.push(obj);
    } else {
      outputData.forEach(function (item) {
        item.revenue += totalPrice;
      });
    }

    ;
  });
}

; // 整理成 C3.js Pie 格式 [['label_1', 數量], ['label_2', 數量], ....]

function toC3PieChartFormat(data) {
  // 由大排到小，chart 顏色要用
  data = data.sort(function (a, b) {
    return b.revenue - a.revenue;
  });
  var chartFormatData = [];
  data.forEach(function (item) {
    var ary = [];
    ary.push(item.label, item.revenue);
    chartFormatData.push(ary);
  });
  return chartFormatData;
}

;

function changeChart(e) {
  var btnStatus = e.target.getAttribute('data-chartBtn');

  if (e.target.nodeName !== 'BUTTON' || btnStatus === 'active') {
    return;
  }

  ;
  var chartName = e.target.getAttribute('data-chartName');
  var chartDivs = document.querySelectorAll('[data-chart]');
  var btns = document.querySelectorAll('[data-js="chartBtn"]');
  btns.forEach(function (item) {
    if (item.getAttribute('data-chartName') === chartName) {
      item.setAttribute('data-chartBtn', 'active');
    } else {
      item.setAttribute('data-chartBtn', 'default');
    }
  });
  chartDivs.forEach(function (item) {
    if (item.getAttribute('data-js') === chartName) {
      item.setAttribute('data-chart', 'show');
    } else {
      item.setAttribute('data-chart', 'hidden');
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
  popUpDiv.setAttribute('data-popUp', 'show');

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
      str += "\n        <div class=\"popUp-body p-4 border-b\">\n          <p class=\"text-lg pb-1.5\">\n            \u78BA\u5B9A\u8981\u5C07\u4EE5\u4E0B\u8A02\u55AE\u7684\u72C0\u614B\u5F9E <span class=\"text-info underline\">".concat(target.paid ? '已處理' : '未處理', "</span> \u66F4\u6539\u70BA \n            <span class=\"text-info underline\">").concat(target.paid ? '未處理' : '已處理', "</span> \u55CE\uFF1F\n          </p>\n          <hr>\n          <ul class=\"mt-4\"}>\n            <li>\u8A02\u55AE\u7DE8\u865F\uFF1A").concat(target.id, "</li>\n            <li>\u9867\u5BA2\u59D3\u540D\uFF1A").concat(target.user.name, "</li>\n            <li>\n              \u8CFC\u8CB7\u7522\u54C1\uFF1A\n              <ul class=\"list-disc ml-8\">").concat(productStr, "</ul>\n            </li>\n            <li>\u7E3D\u91D1\u984D\uFF1A").concat(target.total, "\n        </div>\n        <div class=\"popUp-footer flex justify-end py-4\">\n          <button class=\"mr-2 py-2 px-3 bg-gray-400 text-white rounded hover:opacity-75\" data-js=\"dblCheckBtn\" data-dblCheckBtn=\"false\">\u53D6\u6D88</button>\n          <button class=\"py-2 px-3 bg-danger text-white rounded hover:opacity-75\" data-prop=\"changePaid\" data-js=\"dblCheckBtn\" data-dblCheckBtn=\"true\">\u78BA\u5B9A</button>\n        </div>\n      ");
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
      popUpDiv.setAttribute('data-popUp', 'hidden');
    } else if (btnProp === 'changePaid') {
      var isPaid = target.paid;
      changePaid(orderId, isPaid);
    } else if (btnProp === 'deleteOne' || btnProp === 'deleteAll') {
      deleteOrder(orderId, btnProp);
    }

    ;
  }, {
    once: true
  });
}

;
//# sourceMappingURL=all.js.map
