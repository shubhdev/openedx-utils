$(document).ready(function(){

    console.log('ready');
    var drop_down =$('select.lang-options');
    if(window.localStorage){
        console.log('have it!');
        var $get = window.localStorage.getItem('lang_choice');
        if($get){drop_down.val($get);}
    }
    window.editor=CodeMirror.fromTextArea($('#editor')[0],{
            mode:drop_down.val(),
            lineNumbers:true
        });

    drop_down.change(function(){
       //alert('hi');
        var mode=$(this).val();
        window.localStorage.setItem('lang_choice',mode);
        $(this).attr('data-mode',mode);
        window.editor.setOption('mode',mode);
    }
                              );
    CodeMirror.prototype.getSelectionRange = function(){
      return {'from':this.getCursor("anchor"),'to':this.getCursor()};
    };
drop_down.trigger('change');
    var cm_wrapper = $('#textarea').find('.CodeMirror');
    var editor = cm_wrapper[0].CodeMirror;
    function keyLogger(time,selectionRange,selectedText,pressedKey,pastedText,logEvent,editorChanged){
      //this.event_time=time;
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
    function captureCut(event,editor){
    		//alert('cut');
        	console.log('Cut Detected'+  Date.now()   );
        	return new keyLogger(Date.now(),editor.getSelectionRange(),editor.getSelection('\n'),null ,null ,"cut",null);
    }
    function captureCopy(e,editor){
    		console.log('Copy Detected');
    		return new keyLogger(Date.now(),editor.getSelectionRange(),editor.getSelection('\n'),null ,null ,"copy",null);
    	}
    function capturePaste(e,editor){
    		console.log('Paste Detected');
    		return new keyLogger(Date.now(),editor.getSelectionRange(),editor.getSelection('\n'),null ,e.originalEvent.clipboardData.getData('text'),"paste",null);
    	}
    function captureKey(e,editor,editorChanged){
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

      function startLogging(editor,_editor_jquery_){

          console.log("logging started...");
          //var rn=Math.ceil(Math.random()*10000);
          var aceLog=[];
          //var currFile={fileName:fileName,rn:rn};
          //_editor_jquery_.on("cut",);
          _editor_jquery_.on({
              'copy':function(e){
                  aceLog.push(captureCopy(e,editor));
              },
              'cut':function(e){
                  aceLog.push(captureCut(e,editor));
              },
              'paste':function(e){
                  aceLog.push(capturePaste(e,editor));
              },
              'keyup keypress':function(e){
                  aceLog.push(captureKey(e,editor,null));
              }
          });
          // editor.on('mousedown',function(e){
          //         //if(e.button==2)
          //                 console.log(e);
          // });
          setInterval(function(){
              sendLog();
              //rsFunctionsObject.rsSaveFunction();
          },10000);
          // if(rsFunctionsObject.files === undefined){
          //     rsFunctionsObject.files=[];
          // }
          // rsFunctionsObject.files.push(function(){
          //     console.log("saving..."+fileName+"_"+rn);
          //     sendLog(fileName,rn);
          // });
          function sendLog(){
            if(aceLog.length > 0){
              var log=JSON.stringify(aceLog);
              var compressed=JSON.stringify(LZW.compress(log));
              console.log(log,log.length);

              console.log(compressed,compressed.length);
            }
            aceLog = updateLog(aceLog,Date.now())
          }
      }
  $('button#test').click(function(){

    startLogging(editor,cm_wrapper);
    //console.log(JSON.stringify(editor.getCursor()));
    //console.log("69"+ JSON.stringify(editor.getCursor("anchor")));
    //
    // console.log(JSON.stringify(editor.getSelection('\n')));
    // console.log(JSON.stringify(editor.getSelectionRange()));
  });
  // cm_wrapper.on({
  //   'paste keyup' : function(e){
  //     console.log(e.originalEvent.clipboardData);
  //     console.log(JSON.stringify( {
  //       'event_type': "cut",
  //       'event_time':Date.now(),
  //       'selection_range': editor.getSelectionRange(),
  //       'selected_text': editor.getSelection(),
  //
  //     }))
  //   }
  // });

});
