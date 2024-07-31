initRootFolderId();

// 监听快捷键
chrome.commands.onCommand.addListener(function(command) {
  // 焦聚重返questions
  if(command == "reback-questions"){
    chrome.bookmarks.create({'parentId': localStorage.q_bookmarks_rootID,'title': "temp"},function (newFolder){
        chrome.bookmarks.remove(newFolder.id);
    });
  }

  // 新增文件夹
  if (command == "add-folder") {
    // 接受文件夹名称
    var fileName = prompt("名字","新建文件夹");
    if(fileName==null || fileName==""){
      return;
    }

    // 新增文件夹
    chrome.bookmarks.create({'parentId': localStorage.q_bookmarks_rootID,'title': fileName},function (newFolder){
      chrome.bookmarks.create({'parentId': newFolder.id,'title': "temp"},function (tempFolder){
        chrome.bookmarks.remove(tempFolder.id);
      });
    });
  }

  // 移动到其他书签
  if (command == "move-other") {
    chrome.bookmarks.getSubTree(localStorage.q_bookmarks_rootID,function(rootFolder){
      if (chrome.runtime.lastError) {
        alert("归档异常！");
        console.log("move error:"+chrome.runtime.lastError);
      } else if(rootFolder[0].children.length==0){
        alert("空文件夹不可归档！");
        console.log("not move empty folder to other bookmarks");
      }else {
        var backName = prompt("归档",rootFolder[0].title +"-"+ new Date().Format("yy-MM-dd"));
        if(backName==null || backName==""){
          return;
        }
        chrome.bookmarks.create({'parentId': "2",'title': backName},function (newFolder){
          var qArray =  rootFolder[0].children;
          for(var i=0, len=rootFolder[0].children.length; i<len; i++ ){
            chrome.bookmarks.move(qArray[i].id,{parentId:newFolder.id});
          }
        });
      }
    });
  }
});

// 初始化[书签]定义的根文件夹Id
function initRootFolderId(){
    if(!localStorage.q_bookmarks_rootID){
      createRootFolder();
    }else{
      try {
        chrome.bookmarks.get(localStorage.q_bookmarks_rootID,function(rootFolder){
          if (chrome.runtime.lastError) {
              createRootFolder();
          }else if (!rootFolder||rootFolder[0].parentId!="1"){
              createRootFolder();
          }
        })
      } catch(err){
        createRootFolder();
      }
    }
}

// 创建 questions 文件夹作为 rootFolder 即：questions必须在书签目录下
function createRootFolder(){
  chrome.bookmarks.create({'parentId': '1','title': "questions"},function(rootFolder) {
    localStorage.q_bookmarks_rootID = rootFolder.id;
  });
}

// 时间格式化
Date.prototype.Format = function (fmt) {
  var o = {
    "y+": this.getFullYear(),
    "M+": this.getMonth() + 1,                 //月份
    "d+": this.getDate(),                    //日
    "h+": this.getHours(),                   //小时
    "m+": this.getMinutes(),                 //分
    "s+": this.getSeconds(),                 //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S+": this.getMilliseconds()             //毫秒
  };
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)){
      if(k == "y+"){
        fmt = fmt.replace(RegExp.$1, ("" + o[k]).substr(4 - RegExp.$1.length));
      }
      else if(k=="S+"){
        var lens = RegExp.$1.length;
        lens = lens==1?3:lens;
        fmt = fmt.replace(RegExp.$1, ("00" + o[k]).substr(("" + o[k]).length - 1,lens));
      }
      else{
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      }
    }
  }
  return fmt;
}
