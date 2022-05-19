define(function(){
    return{
        showModal:function(message){
            $("#modal-text").text(message);
            $('#warning-modal').modal('show');
        }
    }
})