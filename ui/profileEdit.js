var theDp = document.getElementById('theProfilePicture');
var theDpLink = document.getElementById('dpLink');
var editSaveBtn = document.getElementById('editProfileSave');
var loader = document.getElementsByClassName('loader');

function loadTheImage(){
  proPicLink = theDpLink.value;
  if(proPicLink !== ""){
      theDp.src = theDpLink.value;
  } else {
      theDp.src = '/ui/blank-profile-picture.png';
  }
}

theDpLink.onfocus = function() {
  if (theDpLink.value === "Link to Your Profile Picture Here") {
    theDpLink.value = "";
  }

}

editSaveBtn.onclick = function() {
  loader[0].style.display = "inline-block";
  editSaveBtn.innerHTML = "Saving Changes...";

  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {

    if(request.readyState === XMLHttpRequest.DONE){
      if(request.status === 200){
          loader[0].style.display = "none";
          editSaveBtn.innerHTML = "Changes&nbsp;Saved";
          setTimeout(function() {editSaveBtn.innerHTML = "Save Changes";}, 700);
      } else {
        loader[0].style.display = "none";
        alert("Some Internal Error Occured!\nPlease Try Again Later!");
        editSaveBtn.innerHTML = "Save Changes";
      }
    }
  };

  var dpLink = theDpLink.value;
  var bio  = document.getElementById('theBioArea').value;

  if(dpLink === ""){
      dpLink = '/ui/blank-profile-picture.png';
  }

  request.open('POST', '/edit-profile-save', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({DpLink: dpLink,
                               Bio:    bio}));
};
