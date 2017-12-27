$(function(){
    //建立socket.io連線
    var socket = io();

    var username = null;

    //當使用者按下了send按鈕後，會將input中的值傳回server
    $('#btn').click(function() {
       username = $.trim($('#input').val());
       if(username){
        socket.emit('send user name',username); 
       }
       else{
           alert('請輸入東西');
       }
       
    });

    socket.on('id repeat',function(data){
        alert(data+'重複了');
    });

/*    socket.on('send to all client',function(data){
       
        $('#getmessage').append('<li>'+data);
    });
*/
});