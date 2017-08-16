function intval(v) {
  v = parseInt(v);
  return isNaN(v) ? 0 : v
}

function getPos(e) {
  var l = 0;
  var t = 0;
  var w = intval(e.style.width);
  var h = intval(e.style.height);
  var wb = e.offsetWidth;
  var hb = e.offsetHeight;
  while (e.offsetParent) {
    l += e.offsetLeft + (e.currentStyle ? intval(e.currentStyle.borderLeftWidth) : 0);
    t += e.offsetTop + (e.currentStyle ? intval(e.currentStyle.borderTopWidth) : 0);
    e = e.offsetParent
  }
  l += e.offsetLeft + (e.currentStyle ? intval(e.currentStyle.borderLeftWidth) : 0);
  t += e.offsetTop + (e.currentStyle ? intval(e.currentStyle.borderTopWidth) : 0);
  return {x: l, y: t, w: w, h: h, wb: wb, hb: hb}
}

function getScroll() {
  var t, l, w, h;
  if (document.documentElement && document.documentElement.scrollTop) {
    t = document.documentElement.scrollTop;
    l = document.documentElement.scrollLeft;
    w = document.documentElement.scrollWidth;
    h = document.documentElement.scrollHeight
  } else if (document.body) {
    t = document.body.scrollTop;
    l = document.body.scrollLeft;
    w = document.body.scrollWidth;
    h = document.body.scrollHeight
  }
  return {t: t, l: l, w: w, h: h}
}

function scroller(el, duration) {
  if (typeof el != 'object') {
    el = document.getElementById(el)
  }
  if (!el) return;
  var z = this;
  z.el = el;
  z.p = getPos(el);
  z.s = getScroll();
  z.clear = function () {
    window.clearInterval(z.timer);
    z.timer = null;
  };
  z.t = (new Date).getTime();
  z.step = function () {
    var t = (new Date).getTime();
    var p = (t - z.t) / duration;
    if (t >= duration + z.t) {
      z.clear();
      window.setTimeout(function () {
        z.scroll(z.p.y, z.p.x)
      }, 13)
    } else {
      st = ((-Math.cos(p * Math.PI) / 2) + 0.5) * (z.p.y - z.s.t) + z.s.t;
      sl = ((-Math.cos(p * Math.PI) / 2) + 0.5) * (z.p.x - z.s.l) + z.s.l;
      z.scroll(st, sl)
    }
  };
  z.scroll = function (t, l) {
    window.scrollTo(l, t)
  };
  z.timer = window.setInterval(function () {
    z.step()
  }, 13)
  var m = document.querySelector('.menu');
}

