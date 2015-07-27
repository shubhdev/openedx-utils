function keyLogger(time,selectionRange,selectedText,pressedKey,pastedText,logEvent,editorChanged){
                this.event_time=time;
                this.selection_range=selectionRange;
                this.selected_text=selectedText;
                this.pressed_key=pressedKey;
                this.pasted_text=pastedText;
                this.event_type=logEvent;
                if(editorChanged=== 'undefined')
                    editorChanged=null;
                this.editorChanged=editorChanged;
                //console.log(JSON.stringify(this));
}
function getLogStringKeyhandler(e){
        this.altKey=e.altKey;
        this.ctrlKey=e.ctrlKey;
        this.key=e.key;
        this.keyCode=e.keyCode;
        this.timeStamp=e.timeStamp;
        this.type=e.type;
        this.shiftKey=e.shiftKey;
}
 //-------------CUT COPY PASTE EDITOR--------------//
	/*editor.on("copy", function(e){
		console.log('Copy Detected');
		//alert(e+ " "+ e.originalEvent);
		new keyLogger(Date.now(),editor.getSelectionRange(),editor.getSelectedText(),null ,null ,"log_copy");
	});*/
function captureCut(event,editor,fileName){
		//alert('cut');
    	console.log('Cut Detected'+  Date.now()   );
    	return new keyLogger(Date.now(),editor.getSelectionRange(),editor.getSelection('\n'),null ,null ,"cut",null);
}
function captureCopy(e,editor,fileName){
		console.log('Copy Detected');
		return new keyLogger(Date.now(),editor.getSelectionRange(),editor.getSelection('\n'),null ,null ,"copy",null);
	}
function capturePaste(e,editor,fileName){
		console.log('Paste Detected');
		return new keyLogger(Date.now(),editor.getSelectionRange(),editor.getSelection('\n'),null , e.text,"paste",null);
	}
function captureKey(e,editor,fileName,editorChanged){
		//console.log(e);
		return new keyLogger(Date.now(),editor.getSelectionRange(),editor.getSelection('\n'),new getLogStringKeyhandler(e) ,null ,"key",editorChanged);
	}

function updateLog(aceLog,tsI){
  var aceLogNew=[];
  for(x in aceLog){
      if(x.event_time>tsI){
          aceLogNew.push(x);
      }
  }
  return aceLogNew;
}

function startLogging(fileName,editor,_editor_jquery_,options){
    //console.log(options.id);
    if(!options.id){
        return;
    }
    console.log("logging started...");
    var rn=Math.ceil(Math.random()*10000);
    var aceLog=[];
    var currFile={fileName:fileName,rn:rn};
    editor.on("cut",function(e){
        aceLog.push(captureCut(e,editor,currFile));
    });
    _editor_jquery_.bind({
        copy:function(e){
            aceLog.push(captureCopy(e,editor,currFile));
        }
    });
    editor.on("paste", function(e){
        aceLog.push(capturePaste(e,editor,currFile));
    });
    editor.container.addEventListener("keydown", function(e){
    //console.log(e);

    if(e.ctrlKey===true && (e.key==='z'||e.key==='Z') || e.ctrlKey===true && e.keyCode===90){
                            var u1len=editor.session.getUndoManager().$undoStack[0].length;
            function f1(e2){
                    console.log("Undo detected");
                    //console.log(editor.session.getUndoManager().$undoStack);
                    u1len--;
                    //console.log(u1len);
                    if(u1len===0)
                            editor.off("change",f1);
                    var p=captureKey(e,editor,currFile,e2);
                    p.type='log_undo';
                    p.selection_range=null;
                    p.selectedText=null;
                    //console.log(JSON.stringify(p));
                    aceLog.push(p);
                    //console.log(JSON.stringify(e2));
            }
            //console.log(editor.session.getUndoManager().$undoStack.length);
            if(editor.session.getUndoManager().$undoStack.length>0)
                    editor.on("change",f1);
            }
            if(e.ctrlKey===true && (e.key==='y'||e.key==='Y') || e.ctrlKey===true && e.keyCode===89){
                            var u1len=editor.session.getUndoManager().$redoStack[0].length;
            function f1(e2){
                    console.log("Redo detected");
                    u1len--;
                    //console.log(u1len);
                    if(u1len===0)
                            editor.off("change",f1);
                    var p=captureKey(e,editor,currFile,e2);
                    p.type='log_redo';
                    p.selection_range=null;
                    p.selectedText=null;
                    //console.log(JSON.stringify(p));
                    aceLog.push(p);
                    //console.log(JSON.stringify(e2));
            }
            console.log(editor.session.getUndoManager().$redoStack.length);
            if(editor.session.getUndoManager().$redoStack.length>0)
                    editor.on("change",f1);
            }
}, true);
    _editor_jquery_.on("keyup keypress",function(e){
        aceLog.push(captureKey(e,editor,currFile,null));
        /*if(e.ctrlKey===true && e.key==='z' || e.ctrlKey===true && e.keyCode===90){
            console.log("Undo detected");
            editor.on("change",function(e){
                    console.log(e);
            });
            }*/
        console.log(currFile);
    });
    //setInterval(sendLog(aceLog), 200);
    editor.on('mousedown',function(e){
            //if(e.button==2)
                    console.log(e);
    });
    setInterval(function(){
        //sendLog(fileName,rn);
        rsFunctionsObject.rsSaveFunction();
    },20000);
    if(rsFunctionsObject.files === undefined){
        rsFunctionsObject.files=[];
    }
    rsFunctionsObject.files.push(function(){
        console.log("saving..."+fileName+"_"+rn);
        sendLog(fileName,rn);
    });
    function sendLog(fileName,rn){
                    var xmlhttp;
                    xmlhttp=new XMLHttpRequest();
                    xmlhttp.onreadystatechange=function()
                        {
                        var ts=xmlhttp.responseText;
                        console.log("ts="+ts);
                        if (xmlhttp.readyState===4 && xmlhttp.status===200)
                          {
                            //console.log("responseText="+ts);
                            var tsI=parseInt(ts);
                            //update aceLog
                            aceLog=updateLog(aceLog,ts);
                          }
                          //console.log("afterRecieve:"+aceLog);
                        };
                    xmlhttp.open("POST","../../../../PhpProject1/",true);
                    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                    var sendParams='fileName='+fileName+'&rn='+rn+'&log='+JSON.stringify(aceLog);
                    sendParams+=options.download.indexOf('?')===-1? "" : "&"+(options.download.substring(options.download.indexOf('?')+1));
                    console.log(sendParams);
                    xmlhttp.send(sendParams);
                }
}
