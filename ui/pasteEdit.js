var deleteButton = document.getElementById('deletePasteBtn');
var saveEditBtn = document.getElementById('saveEditBtn');
var pasteShownArea = document.getElementById('pasteShownArea');


saveEditBtn.onclick = function() {
  if (saveEditBtn !== null) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {

      if(request.readyState === XMLHttpRequest.DONE){
        if(request.status === 200){
            location.reload();
        } else {
          alert("Some Internal Error Occured!\nPlease Try Again Later!");
        }
      }
    };

    var pasteBody = pasteShownArea.value;
    var pasteLink = window.location.href.split('/').reverse()[0];

    request.open('POST', '/edit-paste', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({
                    PasteBody: pasteBody,
                    PasteLink: pasteLink
               }));
            }
}

deleteButton.onclick = function() {

  if (deleteButton !== null) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {

      if(request.readyState === XMLHttpRequest.DONE){
        if(request.status === 200){
            window.location = "/browse";
        } else {
          alert("Some Internal Error Occured!\nPlease Try Again Later!");
        }
      }
    };

    var pasteLink = window.location.href.split('/').reverse()[0];

    request.open('POST', '/delete-paste', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({PasteLink: pasteLink}));
  }
}
