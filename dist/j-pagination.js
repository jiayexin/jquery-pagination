/**
 * Name: jquery.j-pagination
 * Author: Jia Yexin
 * Version: 1.0.5
 * Update: 2017-04-11
 **/

(function ($) {
  $.fn.jPagination = function(options) {
    options = $.extend({
      isAjax: false,
      url: '',
      limitName: 'limit',
      offsetOrPageNum: 0,
      pageNumName: 'page',
      offsetName: 'offset',
      otherData: {},
      resTotalNumOrPageNum: 0,
      resTotalName: [],
      resPageNum: [],
      totalPage: 30,
      currentPage: 1,
      maxPage: 5,
      perPage: 10,
      size: 'sm',
      callback: {
        staticFun: function() {},
        success: function(data) {},
        error: function(err) {}
      }
    }, options || {});

    return this.each(function() {
      var _this = this;

      function getData(index) {
        if(options.isAjax) {
          _params = options.otherData;

          if(options.limitName == '') return options.callback.error('请传入limitName');
          _params[options.limitName] = options.perPage;

          if(options.offsetOrPageNum == 0 || options.offsetOrPageNum == '0') {
            if(options.offsetName == '') return options.callback.error('请传入offsetName');
            _params[options.offsetName] = (options.currentPage - 1) * options.perPage;
          } else if(options.offsetOrPageNum == 1 || options.offsetOrPageNum == '1') {
            if(options.pageNumName == '') return options.callback.error('请传入pageNumName');
            _params[options.pageNumName] = options.currentPage;
          }

          $.ajax({
            type: "GET",
            url: options.url,
            data: _params,
            dataType: "json",
            success: function(res) {
              var _str = 'res', _arr = [];
              if(options.resTotalNumOrPageNum == 0) _arr = options.resTotalName;
              if(options.resTotalNumOrPageNum == 1) _arr = options.resPageNum;
              for(var i = 0; i < _arr.length; i++) {
                _str += '[_arr['+ i +']]';
              }
              if(options.resTotalNumOrPageNum == 0) options.totalPage = Math.ceil(Number(eval(_str)) / options.perPage);
              if(options.resTotalNumOrPageNum == 1) options.totalPage = Number(eval(_str));

              return setPageUl(index, function() {
                options.callback.success(options.currentPage, res);
              });
            },
            error: function(err) {
              return setPageUl(index, function() {
                options.callback.error(err);
              });
            }
          });
        } else {
          return setPageUl(index, function() {
            options.callback.staticFun(options.currentPage);
          });
        }
      }

      function pageBtnOverflow() {
        var startNum = 1;

        if(options.totalPage > options.maxPage) {
          if(options.currentPage > 3) {
            if((options.totalPage - options.currentPage) >= 3) {
              startNum = (options.currentPage - Math.floor(options.maxPage / 2)) > 0 ? (options.currentPage - Math.floor(options.maxPage / 2)) : 1;
            } else {
              startNum = options.totalPage - options.maxPage + 1;
            }
          }
        }

        getData(startNum);
      }

      function pageClick(type, index) {
        switch(type){
          case 'up':
            if(options.currentPage <= 1) break;
            options.currentPage--;
            break;

          case 'down':
            if(options.currentPage >= options.totalPage) break;
            options.currentPage++;
            break;

          case 'num':
            if(index > options.totalPage || index < 1 || options.currentPage == index) break;
            options.currentPage = index;
            break;

          default:
            break;
        }
        pageBtnOverflow();
      }

      function setPageUl(num, callback) {
        if(num == undefined) num = 1;
        if(options.maxPage < 5) options.maxPage = 5;

        $(_this).children('ul').html('');
        $(_this).children('ul').append('<li data-type="up" data-index=""><a href="javascript:;">上一页</a></li>');

        if(num > 1) $(_this).children('ul').append('<li data-type="num" data-index="1"><a href="javascript:;">1</a></li>');

        if(num > 2) $(_this).children('ul').append('<li data-type="num" data-index="'+ ((options.currentPage - options.maxPage) < 1 ? 1 : (options.currentPage - options.maxPage)) +'"><a href="javascript:;">···</a></li>');

        var stopNum = options.totalPage;
        if(options.totalPage > options.maxPage) stopNum = num + options.maxPage - 1;

        for(var i = num; i <= stopNum; i++) {
          $(_this).children('ul').append('<li data-type="num" data-index="'+ i +'"><a href="javascript:;">'+ i +'</a></li>');
        }

        if((options.totalPage - options.currentPage) > 3) $(_this).children('ul').append('<li data-type="num" data-index="'+ ((options.currentPage + options.maxPage) > options.totalPage ? options.totalPage : (options.currentPage + options.maxPage)) +'"><a href="javascript:;">···</a></li>');

        if((options.totalPage - options.currentPage) > 2) $(_this).children('ul').append('<li data-type="num" data-index="'+ options.totalPage +'"><a href="javascript:;">'+ options.totalPage +'</a></li>');

        $(_this).children('ul').append('<li data-type="down" data-index=""><a href="javascript:;">下一页</a></li>');

        $(_this).children('ul').children('li').off('click').on('click', function() {
          if($(this).hasClass('disabled')) return;
          if($(this).data('index') == options.currentPage) return;
          pageClick($(this).data('type'), $(this).data('index'));
        });

        var activeIndex = options.currentPage;
        if(options.totalPage > options.maxPage) activeIndex = options.currentPage - num + 1;
        if(num > 1) activeIndex = options.currentPage - num + 2;
        if(num > 2) activeIndex = options.currentPage - num + 3;

        $(_this).children('ul').children('li').removeClass('active').eq(activeIndex).addClass('active');
        $(_this).children('ul').children('li').eq(0).removeClass('disabled');
        $(_this).children('ul').children('li').eq(-1).removeClass('disabled');

        if(options.currentPage == 1 || options.totalPage == 0){
          $(_this).children('ul').children('li').eq(0).addClass('disabled').removeClass('active');
        }

        if(options.currentPage == options.totalPage || options.totalPage == 0){
          $(_this).children('ul').children('li').eq(-1).addClass('disabled').removeClass('active');
        }

        if(callback != undefined) callback();
      }

      function render() {
        $(_this).html('<ul></ul>');
        $(_this).addClass('j-pagination');
        $(_this).addClass('j-pagination-' + options.size);

        return getData(1);
      }

      render();
    });
  };
})(jQuery);