window.onload = function () {
  var mapEl = document.getElementById('map');
  var map = new window.BMap.Map(mapEl);
  var mapPosition = mapEl.getAttribute('data-value').split(',');
  var point = new window.BMap.Point(parseFloat(mapPosition[0]), parseFloat(mapPosition[1]));
  var marker = new window.BMap.Marker(point);

  map.centerAndZoom(point, 18);
  map.addOverlay(new window.BMap.Marker(point));
  map.addControl(new window.BMap.MapTypeControl());
  map.setCurrentCity('北京');
  marker.setLabel(new window.BMap.Label('大会举行地址'));

  if (document.querySelector('.qrcode')) {
    var qr = document.getElementById("qrcode");

    new QRCode(qr, {
      text: qr.attributes.dataSrc.value,
      width: 128,
      height: 128,
      colorDark: "#333",
      colorLight: "#fff",
    });
  }

  if (document.querySelector('#footqr')) {
    var qr = document.getElementById("footqr");

    new QRCode(qr, {
      text: qr.attributes.dataSrc.value,
      width: 128,
      height: 128,
      colorDark: "#333",
      colorLight: "#fff",
    });
  }

  var sw = document.querySelector('.switch')

  sw.onclick = function () {
    var menu = document.querySelector('.menu');

    menu.className = /hidden/.test(menu.className) ? menu.className.replace(/ hidden|hidden/, '') : menu.className + ' hidden';
  }

  document.querySelector('.menu').onclick = function () {
    var menu = document.querySelector('.menu');

    menu.className = /hidden/.test(menu.className) ? menu.className.replace(/ hidden|hidden/, '') : menu.className + ' hidden';
  }

  if (document.querySelector('.latest'))
    document.querySelector('.latest').onclick = function (e) {
      e.stopPropagation();
      var latest = document.querySelector('.latest');

      latest.className = /open/.test(latest.className) ? latest.className.replace(/ open|open/, '') : latest.className + ' open';
    }

  var submit = document.querySelector('.submit-btn'), submitTime = submit.getAttribute('data-value').split('-');

  if (Date.now() < Date.parse(submitTime[0])) {
    submit.innerHTML = '报名将在' + submitTime[0] + '开始';
    submit.style.pointerEvents = 'none';
  } else if (Date.now() > Date.parse(submitTime[1])) {
    submit.innerHTML = '报名已经结束';
    submit.style.pointerEvents = 'none';
  } else {
    submit.onclick = function (e) {
      var el = document.querySelector('form');
      var url = '/api/' + location.href.match('conf/[^\/]*')[0] + '/singup';
      console.log(url);

      if (!el.checkValidity()) {
        alert('填写信息有误，请检查后提交');
        return false;
      }

      var form = new FormData(el);
      var req = new XMLHttpRequest();

      req.open("POST", url);
      try {
        req.send(form);
      } catch (e) {
        alert('提交失败，请刷新后重试');
      }
      req.responseType = 'text';

      req.onload = function (e) {
        if (req.status == 200) {
          var data = JSON.parse(req.responseText);

          if (data.ret) {
            alert('报名成功');
            location.reload();
          } else {
            alert('提交失败，请刷新后重试');
          }
        } else {
          alert('提交失败，请刷新后重试');
        }
      };

      e.preventDefault();
      return false
    }
  }

  var waypoints = {
    guide: new Waypoint.Inview({
      element: document.querySelector('.home .title'),
      exited: function () {
        document.querySelector('.guide').className += ' shadow';
      },
      enter: function () {
        document.querySelector('.guide').className = document.querySelector('.guide').className.replace(/ shadow|shadow/, '')
      }
    })
  }

  var title = document.querySelectorAll('h1');

  title.forEach(function (el) {
    new Waypoint.Inview({
      element: el,
      entered: function () {
        el.className += ' inview';
      },
      exit: function () {
        el.className = el.className.replace(/ inview|inview/, '')
      }
    })
  })

  var center = document.querySelectorAll('.center');

  center.forEach(function (el) {
    var a = new Waypoint.Inview({
      element: el,
      enter: function () {
        el.className += ' fadein';
      },
      exit: function () {
        el.style.opacity = 1;
        a.destroy()
      }
    })
  })

}

!function(){"use strict";function t(s){this.options=e.extend({},i.defaults,t.defaults,s),this.element=this.options.element,this.$element=e(this.element),this.createWrapper(),this.createWaypoint()}var e=window.jQuery,i=window.Waypoint;t.prototype.createWaypoint=function(){var t=this.options.handler;this.waypoint=new i(e.extend({},this.options,{element:this.wrapper,handler:e.proxy(function(e){var i=this.options.direction.indexOf(e)>-1,s=i?this.$element.outerHeight(!0):"";this.$wrapper.height(s),this.$element.toggleClass(this.options.stuckClass,i),t&&t.call(this,e)},this)}))},t.prototype.createWrapper=function(){this.options.wrapper&&this.$element.wrap(this.options.wrapper),this.$wrapper=this.$element.parent(),this.wrapper=this.$wrapper[0]},t.prototype.destroy=function(){this.$element.parent()[0]===this.wrapper&&(this.waypoint.destroy(),this.$element.removeClass(this.options.stuckClass),this.options.wrapper&&this.$element.unwrap())},t.defaults={wrapper:'<div class="sticky-wrapper" />',stuckClass:"stuck",direction:"down right"},i.Sticky=t}();
