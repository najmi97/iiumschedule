
  
  var currenttemplate;
  
  function postpage(){
  }
  
  var rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
  };

  var token = function() {
      return rand() + rand(); // to make it longer
  };
  
  var ctoken=token();
  $("#savebutton a").attr("href","/scheduleloader?ctoken="+ctoken);
  $("#savebutton a").click(saveStyle);
  
  function getcurrentstyle(){
      var theiframe=$('#previewiframe');
      return theiframe.contents().find("#thestyle").html();
  }
  
  function getcurrenttemplate(){
      if(currenttemplate!=undefined){
	return currenttemplate;
      }
      return $("#scheduletemplate").html();
  }
  
  function rerender(style){
      if(style==undefined){
	style=getcurrentstyle();
      }
      var thetext=(new EJS({text:currenttemplate})).render(thedata);
    
      var theiframe=$('#previewiframe')
      
      theiframe.contents().find('html').html(thetext);
      theiframe.contents().find("#thestyle").html(style);
  }
  
  function changetemplatepage(){
    postpage();
    $('#configiframe').bind('load',function(){
       document.getElementById('configiframe').contentWindow.changetemplate(getcurrenttemplate());
       $('#configiframe').unbind("load");
       postpage=function(){
       }
    });
    $("#configiframe").attr("src","/static/templateeditor.html");
  }
  
  function themegallery(){
    postpage();
    $('#configiframe').bind('load',function(){
       $('#configiframe').unbind("load");
       postpage=function(){
       }
    });
    $("#configiframe").attr("src","/themegallery");
  }
  
  function manualcsspage(){
    postpage();
    $('#configiframe').bind('load',function(){
       document.getElementById('configiframe').contentWindow.changeStyle(getcurrentstyle());
       $('#configiframe').unbind("load");
       postpage=function(){
       }
    });
    $("#configiframe").attr("src","/static/csseditor.html");
  }
  
  function stylercsspage(){
    postpage();
    $('#configiframe').bind('load',function(){
      document.getElementById('configiframe').contentWindow.parseCSS(getcurrentstyle(),$('#previewiframe'));
      $('#configiframe').unbind("load");
      postpage=function(){
	document.getElementById('configiframe').contentWindow.savestyle();
      }
    });
    $("#configiframe").attr("src","/static/styler.html");
  }
  
  function applyStyle(thestyle){
    rerender(thestyle);
  }
  
  function applyTemplate(template){
    currenttemplate=template;
    rerender();
  }
  
  
  function saveStyle(){
    console.log("Saving Style");
    var theiframe=$('#previewiframe');
    
    var data=theiframe.contents().find('html').html();
  
    console.log("Posting schedule");
    $.post(window.location.origin+"/scheduleformatter/",{data:data,custom:1,ctoken:ctoken},function(response){
    
      console.log("Schedule posted");
    })
    
  }
  
  function makearray(length){
    var thearray=new Array();
    var i=0;
    while(i<length){
      thearray.push("");
      i=i+1;
    }
    return thearray;
  }
  
  function formatschedule(){
    
    var studentname=data.studentname;
    var coursearray=data.coursearray;
    
    var byday={
      MON:makearray(10),
      TUE:makearray(10),
      WED:makearray(10),
      THUR:makearray(10),
      FRI:makearray(10),
    }
    
    var ci=0;
    while(ci<coursearray.length){
      var course=coursearray[ci];
      var si=0;
      while(si<course.schedule.length){
	var schedule=course.schedule[si];
	var start=schedule.start;
	var end=schedule.end;
	var duration=end-start;
	byday[schedule.day][start-8]={
	  course:course,
	  duration:duration,
	  venue:course.schedule[si].venue,
	  }
	var i=1;
	while(i<duration){
	  byday[schedule.day][start-8+i]="none";
	  i=i+1;
	}
	si=si+1;
      }
      
      ci=ci+1;
    }
    
    function getScheduleText(course){
	if(course==""){
	  return {text:""};
	}else{
	  return {text:course.name};
	}
    }
    
    function formatschedule(){
      var thereturn=new Array();
      for(key in byday){
	thereturn.push(
	{
	  day:key,
	  ischedule:getScheduleText(byday[key]),
	}
	);
      }
      return thereturn;
    }
    
    thedata={
      studentname:studentname,
      schedule:byday,
      courselist:coursearray,
      matricnumber:data.matricnumber,
      ic:data.ic,
      session:data.session,
      semester:data.semester,
      program:data.program,
    }
    
    $.get("/static/default.html",function(data){
      currenttemplate=data;
      rerender($("#defaultstyle").html());
      $.get("/static/default.css",function(data){
	rerender(data);
	themegallery();
      });
    });
    
    
    
  }
  