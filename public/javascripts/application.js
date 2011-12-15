/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function callMeOften() {
    $.ajax({
        method: 'get',
        url : "/quickbook_import_status",
        dataType : 'text',
        success: function (text) {
            document.getElementById('update_ststus').innerHTML = text;
        }
    });
}