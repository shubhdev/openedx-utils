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
 
drop_down.trigger('change');
    var cm_wrapper = $('#textarea').find('.CodeMirror');
    var editor = cm_wrapper[0].CodeMirror;
   
  $('button#test').click(function(){
    logger = new KeyLogger(editor,cm_wrapper);
    logger.startLogging(5000);
    
  });
 
});
