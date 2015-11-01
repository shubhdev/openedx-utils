class LogEntry
  constructor:(time,selectionRange,selectedText,pressedKey,pastedText,logEvent,editorChanged)->
	  this.event_time=time
	  this.selection_range=selectionRange
	  this.selected_text=selectedText
	  this.pressed_key=pressedKey
	  this.pasted_text=pastedText
	  this.event_type=logEvent
	  if(editorChanged== 'undefined')
	    editorChanged=null
	  this.editorChanged=editorChanged
class KeyLogger
  constructor:(editor,editor_jquery)->
    @editor = editor
    @editor_jquery = editor_jquery
    @log = []
  
  bind:()=>
  	@editor_jquery.on({
      'copy':(e)=>
          @log.push @captureCopy(e)
      ,
      'cut':(e)=>
          @log.push @captureCut(e)
      ,
      'paste':(e)=>
          @log.push @capturePaste(e)
      ,
      'keyup keypress':(e)=>
          @log.push @captureKey(e,null)
    })
  	return
  getSelectionRange: =>
    return {'from': @editor.getCursor("anchor"),'to': @editor.getCursor()}
  captureCut:(e)=>
    console.log ('Cut Detected'+Date.now()) 
    return new LogEntry(Date.now(),@getSelectionRange(),@editor.getSelection('\n'),null ,null ,"cut",null)
  
  captureCopy:(e)=>
    console.log('Copy Detected')
    return new LogEntry(Date.now(),@getSelectionRange(),@editor.getSelection('\n'),null ,null ,"copy",null)
  
  capturePaste:(e)=>
    console.log('Paste Detected')
    return new LogEntry(Date.now(),@getSelectionRange(),@editor.getSelection('\n'),null ,e.originalEvent.clipboardData.getData('text'),"paste",null)
  
  captureKey:(e,editor,editorChanged)=>
    #console.log(e)
    return new LogEntry(Date.now(),@getSelectionRange(),@editor.getSelection('\n'),new getLogStringKeyhandler(e) ,null ,"key",editorChanged)
  updateLog:(t)=>
    @log = (entry for entry in @log when entry.event_time > t)
  sendLog: =>
    if @log.length > 0
      #TODO send JSONified log to the backend via ajax
      console.log JSON.stringify(@log)
      @updateLog(Date.now())
    return
  getLogStringKeyhandler=(e)->
	  this.altKey=e.altKey
	  this.ctrlKey=e.ctrlKey
	  this.key=e.key
	  this.keyCode=e.keyCode
	  this.timeStamp=e.timeStamp
	  this.type=e.type
	  this.shiftKey=e.shiftKey
  startLogging:(t)=>
    @bind()
    window.setInterval(@sendLog,t)
    console.log 'started logging...'

